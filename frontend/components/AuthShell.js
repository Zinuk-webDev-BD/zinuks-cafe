import { playfair } from "@/lib/fonts";

const beans = [
  { left: "8%", duration: 14, delay: -3, scale: 1.2 },
  { left: "20%", duration: 18, delay: -9, scale: 1.7 },
  { left: "33%", duration: 12, delay: -5, scale: 1 },
  { left: "47%", duration: 16, delay: -12, scale: 1.4 },
  { left: "60%", duration: 20, delay: -7, scale: 1.8 },
  { left: "72%", duration: 13, delay: -1, scale: 1.1 },
  { left: "84%", duration: 17, delay: -10, scale: 1.5 },
  { left: "94%", duration: 15, delay: -4, scale: 1 },
];

const perks = [
  { icon: "☕", text: "Order your favourites in a few taps" },
  { icon: "📦", text: "Follow every order from kitchen to door" },
  { icon: "🔒", text: "Your password is stored securely hashed" },
];

const quotes = [
  "Good coffee, good mood.",
  "Fresh from our kitchen to your door.",
  "Your corner table is waiting.",
];

const decor = [
  { e: "☕", left: "6%", top: "10%", size: "4rem", dur: 9, delay: 0 },
  { e: "🍰", left: "86%", top: "14%", size: "3.5rem", dur: 11, delay: -3 },
  { e: "🥐", left: "8%", top: "78%", size: "3.5rem", dur: 10, delay: -6 },
  { e: "🍩", left: "88%", top: "76%", size: "4rem", dur: 12, delay: -2 },
];

export default function AuthShell({ heading, sub, children }) {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <aside
        className="relative hidden items-center justify-center overflow-hidden bg-espresso bg-cover bg-center text-white lg:flex"
        style={{
          backgroundImage:
            "linear-gradient(rgba(30,16,8,0.7), rgba(30,16,8,0.86)), url('/hero.jpg')",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          {beans.map((b, i) => (
            <span
              key={i}
              className="bean"
              style={{
                left: b.left,
                scale: b.scale,
                animationDuration: `${b.duration}s`,
                animationDelay: `${b.delay}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-md px-10">
          <div className="float text-7xl">☕</div>
          <h2
            className={`${playfair.className} mt-6 text-5xl font-bold leading-tight`}
          >
            Zinuk&apos;s <span className="shine">Cafe</span> Corner
          </h2>
          <div className="rotator mt-5 text-xl text-stone-200">
            {quotes.map((q) => (
              <span key={q}>{q}</span>
            ))}
          </div>
          <ul className="mt-8 space-y-3">
            {perks.map((p, i) => (
              <li
                key={p.text}
                className="fade-up flex items-center gap-3"
                style={{ animationDelay: `${0.4 + i * 0.25}s` }}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl">
                  {p.icon}
                </span>
                <span className="text-stone-200">{p.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <section className="relative flex items-center justify-center overflow-hidden px-4 py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          {decor.map((d, i) => (
            <span
              key={i}
              className="drift absolute select-none"
              style={{
                left: d.left,
                top: d.top,
                fontSize: d.size,
                animationDuration: `${d.dur}s`,
                animationDelay: `${d.delay}s`,
              }}
            >
              {d.e}
            </span>
          ))}
        </div>

        <div className="card-in border-flow relative w-full max-w-md rounded-3xl p-[2px] shadow-2xl shadow-espresso/20">
          <div className="rounded-[22px] bg-white p-8">
            <h1 className={`${playfair.className} text-3xl font-bold`}>
              {heading}
            </h1>
            <p className="mt-1 text-sm text-stone-500">{sub}</p>
            {children}
          </div>
        </div>
      </section>
    </div>
  );
}