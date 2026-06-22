import type { JSX } from "react";

import { Check, X } from "lucide-react";

import {
    PASSWORD_POLICY_MESSAGE_DETAILS,
    type PasswordPolicyFeedback,
} from "../schemas/password-change.schema";

interface PasswordPolicyDisplayProps {
    feedback: PasswordPolicyFeedback;
}

/**
 * Display real-time password policy validation feedback.
 * Shows checkmarks for satisfied requirements and X for unsatisfied.
 */
export function PasswordPolicyDisplay({ feedback }: PasswordPolicyDisplayProps): JSX.Element {
    const policies: (keyof PasswordPolicyFeedback)[] = [
        "length",
        "uppercase",
        "lowercase",
        "digit",
        "special",
    ];

    return (
        <div className="bg-muted/50 space-y-2 rounded-lg p-3">
            <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                Password requirements
            </p>
            <div className="space-y-1.5">
                {policies.map((policy) => (
                    <div
                        key={policy}
                        className={`flex items-center gap-2 text-xs transition-colors ${
                            feedback[policy] ? "text-primary" : "text-muted-foreground"
                        }`}
                    >
                        {feedback[policy] ? (
                            <Check className="size-3.5 shrink-0" />
                        ) : (
                            <X className="size-3.5 shrink-0" />
                        )}
                        <span>{PASSWORD_POLICY_MESSAGE_DETAILS[policy]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
