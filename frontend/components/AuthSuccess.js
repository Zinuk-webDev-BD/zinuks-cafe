export default function AuthSuccess({
  message,
  sub = "Taking you to the menu...",
}) {
  return (
    <div className="py-10 text-center">
      <svg viewBox="0 0 52 52" className="mx-auto h-24 w-24">
        <circle className="check-circle" cx="26" cy="26" r="24" fill="none" />
        <path className="check-mark" fill="none" d="M14 27l8 8 16-16" />
      </svg>
      <p
        className="fade-up mt-4 text-xl font-semibold"
        style={{ animationDelay: "0.6s" }}
      >
        {message}
      </p>
      <p
        className="fade-up mt-1 text-sm text-stone-500"
        style={{ animationDelay: "0.8s" }}
      >
        {sub}
      </p>
    </div>
  );
}