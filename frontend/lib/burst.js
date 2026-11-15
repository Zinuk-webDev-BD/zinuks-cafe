export function burst(x, y, emojis, count = 20) {
  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.textContent = emojis[i % emojis.length];
    el.style.cssText = `position:fixed;left:${x}px;top:${y}px;font-size:${
      18 + Math.random() * 20
    }px;pointer-events:none;z-index:9999;`;
    document.body.appendChild(el);

    const angle = Math.random() * Math.PI * 2;
    const dist = 90 + Math.random() * 150;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - 70;

    const anim = el.animate(
      [
        {
          transform: "translate(-50%, -50%) scale(0.2) rotate(0deg)",
          opacity: 1,
        },
        {
          transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1.3) rotate(${
            Math.random() * 360
          }deg)`,
          opacity: 1,
          offset: 0.55,
        },
        {
          transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${
            dy + 130
          }px)) scale(0.8) rotate(${Math.random() * 540}deg)`,
          opacity: 0,
        },
      ],
      { duration: 1100 + Math.random() * 500, easing: "cubic-bezier(0.2, 0.8, 0.3, 1)" }
    );
    anim.onfinish = () => el.remove();
  }
}