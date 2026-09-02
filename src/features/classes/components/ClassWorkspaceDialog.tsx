import type { JSX } from "react";

import { PERMISSIONS } from "@constants/permissions.constants";

import { Role } from "@/types/api";

import { hasPermission, useAuthStore } from "@features/auth";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { ClassCurriculumSection } from "./ClassCurriculumSection";

interface ClassWorkspaceDialogProps {
    open: boolean;
    academicYearName: string;
    classNumber: number | null;
    onOpenChange: (open: boolean) => void;
}

export function ClassWorkspaceDialog({
    open,
    academicYearName,
    classNumber,
    onOpenChange,
}: ClassWorkspaceDialogProps): JSX.Element {
    const user = useAuthStore((state) => state.user);
    const isAdmin = user?.role === Role.ADMIN;
    const canManageSubjects =
        isAdmin || hasPermission(user?.permissions, PERMISSIONS.SUBJECT_MANAGE);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-5xl">
                <DialogHeader className="border-border/60 from-primary/12 via-primary/5 border-b bg-linear-to-br to-transparent px-6 py-5 pr-16">
                    <DialogTitle className="text-xl">
                        Class {classNumber ?? ""} subjects
                    </DialogTitle>
                    <DialogDescription className="mt-1">
                        Manage the subject catalog shared by every Section · {academicYearName}
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[75vh] overflow-y-auto px-6 py-5">
                    {classNumber !== null ? (
                        <ClassCurriculumSection
                            gradeLevel={classNumber}
                            canManage={canManageSubjects}
                            canDelete={isAdmin}
                        />
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    );
}
