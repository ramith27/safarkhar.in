export const dynamic = "force-dynamic";

import { getWallets } from "@/lib/actions/wallets";
import { WalletsClient } from "@/components/wallets/wallets-client";

export default async function WalletsPage() {
  const wallets = await getWallets();
  return <WalletsClient wallets={wallets} />;
}
