import { notFound } from "next/navigation";
import { getParty } from "@/modules/parties";
import { toPartyDetails } from "@/modules/parties/party.mappers";
import { hasPermission } from "@/lib/permissions";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import EditPartyClient from "./EditPartyClient";

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

  let party;
  try {
    const result = await getParty(id);
    party = toPartyDetails(result.party);
  } catch {
    notFound();
  }

  return <EditPartyClient party={party} />;
}