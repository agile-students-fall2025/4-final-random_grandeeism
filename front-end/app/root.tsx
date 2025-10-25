import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
} from "react-router";
import { 
  Home as HomeIcon, 
  Inbox as InboxIcon, 
  BookOpen, 
  BookMarked, 
  Sparkles, 
  Video, 
  Headphones, 
  FileText, 
  Tag, 
  Rss, 
  BarChart3, 
  Settings as SettingsIcon 
} from 'lucide-react';

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <div className="App">
      <nav className="navbar">
        <ul>
          <li><Link to="/"><HomeIcon size={18} /> Home</Link></li>
          <li><Link to="/inbox"><InboxIcon size={18} /> Inbox</Link></li>
          <li><Link to="/daily-reading"><BookOpen size={18} /> Daily Reading</Link></li>
          <li><Link to="/continue-reading"><BookMarked size={18} /> Continue Reading</Link></li>
          <li><Link to="/rediscovery"><Sparkles size={18} /> Rediscovery</Link></li>
          <li><Link to="/videos"><Video size={18} /> Videos</Link></li>
          <li><Link to="/audios"><Headphones size={18} /> Audios</Link></li>
          <li><Link to="/text"><FileText size={18} /> Text</Link></li>
          <li><Link to="/tags"><Tag size={18} /> Tags</Link></li>
          <li><Link to="/feeds"><Rss size={18} /> Feeds</Link></li>
          <li><Link to="/statistics"><BarChart3 size={18} /> Statistics</Link></li>
          <li><Link to="/settings"><SettingsIcon size={18} /> Settings</Link></li>
        </ul>
      </nav>
      <Outlet />
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
