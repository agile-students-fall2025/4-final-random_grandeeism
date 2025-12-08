# Overall Guide Lines

## Design Standards

**⚠️ IMPORTANT:** Before implementing any new features, please review [DESIGN_STANDARDS.md](./DESIGN_STANDARDS.md) for:
- Icon standards (especially the `PanelBottomClose` requirement for status changes)
- Branding guidelines ("fieldnotes." with NotebookPen icon)
- Color and accessibility standards
- Component and interaction patterns

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

### React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

### Expanding the ESLint configuration

This front-end is implemented using JavaScript with JSX. Please write components and examples in JSX/JavaScript (files using the `.jsx` or `.js` extensions). The repository and project tooling are configured for a JavaScript (JSX) codebase — do not introduce TypeScript files for this project. If you need type-checked examples for learning purposes, document them separately, but keep the main source and examples in JSX.

## Dependencies

### Core Libraries

This project uses several key dependencies for enhanced functionality:

- **jsPDF** (`^3.0.3`) - PDF generation library for the export notes feature. Allows users to export their article notes and highlights as properly formatted PDF files directly in the browser without requiring server-side processing.

### Setup

1. Install all dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   # or
   npm run dev
   ```

Both commands start the Vite development server with hot module replacement (HMR).

**For deployment:**
```bash
npm run build    # Build for production
npm run preview  # Preview production build locally
```

The development server will start on `http://localhost:5173` by default.

## Front-End Development Restrictions

### Technical requirements

The following requirements outline what must be, must not be, and may be done during the front-end development sprint.

#### Musts

- All front-end code must be generated using React.js.
- All component definitions must be written as **functions**, not as classes.
- All component content must be written using **JSX**, not only plain Javascript.
- Front-end screens must be custom-designed to look clean, contemporary, and sharp, not like a wireframe.
- Any user-generated images that will be displayed by your app must be temporarily mocked with a random image API service, such as [Picsum](https://picsum.photos/).
- Front-ends must include all screens in the completed application and should closely match the clickable prototypes created previously, unless the team believes an alternate user experience is beneficial.
- Ay mismatch between the clickable prototypes and the front-end app code delivered must be explained during the stakeholder demo.
- Any front-end dynamic functionality, such as buttons that change something on the screen when clicked, or search fields that filter results as they are typed into, must be implemented in the front-end.
- If your app will eventually have user registration and login functionality, all front-end screens to support this must be created, although they can be non-functional for now.
- Instructions on how to set up and run the project must be included in the `README.md` file in version control. It must be possible for anybody to follow the instructions on the `README.md` to build and run the entire project on their local machines.
- Credentials or URIs for logging into databases, APIs, or other remote services, must never be shared in version control. They are usually stored in private settings files, such as `.env` or similar, which are not included in the version control repository.

#### May

- You **may** use [React Context](https://react.dev/learn/passing-data-deeply-with-context) for sharing state among multiple components.
- You **may** use the front-end framework, [Tailwind](https://tailwindcss.com/) to streamline your CSS styling.
- You **may** use [mockaroo](https://mockaroo.com/mock_apis), [picsum](https://picsum.photos/) and [other mocking/faking tools](https://www.npmjs.com/search?q=fake%20data) to mock any data that will eventually come from your application's back-end or other external source.

### Must nots

- You **must not** any 3rd-party state manager tools, such as [Redux](https://react-redux.js.org/) or [Mobx](https://mobx.js.org/README.html#introduction)
- You **must not** use [next.js](https://nextjs.org/) or any other server-side rendering framework.
- You **must not** use the front-end frameworks [Material UI](https://material-ui.com/) or [Bootstrap](https://react-bootstrap.github.io/).
- You **must not** hard-code any data in your front-end code that will eventually be provided by your application's back-end or other external source.

## Dev Team Guidelines

## Folder Organization

The front-end project follows a structured organization to maintain code clarity and scalability:

### `/src` - Source Code Root

The main directory containing all application source code.

### `/src/pages` - Page Components

Contains all main page components that represent different routes/screens in the application:

- **AuthPage.jsx** - User authentication and login
- **HomePage.jsx** - Main home/dashboard page
- **SearchPage.jsx** - Search functionality interface
- **InboxPage.jsx** - User inbox for saved content
- **DailyReadingPage.jsx** - Daily curated reading content
- **ContinueReadingPage.jsx** - Resume previously started content
- **RediscoveryPage.jsx** - Resurface previously saved content
- **VideosPage.jsx** - Video content library
- **AudioPage.jsx** - Audio content library
- **TextPage.jsx** - Text-based content library
- **FeedsPage.jsx** - RSS/content feeds management
- **TagsPage.jsx** - Tag organization and browsing
- **SettingsPage.jsx** - User settings and preferences
- **LandingPage.jsx** - Initial landing/welcome page

### `/src/pages/viewers` - Content Viewer Components

Specialized components for viewing different content types:

- **AudioPlayer.jsx** - Audio playback interface
- **VideoPlayer.jsx** - Video playback interface
- **TextReader.jsx** - Text reading interface

### `/src/components` - Reusable Components

Shared components used across multiple pages:

- **`/primitives`** - Basic UI building blocks (buttons, inputs, etc.)
- **`/customUI`** - Custom composite UI components

### `/src/contexts` - React Context Providers

Contains React Context definitions for state management across components.

### `/src/assets` - Static Assets

Images, fonts, icons, and other static files.

### `/src/styles` - Global Styles

Application-wide CSS and styling configurations.

### `/public` - Public Static Files

Files served directly without processing (favicon, robots.txt, etc.).
# front-end
# front-end
# front-end
# front-end
