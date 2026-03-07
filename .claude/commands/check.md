# COMPLETE CODE VALIDATION

Run all code quality checks: TypeScript, ESLint, and Prettier formatting.

## What to do

Run checks in this exact order:

1. **TypeScript**: `pnpm typecheck`
   - Fix any type errors before proceeding

2. **ESLint**: `pnpm lint`
   - Fix any linting errors before proceeding
   - Use `pnpm lint --fix` for auto-fixable issues

3. **Prettier**: `pnpm format`
   - Auto-formats all code

4. Report comprehensive results to user

## Rules

- MUST run in order: typecheck → lint → format
- MUST fix errors at each step before proceeding
- NEVER skip a step
- This is the pre-commit validation workflow
- All three checks MUST pass

## Expected outcome

Complete validation with:
- ✅ No TypeScript errors
- ✅ No ESLint errors/warnings
- ✅ All code properly formatted

Code is ready for commit.
