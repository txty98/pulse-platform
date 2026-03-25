import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  split?: boolean;
};

export function PageHero({ eyebrow, title, description, children, split = false }: PageHeroProps) {
  return (
    <section className={`page-hero${split ? " page-hero-split" : ""}`}>
      <div className="page-hero-copy">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="lede">{description}</p>
      </div>
      {children ? <div className="page-hero-aside">{children}</div> : null}
    </section>
  );
}
