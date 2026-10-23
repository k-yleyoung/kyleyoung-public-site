(() => {
  "use strict";

  const orbit = document.getElementById("ascii-orbit");
  const progress = document.querySelector(".page-progress");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let visible = true;
  let lastFrame = 0;
  let animationFrame = 0;

  // An original, text-only rotating torus. No canvas, textures, or third-party animation runtime.
  const width = 48;
  const height = 26;
  const ink = " .·:-=+*#%@";
  const tau = Math.PI * 2;

  function renderOrbit(time) {
    if (!orbit) return;

    const a = 0.53 + time * 0.00018;
    const b = -0.45 + time * 0.00031;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const cb = Math.cos(b);
    const sb = Math.sin(b);
    const pixels = new Array(width * height).fill(" ");
    const zbuffer = new Float32Array(width * height);

    for (let phi = 0; phi < tau; phi += 0.074) {
      const cp = Math.cos(phi);
      const sp = Math.sin(phi);
      for (let theta = 0; theta < tau; theta += 0.15) {
        const ct = Math.cos(theta);
        const st = Math.sin(theta);
        const ring = 1.8 + 0.7 * ct;
        const x0 = ring * cp;
        const y0 = ring * sp;
        const z0 = 0.7 * st;

        const y1 = y0 * ca - z0 * sa;
        const z1 = y0 * sa + z0 * ca;
        const x = x0 * cb + z1 * sb;
        const z = -x0 * sb + z1 * cb;
        const depth = 1 / (z + 4.8);

        const col = Math.floor(width / 2 + width * 0.85 * depth * x);
        const row = Math.floor(height / 2 + height * 1.12 * depth * y1);
        if (col < 0 || col >= width || row < 0 || row >= height) continue;

        const index = col + row * width;
        if (depth <= zbuffer[index]) continue;
        zbuffer[index] = depth;

        const nx0 = ct * cp;
        const ny0 = ct * sp;
        const nz0 = st;
        const ny1 = ny0 * ca - nz0 * sa;
        const nz1 = ny0 * sa + nz0 * ca;
        const nx = nx0 * cb + nz1 * sb;
        const nz = -nx0 * sb + nz1 * cb;
        const light = nx * 0.27 - ny1 * 0.47 + nz * 0.85;
        const shade = Math.max(1, Math.min(ink.length - 1, Math.floor((light + 1) * (ink.length - 1) / 2)));
        pixels[index] = ink[shade];
      }
    }

    let output = "";
    for (let y = 0; y < height; y++) {
      output += pixels.slice(y * width, (y + 1) * width).join("") + (y < height - 1 ? "\n" : "");
    }
    orbit.textContent = output;
  }

  function animate(time) {
    if (visible && document.visibilityState === "visible") {
      if (time - lastFrame >= 65) {
        renderOrbit(time);
        lastFrame = time;
      }
    }
    if (!reduceMotion.matches) animationFrame = requestAnimationFrame(animate);
  }

  if (orbit) {
    renderOrbit(2100);
    if (!reduceMotion.matches) animationFrame = requestAnimationFrame(animate);
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0 });
      observer.observe(orbit);
    }
    reduceMotion.addEventListener?.("change", () => {
      cancelAnimationFrame(animationFrame);
      if (reduceMotion.matches) renderOrbit(2100);
      else animationFrame = requestAnimationFrame(animate);
    });
  }

  if (progress) {
    let ticking = false;
    function updateProgress() {
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      const fraction = distance > 0 ? window.scrollY / distance : 0;
      progress.style.width = Math.min(100, Math.max(0, fraction * 100)) + "%";
      ticking = false;
    }
    window.addEventListener("scroll", () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateProgress);
      }
    }, { passive: true });
    updateProgress();
  }
})();
