import { PageHero } from "../_components/page-hero";
import { SiteHeader } from "../_components/site-header";
import { BlogIndex } from "./blog-index";
import { blogPosts } from "./posts";

export default function BlogPage() {
  return (
    <main className="page">
      <SiteHeader />

      <PageHero
        eyebrow="Blog"
        title="Notes on product thinking, outreach systems, and church operations."
        description="This space can grow into product updates, implementation guidance, and practical ideas for churches building stronger ministry systems."
      />

      <BlogIndex posts={blogPosts} />
    </main>
  );
}
