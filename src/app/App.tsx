import type { JSX } from "react";

import { RouterProvider } from "react-router-dom";

import { AuthInitializer } from "@components/common/AuthInitializer";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { router } from "./router";

export function App(): JSX.Element {
    return (
        <AuthInitializer>
            <TooltipProvider>
                <RouterProvider router={router} />
            </TooltipProvider>
            <Toaster />
        </AuthInitializer>
    );
}
