import { apiGet } from "@/lib/api";

export default async function OpenBadge() {
  try {
    const s = await apiGet("/settings");
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium ${
          s.isOpen ? "bg-green-500/20 text-green-200" : "bg-red-500/20 text-red-200"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            s.isOpen ? "bg-green-400" : "bg-red-400"
          }`}
        />
        {s.isOpen ? "Open now, taking orders" : "Closed right now"}
      </span>
    );
  } catch {
    return null;
  }
}