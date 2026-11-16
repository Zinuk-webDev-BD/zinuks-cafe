const STEPS = [
  { key: "pending", icon: "📝", title: "Order placed", text: "We got your order" },
  { key: "confirmed", icon: "✅", title: "Confirmed", text: "The cafe accepted your order" },
  { key: "preparing", icon: "🍳", title: "Preparing", text: "Your food is being made" },
  { key: "out_for_delivery", icon: "🛵", title: "On the way", text: "Your order is out for delivery" },
  { key: "delivered", icon: "🎉", title: "Delivered", text: "Enjoy your meal!" },
];

const timeOf = (history, key) => {
  const h = history.find((x) => x.status === key);
  if (!h) return "";
  return new Date(h.at).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function OrderTimeline({ status, history = [] }) {
  const current = STEPS.findIndex((s) => s.key === status);

  return (
    <ol>
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const last = i === STEPS.length - 1;
        const time = timeOf(history, s.key);

        return (
          <li key={s.key} className="relative flex gap-4 pb-8 last:pb-0">
            {!last && (
              <span className="absolute left-5 top-10 -ml-px h-[calc(100%-2.5rem)] w-0.5 bg-latte">
                <span
                  className={`block w-full bg-caramel transition-all duration-1000 ${
                    done ? "h-full" : "h-0"
                  }`}
                />
              </span>
            )}

            <span
              className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg transition-all duration-500 ${
                done || active
                  ? "bg-caramel text-white"
                  : "bg-latte text-stone-400"
              } ${active ? "scale-110 ring-4 ring-caramel/30" : ""}`}
            >
              {active && status !== "delivered" && (
                <span className="absolute inset-0 animate-ping rounded-full bg-caramel/40" />
              )}
              <span className="relative">{done ? "✓" : s.icon}</span>
            </span>

            <div className="pt-1">
              <p
                className={`font-semibold ${
                  done || active ? "text-espresso" : "text-stone-400"
                }`}
              >
                {s.title}
              </p>
              {active && <p className="text-sm text-stone-500">{s.text}</p>}
              {time && <p className="text-xs text-stone-400">{time}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}