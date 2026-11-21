const money = (n) => `${n} Tk`;

// Customer typed text goes into the email, so make it safe first
const esc = (s) =>
  String(s === undefined || s === null ? "" : s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );

function layout({ preheader, emoji, heading, intro, content, button }) {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#faf5ee;font-family:Arial,Helvetica,sans-serif;color:#2b1a12;">
<span style="display:none;opacity:0;visibility:hidden;height:0;width:0;">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf5ee;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
<tr><td style="background:#2b1a12;padding:22px;text-align:center;color:#ffffff;">
<div style="font-size:22px;font-weight:bold;">☕ Zinuk's Cafe Corner</div>
</td></tr>
<tr><td style="padding:28px 24px 8px;text-align:center;">
<div style="font-size:44px;line-height:1;">${emoji}</div>
<h1 style="margin:10px 0 6px;font-size:22px;">${esc(heading)}</h1>
<p style="margin:0;color:#6b5b53;font-size:15px;line-height:1.5;">${intro}</p>
</td></tr>
<tr><td style="padding:16px 24px;">${content}</td></tr>
${
  button
    ? `<tr><td style="padding:8px 24px 28px;text-align:center;"><a href="${esc(button.url)}" style="display:inline-block;background:#c8793a;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 28px;border-radius:999px;">${esc(button.label)}</a></td></tr>`
    : ""
}
<tr><td style="background:#faf5ee;padding:16px 24px;text-align:center;font-size:12px;color:#8a7a70;">
Zinuk's Cafe Corner · Dhaka, Bangladesh<br/>This is a demo project, so no real food will be delivered.
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

const row = (label, value, style = "") =>
  `<tr><td style="padding:5px 0;font-size:14px;${style}">${label}</td><td style="padding:5px 0;font-size:14px;text-align:right;white-space:nowrap;${style}">${value}</td></tr>`;

function itemsTable(order) {
  const rows = order.items
    .map((it) => {
      const extras = [];
      if (it.variant) extras.push(it.variant);
      if (it.addOns && it.addOns.length > 0)
        extras.push("+ " + it.addOns.map((a) => a.name).join(", "));
      return `<tr>
<td style="padding:8px 0;border-bottom:1px solid #f0e6d8;font-size:14px;">${it.quantity} x ${esc(it.name)}${
        extras.length > 0
          ? `<br/><span style="color:#8a7a70;font-size:12px;">${esc(extras.join(" "))}</span>`
          : ""
      }</td>
<td style="padding:8px 0;border-bottom:1px solid #f0e6d8;font-size:14px;text-align:right;white-space:nowrap;">${money(it.lineTotal)}</td>
</tr>`;
    })
    .join("");

  const totals = [
    row("Subtotal", money(order.subtotal)),
    order.discount > 0
      ? row(`Coupon ${esc(order.couponCode)}`, `- ${money(order.discount)}`, "color:#16a34a;")
      : "",
    row("Delivery fee", money(order.deliveryFee)),
    row("Total", money(order.total), "font-weight:bold;font-size:16px;color:#c8793a;"),
  ].join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}${totals}</table>`;
}

function deliveryBlock(order) {
  const a = order.address || {};
  return `<div style="background:#faf5ee;border-radius:12px;padding:14px;margin-top:16px;font-size:14px;line-height:1.6;">
<strong>Delivering to</strong><br/>
${esc(a.name)} · ${esc(a.phone)}<br/>
${esc(a.address)}${a.note ? `<br/><span style="color:#8a7a70;">Note: ${esc(a.note)}</span>` : ""}<br/>
<span style="color:#8a7a70;">💵 Cash on delivery</span>
</div>`;
}

function orderPlacedEmail(order, trackUrl) {
  return layout({
    preheader: `Order ${order.orderNumber} received`,
    emoji: "🧾",
    heading: "We got your order!",
    intro: `Order <strong>${esc(order.orderNumber)}</strong> is placed. We will email you as it moves along.`,
    content: itemsTable(order) + deliveryBlock(order),
    button: { label: "Track my order", url: trackUrl },
  });
}

const STATUS_COPY = {
  confirmed: {
    emoji: "✅",
    title: "Your order is confirmed",
    text: "The cafe accepted your order and will start preparing it soon.",
  },
  out_for_delivery: {
    emoji: "🛵",
    title: "Your order is on the way",
    text: "Our rider is heading to you. Please keep your phone nearby and the cash ready.",
  },
  delivered: {
    emoji: "🎉",
    title: "Delivered. Enjoy your meal!",
    text: "Thank you for ordering from us. We hope to see you again soon.",
  },
  cancelled: {
    emoji: "😔",
    title: "Your order was cancelled",
    text: "This order has been cancelled. If you did not expect this, please contact the cafe.",
  },
};

// Returns { subject, html } or null (no email for this status)
function statusEmail(order, trackUrl) {
  const copy = STATUS_COPY[order.status];
  if (!copy) return null;
  return {
    subject: `Order ${order.orderNumber}: ${copy.title}`,
    html: layout({
      preheader: copy.title,
      emoji: copy.emoji,
      heading: copy.title,
      intro: `${esc(copy.text)}<br/><span style="color:#8a7a70;font-size:13px;">Order ${esc(order.orderNumber)}</span>`,
      content: itemsTable(order),
      button: { label: "View my order", url: trackUrl },
    }),
  };
}

function adminNewOrderEmail(order, adminUrl) {
  return layout({
    preheader: `New order ${order.orderNumber}`,
    emoji: "🔔",
    heading: "New order received",
    intro: `<strong>${esc(order.orderNumber)}</strong> · ${money(order.total)}`,
    content: itemsTable(order) + deliveryBlock(order),
    button: { label: "Open dashboard", url: adminUrl },
  });
}

module.exports = { orderPlacedEmail, statusEmail, adminNewOrderEmail };