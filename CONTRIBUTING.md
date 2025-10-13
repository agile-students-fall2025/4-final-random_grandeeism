# Guide to Contributing

%%Delete the contents of this file and replace with the contents of a proper guide to contributing to this project, as described in the [instructions](./instructions-0c-project-setup#contributingmd)%%

## Team Norms

### Team Values

Our team will decide together how to split the work for each user story selected for a sprint. For every story we tackle, each team member will first act as a Developer to implement their assigned work and then act as a Code Reviewer for a teammate's work. We will not add new features on the fly unless everyone agrees during a daily standup.

Daily standups are for discussing development problems and for a quick secondary review of current Sprint work. If we disagree about how to proceed on an issue, we will resolve it by popular vote.

We follow Agile development and the SCRUM framework. At each Sprint Planning Standup the team will choose, by agreement, who will be the **Product Owner** and who will be the **Scrum Master** for that sprint; these roles rotate each sprint. All team members will serve as **Developers**. The **Stakeholder** role is held by the course admin, tutors, and professor.

### Sprint Cadence

- Our sprints will be approximately **2 weeks**

### Daily Standups

- Our standups will take place on Monday, Wednesday and Fridays at 6:30 pm and last for a minimum of 30 minutes
- Our members have agreed to not cover for team members that are not present
- A member that doesn't make progress on a task will be reported to management

## Coding Standards

- The standardized IDE that our team members use collectively is **Visual Studio Code**
- The standardized linters for our team are:ESLint,Stylelint, JSON Validation (built in to VS Code)MarkdownLinter

### Practical coding rules

- Write the smallest working solution first, then improve it. Don’t over-engineer.
- All code for features and spikes must be peer-reviewed and pass tests before merging into `main`.
- Always push working code; if you break the build or CI pipeline, fix it quickly.
- Make small, focused commits (one feature or bug per commit) with descriptive commit messages.
- Use clear, self-documenting names for variables and functions—avoid cryptic abbreviations.
- Remove dead or commented-out code; delete it rather than leaving it behind.
- Add automated tests for important integrations and functionality as you learn to write tests.

## Git Workflow

Our team follows the **feature-branch workflow** to keep `main` always deployable and to make collaboration predictable:

- Start from the latest `main` and create a new branch for each change: `feature/short-description`, `fix/issue-123`, or `chore/update-deps`.
- Make small, focused commits with clear messages. Run tests and linters locally before pushing.
- Push the branch to the remote and open a Pull Request (PR) against `main`. In your PR, link related issues, describe the change and testing steps, and include screenshots or logs if helpful.
- Keep your branch up-to-date with `main` while you work (rebase or merge as agreed by the team). Prefer rebasing for a linear history when it's safe.
- Address review feedback with additional commits. Squash or tidy commits before merge if the team prefers a clean history.
- Merge only after PR approval and green CI. Delete the feature branch after merging. For urgent hotfixes, branch from `main`, fix, and merge back immediately.

## Contributing Rules

If you want to contribute to **ToBeRead** , please follow these simple rules:

- Check existing Issues first — someone may already be working on the same idea.
- Pick an issue labeled `good first issue` or `help wanted` if you are new.
- Start from the latest `main` and create a branch named like `feature/short-desc` or `fix/issue-123`.
- Make small, focused changes. Run the app and tests locally before pushing.
- Write or update tests for any important behavior you change.
- Open a Pull Request against `main` and describe what you changed and how to test it.
- Link the PR to the related issue and add screenshots or short videos for UI changes.
- Be responsive to review feedback; update your branch and push changes to the same PR.
- Keep sensitive data out of the repo (no passwords, API keys, or personal data).
- Respect the project's Code of Conduct and be courteous in all discussions.

## Instructions for Setting up the Local Environment

### Setting up the Local Environment

Follow these steps to set up the project on your local machine:

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/4-final-random_grandeeism.git
   cd 4-final-random_grandeeism
   ```

2. **Install dependencies**
   Make sure you have Node.js (>= 18) and npm installed.
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy the example environment file:
     ```bash
     cp .env.example .env
     ```
   - Update `.env` with your local configuration values (e.g., MongoDB URI, JWT secret, API keys).

4. **Set up the front-end**
   - Navigate to the front-end directory:
     ```bash
     cd front-end
     npm install
     npm run dev
     ```
   - The React app will run on `http://localhost:3000`.
   - All components must be functional and written using **React.js** and **JSX**.
   - Styling should be clean and modern; you may use **Tailwind CSS**, but **Material UI** and **Bootstrap** are not allowed.
   - If applicable, mock images can be fetched from [Picsum](https://picsum.photos/).
   - All user registration/login screens should exist (can be non-functional for now).

5. **Set up the back-end**
   - Navigate to the back-end directory:
     ```bash
     cd ../back-end
     npm install
     npm start
     ```
   - The back-end must be built with **Express.js**.
   - Dynamic routes must return mock JSON data or use a mocking API such as [Mockaroo](https://mockaroo.com/).
   - All static routes must return the correct files.
   - Front-end and back-end must be **fully integrated** — forms should `POST` to back-end routes.

6. **Set up the database**
   - The project uses **MongoDB Atlas** as the database.
   - Connect using **Mongoose** in the back-end.
   - Add your MongoDB connection string to `.env` (do not commit this file):
     ```bash
     MONGO_URI=your_mongodb_atlas_connection_string
     JWT_SECRET=your_jwt_secret
     ```
   - Ensure that data validation is implemented using **express-validator** before saving data.
   - User authentication must be handled with **JSON Web Tokens (JWT)**.


## Build and Test Instructions
