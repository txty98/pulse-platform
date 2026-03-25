"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getRequiredDashboardContext } from "../../../lib/dashboard-context";

function buildCommunicationsRedirect(message: string, kind: "error" | "message" = "error") {
  return `/dashboard/communications?${kind}=${encodeURIComponent(message)}`;
}

function buildCampaignRedirect(campaignId: string, message?: string, kind: "error" | "message" = "error") {
  if (!message) {
    return `/dashboard/communications/${campaignId}`;
  }

  return `/dashboard/communications/${campaignId}?${kind}=${encodeURIComponent(message)}`;
}

export async function createCampaign(formData: FormData) {
  const tenant = String(formData.get("tenant") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();

  if (!tenant || !name) {
    redirect(buildCommunicationsRedirect("Tenant and campaign name are required."));
  }

  const context = await getRequiredDashboardContext(tenant);

  if (!context.supabase || !context.access?.activeMembership) {
    redirect(buildCommunicationsRedirect("No active tenant was found for this request."));
  }

  const insertResult = await context.supabase
    .from("email_campaigns")
    .insert({
      tenant_id: context.access.activeMembership.tenant.id,
      name,
      subject: name,
      preview_text: null,
      status: "draft",
      design: [],
      audience: {
        type: "all_people_with_email"
      }
    } as never)
    .select("id")
    .single();

  const createdCampaign = (insertResult.data ?? null) as { id: string } | null;

  if (insertResult.error || !createdCampaign) {
    redirect(buildCommunicationsRedirect(insertResult.error?.message ?? "Unable to create campaign."));
  }

  revalidatePath("/dashboard/communications");
  redirect(buildCampaignRedirect(createdCampaign.id));
}

export async function saveCampaignDesigner(formData: FormData) {
  const tenant = String(formData.get("tenant") ?? "").trim();
  const campaignId = String(formData.get("campaign_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const previewText = String(formData.get("preview_text") ?? "").trim();
  const designRaw = String(formData.get("design") ?? "[]");
  const intent = String(formData.get("intent") ?? "").trim();
  const audienceMode = String(formData.get("audience_mode") ?? "all").trim();
  const audienceGroupIds = formData.getAll("audience_group_ids").map((value) => String(value));
  const audiencePersonIds = formData.getAll("audience_person_ids").map((value) => String(value));

  if (!tenant || !campaignId || !name || !subject) {
    redirect(buildCommunicationsRedirect("Tenant, campaign, name, and subject are required."));
  }

  let parsedDesign: unknown;

  try {
    parsedDesign = JSON.parse(designRaw);
  } catch {
    redirect(buildCampaignRedirect(campaignId, "The email design could not be parsed."));
  }

  const context = await getRequiredDashboardContext(tenant);

  if (!context.supabase || !context.access?.activeMembership) {
    redirect(buildCommunicationsRedirect("No active tenant was found for this request."));
  }

  const updateResult = await context.supabase
    .from("email_campaigns")
    .update({
      name,
      subject,
      preview_text: previewText || null,
      design: parsedDesign as never,
      audience:
        audienceMode === "custom"
          ? {
              type: "custom",
              group_ids: audienceGroupIds,
              person_ids: audiencePersonIds
            }
          : {
              type: "all_people_with_email"
            },
      status: intent === "ready" ? "ready" : "draft",
      provider: null
    } as never)
    .eq("tenant_id", context.access.activeMembership.tenant.id)
    .eq("id", campaignId);

  if (updateResult.error) {
    redirect(buildCampaignRedirect(campaignId, updateResult.error.message));
  }

  revalidatePath("/dashboard/communications");
  revalidatePath(`/dashboard/communications/${campaignId}`);
  redirect(
    buildCampaignRedirect(
      campaignId,
      intent === "ready" ? "Campaign marked ready for delivery." : "Campaign saved.",
      "message"
    )
  );
}
