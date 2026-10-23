/*
 * "La malla" — fondo animado de Ubeenet Connect 2026.
 * Todo se dibuja como función pura de t (0–12 s). Loop perfecto: cada
 * movimiento usa ciclos enteros dentro de los 12 s, así frame 0 = frame 360.
 */
(function () {
  const DURATION = 12;
  const TAU = Math.PI * 2;

  const C = {
    noche: [13, 19, 32],
    marino: [36, 56, 103],
    violeta: [94, 35, 126],
    nube: [104, 166, 189],
    texto: [238, 241, 246],
  };
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  // PRNG con semilla (mulberry32): mismas decisiones en cada frame.
  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Construye la escena una vez: malla, nodos, rutas y paquetes. */
  function build(w, h, layout) {
    const s = layout.hexSize; // radio del hexágono (vértice a centro)
    const tilt = (12 * Math.PI) / 180;
    const D = layout.cameraDistance;
    const f = D; // a z=0 la escala es 1
    const cx = w / 2;
    const cy = h / 2;

    // Plano inclinado ~12° alrededor del eje X, con perspectiva ligera.
    function project(X, Y) {
      const y3 = Y * Math.cos(tilt);
      const z3 = Y * Math.sin(tilt);
      const k = f / (D + z3);
      return [cx + X * k, cy + y3 * k];
    }

    // Vértices de una retícula hexagonal (pointy-top) que cubre el cuadro.
    const hw = Math.sqrt(3) * s;
    const vh = 1.5 * s;
    const cols = Math.ceil((w * 1.5) / hw) + 4;
    const rows = Math.ceil((h * 1.6) / vh) + 4;
    const verts = new Map();
    const vlist = [];
    const edges = new Map();
    const adj = new Map();
    const key = (x, y) => `${Math.round(x * 10)},${Math.round(y * 10)}`;
    function vert(X, Y) {
      const k = key(X, Y);
      if (!verts.has(k)) {
        const v = { id: vlist.length, X, Y, p: project(X, Y) };
        verts.set(k, v);
        vlist.push(v);
        adj.set(v.id, []);
      }
      return verts.get(k);
    }
    function edge(a, b) {
      const k = a.id < b.id ? `${a.id}-${b.id}` : `${b.id}-${a.id}`;
      if (edges.has(k)) return;
      edges.set(k, [a, b]);
      adj.get(a.id).push(b.id);
      adj.get(b.id).push(a.id);
    }
    for (let r = -rows / 2; r <= rows / 2; r++) {
      for (let q = -cols / 2; q <= cols / 2; q++) {
        const hx = q * hw + (r & 1 ? hw / 2 : 0);
        const hy = r * vh;
        const corners = [];
        for (let i = 0; i < 6; i++) {
          const a = TAU * (i / 6) - Math.PI / 2;
          corners.push(vert(hx + s * Math.cos(a), hy + s * Math.sin(a)));
        }
        for (let i = 0; i < 6; i++) edge(corners[i], corners[(i + 1) % 6]);
      }
    }

    function nearestVertex(nx, ny) {
      let best = null;
      let bd = Infinity;
      for (const v of vlist) {
        const dx = v.p[0] - nx * w;
        const dy = v.p[1] - ny * h;
        const d = dx * dx + dy * dy;
        if (d < bd) {
          bd = d;
          best = v;
        }
      }
      return best;
    }

    // Ruta más corta por las aristas de la malla (BFS).
    function pathBetween(a, b) {
      const prev = new Map([[a.id, -1]]);
      const queue = [a.id];
      while (queue.length) {
        const cur = queue.shift();
        if (cur === b.id) break;
        for (const n of adj.get(cur)) {
          if (!prev.has(n)) {
            prev.set(n, cur);
            queue.push(n);
          }
        }
      }
      const ids = [];
      for (let c = b.id; c !== -1; c = prev.get(c)) ids.push(c);
      ids.reverse();
      const pts = ids.map((id) => vlist[id].p);
      const lens = [0];
      for (let i = 1; i < pts.length; i++) {
        lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      }
      return { pts, lens, total: lens[lens.length - 1] };
    }

    const rand = mulberry32(layout.seed);
    const nodes = layout.nodes.map((n, i) => ({
      v: nearestVertex(n[0], n[1]),
      cloud: !!n[2],
      r: n[2] ? 5 : 3 + Math.round(rand()),
      phase: rand(),
      breaths: 1 + (i % 2), // 1 o 2 respiraciones por ciclo
    }));
    const routes = layout.routes.map(([a, b]) => pathBetween(nodes[a].v, nodes[b].v));
    const packets = layout.packets.map(([route, laps, offset]) => ({ route, laps, offset }));
    const clouds = nodes.filter((n) => n.cloud);

    return { w, h, edges: [...edges.values()], nodes, routes, packets, clouds, layout };
  }

  function pointAt(route, d) {
    const { pts, lens } = route;
    let i = 1;
    while (i < lens.length - 1 && lens[i] < d) i++;
    const seg = lens[i] - lens[i - 1] || 1;
    const u = Math.min(1, Math.max(0, (d - lens[i - 1]) / seg));
    return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u];
  }

  function render(ctx, scene, t) {
    const { w, h, layout } = scene;
    const p = (((t % DURATION) + DURATION) % DURATION) / DURATION;

    // Fondo y manchas de luz difusas (deriva de ±4 % del ancho en el ciclo).
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = rgba(C.noche, 1);
    ctx.fillRect(0, 0, w, h);

    const drift = 0.04 * w;
    const blobs = [
      { c: C.violeta, a: 0.35, x: layout.violet[0] * w + drift * Math.sin(TAU * p), y: layout.violet[1] * h + 0.02 * h * Math.cos(TAU * p), r: layout.violet[2] * w },
      { c: C.marino, a: 0.75, x: layout.marine[0] * w - drift * Math.sin(TAU * p + 1.3), y: layout.marine[1] * h + 0.02 * h * Math.sin(TAU * p), r: layout.marine[2] * w },
    ];
    for (const b of blobs) {
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      g.addColorStop(0, rgba(b.c, b.a));
      g.addColorStop(0.45, rgba(b.c, b.a * 0.45));
      g.addColorStop(1, rgba(b.c, 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    // Máscara radial: la malla se desvanece hacia los bordes.
    const m = layout.mask;
    const mx = m[0] * w;
    const my = m[1] * h;
    const mr = m[2] * Math.max(w, h);
    const fade = (x, y) => {
      const d = Math.hypot(x - mx, y - my) / mr;
      return d >= 1 ? 0 : Math.pow(1 - d, 1.4);
    };

    // Malla: líneas de 1 px en --nube al 12–18 %.
    ctx.lineWidth = 1;
    for (const [a, b] of scene.edges) {
      const ex = (a.p[0] + b.p[0]) / 2;
      const ey = (a.p[1] + b.p[1]) / 2;
      if (ex < -40 || ex > w + 40 || ey < -40 || ey > h + 40) continue;
      const k = fade(ex, ey);
      if (k <= 0.01) continue;
      ctx.strokeStyle = rgba(C.nube, (0.12 + 0.06 * k) * k);
      ctx.beginPath();
      ctx.moveTo(a.p[0], a.p[1]);
      ctx.lineTo(b.p[0], b.p[1]);
      ctx.stroke();
    }

    // Rutas entre nodos, sobre las aristas, en --nube al 35 %.
    ctx.lineWidth = 1.25;
    ctx.lineJoin = 'round';
    for (const r of scene.routes) {
      ctx.strokeStyle = rgba(C.nube, 0.35);
      ctx.beginPath();
      r.pts.forEach((pt, i) => (i ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1])));
      ctx.stroke();
    }

    // Pulso de conexión: cada 4 s, un anillo tenue desde un nodo-nube.
    const pulseIndex = Math.floor((p * DURATION) / 4) % scene.clouds.length;
    const tau = ((p * DURATION) % 4) / 4;
    const origin = scene.clouds[pulseIndex].v.p;
    const ringR = 8 + tau * layout.pulseRadius;
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = rgba(C.texto, 0.15 * Math.pow(1 - tau, 1.6));
    ctx.beginPath();
    ctx.arc(origin[0], origin[1], ringR, 0, TAU);
    ctx.stroke();

    // Nodos con halo que respira (1 → 1.6 → 1), desfasado por nodo.
    for (const n of scene.nodes) {
      const [x, y] = n.v.p;
      const breath = 0.5 - 0.5 * Math.cos(TAU * (p * n.breaths + n.phase));
      const haloR = n.r * 3 * (1 + 0.6 * breath);
      const g = ctx.createRadialGradient(x, y, 0, x, y, haloR);
      g.addColorStop(0, rgba(C.nube, 0.45));
      g.addColorStop(1, rgba(C.nube, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, haloR, 0, TAU);
      ctx.fill();

      ctx.fillStyle = rgba(C.nube, 0.95);
      ctx.beginPath();
      ctx.arc(x, y, n.r, 0, TAU);
      ctx.fill();

      if (n.cloud) {
        // Anillo hexagonal fino alrededor de los nodos-nube.
        ctx.lineWidth = 1;
        ctx.strokeStyle = rgba(C.nube, 0.55);
        ctx.beginPath();
        for (let i = 0; i <= 6; i++) {
          const a = TAU * (i / 6) - Math.PI / 2;
          const hx = x + 16 * Math.cos(a);
          const hy = y + 16 * Math.sin(a);
          i ? ctx.lineTo(hx, hy) : ctx.moveTo(hx, hy);
        }
        ctx.stroke();
      }
    }

    // Paquetes: núcleo blanco, halo --nube y estela de 40 px. Cada uno completa
    // su ruta un número entero de veces en 12 s; aparecen y se desvanecen en los extremos.
    for (const pk of scene.packets) {
      const route = scene.routes[pk.route];
      const u = (p * pk.laps + pk.offset) % 1;
      const d = u * route.total;
      const edgeFade = Math.min(1, u / 0.08, (1 - u) / 0.08);
      const [x, y] = pointAt(route, d);

      const trail = 40;
      const steps = 10;
      for (let i = steps; i >= 1; i--) {
        const dd = d - (trail * i) / steps;
        if (dd < 0) continue;
        const [tx, ty] = pointAt(route, dd);
        ctx.fillStyle = rgba(C.nube, 0.35 * (1 - i / steps) * edgeFade);
        ctx.beginPath();
        ctx.arc(tx, ty, 2.2 * (1 - (i / steps) * 0.6), 0, TAU);
        ctx.fill();
      }

      const g = ctx.createRadialGradient(x, y, 0, x, y, 12);
      g.addColorStop(0, rgba(C.nube, 0.6 * edgeFade));
      g.addColorStop(1, rgba(C.nube, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, TAU);
      ctx.fill();

      ctx.fillStyle = rgba(C.texto, edgeFade);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, TAU);
      ctx.fill();
    }
  }

  // Composiciones: zona libre a la izquierda (desktop) o arriba (móvil).
  const LAYOUTS = {
    desktop: {
      seed: 2026,
      hexSize: 58,
      cameraDistance: 2400,
      mask: [0.66, 0.5, 0.62],
      violet: [0.12, 0.92, 0.55],
      marine: [0.86, 0.1, 0.5],
      pulseRadius: 260,
      // [x, y, esNube] en coordenadas normalizadas del cuadro
      nodes: [
        [0.62, 0.24, 1],
        [0.84, 0.46, 1],
        [0.66, 0.74, 1],
        [0.53, 0.47],
        [0.76, 0.2],
        [0.92, 0.72],
        [0.79, 0.86],
        [0.95, 0.3],
        [0.34, 0.8],
        [0.24, 0.16],
        [0.71, 0.5],
      ],
      routes: [
        [0, 4], [4, 1], [1, 7], [0, 3], [3, 10], [10, 1], [1, 5], [10, 2], [2, 6], [6, 5],
      ],
      // [ruta, vueltas en 12 s, desfase]
      packets: [
        [1, 2, 0.1], [3, 1, 0.55], [5, 2, 0.3], [7, 1, 0.8], [8, 2, 0.6], [9, 1, 0.2], [2, 1, 0.45], [4, 1, 0.05],
      ],
    },
    mobile: {
      seed: 1129,
      hexSize: 54,
      cameraDistance: 2600,
      mask: [0.5, 0.64, 0.55],
      violet: [0.0, 0.9, 0.9],
      marine: [1.0, 0.38, 0.85],
      pulseRadius: 240,
      nodes: [
        [0.3, 0.5, 1],
        [0.74, 0.62, 1],
        [0.42, 0.84, 1],
        [0.62, 0.44],
        [0.86, 0.48],
        [0.16, 0.68],
        [0.82, 0.88],
        [0.55, 0.72],
        [0.2, 0.93],
        [0.5, 0.38],
      ],
      routes: [
        [0, 3], [3, 4], [4, 1], [0, 5], [1, 7], [7, 2], [2, 8], [1, 6], [3, 9], [7, 0],
      ],
      packets: [
        [0, 2, 0.15], [2, 1, 0.5], [4, 2, 0.35], [5, 1, 0.75], [7, 1, 0.1], [9, 2, 0.6], [6, 1, 0.9],
      ],
    },
  };

  window.BgMesh = { DURATION, LAYOUTS, build, render };
})();
