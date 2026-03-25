import { ProductPage } from "../../_components/product-page";

export default function PulseMissionsPage() {
  return (
    <ProductPage
      name="Pulse Missions"
      eyebrow="Products"
      title="Outreach and mission engagement tools focused on people, response, and lasting community impact."
      description="Pulse Missions helps churches organize outreach efforts, understand community response, and keep next steps visible long after an event or initiative ends."
      outcomes={[
        "Track outreach activity and response with consistency",
        "Measure community impact beyond attendance counts",
        "Support the next step from contact to discipleship"
      ]}
      pillars={[
        {
          title: "Mission visibility",
          body: "See what outreach efforts are happening, who is involved, and where meaningful response is taking shape."
        },
        {
          title: "Impact tracking",
          body: "Move beyond simple event counts and start understanding stories, outcomes, and momentum across the community."
        },
        {
          title: "Connected next steps",
          body: "Tie mission and outreach work back into the broader relationship system so follow-up does not disappear after the moment passes."
        }
      ]}
    />
  );
}
