export const dynamic = "force-dynamic";

import { getWallets } from "@/lib/actions/wallets";
import { CreateTripWizard } from "@/components/trips/create-trip-wizard";

export default async function NewTripPage() {
  const wallets = await getWallets();
  return <CreateTripWizard wallets={wallets} />;
}
