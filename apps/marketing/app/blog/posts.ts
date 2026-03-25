export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishDate: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "what-comes-after-the-traditional-chms",
    title: "What comes after the traditional CHMS?",
    excerpt:
      "Why relationship context, action, and outreach measurement matter more than ever for the modern church.",
    category: "Product Thinking",
    publishDate: "Coming soon"
  },
  {
    slug: "designing-software-for-ministry-in-motion",
    title: "Designing software for ministry in motion",
    excerpt:
      "Why mobile-first tools matter when ministry work happens in hallways, homes, gatherings, and communities.",
    category: "UX and Ministry",
    publishDate: "Coming soon"
  },
  {
    slug: "security-for-pastoral-and-people-data",
    title: "Security for pastoral and people data",
    excerpt:
      "How to think about trust, permissions, and privacy when technology touches real church relationships.",
    category: "Security",
    publishDate: "Coming soon"
  },
  {
    slug: "measuring-outreach-impact-beyond-attendance",
    title: "Measuring outreach impact beyond attendance",
    excerpt:
      "A better framework for churches that want to understand response, follow-up, and meaningful community outcomes.",
    category: "Outreach",
    publishDate: "Coming soon"
  },
  {
    slug: "leader-mode-and-focused-access",
    title: "Leader mode and focused access",
    excerpt:
      "Why volunteer leaders and ministry coordinators need simpler tools than a full admin dashboard.",
    category: "Platform",
    publishDate: "Coming soon"
  },
  {
    slug: "building-a-modern-rms-for-multi-campus-churches",
    title: "Building a modern RMS for multi-campus churches",
    excerpt:
      "How multi-tenant thinking and church structure shape the next generation of ministry software.",
    category: "Architecture",
    publishDate: "Coming soon"
  }
];
