import { env } from "@config/env";

import { API_ENDPOINTS } from "@constants/apiEndpoints.constants";
import { AUTH_EVENTS } from "@constants/auth.constants";
import { HTTP_STATUS } from "@constants/httpStatus.constants";

import type { ApiEnvelope } from "@/types/api";

import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./tokenStorage";

const API_BASE_URL = env.VITE_API_BASE_URL;

/** Shape of the token pair returned by the refresh endpoint. */
interface RefreshTokens {
    accessToken: string;
    refreshToken: string;
}

// --- Token refresh queue ---

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null): void {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token!);
        }
    });
    failedQueue = [];
}

function emitSessionExpired(): void {
    window.dispatchEvent(new CustomEvent(AUTH_EVENTS.SESSION_EXPIRED));
}

// --- Fetch client ---

export interface FetchOptions extends RequestInit {
    /** Skip unwrapping the API envelope (return raw response body) */
    skipUnwrap?: boolean;
    /** Skip 401 token-refresh retry logic (used for auth endpoints) */
    skipAuth?: boolean;
}

export class ApiError extends Error {
    status: number;
    response: Response;

    constructor(message: string, status: number, response: Response) {
        super(message);
        this.status = status;
        this.response = response;
    }
}

async function apiFetch<T = unknown>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { skipUnwrap = false, skipAuth = false, ...fetchOptions } = options;

    const url = `${API_BASE_URL}${endpoint}`;

    // Create headers object, starting with base headers
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    // Merge in any headers from options
    if (fetchOptions.headers) {
        if (fetchOptions.headers instanceof Headers) {
            fetchOptions.headers.forEach((value, key) => {
                headers[key] = value;
            });
        } else if (Array.isArray(fetchOptions.headers)) {
            fetchOptions.headers.forEach(([key, value]) => {
                headers[key] = value;
            });
        } else {
            Object.assign(headers, fetchOptions.headers);
        }
    }

    // Attach access token
    const token = getAccessToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let response = await fetch(url, { ...fetchOptions, headers });

    // Handle 401: attempt token refresh
    if (response.status === HTTP_STATUS.UNAUTHORIZED && !skipAuth) {
        const isAuthEndpoint =
            endpoint.includes(API_ENDPOINTS.AUTH.LOGIN) ||
            endpoint.includes(API_ENDPOINTS.AUTH.REFRESH);

        if (!isAuthEndpoint) {
            if (isRefreshing) {
                // Queue this request until refresh completes
                try {
                    const newToken = await new Promise<string>((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    });
                    headers.Authorization = `Bearer ${newToken}`;
                    response = await fetch(url, { ...fetchOptions, headers });
                } catch (error) {
                    return Promise.reject(error);
                }
            } else {
                isRefreshing = true;
                const refreshToken = getRefreshToken();

                if (!refreshToken) {
                    isRefreshing = false;
                    clearTokens();
                    emitSessionExpired();
                    return Promise.reject(new Error("No refresh token available"));
                }

                try {
                    const refreshResponse = await fetch(
                        `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ refreshToken }),
                        },
                    );

                    if (!refreshResponse.ok) {
                        throw new Error("Token refresh failed");
                    }

                    const envelope = (await refreshResponse.json()) as ApiEnvelope<RefreshTokens>;
                    const { accessToken, refreshToken: newRefreshToken } = envelope.data;

                    setTokens(accessToken, newRefreshToken);
                    processQueue(null, accessToken);

                    headers.Authorization = `Bearer ${accessToken}`;
                    response = await fetch(url, { ...fetchOptions, headers });
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    clearTokens();
                    emitSessionExpired();
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }
        }
    }

    if (!response.ok) {
        throw new ApiError(`API Error: ${response.status}`, response.status, response);
    }

    const data = await response.json();

    // Unwrap the API envelope — return only `data` field
    if (skipUnwrap || !data.data) {
        return data as T;
    }

    return data.data as T;
}

export default apiFetch;
