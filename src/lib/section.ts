/** Uniform section label used across the app, e.g. "Class 5 – A". */
export function formatSectionLabel(classLevel: number, sectionName: string): string {
    return `Class ${classLevel} – ${sectionName}`;
}
