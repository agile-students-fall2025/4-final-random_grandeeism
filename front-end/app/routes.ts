import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("inbox", "routes/inbox.tsx"),
  route("daily-reading", "routes/daily-reading.tsx"),
  route("continue-reading", "routes/continue-reading.tsx"),
  route("rediscovery", "routes/rediscovery.tsx"),
  route("videos", "routes/videos.tsx"),
  route("audios", "routes/audios.tsx"),
  route("text", "routes/text.tsx"),
  route("tags", "routes/tags.tsx"),
  route("feeds", "routes/feeds.tsx"),
  route("statistics", "routes/statistics.tsx"),
  route("settings", "routes/settings.tsx"),
] satisfies RouteConfig;
