import type { JSX } from "react";

import { useNavigate } from "react-router-dom";

import { AlertCircle, KeyRound, Mail, Phone, UserRound } from "lucide-react";

import { ROUTES } from "@constants/routes.constants";

import { Role } from "@/types/api";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

import { useProfile } from "../hooks/useProfile";

function formatDate(value: string | null): string {
    if (!value) {
        return "—";
    }

    return new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function DetailRow({ label, value }: { label: string; value: string }): JSX.Element {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-muted-foreground text-xs">{label}</span>
            <span className="text-sm font-medium">{value}</span>
        </div>
    );
}

export function ProfilePage(): JSX.Element {
    const navigate = useNavigate();
    const { data: profile, isLoading, isError } = useProfile();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center gap-2 py-16">
                <Spinner />
                <span className="text-muted-foreground text-sm">Loading profile...</span>
            </div>
        );
    }

    if (isError || !profile) {
        return (
            <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>Could not load your profile.</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-card text-card-foreground ring-foreground/10 overflow-hidden rounded-xl shadow-sm ring-1">
                <div className="border-border/60 from-primary/12 via-primary/5 border-b bg-linear-to-br to-transparent px-6 py-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary text-primary-foreground flex size-14 items-center justify-center rounded-full text-lg font-semibold shadow-sm">
                                {profile.firstName[0]}
                                {profile.lastName[0]}
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold tracking-tight">
                                    {profile.firstName} {profile.lastName}
                                </h1>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <Badge variant="secondary" className="capitalize">
                                        {profile.role.toLowerCase()}
                                    </Badge>
                                    {profile.isActive ? (
                                        <Badge>Active</Badge>
                                    ) : (
                                        <Badge variant="destructive">Inactive</Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" onClick={() => navigate(ROUTES.CHANGE_PASSWORD)}>
                            <KeyRound className="size-4" />
                            Change password
                        </Button>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Account</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                        <Phone className="text-muted-foreground size-4" />
                        <DetailRow label="Mobile number" value={profile.mobileNumber} />
                    </div>
                    <div className="flex items-center gap-2">
                        <Mail className="text-muted-foreground size-4" />
                        <DetailRow label="Email" value={profile.email ?? "—"} />
                    </div>
                    <DetailRow label="Member since" value={formatDate(profile.createdAt)} />
                    <DetailRow label="Last updated" value={formatDate(profile.updatedAt)} />
                </CardContent>
            </Card>

            {profile.role === Role.TEACHER && profile.teacherProfile && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <UserRound className="size-4" />
                            Teacher details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <DetailRow
                            label="Employee code"
                            value={profile.teacherProfile.employeeCode}
                        />
                        <DetailRow
                            label="Joining date"
                            value={formatDate(profile.teacherProfile.joiningDate)}
                        />
                    </CardContent>
                </Card>
            )}

            {profile.role === Role.STUDENT && profile.studentProfile && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <UserRound className="size-4" />
                            Student details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <DetailRow
                            label="Admission number"
                            value={profile.studentProfile.admissionNumber}
                        />
                        <DetailRow
                            label="Date of birth"
                            value={formatDate(profile.studentProfile.dateOfBirth)}
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
