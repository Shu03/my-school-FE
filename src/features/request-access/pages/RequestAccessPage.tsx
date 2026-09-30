import { useMemo, useState } from "react";
import type { JSX } from "react";

import { useSearchParams } from "react-router-dom";

import { KeyRound } from "lucide-react";
import { toast } from "sonner";

import { Role } from "@/types/api";

import { formatSectionLabel } from "@lib/section";

import { useCurrentAcademicYear } from "@features/academic-years";
import { useAuthStore } from "@features/auth";
import { useClassesList } from "@features/classes";
import {
    useAccessRequests,
    useApproveAccessRequest,
    useCancelAccessRequest,
    useCreateAccessRequest,
    useGrantAccess,
    useMyAccessRequests,
    useRejectAccessRequest,
    useRevokeAccessRequest,
    useSubjectAccessTracking,
    type AccessRequest,
    type AccessRequestFilters,
    type AccessRequestStatus,
    type AccessType,
} from "@features/request-access";
import { useSubjectsList } from "@features/subjects";
import { useTeachersList } from "@features/teachers";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PAGE_SIZE = 20;
const statuses: AccessRequestStatus[] = ["PENDING", "APPROVED", "REJECTED", "CANCELLED", "REVOKED"];

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "The access request could not be completed.";
}

function RequestAccessForm(): JSX.Element {
    const [searchParams] = useSearchParams();
    const type = searchParams.get("type") === "MARKS" ? "MARKS" : "HOMEWORK";
    const sectionId = searchParams.get("sectionId") ?? "";
    const subjectId = searchParams.get("subjectId") ?? "";

    return (
        <RequestAccessFormFields
            key={searchParams.toString()}
            initialType={type}
            initialSectionId={sectionId}
            initialSubjectId={subjectId}
        />
    );
}

function RequestAccessFormFields({
    initialType,
    initialSectionId,
    initialSubjectId,
}: {
    initialType: AccessType;
    initialSectionId: string;
    initialSubjectId: string;
}): JSX.Element {
    const { data: currentYear } = useCurrentAcademicYear();
    const { data: sections = [] } = useClassesList(
        { academicYearId: currentYear?.id },
        Boolean(currentYear?.id),
    );
    const { data: subjects = [] } = useSubjectsList({});
    const [type, setType] = useState<AccessType>(initialType);
    const [sectionId, setSectionId] = useState(initialSectionId);
    const [subjectId, setSubjectId] = useState(initialSubjectId);
    const [reason, setReason] = useState("");
    const createRequest = useCreateAccessRequest();
    const section = sections.find((item) => item.id === sectionId);
    const availableSubjects = subjects.filter(
        (subject) => subject.classLevel === section?.classLevel,
    );

    async function submitRequest(event: React.FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        const trimmedReason = reason.trim();
        if (!sectionId || !subjectId || !trimmedReason || trimmedReason.length > 500) return;
        try {
            await createRequest.mutateAsync({ type, sectionId, subjectId, reason: trimmedReason });
            toast.success("Access request submitted.");
            setReason("");
        } catch (error) {
            toast.error(errorMessage(error));
        }
    }

    return (
        <form
            onSubmit={(event) => void submitRequest(event)}
            className="border-border/70 grid gap-4 border-b pb-6 lg:grid-cols-[1fr_1fr_1fr_2fr_auto] lg:items-end"
        >
            <div className="grid gap-2">
                <Label htmlFor="access-type">Access type</Label>
                <select
                    id="access-type"
                    className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                    value={type}
                    onChange={(event) => setType(event.target.value as AccessType)}
                >
                    <option value="HOMEWORK">Homework</option>
                    <option value="MARKS">Marks</option>
                </select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="access-section">Section</Label>
                <select
                    id="access-section"
                    className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                    value={sectionId}
                    onChange={(event) => {
                        setSectionId(event.target.value);
                        setSubjectId("");
                    }}
                    required
                >
                    <option value="">Choose section</option>
                    {sections.map((item) => (
                        <option key={item.id} value={item.id}>
                            {formatSectionLabel(item.classLevel, item.name)}
                        </option>
                    ))}
                </select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="access-subject">Subject</Label>
                <select
                    id="access-subject"
                    className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                    value={subjectId}
                    onChange={(event) => setSubjectId(event.target.value)}
                    disabled={!sectionId}
                    required
                >
                    <option value="">Choose subject</option>
                    {availableSubjects.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.name} ({item.code})
                        </option>
                    ))}
                </select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="access-reason">Reason</Label>
                <Input
                    id="access-reason"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    maxLength={500}
                    required
                    placeholder="Why do you need access?"
                />
            </div>
            <Button
                type="submit"
                disabled={createRequest.isPending || !sectionId || !subjectId || !reason.trim()}
            >
                {createRequest.isPending ? "Sending…" : "Request"}
            </Button>
        </form>
    );
}

function RequestHistoryTable(): JSX.Element {
    const [status, setStatus] = useState<AccessRequestStatus | "">("");
    const [page, setPage] = useState(1);
    const filters = useMemo(
        () => ({ page, limit: PAGE_SIZE, ...(status ? { status } : {}) }),
        [page, status],
    );
    const { data, isLoading, error } = useMyAccessRequests(filters);
    const cancelRequest = useCancelAccessRequest();

    async function cancel(id: string): Promise<void> {
        try {
            await cancelRequest.mutateAsync(id);
            toast.success("Request cancelled.");
        } catch (cancelError) {
            toast.error(errorMessage(cancelError));
        }
    }

    return (
        <section className="grid gap-4 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-semibold">My requests</h2>
                <select
                    aria-label="Filter requests by status"
                    className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                    value={status}
                    onChange={(event) => {
                        setStatus(event.target.value as AccessRequestStatus | "");
                        setPage(1);
                    }}
                >
                    <option value="">All statuses</option>
                    {statuses.map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </select>
            </div>
            {isLoading ? <p className="text-muted-foreground text-sm">Loading requests…</p> : null}
            {error ? <p className="text-destructive text-sm">{errorMessage(error)}</p> : null}
            {!isLoading && data?.data.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                    No access requests found.
                </p>
            ) : null}
            {data && data.data.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-190 text-left text-sm">
                        <thead className="text-muted-foreground border-b text-xs uppercase">
                            <tr>
                                <th className="py-3 pr-4">Access</th>
                                <th className="py-3 pr-4">Section / Subject</th>
                                <th className="py-3 pr-4">Status</th>
                                <th className="py-3 pr-4">Review</th>
                                <th className="py-3 pr-4">Revocation</th>
                                <th className="py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data.data.map((request) => (
                                <tr key={request.id}>
                                    <td className="py-3 pr-4">
                                        {request.type}
                                        <p className="text-muted-foreground mt-1 max-w-48 truncate text-xs">
                                            {request.reason}
                                        </p>
                                    </td>
                                    <td className="py-3 pr-4">
                                        {request.section?.name ?? "Section"}
                                        <p className="text-muted-foreground mt-1 text-xs">
                                            {request.subject?.name ?? "Subject"}
                                        </p>
                                    </td>
                                    <td className="py-3 pr-4">
                                        <Badge
                                            variant={
                                                request.status === "APPROVED"
                                                    ? "default"
                                                    : "secondary"
                                            }
                                        >
                                            {request.status}
                                        </Badge>
                                    </td>
                                    <td className="py-3 pr-4 text-xs">
                                        {request.reviewedBy
                                            ? `${request.reviewedBy.firstName} ${request.reviewedBy.lastName}`
                                            : "—"}
                                        <p className="text-muted-foreground mt-1">
                                            {request.reviewRemarks ??
                                                (request.reviewedAt
                                                    ? new Date(request.reviewedAt).toLocaleString()
                                                    : "")}
                                        </p>
                                    </td>
                                    <td className="py-3 pr-4 text-xs">
                                        {request.revokedBy
                                            ? `${request.revokedBy.firstName} ${request.revokedBy.lastName}`
                                            : "—"}
                                        <p className="text-muted-foreground mt-1">
                                            {request.revokeRemarks ??
                                                (request.revokedAt
                                                    ? new Date(request.revokedAt).toLocaleString()
                                                    : "")}
                                        </p>
                                    </td>
                                    <td className="py-3">
                                        {request.status === "PENDING" ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={cancelRequest.isPending}
                                                onClick={() => void cancel(request.id)}
                                            >
                                                Cancel
                                            </Button>
                                        ) : (
                                            "—"
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : null}
            <Pagination page={page} limit={PAGE_SIZE} total={data?.total ?? 0} onPage={setPage} />
        </section>
    );
}

function Pagination({
    page,
    limit,
    total,
    onPage,
}: {
    page: number;
    limit: number;
    total: number;
    onPage: (page: number) => void;
}): JSX.Element {
    return (
        <div className="flex items-center justify-end gap-2 text-sm">
            <span className="text-muted-foreground mr-2">
                {total
                    ? `${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total}`
                    : "0 results"}
            </span>
            <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => onPage(page - 1)}
            >
                Previous
            </Button>
            <Button
                variant="outline"
                size="sm"
                disabled={page * limit >= total}
                onClick={() => onPage(page + 1)}
            >
                Next
            </Button>
        </div>
    );
}

function AdminAccessRequests(): JSX.Element {
    const { data: currentYear } = useCurrentAcademicYear();
    const { data: sections = [] } = useClassesList(
        { academicYearId: currentYear?.id },
        Boolean(currentYear?.id),
    );
    const { data: subjects = [] } = useSubjectsList({});
    const { data: teachers = [] } = useTeachersList();
    const [status, setStatus] = useState<AccessRequestStatus>("PENDING");
    const [type, setType] = useState<AccessType | "">("");
    const [requesterId, setRequesterId] = useState("");
    const [sectionId, setSectionId] = useState("");
    const [subjectId, setSubjectId] = useState("");
    const [page, setPage] = useState(1);
    const [action, setAction] = useState<{
        request: AccessRequest;
        kind: "approve" | "reject" | "revoke";
    } | null>(null);
    const [remarks, setRemarks] = useState("");
    const [grantOpen, setGrantOpen] = useState(false);
    const [grantTeacher, setGrantTeacher] = useState("");
    const [grantType, setGrantType] = useState<AccessType>("HOMEWORK");
    const [grantSection, setGrantSection] = useState("");
    const [grantSubject, setGrantSubject] = useState("");
    const [grantRemarks, setGrantRemarks] = useState("");
    const [trackSection, setTrackSection] = useState("");
    const [trackSubject, setTrackSubject] = useState("");
    const filters: AccessRequestFilters = {
        page,
        limit: PAGE_SIZE,
        status,
        ...(type ? { type } : {}),
        ...(requesterId ? { requesterId } : {}),
        ...(sectionId ? { sectionId } : {}),
        ...(subjectId ? { subjectId } : {}),
    };
    const { data, isLoading, error } = useAccessRequests(filters);
    const approve = useApproveAccessRequest();
    const reject = useRejectAccessRequest();
    const revoke = useRevokeAccessRequest();
    const grant = useGrantAccess();
    const tracking = useSubjectAccessTracking(trackSection, trackSubject);
    const selectedSection = sections.find((section) => section.id === grantSection);
    const grantSubjects = subjects.filter(
        (subject) => subject.classLevel === selectedSection?.classLevel,
    );
    const trackedSection = sections.find((section) => section.id === trackSection);
    const trackedSubjects = subjects.filter(
        (subject) => subject.classLevel === trackedSection?.classLevel,
    );

    async function runAction(): Promise<void> {
        if (!action) return;
        const id = action.request.id;
        try {
            if (action.kind === "approve")
                await approve.mutateAsync({
                    id,
                    data: remarks.trim() ? { remarks: remarks.trim() } : {},
                });
            if (action.kind === "reject")
                await reject.mutateAsync({ id, data: { remarks: remarks.trim() } });
            if (action.kind === "revoke")
                await revoke.mutateAsync({
                    id,
                    data: remarks.trim() ? { remarks: remarks.trim() } : {},
                });
            toast.success(
                `Access request ${action.kind === "approve" ? "approved" : action.kind === "reject" ? "rejected" : "revoked"}.`,
            );
            setAction(null);
            setRemarks("");
        } catch (error) {
            toast.error(errorMessage(error));
        }
    }

    async function submitGrant(event: React.FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        if (!grantTeacher || !grantSection || !grantSubject) return;
        try {
            await grant.mutateAsync({
                requesterId: grantTeacher,
                type: grantType,
                sectionId: grantSection,
                subjectId: grantSubject,
                ...(grantRemarks.trim() ? { remarks: grantRemarks.trim() } : {}),
            });
            toast.success("Access granted.");
            setGrantOpen(false);
            setGrantRemarks("");
        } catch (error) {
            toast.error(errorMessage(error));
        }
    }

    async function revokeGrant(request: AccessRequest): Promise<void> {
        setAction({ request, kind: "revoke" });
        setRemarks("");
    }

    const tracked = tracking.data;
    const activeTeachers = teachers.filter((teacher) => teacher.user.isActive);

    return (
        <div className="grid gap-8">
            <section className="grid gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-base font-semibold">Access requests</h2>
                    <Button onClick={() => setGrantOpen(true)}>Grant access</Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    <select
                        aria-label="Request status"
                        className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                        value={status}
                        onChange={(event) => {
                            setStatus(event.target.value as AccessRequestStatus);
                            setPage(1);
                        }}
                    >
                        {statuses.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                    <select
                        aria-label="Request type"
                        className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                        value={type}
                        onChange={(event) => {
                            setType(event.target.value as AccessType | "");
                            setPage(1);
                        }}
                    >
                        <option value="">All types</option>
                        <option value="HOMEWORK">Homework</option>
                        <option value="MARKS">Marks</option>
                    </select>
                    <select
                        aria-label="Filter by teacher"
                        className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                        value={requesterId}
                        onChange={(event) => {
                            setRequesterId(event.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All teachers</option>
                        {activeTeachers.map((teacher) => (
                            <option key={teacher.userId} value={teacher.userId}>
                                {teacher.user.firstName} {teacher.user.lastName}
                            </option>
                        ))}
                    </select>
                    <select
                        aria-label="Filter by section"
                        className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                        value={sectionId}
                        onChange={(event) => {
                            setSectionId(event.target.value);
                            setSubjectId("");
                            setPage(1);
                        }}
                    >
                        <option value="">All sections</option>
                        {sections.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                    <select
                        aria-label="Filter by subject"
                        className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                        value={subjectId}
                        onChange={(event) => {
                            setSubjectId(event.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All subjects</option>
                        {subjects
                            .filter(
                                (subject) =>
                                    !sectionId ||
                                    subject.classLevel ===
                                        sections.find((item) => item.id === sectionId)?.classLevel,
                            )
                            .map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                    </select>
                </div>
                {isLoading ? (
                    <p className="text-muted-foreground text-sm">Loading requests…</p>
                ) : null}
                {error ? <p className="text-destructive text-sm">{errorMessage(error)}</p> : null}
                {data?.data.length === 0 ? (
                    <p className="text-muted-foreground py-6 text-center text-sm">
                        No requests match these filters.
                    </p>
                ) : null}
                {data && data.data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-230 text-left text-sm">
                            <thead className="text-muted-foreground border-b text-xs uppercase">
                                <tr>
                                    <th className="py-3 pr-4">Teacher</th>
                                    <th className="py-3 pr-4">Access</th>
                                    <th className="py-3 pr-4">Reason</th>
                                    <th className="py-3 pr-4">Requested</th>
                                    <th className="py-3 pr-4">Status</th>
                                    <th className="py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {data.data.map((request) => (
                                    <tr key={request.id}>
                                        <td className="py-3 pr-4">
                                            {request.requester.firstName}{" "}
                                            {request.requester.lastName}
                                        </td>
                                        <td className="py-3 pr-4">
                                            {request.type}
                                            <p className="text-muted-foreground mt-1 text-xs">
                                                {request.section?.name} · {request.subject?.name}
                                            </p>
                                        </td>
                                        <td className="max-w-56 py-3 pr-4">
                                            {request.reason ?? "Direct grant"}
                                            <p className="text-muted-foreground mt-1 text-xs">
                                                {request.reviewRemarks}
                                            </p>
                                        </td>
                                        <td className="py-3 pr-4 text-xs">
                                            {new Date(request.createdAt).toLocaleString()}
                                        </td>
                                        <td className="py-3 pr-4">
                                            <Badge
                                                variant={
                                                    request.status === "APPROVED"
                                                        ? "default"
                                                        : "secondary"
                                                }
                                            >
                                                {request.status}
                                            </Badge>
                                        </td>
                                        <td className="py-3">
                                            <div className="flex gap-2">
                                                {request.status === "PENDING" ? (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                setAction({
                                                                    request,
                                                                    kind: "approve",
                                                                });
                                                                setRemarks("");
                                                            }}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setAction({
                                                                    request,
                                                                    kind: "reject",
                                                                });
                                                                setRemarks("");
                                                            }}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </>
                                                ) : null}
                                                {request.status === "APPROVED" ? (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setAction({ request, kind: "revoke" });
                                                            setRemarks("");
                                                        }}
                                                    >
                                                        Revoke
                                                    </Button>
                                                ) : null}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : null}
                <Pagination
                    page={page}
                    limit={PAGE_SIZE}
                    total={data?.total ?? 0}
                    onPage={setPage}
                />
            </section>

            <section className="border-border/70 grid gap-4 border-t pt-6">
                <div>
                    <h2 className="text-base font-semibold">Subject access</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Review assigned teachers and approved grants for a section and subject.
                    </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    <select
                        aria-label="Tracking section"
                        className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                        value={trackSection}
                        onChange={(event) => {
                            setTrackSection(event.target.value);
                            setTrackSubject("");
                        }}
                    >
                        <option value="">Choose section</option>
                        {sections.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                    <select
                        aria-label="Tracking subject"
                        className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                        value={trackSubject}
                        onChange={(event) => setTrackSubject(event.target.value)}
                        disabled={!trackSection}
                    >
                        <option value="">Choose subject</option>
                        {trackedSubjects.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>
                {tracked ? (
                    <div className="grid gap-5 md:grid-cols-3">
                        <AccessGroup
                            title="Class teacher"
                            people={tracked.classTeacher ? [tracked.classTeacher] : []}
                        />
                        <AccessGroup title="Subject teachers" people={tracked.subjectTeachers} />
                        <div className="grid content-start gap-2">
                            <h3 className="text-sm font-semibold">Extra access</h3>
                            {tracked.grantedAccess.length ? (
                                tracked.grantedAccess.map((item) => (
                                    <div
                                        key={item.id}
                                        className="border-border/60 flex items-start justify-between gap-3 border-b py-2 text-sm"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {item.requester.firstName} {item.requester.lastName}{" "}
                                                · {item.type}
                                            </p>
                                            <p className="text-muted-foreground text-xs">
                                                {item.reason === null ||
                                                item.requestedById === item.reviewedById
                                                    ? "Direct grant"
                                                    : "Approved request"}
                                                {" · "}
                                                {item.reviewedBy
                                                    ? `by ${item.reviewedBy.firstName} ${item.reviewedBy.lastName}`
                                                    : "Approved"}
                                                {item.reviewedAt
                                                    ? ` · ${new Date(item.reviewedAt).toLocaleDateString()}`
                                                    : ""}
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => void revokeGrant(item)}
                                        >
                                            Revoke
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-sm">
                                    No extra access grants.
                                </p>
                            )}
                        </div>
                    </div>
                ) : null}
            </section>

            <Dialog
                open={Boolean(action)}
                onOpenChange={(open) => {
                    if (!open) setAction(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {action
                                ? `${action.kind[0].toUpperCase()}${action.kind.slice(1)} access`
                                : "Review access"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-3 pt-3">
                        <Label htmlFor="review-remarks">
                            Remarks{action?.kind === "reject" ? " (required)" : " (optional)"}
                        </Label>
                        <textarea
                            id="review-remarks"
                            className="border-input bg-background min-h-24 rounded-md border px-3 py-2 text-sm"
                            value={remarks}
                            maxLength={500}
                            onChange={(event) => setRemarks(event.target.value)}
                            required={action?.kind === "reject"}
                        />
                        <Button
                            disabled={
                                !action ||
                                (action.kind === "reject" && !remarks.trim()) ||
                                approve.isPending ||
                                reject.isPending ||
                                revoke.isPending
                            }
                            onClick={() => void runAction()}
                        >
                            {action?.kind === "approve"
                                ? "Approve"
                                : action?.kind === "reject"
                                  ? "Reject"
                                  : "Revoke"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={grantOpen} onOpenChange={setGrantOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Grant access</DialogTitle>
                    </DialogHeader>
                    <form className="grid gap-4 pt-3" onSubmit={(event) => void submitGrant(event)}>
                        <div className="grid gap-2">
                            <Label htmlFor="grant-teacher">Teacher</Label>
                            <select
                                id="grant-teacher"
                                className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                                value={grantTeacher}
                                onChange={(event) => setGrantTeacher(event.target.value)}
                                required
                            >
                                <option value="">Choose teacher</option>
                                {activeTeachers.map((teacher) => (
                                    <option key={teacher.userId} value={teacher.userId}>
                                        {teacher.user.firstName} {teacher.user.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="grant-type">Access type</Label>
                            <select
                                id="grant-type"
                                className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                                value={grantType}
                                onChange={(event) => setGrantType(event.target.value as AccessType)}
                            >
                                <option value="HOMEWORK">Homework</option>
                                <option value="MARKS">Marks</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="grant-section">Section</Label>
                            <select
                                id="grant-section"
                                className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                                value={grantSection}
                                onChange={(event) => {
                                    setGrantSection(event.target.value);
                                    setGrantSubject("");
                                }}
                                required
                            >
                                <option value="">Choose section</option>
                                {sections.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="grant-subject">Subject</Label>
                            <select
                                id="grant-subject"
                                className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                                value={grantSubject}
                                onChange={(event) => setGrantSubject(event.target.value)}
                                disabled={!grantSection}
                                required
                            >
                                <option value="">Choose subject</option>
                                {grantSubjects.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="grant-remarks">Remarks</Label>
                            <Input
                                id="grant-remarks"
                                value={grantRemarks}
                                onChange={(event) => setGrantRemarks(event.target.value)}
                                maxLength={500}
                            />
                        </div>
                        <Button type="submit" disabled={grant.isPending}>
                            {grant.isPending ? "Granting…" : "Grant access"}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function AccessGroup({
    title,
    people,
}: {
    title: string;
    people: Array<{ user: { firstName: string; lastName: string; mobileNumber: string } }>;
}): JSX.Element {
    return (
        <div className="grid content-start gap-2">
            <h3 className="text-sm font-semibold">{title}</h3>
            {people.length ? (
                people.map((person, index) => (
                    <p
                        key={`${person.user.mobileNumber}-${index}`}
                        className="border-border/60 border-b py-2 text-sm"
                    >
                        {person.user.firstName} {person.user.lastName}
                        <span className="text-muted-foreground block text-xs">
                            {person.user.mobileNumber}
                        </span>
                    </p>
                ))
            ) : (
                <p className="text-muted-foreground text-sm">None assigned.</p>
            )}
        </div>
    );
}

export function RequestAccessPage(): JSX.Element {
    const user = useAuthStore((state) => state.user);
    const isAdmin = user?.role === Role.ADMIN;

    return (
        <div className="bg-card text-card-foreground ring-foreground/10 overflow-hidden rounded-xl shadow-sm ring-1">
            <div className="border-border/60 from-primary/12 via-primary/5 flex items-center gap-3 border-b bg-linear-to-br to-transparent px-6 py-5">
                <span className="bg-primary/12 text-primary ring-primary/25 flex size-10 items-center justify-center rounded-xl ring-1">
                    <KeyRound className="size-5" />
                </span>
                <div>
                    <h1 className="text-xl font-semibold">
                        {isAdmin ? "Access Requests" : "Request Access"}
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {isAdmin
                            ? "Review and manage additional teacher access."
                            : "Request additional access for a section and subject."}
                    </p>
                </div>
            </div>
            <div className="px-6 py-6">
                {isAdmin ? (
                    <AdminAccessRequests />
                ) : (
                    <>
                        <RequestAccessForm />
                        <RequestHistoryTable />
                    </>
                )}
            </div>
        </div>
    );
}
