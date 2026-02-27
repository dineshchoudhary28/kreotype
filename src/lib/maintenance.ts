import { toast } from "sonner";

export const MAINTENANCE_MODE = true;

export function showMaintenanceToast() {
  toast.info(
    "Backend services are currently on hold. Core typing features remain available."
  );
}
