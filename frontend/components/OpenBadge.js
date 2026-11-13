import { apiGet } from "@/lib/api";

export default async function OpenBadge() {
  let isOpen = false;

  try {
    const settings = await apiGet("/settings");
    isOpen = settings.isOpen;
  } catch {
    return null;
  }

  const dot = isOpen ? "bg-green-400" : "bg-red-400";
  const box = isOpen
    ? "bg-green-500/20 text-green-200"
    : "bg-red-500/20 text-red-200";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium ${box}`}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${dot}`}
        />
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${dot}`} />
      </span>
      {isOpen ? "Open now, taking orders" : "Closed right now"}
    </span>
  );
}