# Code Style
- Apply Clean Code™️.
- Avoid duplicate code.
- Avoid redundant variables: don't create temporary variables that simply rename another value unless it improves readability or documents intent.
- Prefer direct returns, destructuring, and small helper functions.
- If a variable adds clarity, name it descriptively and keep its scope minimal.
- Files should never be longer than 100 lines.
- Methods should never be longer than 10 lines.
- Never use `eslint-disable`, `biome-ignore`, or similar comments to silence linter errors; instead fix the underlying issue.
- No README or documentation needed.
- No jsdoc. No comments needed. Code explains itself.
- Prefer composition to inheritance.
- Use constants for fixed values instead of magic numbers or strings.
- Use descriptive variable and function names.
- Avoid side effects in functions. Write pure functions whenever possible.
- No unused code. No unused variables, functions, imports, or exports.
- Never implement hacky workarounds. Use built-in language/platform features.

# React Native / Expo Specific
- Don't use Alert.alert for dialogs/menus. Use Modal-based components (like ActionMenu) that close on tap outside.
- Don't use colored icons, use mdi or similar icon font and style.

# Workflow
- When user corrects general behavior, update these instructions accordingly.
- Never commit build files (ios/, android/build/, node_modules/, etc.). Only commit source files.
- After each change:
  1. Run `npm run prebuild` (typecheck + lint) and fix any errors
  2. Ask me to verify the change works
  3. If I approve, ALWAYS perform thorough code review WITHOUT being asked. Re-read each and every changed file and check for:
     - Unused imports
     - Hardcoded colors/values that should use theme constants (homeColors, homeSpacing, etc.)
     - Magic numbers or strings that should be constants
     - Duplicate code across files (especially string literals that appear in multiple places)
     - Inconsistent patterns compared to rest of codebase
     - Variables declared but never used
     - Functions that could be simplified
     - Constants defined in wrong location (should be in shared copy/styles files)
  4. Run `npm run prebuild` to verify no errors after review
  5. Suggest commit message (conventional commits style, descriptive commit body ~5 lines)
  5. Wait for my approval before committing.

# Communication
- pcr = picky code review
- vfd = verified, picky code review

