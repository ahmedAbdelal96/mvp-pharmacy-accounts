import { notFound } from "next/navigation";
import { getParty } from "@/modules/parties";
import { hasPermission } from "@/lib/permissions";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import EditPartyClient from "./EditPartyClient";

// Opt out of static generation — requires DB
export const dynamic = "force-dynamic";

export default async function EditPartyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "party.update")) {
    notFound();
  }

  const result = await getParty(id).catch(() => null);
  if (!result) {
    notFound();
  }

  // result.party is already PartyDetails (mapped in service)
  return <EditPartyClient party={result.party} />;
}