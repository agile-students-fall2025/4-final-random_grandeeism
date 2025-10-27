# Guide to Contributing
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

If you want to contribute to **fieldnotes.** , please follow these simple rules:

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

This guide provides step-by-step instructions to get the full MERN-stack application running on your local machine for development.

---

### **Prerequisites**

Before you begin, ensure you have the following software installed on your computer:

* **Git** – For version control and cloning the repository.  
* **Node.js and npm** – To run the JavaScript-based front-end and back-end.  
  * This project was built and tested using **Node.js v18.x**.  
  * If you use **Node Version Manager (nvm)**, you can switch to the correct version by running:
    ```bash
    nvm use
    ```
    (An `.nvmrc` file should be included in the project root to simplify this.)
* **Docker Desktop (Optional)** – Required if you choose to run a local MongoDB instance. Download it [here](https://www.docker.com/get-started).  
* **Visual Studio Code** – The recommended IDE for this project.  

---

### **Step 1: Get the Project Code**

1. **Fork** this repository to your personal GitHub account.  
2. **Clone** your forked repository to your local machine:
    ```bash
    git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
    ```
3. Navigate into the newly created project directory:
    ```bash
    cd YOUR_REPOSITORY_NAME
    ```

---

### **Step 2: Set Up the Database**

All application data is stored in a MongoDB database.  
You can use either a **cloud-hosted MongoDB Atlas instance (recommended)** or a **local instance via Docker**.  

#### **Option A: MongoDB Atlas (Recommended)**

This is the required method for the final deployed version of the app.

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.  
2. Create a **new project** and then a **free-tier cluster**.  
3. Create a **database user** with a secure username and password — save these credentials for later.  
4. Whitelist your current IP address:  
   Go to **Network Access → Add IP Address → Allow Access From My Current IP**.  
5. Click **Connect → Drivers** and copy the **Connection String** (you’ll need it for your `.env` file).

#### **Option B: Local MongoDB via Docker**

1. Ensure Docker Desktop is installed and running.  
2. Run this command in your terminal:
    ```bash
    docker run --name mongodb_dockerhub -p 27017:27017 \
    -e MONGO_INITDB_ROOT_USERNAME=admin \
    -e MONGO_INITDB_ROOT_PASSWORD=secret \
    -d mongo:latest
    ```
    This creates a MongoDB instance accessible on `mongodb://localhost:27017`.

---

### **Step 3: Configure and Run the Back-End**

The back-end is built with **Express.js** and connects to MongoDB.  

1. Navigate to the back-end directory:
    ```bash
    cd back-end
    ```
2. Create a `.env` file in this directory (`back-end/.env`).  
3. Add your environment variables inside:
    ```
    DB_CONNECTION_STRING="<your_connection_string>"
    PORT=7001
    JWT_SECRET="your-super-secret-and-long-string-for-signing-tokens"
    ```
    - **For MongoDB Atlas:**
      ```
      DB_CONNECTION_STRING="mongodb+srv://<username>:<password>@cluster0.mongodb.net/example-mern-stack-app"
      ```
    - **For Local Docker:**
      ```
      DB_CONNECTION_STRING="mongodb://admin:secret@localhost:27017/example-mern-stack-app?authSource=admin"
      ```
4. Install dependencies:
    ```bash
    npm install
    ```
5. Run automated tests to ensure the back-end is functioning correctly:
    ```bash
    # Run tests with Mocha and Chai
    npm test

    # Check code coverage using c8
    npm run coverage
    ```
6. Start the server:
    ```bash
    npm start
    ```
    The back-end should now run on **http://localhost:7001**

---

### **Step 4: Configure and Run the Front-End**

The front-end is a **React.js** application.  

1. In a **new terminal window**, navigate to the front-end folder:
    ```bash
    cd front-end
    ```
2. Create a `.env` file in this directory (`front-end/.env`) with:
    ```
    REACT_APP_API_URL=http://localhost:7001
    PORT=7002
    ```
    This ensures the React app communicates with the back-end API.  
3. Install dependencies:
    ```bash
    npm install
    ```
4. Start the React development server:
    ```bash
    npm start
    ```
    The app will automatically open in your browser.

---

### **Step 5: View the Application**

With both servers running:

* **Back-End:** http://localhost:7001  
* **Front-End:** http://localhost:7002  

Visit the front-end URL in your browser.  
For an enhanced development experience, install the [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi).

---

### **Step 6: Troubleshooting**

* If the front-end can’t connect to the back-end, check that:
  - Both servers are running.
  - The `.env` values are correct.
  - Ports `7001` and `7002` aren’t blocked by another process.
* If Docker MongoDB doesn’t start, try:
  ```bash
  docker ps -a
  docker start mongodb_dockerhub

## Build and Test Instructions
