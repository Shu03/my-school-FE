import type { JSX, ReactNode } from "react";

import { Label } from "@/components/ui/label";

interface FieldProps {
    label: string;
    htmlFor: string;
    error?: string;
    required?: boolean;
    children: ReactNode;
}

/** Labeled form field wrapper with inline validation message. */
export function Field({ label, htmlFor, error, required, children }: FieldProps): JSX.Element {
    return (
        <div className="flex flex-col gap-2">
            <Label htmlFor={htmlFor}>
                {label}
                {required && <span className="text-destructive ml-0.5">*</span>}
            </Label>
            {children}
            {error && <p className="text-destructive text-xs">{error}</p>}
        </div>
    );
}
