# UPDATE DOCUMENTATION

Update project documentation files (CLAUDE.md and README.md) to reflect current codebase state.

## Documentation Philosophy

- **CLAUDE.md**: Concise guidance file (~100 lines max) - only essential rules and high-level overview
- **README.md**: Comprehensive reference documentation - detailed API docs, features, commands, architecture

## What to do

1. **Analyze Codebase Structure**
   - Explore project architecture and services
   - Identify key technologies and dependencies
   - Review package.json files for commands and scripts
   - Check environment configuration files

2. **Update CLAUDE.md** (Keep it concise!)
   - Verify "Code flow" rules are current
   - Update "Project Overview" with tech versions
   - Update "Architecture" with high-level structure only
   - Update "Key Technologies" list (no detailed explanations)
   - Verify "Development Commands" - Docker commands only
   - Keep "Git Workflow & Code Quality" brief
   - **NEVER add**: API endpoints, detailed features, component lists, database schemas, environment details

3. **Update README.md** (Comprehensive reference)
   - Sync tech stack with current dependencies
   - Update Quick Start instructions
   - Verify all commands work correctly (root, frontend, backend, database)
   - Update detailed project structure diagram
   - Ensure API documentation is current with all endpoints
   - Update features sections (backend & frontend)
   - Update database schema documentation
   - Update environment variables documentation
   - Update links and references

4. **Update Landing Page Stats**
   - Run `git rev-list --count HEAD` to get the current commit count
   - Run `gloc` locally to get total lines of code, convert to nearest integer in k (e.g. 149k)
   - Update the hardcoded values in `frontend/src/components/landing/HeroSection.tsx` and `frontend/src/components/landing/SocialProofSection.tsx`
   - Format as `{count}+` for commits and `{k}k+` for lines of code

5. **Validate Changes**
   - Ensure CLAUDE.md stays concise (~100 lines or less)
   - Ensure README.md is comprehensive with all details
   - Verify all mentioned commands actually exist
   - Check that ports and URLs are correct
   - Confirm core info is consistent between files

6. Report comprehensive updates to user

## Rules

- MUST analyze codebase BEFORE making changes
- MUST verify all commands exist and work
- MUST keep CLAUDE.md CONCISE (guidance) and README.md DETAILED (reference)
- NEVER add implementation details to CLAUDE.md
- NEVER invent features that don't exist
- ALWAYS preserve existing formatting style
- Documentation must reflect ACTUAL codebase state

## Expected outcome

Updated documentation with:
- ✅ Accurate project overview
- ✅ Current tech stack and dependencies
- ✅ Working commands and scripts
- ✅ Correct architecture description
- ✅ Consistent information across files

Documentation is accurate and ready for use.
