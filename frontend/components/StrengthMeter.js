const labels = ["Too short", "Weak", "Okay", "Good", "Strong"];
const colors = [
  "bg-red-400",
  "bg-orange-400",
  "bg-yellow-400",
  "bg-lime-500",
  "bg-green-500",
];

export default function StrengthMeter({ password }) {
  if (!password) return null;

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[0-9]/.test(password) && /[a-zA-Z]/.test(password)) score++;
  if (/[A-Z]/.test(password) && /[^a-zA-Z0-9]/.test(password)) score++;

  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`strength-seg h-1.5 flex-1 rounded-full ${
              i < score ? colors[score] : "bg-stone-200"
            }`}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-stone-500">{labels[score]}</p>
    </div>
  );
}