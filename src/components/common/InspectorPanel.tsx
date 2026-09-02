import { useSyncExternalStore, type JSX, type ReactNode } from "react";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface InspectorPanelProps {
    open: boolean;
    title: string;
    description: string;
    children: ReactNode;
    onOpenChange: (open: boolean) => void;
    className?: string;
}

function useDesktopInspector(): boolean {
    return useSyncExternalStore(
        (onStoreChange) => {
            const mediaQuery = window.matchMedia("(min-width: 1280px)");
            mediaQuery.addEventListener("change", onStoreChange);
            return () => mediaQuery.removeEventListener("change", onStoreChange);
        },
        () => window.matchMedia("(min-width: 1280px)").matches,
        () => true,
    );
}

export function InspectorPanel({
    open,
    title,
    description,
    children,
    onOpenChange,
    className,
}: InspectorPanelProps): JSX.Element | null {
    const isDesktop = useDesktopInspector();

    if (!open) {
        return null;
    }

    if (!isDesktop) {
        return (
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className={cn("overflow-hidden", className)}>
                    <SheetHeader className="sr-only">
                        <SheetTitle>{title}</SheetTitle>
                        <SheetDescription>{description}</SheetDescription>
                    </SheetHeader>
                    <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <>
            <button
                type="button"
                tabIndex={-1}
                aria-label="Close panel"
                className="bg-foreground/8 absolute inset-0 z-20 cursor-default backdrop-blur-[1px]"
                onClick={() => onOpenChange(false)}
            />
            <aside
                aria-label={title}
                className={cn(
                    "border-border/70 bg-card absolute inset-y-0 right-0 z-30 w-[min(42rem,calc(100%-2rem))] overflow-hidden border-l shadow-2xl",
                    className,
                )}
            >
                <p className="sr-only">{description}</p>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    className="absolute top-3 right-3 z-10"
                    aria-label="Close panel"
                    onClick={() => onOpenChange(false)}
                >
                    <X />
                </Button>
                <div className="h-full overflow-y-auto">{children}</div>
            </aside>
        </>
    );
}
