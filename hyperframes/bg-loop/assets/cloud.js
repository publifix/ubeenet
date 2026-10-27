/*
 * "Nube de red" — fondo animado de Ubeenet Connect 2026.
 * Nubes con contorno luminoso (como el hero de ubeenet.com), malla interna de
 * nodos, paquetes de datos que recorren el contorno y viajan entre nubes, y un
 * campo de partículas en ola. Todo es función pura de t (0–12 s) con ciclos
 * enteros: frame 0 = frame 360, loop perfecto. Sin amarillo (#CDA41B).
 */
(function () {
  const DURATION = 12;
  const TAU = Math.PI * 2;
  const C = {
    noche: [13, 19, 32],
    marino: [36, 56, 103],
    violeta: [94, 35, 126],
    violetaLuz: [168, 104, 214],
    nube: [104, 166, 189],
    nubeLuz: [178, 226, 242],
    blanco: [255, 255, 255],
  };
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const wave = (p, cycles, phase = 0) => Math.sin(TAU * (p * cycles + phase));

  // Silueta de nube en coordenadas unitarias: unión de círculos + base redondeada.
  const CIRCLES = [
    [0.27, 0.6, 0.19],
    [0.48, 0.43, 0.27],
    [0.73, 0.56, 0.21],
    [0.22, 0.68, 0.12],
    [0.8, 0.68, 0.12],
  ];
  function insideCloud(x, y) {
    for (const [cx, cy, r] of CIRCLES) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) return true;
    return x >= 0.22 && x <= 0.8 && y >= 0.56 && y <= 0.8;
  }
  // Contorno por rayos desde el centro (la silueta es estrellada respecto a él).
  const CENTER = [0.5, 0.6];
  const OUTLINE = (() => {
    const pts = [];
    const N = 420;
    for (let i = 0; i < N; i++) {
      const a = (TAU * i) / N;
      let r = 0;
      for (let s = 0; s < 0.7; s += 0.0015) {
        if (insideCloud(CENTER[0] + Math.cos(a) * s, CENTER[1] + Math.sin(a) * s)) r = s;
      }
      pts.push([CENTER[0] + Math.cos(a) * r, CENTER[1] + Math.sin(a) * r]);
    }
    // Suaviza el escalonado del muestreo (promedio circular, 3 pasadas).
    let out = pts;
    for (let pass = 0; pass < 3; pass++) {
      out = out.map((_, i) => {
        let x = 0;
        let y = 0;
        for (let k = -3; k <= 3; k++) {
          const q = out[(i + k + out.length) % out.length];
          x += q[0];
          y += q[1];
        }
        return [x / 7, y / 7];
      });
    }
    return out;
  })();
  const outlineAt = (deg) => OUTLINE[Math.round((((deg % 360) + 360) % 360) / 360 * OUTLINE.length) % OUTLINE.length];

  // Malla interna: nodos en el contorno (ángulo) y en el interior, unidos por aristas.
  const WIRE_NODES = [
    outlineAt(165), // 0 abajo-izquierda
    outlineAt(205), // 1 izquierda
    outlineAt(245), // 2 arriba-izquierda
    outlineAt(272), // 3 arriba
    outlineAt(318), // 4 arriba-derecha
    outlineAt(355), // 5 derecha
    outlineAt(20), // 6 abajo-derecha
    outlineAt(90), // 7 abajo
    [0.47, 0.6], // 8 centro
    [0.63, 0.5], // 9 interior derecha
  ];
  const WIRE_EDGES = [
    [0, 3], [3, 6], [0, 8], [8, 6], [2, 8], [8, 9], [9, 4], [9, 5], [1, 8], [7, 8], [3, 9],
  ];
  // Colores de nodo: nube, blanco o violeta (como los nodos del sitio, sin amarillo).
  const NODE_TONE = ['nube', 'blanco', 'nube', 'violeta', 'nube', 'blanco', 'nube', 'violeta', 'blanco', 'nube'];

  function makeCloud(x, y, w, opts) {
    const h = w; // unidades cuadradas
    const map = ([u, v]) => [x + (u - 0.5) * w, y + (v - 0.6) * h];
    const outline = OUTLINE.map(map);
    const lens = [0];
    for (let i = 1; i <= outline.length; i++) {
      const a = outline[i - 1];
      const b = outline[i % outline.length];
      lens.push(lens[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
    }
    return {
      outline,
      lens,
      total: lens[lens.length - 1],
      nodes: WIRE_NODES.map(map),
      w,
      bob: opts.bob,
      phase: opts.phase,
      strength: opts.strength,
      packets: opts.packets, // [vueltas en 12 s, desfase, sentido]
      wire: opts.wire,
    };
  }

  function pointOnOutline(cloud, d) {
    const { outline, lens, total } = cloud;
    d = ((d % total) + total) % total;
    let lo = 0;
    let hi = lens.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (lens[mid] <= d) lo = mid;
      else hi = mid;
    }
    const a = outline[lo % outline.length];
    const b = outline[(lo + 1) % outline.length];
    const u = (d - lens[lo]) / (lens[lo + 1] - lens[lo] || 1);
    return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  }

  function build(w, h, layout) {
    const s = Math.min(w, h);
    const clouds = layout.clouds.map((c) =>
      makeCloud(c.x * w, c.y * h, c.size * (layout.sizeBy === 'h' ? h : w), c),
    );
    // Campo de partículas: retícula en un plano inclinado con perspectiva.
    const dots = [];
    const f = layout.floor;
    for (let j = 0; j < f.rows; j++) {
      for (let i = 0; i < f.cols; i++) {
        dots.push({ u: i / (f.cols - 1), v: j / (f.rows - 1), seed: ((i * 73856093) ^ (j * 19349663)) >>> 0 });
      }
    }
    return { w, h, s, clouds, dots, layout };
  }

  function glowStroke(ctx, path, color, width, blur, alpha) {
    ctx.save();
    ctx.strokeStyle = rgba(color, alpha);
    ctx.lineWidth = width;
    ctx.shadowColor = rgba(color, Math.min(1, alpha + 0.2));
    ctx.shadowBlur = blur;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke(path);
    ctx.restore();
  }

  function glowDot(ctx, x, y, r, color, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 5);
    g.addColorStop(0, rgba(color, 0.75 * alpha));
    g.addColorStop(0.35, rgba(color, 0.25 * alpha));
    g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r * 5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = rgba(C.blanco, alpha);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }

  function render(ctx, scene, t) {
    const { w, h, layout } = scene;
    const p = (((t % DURATION) + DURATION) % DURATION) / DURATION;

    // Fondo: noche con luz difusa marino y violeta (deriva ±4 % del ancho).
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 0;
    ctx.fillStyle = rgba(C.noche, 1);
    ctx.fillRect(0, 0, w, h);
    const blobs = [
      [C.violeta, 0.42, layout.violet, wave(p, 1)],
      [C.marino, 0.85, layout.marine, wave(p, 1, 0.3)],
      [C.nube, 0.16, layout.halo, wave(p, 1, 0.6)],
    ];
    for (const [c, a, [bx, by, br], d] of blobs) {
      const x = bx * w + 0.04 * w * d;
      const y = by * h;
      const r = br * Math.max(w, h);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, rgba(c, a));
      g.addColorStop(0.5, rgba(c, a * 0.35));
      g.addColorStop(1, rgba(c, 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    // Campo de partículas en ola (la "data" que fluye bajo las nubes).
    const fl = layout.floor;
    for (const d of scene.dots) {
      const depth = d.v; // 0 lejos, 1 cerca
      const persp = 0.35 + 0.65 * depth;
      const x = fl.x * w + (d.u - 0.5) * fl.width * w * persp;
      const lift = Math.sin(TAU * (d.u * 1.5 + p * 2)) * Math.cos(TAU * (d.v * 0.8 - p)) * fl.amp * h * persp;
      const y = fl.y * h + depth * fl.depth * h - lift;
      const tw = 0.5 + 0.5 * Math.sin(TAU * (p * (1 + (d.seed % 3)) + (d.seed % 997) / 997));
      const edge = Math.min(1, d.u / 0.15, (1 - d.u) / 0.15) * Math.min(1, depth / 0.25);
      const a = (0.2 + 0.6 * tw) * persp * edge;
      if (a < 0.02) continue;
      ctx.fillStyle = rgba(d.seed % 7 === 0 ? C.violetaLuz : C.nubeLuz, a);
      ctx.fillRect(x, y, 2 * persp + 0.8, 2 * persp + 0.8);
    }

    // Enlaces entre nubes: arcos con paquetes que viajan de una a otra.
    const links = layout.links || [];
    links.forEach(([ai, an, bi, bn, laps, off], k) => {
      const A = scene.clouds[ai];
      const B = scene.clouds[bi];
      const ay = wave(p, 1, A.phase) * A.bob;
      const by = wave(p, 1, B.phase) * B.bob;
      const a = [A.nodes[an][0], A.nodes[an][1] + ay];
      const b = [B.nodes[bn][0], B.nodes[bn][1] + by];
      const mx = (a[0] + b[0]) / 2;
      const my = (a[1] + b[1]) / 2 - Math.abs(a[0] - b[0]) * 0.25 - 40;
      const path = new Path2D();
      path.moveTo(a[0], a[1]);
      path.quadraticCurveTo(mx, my, b[0], b[1]);
      ctx.save();
      ctx.setLineDash([2, 7]);
      ctx.lineDashOffset = -p * 9 * 12; // múltiplo del patrón: continuo en el loop
      ctx.strokeStyle = rgba(C.nube, 0.55);
      ctx.lineWidth = 1.2;
      ctx.stroke(path);
      ctx.restore();
      const u = (p * laps + off) % 1;
      const q = (s) => [
        (1 - s) * (1 - s) * a[0] + 2 * (1 - s) * s * mx + s * s * b[0],
        (1 - s) * (1 - s) * a[1] + 2 * (1 - s) * s * my + s * s * b[1],
      ];
      const fade = Math.min(1, u / 0.1, (1 - u) / 0.1);
      for (let i = 6; i >= 1; i--) {
        const s = u - i * 0.012;
        if (s < 0) continue;
        const [tx, ty] = q(s);
        ctx.fillStyle = rgba(C.nubeLuz, 0.3 * (1 - i / 6) * fade);
        ctx.beginPath();
        ctx.arc(tx, ty, 2, 0, TAU);
        ctx.fill();
      }
      const [px, py] = q(u);
      glowDot(ctx, px, py, 2.4, k % 2 ? C.violetaLuz : C.nubeLuz, fade);
    });

    // Nubes.
    for (const cloud of scene.clouds) {
      const dy = wave(p, 1, cloud.phase) * cloud.bob;
      const k = cloud.strength;
      ctx.save();
      ctx.translate(0, dy);

      // Relleno muy tenue para dar volumen.
      const fill = new Path2D();
      cloud.outline.forEach(([x, y], i) => (i ? fill.lineTo(x, y) : fill.moveTo(x, y)));
      fill.closePath();
      const cx = cloud.nodes[8][0];
      const cy = cloud.nodes[8][1];
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, cloud.w * 0.6);
      g.addColorStop(0, rgba(C.nube, 0.1 * k));
      g.addColorStop(1, rgba(C.nube, 0.02 * k));
      ctx.fillStyle = g;
      ctx.fill(fill);

      // Malla interna.
      if (cloud.wire) {
        const wire = new Path2D();
        for (const [i, j] of WIRE_EDGES) {
          wire.moveTo(cloud.nodes[i][0], cloud.nodes[i][1]);
          wire.lineTo(cloud.nodes[j][0], cloud.nodes[j][1]);
        }
        glowStroke(ctx, wire, C.nube, 1.2, 6, 0.5 * k);
      }

      // Contorno de neón: halo ancho + línea central clara (respira levemente).
      const breath = 0.85 + 0.15 * wave(p, 2, cloud.phase);
      glowStroke(ctx, fill, C.nube, 10 * k, 42, 0.42 * k * breath);
      glowStroke(ctx, fill, C.nubeLuz, 2.2 * k, 10, 0.95 * k);

      // Paquetes recorriendo el contorno, con estela.
      for (const [laps, off, dir] of cloud.packets) {
        const u = (((p * laps * dir + off) % 1) + 1) % 1;
        const d = u * cloud.total;
        const trail = 90 * k;
        for (let i = 10; i >= 1; i--) {
          const [tx, ty] = pointOnOutline(cloud, d - dir * (trail * i) / 10);
          ctx.fillStyle = rgba(C.blanco, 0.5 * (1 - i / 10));
          ctx.beginPath();
          ctx.arc(tx, ty, 2.2 * k * (1 - i / 14), 0, TAU);
          ctx.fill();
        }
        const [x, y] = pointOnOutline(cloud, d);
        glowDot(ctx, x, y, 3 * k, C.nubeLuz, 1);
      }

      // Nodos que pulsan (desfasados).
      cloud.nodes.forEach(([x, y], i) => {
        if (!cloud.wire && i > 7) return;
        const pulse = 0.5 + 0.5 * wave(p, 1 + (i % 3), i * 0.13 + cloud.phase);
        const tone = NODE_TONE[i] === 'violeta' ? C.violetaLuz : NODE_TONE[i] === 'blanco' ? C.blanco : C.nubeLuz;
        glowDot(ctx, x, y, (2.2 + 1.6 * pulse) * k, tone, 0.65 + 0.35 * pulse);
      });

      ctx.restore();
    }

    // Pulso de conexión: cada 4 s un anillo tenue desde el nodo superior de la nube principal.
    const main = scene.clouds[0];
    const tau = ((p * DURATION) % 4) / 4;
    const top = main.nodes[[3, 8, 9][Math.floor((p * DURATION) / 4) % 3]];
    const mdy = wave(p, 1, main.phase) * main.bob;
    ctx.strokeStyle = rgba(C.blanco, 0.22 * Math.pow(1 - tau, 1.5));
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(top[0], top[1] + mdy, 10 + tau * layout.pulseRadius, 0, TAU);
    ctx.stroke();
  }

  const LAYOUTS = {
    desktop: {
      sizeBy: 'w',
      violet: [0.18, 0.95, 0.5],
      marine: [0.85, 0.12, 0.5],
      halo: [0.74, 0.45, 0.32],
      pulseRadius: 300,
      floor: { x: 0.72, y: 0.66, width: 0.72, depth: 0.36, amp: 0.025, cols: 72, rows: 22 },
      clouds: [
        { x: 0.75, y: 0.44, size: 0.36, bob: 10, phase: 0, strength: 1, wire: true, packets: [[1, 0, 1], [2, 0.5, 1], [1, 0.3, -1]] },
        { x: 0.52, y: 0.2, size: 0.13, bob: 8, phase: 0.35, strength: 0.7, wire: false, packets: [[2, 0.2, 1]] },
        { x: 0.9, y: 0.8, size: 0.13, bob: 7, phase: 0.7, strength: 0.65, wire: false, packets: [[1, 0.6, -1]] },
      ],
      // [nube A, nodo A, nube B, nodo B, vueltas, desfase]
      links: [
        [1, 5, 0, 2, 1, 0.1],
        [0, 6, 2, 1, 2, 0.4],
      ],
    },
    mobile: {
      sizeBy: 'w',
      violet: [0.1, 0.95, 0.9],
      marine: [0.95, 0.5, 0.8],
      halo: [0.55, 0.74, 0.5],
      pulseRadius: 240,
      floor: { x: 0.5, y: 0.86, width: 1.3, depth: 0.12, amp: 0.01, cols: 46, rows: 16 },
      // Zona libre arriba (título); la red vive en la mitad inferior.
      clouds: [
        { x: 0.56, y: 0.74, size: 0.78, bob: 12, phase: 0, strength: 1, wire: true, packets: [[1, 0, 1], [2, 0.5, 1], [1, 0.3, -1]] },
        { x: 0.82, y: 0.52, size: 0.26, bob: 9, phase: 0.35, strength: 0.7, wire: false, packets: [[2, 0.2, 1]] },
        { x: 0.16, y: 0.58, size: 0.24, bob: 8, phase: 0.7, strength: 0.6, wire: false, packets: [[1, 0.6, -1]] },
      ],
      links: [
        [1, 7, 0, 4, 1, 0.1],
        [2, 6, 0, 1, 2, 0.4],
      ],
    },
  };

  window.BgCloud = { DURATION, LAYOUTS, build, render };
})();
