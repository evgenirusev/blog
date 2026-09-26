// "Selected work" on the home page: posts or case studies, each with a kind
// label and a one-line summary. Images go through Astro's optimizer via these imports.
import type { ImageMetadata } from "astro";
import aiFirstSdlc from "@/assets/images/posts/ai-first-sdlc.png";
import secondBrain from "@/assets/images/posts/second-brain-obsidian-claude-code.webp";
import painPoints from "@/assets/images/posts/pain-points-to-funded-roadmap.png";

export type FeaturedWork = {
  href: string;
  title: string;
  kind: string;
  summary: string;
  image: ImageMetadata;
};

export const FEATURED_WORK: FeaturedWork[] = [
  {
    href: "/posts/ai-first-sdlc/",
    title: "The AI-First SDLC",
    kind: "Operating model",
    summary: "The approach 8 of our 12 engineering teams now run on, presented at DevTalks Cluj.",
    image: aiFirstSdlc,
  },
  {
    href: "/case-studies/pain-points-to-funded-roadmap/",
    title: "Business Transformation: 31 Pain Points to AI in Production",
    kind: "Case study",
    summary: "A two-week assessment into a funded roadmap, and roughly 80% less manual finance work in production.",
    image: painPoints,
  },
  {
    href: "/posts/second-brain-obsidian-claude-code/",
    title: "A Second Brain with Obsidian + Claude Code",
    kind: "Personal system",
    summary: "An AI-maintained knowledge base in Obsidian, with Claude Code as the structuring engine.",
    image: secondBrain,
  },
];
