import type { ComponentProps, ComponentType, FormEventHandler, JSX, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface AccountFormDialogProps {
    open: boolean;
    icon: ComponentType<{ className?: string }>;
    title: string;
    description: ReactNode;
    submitLabel: string;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: FormEventHandler<HTMLFormElement>;
    children: ReactNode;
}

export function AccountFormDialog({
    open,
    icon: Icon,
    title,
    description,
    submitLabel,
    isSubmitting,
    onOpenChange,
    onSubmit,
    children,
}: AccountFormDialogProps): JSX.Element {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
                <div className="border-border/60 from-primary/12 via-primary/5 flex items-start gap-4 border-b bg-linear-to-br to-transparent px-6 pt-6 pb-5">
                    <span className="bg-primary/12 text-primary ring-primary/25 texture-sheen flex size-11 shrink-0 items-center justify-center rounded-xl ring-1">
                        <Icon className="size-5" />
                    </span>
                    <DialogHeader className="gap-1 pr-6">
                        <DialogTitle className="text-lg font-semibold tracking-tight">
                            {title}
                        </DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>
                </div>

                <form className="flex min-h-0 flex-col" onSubmit={onSubmit} noValidate>
                    <div className="flex max-h-[65vh] flex-col gap-5 overflow-y-auto px-6 py-6">
                        {children}
                    </div>
                    <div className="bg-muted/40 flex flex-col-reverse gap-2 border-t px-6 py-4 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isSubmitting}
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="texture-sheen" disabled={isSubmitting}>
                            {isSubmitting && <Spinner />}
                            {submitLabel}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface FormFieldProps {
    id: string;
    label: string;
    optional?: boolean;
    hint?: ReactNode;
    error?: string;
    className?: string;
    children: ReactNode;
}

export function FormField({
    id,
    label,
    optional = false,
    hint,
    error,
    className,
    children,
}: FormFieldProps): JSX.Element {
    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <Label htmlFor={id} className="flex items-baseline gap-1.5">
                {label}
                {optional && (
                    <span className="text-muted-foreground text-xs font-normal">Optional</span>
                )}
            </Label>
            {children}
            {error ? (
                <p id={`${id}-error`} role="alert" className="text-destructive text-xs">
                    {error}
                </p>
            ) : (
                hint && <p className="text-muted-foreground text-xs">{hint}</p>
            )}
        </div>
    );
}

/** Rupee-prefixed amount input; entered with 2-decimal precision. */
export function MoneyInput({ className, ...props }: ComponentProps<"input">): JSX.Element {
    return (
        <div className="relative">
            <span
                className="text-muted-foreground pointer-events-none absolute inset-y-0 left-3 flex items-center text-base font-semibold"
                aria-hidden="true"
            >
                ₹
            </span>
            <Input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className={cn("h-11 pl-8 text-lg font-semibold tabular-nums md:text-lg", className)}
                {...props}
            />
        </div>
    );
}
