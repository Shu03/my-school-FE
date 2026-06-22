import type { JSX } from "react";

import { RouterProvider } from "react-router-dom";

import { AuthInitializer } from "@components/common/AuthInitializer";

import { router } from "./router";

export function App(): JSX.Element {
    return (
        <AuthInitializer>
            <RouterProvider router={router} />
        </AuthInitializer>
    );
}
