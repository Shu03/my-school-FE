import { StrictMode } from "react";

import { createRoot } from "react-dom/client";

import { App } from "@app/App";
import { QueryProvider } from "@app/providers/QueryProvider";

import { ErrorBoundary } from "@components/common/ErrorBoundary";

import "@app/styles/index.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ErrorBoundary>
            <QueryProvider>
                <App />
            </QueryProvider>
        </ErrorBoundary>
    </StrictMode>,
);
