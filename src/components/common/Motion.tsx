import type { JSX, ReactNode } from "react";

import { motion, useReducedMotion, type Variants } from "motion/react";

/** Shared easing — a calm, decelerating curve used across the app's motion. */
const EASE = [0.16, 1, 0.3, 1] as const;

const containerVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

/**
 * Fades + lifts page content on mount. Motivated by navigation feedback: re-keying
 * this wrapper on the route path gives each page a fresh entrance.
 */
export function PageTransition({ children }: { children: ReactNode }): JSX.Element {
    const reduceMotion = useReducedMotion();
    return (
        <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
        >
            {children}
        </motion.div>
    );
}

/**
 * Container that staggers the entrance of its {@link StaggerItem} children.
 * Used for sequence-revealing groups such as the dashboard metric cards.
 */
export function Stagger({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}): JSX.Element {
    const reduceMotion = useReducedMotion();
    return (
        <motion.div
            className={className}
            variants={containerVariants}
            initial={reduceMotion ? false : "hidden"}
            animate="show"
        >
            {children}
        </motion.div>
    );
}

/** A single item revealed by a parent {@link Stagger}. Collapses to static under reduced motion. */
export function StaggerItem({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}): JSX.Element {
    const reduceMotion = useReducedMotion();
    return (
        <motion.div className={className} variants={reduceMotion ? undefined : itemVariants}>
            {children}
        </motion.div>
    );
}
