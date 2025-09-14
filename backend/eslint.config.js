import globals from "globals";
import pluginJs from "@eslint/js";
import pluginPrettier from "eslint-plugin-prettier";
import configPrettier from "eslint-config-prettier";

export default [
  {
    // Ignore patterns
    ignores: ["node_modules/", "dist/"],
  },
  {
    files: ["src/**/*.js", "server.js", "aliases.js", "routes/**/*.js", "config/**/*.js", "models/**/*.js", "scripts/**/*.js", "seeders/**/*.js"], // Apply to all .js files in src and other relevant directories
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      "no-undef": "error",
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "prettier/prettier": "error",
    },
    settings: {
      "import/resolver": {
        "alias": {
          "map": [
            ["~", "./src"],
            ["middleware", "./src/middleware"],
            ["config", "./src/config"],
            ["domains", "./src/domains"],
            ["services", "./src/services"],
            ["utils", "./src/utils"],
            ["models", "./models"]
          ],
          "extensions": [".js", ".json"]
        }
      }
    }
  },
  // Prettier should be the last configuration to override other formatting rules
  configPrettier,
];