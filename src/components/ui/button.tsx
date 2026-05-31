import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    {
        variants: {
            variant: {
                default:
                    "relative bg-gradient-to-b from-primary/90 to-primary text-primary-foreground shadow-[0_0_12px_-3px] shadow-primary/40 ring-1 ring-inset ring-primary/60 before:absolute before:inset-x-0 before:top-0 before:h-px before:rounded-t-lg before:bg-white/25 hover:from-primary/80 hover:to-primary/95",
                outline:
                    "relative bg-gradient-to-b from-background to-muted/50 text-foreground shadow-[0_0_8px_-3px] shadow-border/30 ring-1 ring-inset ring-border before:absolute before:inset-x-0 before:top-0 before:h-px before:rounded-t-lg before:bg-white/40 hover:from-muted/30 hover:to-muted/60 dark:from-input/30 dark:to-input/50 dark:ring-input dark:before:bg-white/10",
                secondary:
                    "relative bg-gradient-to-b from-secondary/80 to-secondary text-secondary-foreground shadow-[0_0_8px_-3px] shadow-secondary/30 ring-1 ring-inset ring-secondary-foreground/10 before:absolute before:inset-x-0 before:top-0 before:h-px before:rounded-t-lg before:bg-white/30 hover:from-secondary/70 hover:to-secondary/90",
                ghost: "relative hover:bg-gradient-to-b hover:from-muted/50 hover:to-muted hover:shadow-[0_0_6px_-3px] hover:shadow-border/20 hover:ring-1 hover:ring-inset hover:ring-border/50 aria-expanded:bg-muted dark:hover:from-muted/30 dark:hover:to-muted/50",
                destructive:
                    "relative bg-gradient-to-b from-destructive/80 to-destructive text-white shadow-[0_0_12px_-3px] shadow-destructive/40 ring-1 ring-inset ring-destructive/60 before:absolute before:inset-x-0 before:top-0 before:h-px before:rounded-t-lg before:bg-white/20 hover:from-destructive/70 hover:to-destructive/90",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default:
                    "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
                xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
                sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
                lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
                icon: "size-8",
                "icon-xs":
                    "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
                "icon-sm":
                    "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
                "icon-lg": "size-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

function Button({
    className,
    variant = "default",
    size = "default",
    asChild = false,
    ...props
}: React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot.Root : "button";

    return (
        <Comp
            data-slot="button"
            data-variant={variant}
            data-size={size}
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Button, buttonVariants };
