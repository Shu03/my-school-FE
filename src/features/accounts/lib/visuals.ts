import type { CSSProperties } from "react";

import { Fuel, Hammer, PencilRuler, Receipt, Utensils, type LucideIcon } from "lucide-react";

/** Hatched fill marks money that has left the school for good (spent on bills). */
export const SPENT_PATTERN: CSSProperties = {
    backgroundImage:
        "repeating-linear-gradient(135deg, transparent 0 3px, color-mix(in oklch, var(--background) 55%, transparent) 3px 5px)",
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
    petrol: Fuel,
    fuel: Fuel,
    diesel: Fuel,
    food: Utensils,
    stationery: PencilRuler,
    maintenance: Hammer,
    repair: Hammer,
};

export function getCategoryIcon(category: string): LucideIcon {
    return CATEGORY_ICONS[category.trim().toLowerCase()] ?? Receipt;
}
