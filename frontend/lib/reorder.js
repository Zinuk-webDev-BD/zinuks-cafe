export function buildReorderLines(order, menu) {
  const byId = new Map(menu.map((m) => [String(m._id), m]));
  const lines = [];
  const skipped = [];

  for (const it of order.items) {
    const m = byId.get(String(it.menuItem));
    if (!m || !m.isAvailable) {
      skipped.push(it.name);
      continue;
    }

    let unitPrice = m.price;
    let variant = "";
    if (it.variant) {
      const v = (m.variants || []).find((x) => x.name === it.variant);
      if (!v) {
        skipped.push(it.name);
        continue;
      }
      unitPrice = v.price;
      variant = v.name;
    }

    const addOns = [];
    let ok = true;
    for (const a of it.addOns || []) {
      const found = (m.addOns || []).find((x) => x.name === a.name);
      if (!found) {
        ok = false;
        break;
      }
      addOns.push({ name: found.name, price: found.price });
      unitPrice += found.price;
    }
    if (!ok) {
      skipped.push(it.name);
      continue;
    }

    lines.push({
      menuItem: m._id,
      name: m.name,
      image: m.image || "",
      variant,
      addOns,
      unitPrice,
      quantity: it.quantity,
    });
  }

  return { lines, skipped };
}