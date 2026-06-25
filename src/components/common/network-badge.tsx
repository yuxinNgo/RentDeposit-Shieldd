import { Orbit } from "lucide-react";
import { NETWORK_LABEL } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

export function NetworkBadge() {
  return (
    <Badge className="border-[rgba(15,142,131,0.18)] bg-[rgba(15,142,131,0.08)] text-[var(--teal)]">
      <Orbit className="h-3.5 w-3.5" />
      {NETWORK_LABEL}
    </Badge>
  );
}
