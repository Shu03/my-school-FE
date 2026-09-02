import * as React from "react";

import { Dialog as SheetPrimitive } from "radix-ui";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
    return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger(props: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
    return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) {
    return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal(props: React.ComponentProps<typeof SheetPrimitive.Portal>) {
    return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
    className,
    ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
    return (
        <SheetPrimitive.Overlay
            data-slot="sheet-overlay"
            className={cn(
                "data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 fixed inset-0 isolate z-50 bg-black/30 duration-200 supports-backdrop-filter:backdrop-blur-xs motion-reduce:duration-0",
                className,
            )}
            {...props}
        />
    );
}

function SheetContent({
    className,
    children,
    showCloseButton = true,
    ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
    showCloseButton?: boolean;
}) {
    return (
        <SheetPortal>
            <SheetOverlay />
            <SheetPrimitive.Content
                data-slot="sheet-content"
                className={cn(
                    "bg-popover text-popover-foreground data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right fixed inset-y-0 right-0 z-50 flex h-dvh w-full flex-col border-l shadow-xl duration-300 outline-none motion-reduce:duration-0 sm:max-w-lg",
                    className,
                )}
                {...props}
            >
                {children}
                {showCloseButton ? (
                    <SheetPrimitive.Close asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-lg"
                            className="absolute top-3 right-3 z-10"
                        >
                            <XIcon />
                            <span className="sr-only">Close panel</span>
                        </Button>
                    </SheetPrimitive.Close>
                ) : null}
            </SheetPrimitive.Content>
        </SheetPortal>
    );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="sheet-header"
            className={cn("flex flex-col gap-1.5 px-5 py-4 pr-14", className)}
            {...props}
        />
    );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="sheet-footer"
            className={cn("border-border/60 bg-muted/40 mt-auto border-t px-5 py-4", className)}
            {...props}
        />
    );
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
    return (
        <SheetPrimitive.Title
            data-slot="sheet-title"
            className={cn("text-base font-semibold", className)}
            {...props}
        />
    );
}

function SheetDescription({
    className,
    ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
    return (
        <SheetPrimitive.Description
            data-slot="sheet-description"
            className={cn("text-muted-foreground text-sm", className)}
            {...props}
        />
    );
}

export {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetOverlay,
    SheetPortal,
    SheetTitle,
    SheetTrigger,
};
