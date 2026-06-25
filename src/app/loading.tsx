import { LoadingState } from "@/components/common/loading-state";

export default function Loading() {
  return (
    <div className="page-shell py-10">
      <LoadingState label="Loading route..." />
    </div>
  );
}
