# Fieldnotes: The Read Later App

## Product Vision Statement

In the current internet age there is a incomprehensible and immense amount of interesting content to peruse yet theres little time to read or consume in the moment upon encountering something new to read, and its liable to be forgotten. **Fieldnotes** is a mobile web app that can be used to save articles, podcasts, youtube videos to be resurfaced for later (optional offline) reading and annotating.

## Team Members

- [Zeba Shafi](https://github.com/Zeba-Shafi)
- [Sheik Anas Ally Ozeer](https://github.com/anas-ozeer)
- [Alexander Escobar](https://github.com/EscoAl516)
- [Saad Sifar](https://github.com/one-loop)
- [Shaurya Srivastava](https://github.com/shauryasr04)
- [Jeffrey Chen](https://github.com/shauryasr04)
- [Our team norms and values](CONTRIBUTING.md#team-norms)

## How this project came to be

After the shutdown of the FOSS project Omnivore, we found ourselves searching for a tool that could truly respect both our reading habits and our data. That search quickly turned into a desire to build our own **FOSS “read it later” app**—not just as a replacement, but as a way to preserve the philosophy behind these tools: empowering readers to **capture, curate, and revisit** meaningful content on their own terms. Read-it-later apps have always existed at the intersection of **attention, agency, and knowledge management**, helping people reclaim the web from the endless scroll. For more reading on the power of the read-it-later app, check out [this article](https://medium.com/praxis-blog/the-secret-power-of-read-it-later-apps-6c75cc37ef42) by Tiago Forte, one of the most prominent experts on productivity in our highly distractable and overwhelming digital age.
Therefore for our  
[Agile Software Development and DevOps](https://knowledge.kitchen/content/courses/agile-development-and-devops/syllabus/) course taught at NYU by [Professor Amos Bloomberg](https://knowledge.kitchen/me/cv/), we decided to work on **fieldnotes.** We hope that our project proves as useful to you in actively, and thoughfully reading in the face of the immense information landscape of the digital age.

## Back-End Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/fieldnotes.git
   cd fieldnotes
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and configure the environment variables (see the "Environment Variables" section below).

4. Start the development server:
   ```bash
   npm run dev
   ```

5. The back-end will run on `http://localhost:7001` by default.

## API Endpoints

### Articles API
- `GET /api/articles` - Retrieve all articles
- `GET /api/articles/:id` - Retrieve a single article by ID
- `POST /api/articles` - Create a new article
- ... (list all endpoints as in the checklist)

### Feeds API
- `GET /api/feeds` - Retrieve all feeds
- ... (list all endpoints as in the checklist)

### Authentication API
- `POST /api/auth/register` - User registration
- ... (list all endpoints as in the checklist)

_For detailed request/response formats, refer to the API documentation in the `docs` folder._

## Environment Variables

The following environment variables are required:

- `JWT_SECRET`: Secret key for signing JWT tokens.
- `PORT`: Port number for the back-end server (default: 7001).
- `NODE_ENV`: Set to `development` or `production`.

Create a `.env` file in the root directory and populate it with these variables. Use `.env.example` as a template.

## Testing Procedures

1. Run all tests:
   ```bash
   npm test
   ```

2. Check code coverage:
   ```bash
   npm run coverage
   ```

3. Ensure all tests pass before committing changes.

## Troubleshooting

- **Issue**: Server does not start.
  - **Solution**: Check if all dependencies are installed and the `.env` file is correctly configured.

- **Issue**: API requests fail with CORS errors.
  - **Solution**: Ensure the front-end and back-end servers are running on the correct ports and CORS is configured.

- **Issue**: Tests fail unexpectedly.
  - **Solution**: Verify that the test database or mock data is correctly set up.

## Want to contribute?

 Read our rules about [contributing](CONTRIBUTING.md#contributing-rules) as well as instructions on [setting up the local development environment](CONTRIBUTING.md#instructions-for-setting-up-the-local-environment) and [building and testing](CONTRIBUTING.md#build-and-test-instructions)
