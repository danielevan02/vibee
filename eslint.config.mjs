import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // New in the Next.js 16 config (eslint-plugin-react-hooks v6). It flags
      // eight pre-existing spots that sync props or external state into state
      // inside an effect - data fetching in bookmarks/explore/notifications,
      // reset-on-open in the lightbox and emoji picker, and prop mirroring in
      // the dialog wrapper. Each needs a real restructure (a `key`, or deriving
      // during render), which does not belong in an upgrade change. Kept as a
      // warning so the signal stays visible instead of being silenced.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts", "src/generated/**"],
  },
];

export default eslintConfig;
