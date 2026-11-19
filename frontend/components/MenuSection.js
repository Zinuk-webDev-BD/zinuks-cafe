import { apiGet } from "@/lib/api";
import MenuExplorer from "@/components/MenuExplorer";

export default async function MenuSection() {
  let categories = [];
  let items = [];

  try {
    [categories, items] = await Promise.all([
      apiGet("/categories"),
      apiGet("/menu"),
    ]);
  } catch {
    return (
      <p className="mx-auto max-w-6xl rounded-xl bg-red-50 p-4 text-red-700">
        Could not load the menu. The server may be waking up, please refresh in
        a few seconds.
      </p>
    );
  }

  return <MenuExplorer categories={categories} items={items} />;
}