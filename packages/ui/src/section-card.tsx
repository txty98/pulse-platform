import type { PropsWithChildren } from "react";

type SectionCardProps = PropsWithChildren<{
  title: string;
}>;

export function SectionCard({ title, children }: SectionCardProps) {
  return (
    <article className="section-card">
      <h2>{title}</h2>
      <p>{children}</p>
    </article>
  );
}
