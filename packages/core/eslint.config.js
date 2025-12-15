import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
export default [{
  files: ["**/*.ts"],
  languageOptions: { parser: tsparser, parserOptions: { ecmaVersion: "latest", sourceType: "module" } },
  plugins: { "@typescript-eslint": tseslint },
  rules: { "no-console": "off", "@typescript-eslint/no-explicit-any": "off" }
}];
