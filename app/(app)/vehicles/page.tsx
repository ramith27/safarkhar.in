import { getVehicles } from "@/lib/actions/vehicles";
import { VehiclesClient } from "@/components/vehicles/vehicles-client";

export default async function VehiclesPage() {
  const vehicles = await getVehicles();
  return <VehiclesClient vehicles={vehicles} />;
}
