export const SITE = {
  website: "https://evgenirusev.com/", // TODO: update once domain is connected
  author: "Evgeni Rusev",
  profile: "https://evgenirusev.com/",
  desc: "Solution Architect at Tecknoworks. I design applied AI and software solutions that make it to production. Writing about AI-native engineering, agent systems, and what actually works in the field.",
  title: "Evgeni Rusev",
  ogImage: "astropaper-og.jpg", // TODO: replace with custom OG image
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 10,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: false,
  showBackButton: true,
  editPost: {
    enabled: false, // disabled until repo is public
    text: "Edit page",
    url: "https://github.com/evgenirusev/blog/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr",
  lang: "en",
  timezone: "Europe/Sofia",
} as const;
