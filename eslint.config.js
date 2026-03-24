import js from "@eslint/js";
import globals from "globals";
import importPlugin from "eslint-plugin-import";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
    globalIgnores(["dist", "src/components/ui"]),
    {
        files: ["**/*.{ts,tsx}"],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        settings: {
            "import/resolver": {
                typescript: {
                    alwaysTryTypes: true,
                },
            },
        },
        plugins: {
            import: importPlugin,
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/explicit-function-return-type": [
                "warn",
                {
                    allowExpressions: true,
                    allowConciseArrowFunctionExpressionsStartingWithVoid: true,
                },
            ],
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            "import/order": [
                "error",
                {
                    groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
                    pathGroups: [
                        { pattern: "react", group: "external", position: "before" },
                        { pattern: "react-*", group: "external", position: "before" },
                        { pattern: "@/types/**", group: "internal", position: "before" },
                        { pattern: "@/lib/**", group: "internal", position: "before" },
                        { pattern: "@/api/**", group: "internal", position: "before" },
                        { pattern: "@/stores/**", group: "internal", position: "before" },
                        { pattern: "@/hooks/**", group: "internal", position: "before" },
                        { pattern: "@/providers/**", group: "internal", position: "after" },
                        { pattern: "@/routes/**", group: "internal", position: "after" },
                        { pattern: "@/layouts/**", group: "internal", position: "after" },
                        { pattern: "@/features/**", group: "internal", position: "after" },
                        { pattern: "@/components/**", group: "internal", position: "after" },
                    ],
                    pathGroupsExcludedImportTypes: ["react", "react-*"],
                    "newlines-between": "always",
                    alphabetize: {
                        order: "asc",
                        caseInsensitive: true,
                    },
                },
            ],
            "import/newline-after-import": "error",
        },
    },
]);
