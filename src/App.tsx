import type { JSX } from "react";

import { RouterProvider } from "react-router-dom";

import { router } from "@/routes";

function App(): JSX.Element {
    return <RouterProvider router={router} />;
}

export default App;
