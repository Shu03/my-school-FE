import type { CSSProperties, JSX } from "react";

import { Toaster as Sonner, type ToasterProps } from "sonner";

import { useThemeStore } from "@/stores/theme.store";

function Toaster(props: ToasterProps): JSX.Element {
    const theme = useThemeStore((state) => state.theme);

    return (
        <Sonner
            theme={theme}
            className="toaster group"
            position="bottom-right"
            richColors
            closeButton
            style={
                {
                    "--normal-bg": "var(--popover)",
                    "--normal-text": "var(--popover-foreground)",
                    "--normal-border": "var(--border)",
                } as CSSProperties
            }
            {...props}
        />
    );
}

export { Toaster };
