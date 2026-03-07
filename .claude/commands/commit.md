# COMMIT CHANGES

Run complete validation, update documentation, and create a git commit.

## What to do

Run the following workflow in exact order:

1. **Run /check command**
   - This validates TypeScript, ESLint, and Prettier
   - Fix any errors before proceeding

2. **Run /update-docs command**
   - This updates CLAUDE.md and README.md
   - Ensures documentation reflects current codebase

3. **Stage all changes**
   - Run `git add .` to stage all changes
   - Review what will be committed with `git status`

4. **Create commit**
   - Follow the Git Workflow protocol from CLAUDE.md
   - Analyze changes with `git diff --staged`
   - Review recent commits with `git log --oneline -5`
   - Create descriptive commit message

5. Report completion to user

## Rules

- MUST run /check FIRST
- MUST run /update-docs SECOND
- MUST fix all validation errors before committing
- MUST use git commit with HEREDOC format for message
- MUST include required footer in commit message
- NEVER push without explicit user approval
- NEVER skip validation steps

## Expected outcome

Complete commit workflow with:
-  All code quality checks passed
-  Documentation updated
-  All changes staged
-  Commit created with proper message
-  Ready for push (but not pushed)

Changes are committed and ready for review/push.
