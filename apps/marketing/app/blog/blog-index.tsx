"use client";

import Link from "next/link";
import { useState } from "react";
import type { BlogPost } from "./posts";

type BlogIndexProps = {
  posts: BlogPost[];
};

export function BlogIndex({ posts }: BlogIndexProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredPosts = !normalizedQuery
    ? posts
    : posts.filter((post) =>
        [post.title, post.excerpt, post.category].some((value) =>
          value.toLowerCase().includes(normalizedQuery)
        )
      );

  return (
    <>
      <section className="section section-tight">
        <div className="blog-search-shell">
          <label className="blog-search-label" htmlFor="blog-search">
            Search blog posts
          </label>
          <input
            id="blog-search"
            className="blog-search-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, category, or topic"
          />
        </div>
      </section>

      <section className="section">
        <div className="blog-grid">
          {filteredPosts.map((post) => (
            <Link className="blog-card" href={`/blog/${post.slug}`} key={post.slug}>
              <p className="blog-card-meta">
                <span>{post.category}</span>
                <span>{post.publishDate}</span>
              </p>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <span className="card-link">Open post</span>
            </Link>
          ))}
        </div>

        {filteredPosts.length === 0 ? (
          <div className="single-column-panel">
            <article className="feature-card">
              <h3>No posts matched your search.</h3>
              <p>Try a broader term like ministry, security, outreach, or mobile.</p>
            </article>
          </div>
        ) : null}
      </section>
    </>
  );
}
