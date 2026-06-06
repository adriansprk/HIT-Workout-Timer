import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    ignores: [
      ".next/**",
      "coverage/**",
      "cypress/screenshots/**",
      "cypress/videos/**",
      "node_modules/**",
    ],
  },
];

export default config;
