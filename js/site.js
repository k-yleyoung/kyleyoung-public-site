(() => {
  "use strict";

  const panel = document.getElementById("ascii-module");
  const artwork = document.getElementById("ascii-art");
  if (!panel || !artwork) return;

  const columns = 45;
  const rows = 19;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let scheduled = false;
  let pointer = { x: 0, y: 0 };

  // A small ASCII wireframe sphere. It only updates when the visitor moves
  // their cursor inside the panel; nothing animates continuously.
  function draw(rotation, tilt) {
    const lines = [];

    for (let row = 0; row < rows; row++) {
      let line = "";
      const y = (row - (rows - 1) / 2) / ((rows - 1) / 2);

      for (let column = 0; column < columns; column++) {
        const x = (column - (columns - 1) / 2) / ((columns - 1) / 2);
        const horizontal = x * 1.55;
        const distance = horizontal * horizontal + y * y;

        if (distance > 1) {
          line += " ";
          continue;
        }

        const z = Math.sqrt(1 - distance);
        const longitude = Math.atan2(horizontal, z) + rotation;
        const latitude = Math.asin(y) + tilt * 0.4;
        const outline = distance > 0.91;
        const meridian = Math.abs(Math.sin(longitude * 5));
        const parallel = Math.abs(Math.sin(latitude * 6));
        const light = 0.5 + 0.5 * Math.cos(longitude - 0.9) * Math.cos(latitude);

        let glyph = " ";
        if (outline) glyph = ".";
        else if (meridian < 0.10 && parallel < 0.16) glyph = "+";
        else if (meridian < 0.095) glyph = light > 0.52 ? ":" : ".";
        else if (parallel < 0.11) glyph = light > 0.55 ? "-" : ".";
        else if (light > 0.67 && ((column * 7 + row * 11) % 19 === 0)) glyph = ".";
        line += glyph;
      }

      lines.push(line.trimEnd());
    }

    artwork.textContent = lines.join("\n");
  }

  function update() {
    draw(pointer.x * 1.1, pointer.y * 0.65);
    scheduled = false;
  }

  panel.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch" || prefersReducedMotion.matches) return;

    const rectangle = panel.getBoundingClientRect();
    pointer.x = Math.max(-1, Math.min(1, (event.clientX - rectangle.left) / rectangle.width * 2 - 1));
    pointer.y = Math.max(-1, Math.min(1, (event.clientY - rectangle.top) / rectangle.height * 2 - 1));
    panel.style.setProperty("--cursor-x", ((pointer.x + 1) * 50).toFixed(1) + "%");
    panel.style.setProperty("--cursor-y", ((pointer.y + 1) * 50).toFixed(1) + "%");

    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(update);
    }
  });

  panel.addEventListener("pointerleave", () => {
    pointer = { x: 0, y: 0 };
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(update);
    }
  });

  draw(0, 0);
})();
