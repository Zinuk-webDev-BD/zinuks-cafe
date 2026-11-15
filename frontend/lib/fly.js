export function flyToCart(source, imageSrc) {
  const target = document.getElementById("cart-btn");
  if (!source || !target) return;

  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const startX = from.left + from.width / 2 - 28;
  const startY = from.top + from.height / 2 - 28;

  const el = document.createElement("div");
  el.style.cssText = `position:fixed;left:${startX}px;top:${startY}px;width:56px;height:56px;border-radius:50%;z-index:9999;pointer-events:none;box-shadow:0 8px 24px rgba(0,0,0,.35);background:#c8793a center/cover;display:flex;align-items:center;justify-content:center;font-size:28px;`;
  if (imageSrc) {
    el.style.backgroundImage = `url("${imageSrc}")`;
  } else {
    el.textContent = "☕";
  }
  document.body.appendChild(el);

  const dx = to.left + to.width / 2 - (startX + 28);
  const dy = to.top + to.height / 2 - (startY + 28);

  const anim = el.animate(
    [
      { transform: "translate(0, 0) scale(1)", opacity: 1 },
      {
        transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 90}px) scale(0.85)`,
        opacity: 1,
        offset: 0.5,
      },
      { transform: `translate(${dx}px, ${dy}px) scale(0.2)`, opacity: 0.4 },
    ],
    { duration: 850, easing: "cubic-bezier(0.5, 0, 0.4, 1)" }
  );
  anim.onfinish = () => el.remove();
}