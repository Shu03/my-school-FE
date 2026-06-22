/**
 * Safe JWT payload extraction and validation utilities.
 * Handles JWT parsing without validation to extract claims like exp and type.
 */

interface JWTPayload {
    sub?: string;
    role?: string;
    permissions?: string[];
    type?: "access" | "refresh" | "first_login";
    exp?: number;
    iat?: number;
    [key: string]: unknown;
}

/**
 * Safely parse JWT payload without validation.
 * Returns null if parsing fails.
 *
 * @param token The JWT token string
 * @returns Decoded payload or null if invalid
 */
export function parseJWTPayload(token: string | null): JWTPayload | null {
    if (!token) return null;

    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        // Decode the payload (second part)
        const payload = parts[1];
        const decoded = atob(payload);
        return JSON.parse(decoded) as JWTPayload;
    } catch {
        // Failed to parse token
        return null;
    }
}

/**
 * Get token expiration time in milliseconds.
 * Returns null if token is invalid or exp claim missing.
 *
 * @param token The JWT token string
 * @returns Expiration time in milliseconds or null
 */
export function getTokenExpirationMs(token: string | null): number | null {
    const payload = parseJWTPayload(token);
    if (!payload?.exp) return null;

    // exp is in seconds, convert to milliseconds
    return payload.exp * 1000;
}

/**
 * Check if token is expired.
 *
 * @param token The JWT token string
 * @returns true if token is expired, false otherwise
 */
export function isTokenExpired(token: string | null): boolean {
    const expirationMs = getTokenExpirationMs(token);
    if (!expirationMs) return true; // If we can't parse, assume expired

    return Date.now() >= expirationMs;
}

/**
 * Calculate milliseconds until token expiration.
 *
 * @param token The JWT token string
 * @returns Milliseconds until expiration, or -1 if already expired or invalid
 */
export function getMillisecondsUntilExpiry(token: string | null): number {
    const expirationMs = getTokenExpirationMs(token);
    if (!expirationMs) return -1;

    const msUntilExpiry = expirationMs - Date.now();
    return msUntilExpiry > 0 ? msUntilExpiry : -1;
}

/**
 * Get token type claim.
 *
 * @param token The JWT token string
 * @returns Token type ("access", "refresh", "first_login") or null
 */
export function getTokenType(token: string | null): JWTPayload["type"] | null {
    const payload = parseJWTPayload(token);
    return payload?.type ?? null;
}

/**
 * Check if token is an access token.
 *
 * @param token The JWT token string
 * @returns true if token type is "access"
 */
export function isAccessToken(token: string | null): boolean {
    return getTokenType(token) === "access";
}

/**
 * Check if token is a first-login token.
 *
 * @param token The JWT token string
 * @returns true if token type is "first_login"
 */
export function isFirstLoginToken(token: string | null): boolean {
    return getTokenType(token) === "first_login";
}

/**
 * Check if token is a refresh token.
 *
 * @param token The JWT token string
 * @returns true if token type is "refresh"
 */
export function isRefreshToken(token: string | null): boolean {
    return getTokenType(token) === "refresh";
}
