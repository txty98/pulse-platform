import { ProductPage } from "../../_components/product-page";

export default function PulseTasksPage() {
  return (
    <ProductPage
      name="Pulse Tasks"
      eyebrow="Products"
      title="Coordinated follow-up and team execution for ministry that cannot slip through the cracks."
      description="Pulse Tasks is designed for staff and ministry leaders who need assignment clarity, visibility into follow-up, and a simpler way to keep action moving across teams."
      outcomes={[
        "Assign and track ministry follow-up without losing context",
        "Turn outreach response into real next actions",
        "Keep staff and volunteer leadership aligned"
      ]}
      pillars={[
        {
          title: "Follow-up workflows",
          body: "Move from notes and ideas to accountable next steps that stay connected to the people and ministries involved."
        },
        {
          title: "Team visibility",
          body: "Help staff and ministry leads understand what is moving, what is stuck, and where support is needed."
        },
        {
          title: "Action with context",
          body: "Tasks are most useful when they are connected to relationships, care history, events, and ministry outcomes."
        }
      ]}
    />
  );
}
