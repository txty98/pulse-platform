import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "../../_components/page-hero";
import { SiteHeader } from "../../_components/site-header";
import { blogPosts } from "../posts";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = blogPosts.find((entry) => entry.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="page">
      <SiteHeader />

      <PageHero eyebrow={post.category} title={post.title} description={post.excerpt} />

      <section className="section section-tight">
        <div className="single-column-panel">
          <article className="feature-card">
            <p className="story-kicker">{post.publishDate}</p>
            <h3>Article coming soon</h3>
            <p>
              This blog post route is live and clickable, but the full article content has not been
              written yet.
            </p>
            <Link className="card-link" href="/blog">
              Back to blog index
            </Link>
          </article>
        </div>
      </section>
    </main>
  );
}
