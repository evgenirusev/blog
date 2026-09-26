// Case studies surfaced on the home page, with the one number that proves each.
// Thumbnails are the 960px WebP copies in public/images/case-studies/.
export type FeaturedCaseStudy = {
  slug: string;
  title: string;
  client: string;
  metric: string;
  metricLabel: string;
};

export const FEATURED_CASE_STUDIES: FeaturedCaseStudy[] = [
  {
    slug: "automating-finance-ap-ar-with-ai",
    title: "Automating 80% of Finance AP/AR with AI",
    client: "Mid-market Irish manufacturer",
    metric: "~80%",
    metricLabel: "less manual finance work",
  },
  {
    slug: "sql-to-fabric-ai-migration",
    title: "Modernizing a Legacy Analytics Stack with AI",
    client: "Top-three global management consultancy",
    metric: "6 months",
    metricLabel: "instead of a 2-year estimate",
  },
  {
    slug: "mining-ai-data-classification",
    title: "AI Data Classification in Mining",
    client: "Top-three global management consultancy",
    metric: "94%",
    metricLabel: "classification accuracy, up from 56%",
  },
];
