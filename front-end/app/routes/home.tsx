import type { Route } from "./+types/home";
import { Home as HomeIcon } from 'lucide-react';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Home" },
    { name: "description", content: "Welcome to your reading app!" },
  ];
}

export default function Home() {
  return (
    <div className="page">
      <h1><HomeIcon size={24} /> Home</h1>
    </div>
  );
}
