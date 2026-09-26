// "Selected work" on the home page: posts or case studies, each with the one
// fact that proves it. Images go through Astro's optimizer via these imports.
import type { ImageMetadata } from "astro";
import aiFirstSdlc from "@/assets/images/posts/ai-first-sdlc.png";
import secondBrain from "@/assets/images/posts/second-brain-obsidian-claude-code.webp";
import painPoints from "@/assets/images/posts/pain-points-to-funded-roadmap.png";

export type FeaturedWork = {
  href: string;
  title: string;
  context: string;
  metric: string;
  metricLabel: string;
  image: ImageMetadata;
};

export const FEATURED_WORK: FeaturedWork[] = [
  {
    href: "/posts/ai-first-sdlc/",
    title: "AI-First SDLC: Transforming Software Engineering",
    context: "Operating model · Tecknoworks",
    metric: "70%",
    metricLabel: "of the sprint reclaimed",
    image: aiFirstSdlc,
  },
  {
    href: "/case-studies/pain-points-to-funded-roadmap/",
    title: "AI Business Transformation: From 31 Pain Points to AI in Production",
    context: "Case study · Mid-market Irish manufacturer",
    metric: "~80%",
    metricLabel: "less manual finance work, in production",
    image: painPoints,
  },
  {
    href: "/posts/second-brain-obsidian-claude-code/",
    title: "How I Built My Second Brain with Obsidian + Claude Code",
    context: "Personal knowledge system",
    metric: "1 afternoon",
    metricLabel: "from manual notes to an AI-maintained wiki",
    image: secondBrain,
  },
];
