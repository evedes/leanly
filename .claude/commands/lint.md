# ESLINT CODE QUALITY CHECKS

Run ESLint to check code quality, catch bugs, and enforce coding standards.

## What to do

1. Run `pnpm lint` from project root
2. If errors/warnings found:
   - Review each issue carefully
   - Fix linting errors in the code
   - Use `pnpm lint --fix` for auto-fixable issues if needed
   - Re-run until all errors are resolved
3. Report results to user

## Rules

- NEVER disable eslint rules without good reason
- Fix issues, don't suppress them
- Follow existing code patterns
- Pay attention to unused variables/imports
- Respect the project's ESLint configuration
- Security warnings should be addressed immediately

## Expected outcome

All ESLint checks pass with no errors or warnings in frontend and backend.
