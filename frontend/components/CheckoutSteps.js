const STEPS = ["Cart", "Details", "Done"];

export default function CheckoutSteps({ current }) {
  return (
    <ol className="mx-auto flex max-w-md items-center">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-500 ${
                  done || active
                    ? "bg-caramel text-white"
                    : "bg-white/15 text-white/60"
                } ${active ? "scale-110 ring-4 ring-caramel/40" : ""}`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={`text-xs ${
                  done || active ? "text-white" : "text-white/50"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span className="mx-2 mb-5 h-0.5 flex-1 overflow-hidden rounded bg-white/15">
                <span
                  className={`block h-full bg-caramel ${done ? "grow-x" : "w-0"}`}
                />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}