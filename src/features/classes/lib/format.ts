/** Build up-to-two-letter initials from a teacher label, ignoring any trailing "(code)". */
export function teacherInitials(name: string): string {
    const cleaned = name.replace(/\s*\(.*\)\s*$/, "").trim();
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
        return "?";
    }

    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
    return `${first}${last}`.toUpperCase();
}
