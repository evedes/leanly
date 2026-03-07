# TYPESCRIPT TYPE CHECKING

Run TypeScript compiler checks across frontend and backend to catch type errors.

## What to do

1. Run `pnpm typecheck` from project root
2. If errors found:
   - Analyze each error carefully
   - Fix type errors in the code
   - Re-run until all errors are resolved
3. Report results to user

## Rules

- NEVER use `any` types as a fix
- NEVER use `@ts-ignore` or `@ts-expect-error` unless absolutely necessary
- Fix the root cause, not the symptom
- Prefer proper typing over type assertions
- Check both frontend and backend errors
- Types should be strict and accurate

## Expected outcome

All TypeScript checks pass with no errors in frontend and backend.
