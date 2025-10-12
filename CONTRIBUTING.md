# Guide to Contributing

%%Delete the contents of this file and replace with the contents of a proper guide to contributing to this project, as described in the [instructions](./instructions-0c-project-setup#contributingmd)%%

## Team Norms

### Team Values

### Sprint Cadence

- Our sprints will be approximately **2 weeks**

### Daily Standups

- Our standups will take place on (days) at (times)
- Our members have agreed to not cover for team members that are not present
- A member that doesn't make progress on a task will be reported to management

## Coding Standards

- The standardized IDE that our team members use collectively is **Visual Studio Code**. 
- The standardized linter is 


## Git Workflow

Our team follows the **feature-branch workflow** to keep `main` always deployable and to make collaboration predictable:

- Start from the latest `main` and create a new branch for each change: `feature/short-description`, `fix/issue-123`, or `chore/update-deps`.
- Make small, focused commits with clear messages. Run tests and linters locally before pushing.
- Push the branch to the remote and open a Pull Request (PR) against `main`. In your PR, link related issues, describe the change and testing steps, and include screenshots or logs if helpful.
- Keep your branch up-to-date with `main` while you work (rebase or merge as agreed by the team). Prefer rebasing for a linear history when it's safe.
- Address review feedback with additional commits. Squash or tidy commits before merge if the team prefers a clean history.
- Merge only after PR approval and green CI. Delete the feature branch after merging. For urgent hotfixes, branch from `main`, fix, and merge back immediately.

## Contributing Rules
