import type { Route } from "next";

export type AppSection =
  | "home"
  | "map"
  | "learn"
  | "studio"
  | "gallery";

export const appNavItems: Array<{
  description: string;
  href: Route;
  id: AppSection;
  label: string;
}> = [
  {
    id: "home",
    label: "Home",
    href: "/",
    description: "Milestone entry and product framing.",
  },
  {
    id: "map",
    label: "Map",
    href: "/map",
    description: "Overview, filters, and recommendation layer.",
  },
  {
    id: "learn",
    label: "Learn",
    href: "/learn/linear-regression" as Route,
    description: "Interactive node-by-node learning workspace.",
  },
  {
    id: "studio",
    label: "Studio",
    href: "/studio" as Route,
    description: "Local authoring, validation, and import/export.",
  },
  {
    id: "gallery",
    label: "Gallery",
    href: "/gallery" as Route,
    description: "File-backed published atlas viewer.",
  },
];
