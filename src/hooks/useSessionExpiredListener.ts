import { useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { useAuthStore } from "@/stores/auth.store";

export function useSessionExpiredListener(): void {
    const logout = useAuthStore((s) => s.logout);
    const navigate = useNavigate();

    useEffect(() => {
        function handleSessionExpired(): void {
            logout();
            navigate("/login", { replace: true });
        }

        window.addEventListener("auth:session-expired", handleSessionExpired);
        return () => {
            window.removeEventListener("auth:session-expired", handleSessionExpired);
        };
    }, [logout, navigate]);
}
