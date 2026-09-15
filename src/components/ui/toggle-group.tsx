"use client";

import * as React from "react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function ToggleGroup({
    className,
    ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
    return (
        <ToggleGroupPrimitive.Root
            data-slot="toggle-group"
            className={cn(
                "bg-muted/60 inline-flex items-center gap-0.5 rounded-lg p-0.5",
                className,
            )}
            {...props}
        />
    );
}

function ToggleGroupItem({
    className,
    ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
    return (
        <ToggleGroupPrimitive.Item
            data-slot="toggle-group-item"
            className={cn(
                "text-muted-foreground focus-visible:ring-ring/50 inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold whitespace-nowrap transition-all focus-visible:ring-[3px] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
                "hover:text-foreground data-[state=on]:bg-background data-[state=on]:shadow-sm",
                "[&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
                className,
            )}
            {...props}
        />
    );
}

export { ToggleGroup, ToggleGroupItem };
