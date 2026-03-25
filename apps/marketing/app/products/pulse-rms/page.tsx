import { ProductPage } from "../../_components/product-page";

export default function PulseRmsPage() {
  return (
    <ProductPage
      name="Pulse RMS"
      eyebrow="Products"
      title="A church relationship management system built around ministry, care, and action."
      description="Pulse RMS helps churches connect people, groups, attendance, discipleship, outreach, and reporting in one system that is fast, mobile-friendly, and built for real church life."
      outcomes={[
        "People, groups, and attendance connected in one workspace",
        "Discipleship steps and outreach impact tracked with context",
        "Leader mode and reporting designed for focused action"
      ]}
      pillars={[
        {
          title: "Relationship context",
          body: "Keep households, notes, attendance, and ministry history connected so staff and leaders can act with understanding."
        },
        {
          title: "Outreach visibility",
          body: "See the movement from community contact to follow-up, engagement, discipleship, and long-term connection."
        },
        {
          title: "Operational clarity",
          body: "Give teams clean reporting, leader-friendly access, and workflows that reflect how ministry actually happens."
        }
      ]}
    />
  );
}
