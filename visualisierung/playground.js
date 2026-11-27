// Selbst ausprobieren: eigene Punkte eingeben oder anklicken und die konvexe
// Hülle mit genau demselben Algorithmus wie in konvexe_huelle.py berechnen.
(() => {
  const MAX_PUNKTE = 100;
  const NS = "http://www.w3.org/2000/svg";
  const W = 720;
  const H = 480;
  const PAD = { left: 52, right: 24, top: 24, bottom: 40 };

  const textarea = document.getElementById("pg-input");
  const svg = document.getElementById("pg-canvas");
  const errorBox = document.getElementById("pg-error");
  const countBox = document.getElementById("pg-count");
  const resultBox = document.getElementById("pg-result");
  const stepText = document.getElementById("pg-step-text");
  const stepState = document.getElementById("pg-step-state");
  const slider = document.getElementById("pg-slider");
  const btn = (id) => document.getElementById(id);

  let punkte = [];      // aktuelle gültige Punktmenge [{x, y}]
  let trace = [];       // aufgezeichnete Algorithmus-Schritte
  let stepIndex = 0;
  let timer = null;
  let view = null;

  const beispiel = "# Format: x y\n0 3\n-3 0\n4 0\n-1 -1\n2 -2\n-2 2\n3 1\n1 0";

  // ---------- gleiche Logik wie in Python ----------

  function orientierung(p, q, r) {
    return (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  }

  function validiere(liste) {
    if (liste.length > MAX_PUNKTE) {
      throw new Error(`Es sind höchstens ${MAX_PUNKTE} Punkte erlaubt (aktuell ${liste.length}).`);
    }
    const gesehen = new Map();
    for (const p of liste) {
      if (gesehen.has(p.x)) {
        throw new Error(`Alle Punkte müssen unterschiedliche x-Koordinaten haben: x = ${fmt(p.x)} kommt doppelt vor.`);
      }
      gesehen.set(p.x, true);
    }
  }

  function liesPunkte(text) {
    const liste = [];
    text.split(/\r?\n/).forEach((roh, i) => {
      const zeile = roh.split("#")[0].trim();
      if (!zeile) return;
      const teile = zeile.replace(/[,;]/g, " ").split(/\s+/);
      const x = Number(teile[0]);
      const y = Number(teile[1]);
      if (teile.length !== 2 || !Number.isFinite(x) || !Number.isFinite(y)) {
        throw new Error(`Ungültige Zeile ${i + 1}: „${roh.trim()}“. Erwartet werden zwei Zahlen x y.`);
      }
      liste.push({ x, y });
    });
    validiere(liste);
    return liste;
  }

  // _rechte_randkette mit Aufzeichnung jedes Schritts für die Anzeige.
  function rechteRandkette(folge, haelfte, oben, log) {
    const kette = [];
    for (const punkt of folge) {
      kette.push(punkt);
      log.push({ typ: "append", haelfte, punkt, kette: [...kette], oben });
      while (kette.length >= 3) {
        const [p, q, r] = kette.slice(-3);
        const d = orientierung(p, q, r);
        if (d < 0) {
          log.push({ typ: "keep", haelfte, p, q, r, d, kette: [...kette], oben });
          break;
        }
        kette.splice(kette.length - 2, 1);
        log.push({ typ: "remove", haelfte, p, q, r, d, kette: [...kette], oben });
      }
    }
    return kette;
  }

  function konvexeHuelle(liste) {
    const log = [];
    const sortiert = [...liste].sort((a, b) => a.x - b.x);
    sortiert.forEach((p, i) => { p.name = `P${i + 1}`; });
    log.push({ typ: "sort", sortiert });
    if (sortiert.length <= 2) {
      log.push({ typ: "done", huelle: sortiert });
      return { huelle: sortiert, log };
    }
    const oben = rechteRandkette(sortiert, "oben", null, log);
    log.push({ typ: "half", haelfte: "oben", kette: oben });
    const unten = rechteRandkette([...sortiert].reverse(), "unten", oben, log);
    log.push({ typ: "half", haelfte: "unten", kette: unten, oben });
    const huelle = oben.concat(unten.slice(1, -1));
    log.push({ typ: "done", huelle, oben, unten });
    return { huelle, log };
  }

  // ---------- Hilfsfunktionen ----------

  function fmt(v) {
    return Number.isInteger(v) ? String(v) : String(Number(v.toFixed(4)));
  }
  const pt = (p) => `(${fmt(p.x)}, ${fmt(p.y)})`;
  const nm = (p) => p.name || pt(p);
  const liste = (k) => `[${k.map(nm).join(", ")}]`;

  function el(name, attrs = {}, text = "") {
    const e = document.createElementNS(NS, name);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (text) e.textContent = text;
    return e;
  }

  function berechneView() {
    let xmin = -10, xmax = 10, ymin = -10, ymax = 10;
    for (const p of punkte) {
      xmin = Math.min(xmin, p.x); xmax = Math.max(xmax, p.x);
      ymin = Math.min(ymin, p.y); ymax = Math.max(ymax, p.y);
    }
    const px = (xmax - xmin) * 0.06;
    const py = (ymax - ymin) * 0.06;
    return { xmin: xmin - px, xmax: xmax + px, ymin: ymin - py, ymax: ymax + py };
  }

  const sx = (x) => PAD.left + ((x - view.xmin) / (view.xmax - view.xmin)) * (W - PAD.left - PAD.right);
  const sy = (y) => PAD.top + ((view.ymax - y) / (view.ymax - view.ymin)) * (H - PAD.top - PAD.bottom);
  const ix = (X) => view.xmin + ((X - PAD.left) / (W - PAD.left - PAD.right)) * (view.xmax - view.xmin);
  const iy = (Y) => view.ymax - ((Y - PAD.top) / (H - PAD.top - PAD.bottom)) * (view.ymax - view.ymin);

  function polyline(kette, cls, close = false) {
    if (kette.length < 2) return null;
    const k = close ? [...kette, kette[0]] : kette;
    return el("polyline", { points: k.map((p) => `${sx(p.x)},${sy(p.y)}`).join(" "), class: cls });
  }

  // ---------- Zeichnen ----------

  function zeichne() {
    svg.replaceChildren();
    // Gitter und Achsen
    const step = niceStep(view.xmax - view.xmin);
    const stepY = niceStep(view.ymax - view.ymin);
    for (let x = Math.ceil(view.xmin / step) * step; x <= view.xmax; x += step) {
      svg.append(el("line", { x1: sx(x), y1: PAD.top, x2: sx(x), y2: H - PAD.bottom, class: x === 0 ? "pg-axis" : "pg-grid" }));
      svg.append(el("text", { x: sx(x), y: H - PAD.bottom + 18, class: "pg-tick", "text-anchor": "middle" }, fmt(x)));
    }
    for (let y = Math.ceil(view.ymin / stepY) * stepY; y <= view.ymax; y += stepY) {
      svg.append(el("line", { x1: PAD.left, y1: sy(y), x2: W - PAD.right, y2: sy(y), class: y === 0 ? "pg-axis" : "pg-grid" }));
      svg.append(el("text", { x: PAD.left - 8, y: sy(y) + 4, class: "pg-tick", "text-anchor": "end" }, fmt(y)));
    }

    const s = trace[stepIndex];
    const hullSet = new Set();
    const zeigeNamen = punkte.length <= 30;

    if (s) {
      if (s.typ === "done") {
        s.huelle.forEach((p) => hullSet.add(p));
        const poly = s.huelle.length >= 3
          ? el("polygon", { points: s.huelle.map((p) => `${sx(p.x)},${sy(p.y)}`).join(" "), class: "pg-hull-fill" })
          : null;
        if (poly) svg.append(poly);
        const l = polyline(s.huelle, "pg-hull", s.huelle.length >= 3);
        if (l) svg.append(l);
      } else if (s.kette) {
        if (s.oben) { const o = polyline(s.oben, "pg-chain-done"); if (o) svg.append(o); }
        const l = polyline(s.kette, s.haelfte === "oben" ? "pg-chain-upper" : "pg-chain-lower");
        if (l) svg.append(l);
        if (s.typ === "keep" || s.typ === "remove") {
          const tri = el("polyline", {
            points: [s.p, s.q, s.r].map((p) => `${sx(p.x)},${sy(p.y)}`).join(" "),
            class: s.typ === "keep" ? "pg-test-keep" : "pg-test-remove",
          });
          svg.append(tri);
        }
      }
    }

    for (const p of punkte) {
      let cls = "pg-point";
      if (hullSet.has(p)) cls += " is-hull";
      if (s && (s.typ === "keep" || s.typ === "remove")) {
        if (p === s.q) cls += s.typ === "keep" ? " is-keep" : " is-removed";
        else if (p === s.p || p === s.r) cls += " is-test";
      }
      if (s && s.typ === "append" && p === s.punkt) cls += " is-new";
      if (s && s.typ === "done" && !hullSet.has(p) && punkte.length > 2) cls += " is-inside";
      svg.append(el("circle", { cx: sx(p.x), cy: sy(p.y), r: 6.5, class: cls }));
      svg.append(el("circle", { cx: sx(p.x), cy: sy(p.y), r: trefferRadius(), class: "pg-hit" }));
      if (zeigeNamen && p.name) {
        svg.append(el("text", { x: sx(p.x) + 9, y: sy(p.y) - 9, class: "pg-label" }, p.name));
      }
    }

    if (!punkte.length) {
      svg.append(el("text", { x: W / 2, y: H / 2, class: "pg-empty", "text-anchor": "middle" },
        "Klicke hier, um Punkte zu setzen"));
    }
  }

  function niceStep(range) {
    const raw = range / 10;
    const mag = 10 ** Math.floor(Math.log10(raw));
    const n = raw / mag;
    return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * mag;
  }

  // ---------- Schritt-Beschreibung ----------

  function beschreibe(s) {
    const total = trace.length;
    btn("pg-step-count").textContent = `Schritt ${stepIndex + 1} / ${total}`;
    let text = "";
    let state = "";
    switch (s.typ) {
      case "sort":
        text = `<b>sorted()</b>: ${s.sortiert.length} Punkte nach x sortiert und als P1 … P${s.sortiert.length} benannt.`;
        state = `sortiert = ${liste(s.sortiert)}`;
        break;
      case "append":
        text = `<b>${s.haelfte === "oben" ? "Obere" : "Untere"} Hülle</b>: <code>kette.append(${nm(s.punkt)})</code> – Punkt probeweise anhängen.`;
        state = `${s.haelfte} = ${liste(s.kette)}`;
        break;
      case "keep":
        text = `Test <code>orientierung(${nm(s.p)}, ${nm(s.q)}, ${nm(s.r)}) = ${fmt(s.d)}</code> &lt; 0 → <span class="pg-ok">Rechtskurve, ${nm(s.q)} bleibt</span>.`;
        state = `${s.haelfte} = ${liste(s.kette)}`;
        break;
      case "remove":
        text = `Test <code>orientierung(${nm(s.p)}, ${nm(s.q)}, ${nm(s.r)}) = ${fmt(s.d)}</code> ${s.d === 0 ? "= 0 → kollinear" : "&gt; 0 → Linkskurve"} → <span class="pg-bad"><code>del kette[-2]</code> entfernt ${nm(s.q)}</span>.`;
        state = `${s.haelfte} = ${liste(s.kette)}`;
        break;
      case "half":
        text = s.haelfte === "oben"
          ? "Obere Hülle fertig. Jetzt dieselbe Funktion mit <code>reversed(sortiert)</code> für die untere Hülle."
          : "Untere Hülle fertig. Jetzt beide Hälften verbinden.";
        state = s.haelfte === "oben" ? `oben = ${liste(s.kette)}` : `oben = ${liste(s.oben)}\nunten = ${liste(s.kette)}`;
        break;
      case "done":
        text = s.huelle.length <= 2
          ? `Bei ${s.huelle.length} Punkt${s.huelle.length === 1 ? "" : "en"} ist die Punktmenge selbst schon die Hülle.`
          : "<b>Fertig</b>: <code>oben + unten[1:-1]</code> ergibt die konvexe Hülle im Uhrzeigersinn.";
        state = `huelle = ${liste(s.huelle)}`;
        break;
    }
    stepText.innerHTML = text;
    stepState.textContent = state;
    slider.max = String(total - 1);
    slider.value = String(stepIndex);
    btn("pg-first").disabled = btn("pg-prev").disabled = stepIndex === 0;
    btn("pg-last").disabled = btn("pg-next").disabled = stepIndex === total - 1;
  }

  // ---------- Ablauf ----------

  function neuBerechnen({ zumEnde = true } = {}) {
    stopPlay();
    view = berechneView();
    if (!punkte.length) {
      trace = [];
      resultBox.innerHTML = "";
      countBox.textContent = "0 Punkte";
      stepText.textContent = "Noch keine Punkte. Tippe links welche ein oder klicke in die Fläche.";
      stepState.textContent = "";
      btn("pg-step-count").textContent = "";
      slider.max = "0";
      ["pg-first", "pg-prev", "pg-next", "pg-last", "pg-play"].forEach((id) => { btn(id).disabled = true; });
      zeichne();
      return;
    }
    btn("pg-play").disabled = false;
    const { huelle, log } = konvexeHuelle(punkte);
    trace = log;
    stepIndex = zumEnde ? trace.length - 1 : 0;
    zeigeErgebnis(huelle);
    render();
  }

  function zeigeErgebnis(huelle) {
    countBox.textContent = `${punkte.length} / ${MAX_PUNKTE} Punkte`;
    resultBox.innerHTML =
      `<p class="pg-result-head">Konvexe Hülle: <b>${huelle.length} Punkte</b> (im Uhrzeigersinn)</p>` +
      `<ol>${huelle.map((p) => `<li><span>${p.name}</span><code>${pt(p)}</code></li>`).join("")}</ol>`;
  }

  function render() {
    zeichne();
    if (trace.length) beschreibe(trace[stepIndex]);
  }

  function gehe(i) {
    stepIndex = Math.max(0, Math.min(trace.length - 1, i));
    render();
  }

  function stopPlay() {
    if (timer) clearInterval(timer);
    timer = null;
    btn("pg-play").textContent = "▶ Abspielen";
  }

  function play() {
    if (timer) { stopPlay(); return; }
    if (stepIndex >= trace.length - 1) gehe(0);
    btn("pg-play").textContent = "❚❚ Pause";
    timer = setInterval(() => {
      if (stepIndex >= trace.length - 1) { stopPlay(); return; }
      gehe(stepIndex + 1);
    }, 650);
  }

  function ausText() {
    try {
      punkte = liesPunkte(textarea.value);
      errorBox.hidden = true;
      textarea.classList.remove("has-error");
      neuBerechnen();
    } catch (e) {
      errorBox.textContent = e.message;
      errorBox.hidden = false;
      textarea.classList.add("has-error");
    }
  }

  function zuText() {
    textarea.value = punkte.map((p) => `${fmt(p.x)} ${fmt(p.y)}`).join("\n");
    errorBox.hidden = true;
    textarea.classList.remove("has-error");
  }

  function zeigeFehler(msg) {
    errorBox.textContent = msg;
    errorBox.hidden = false;
  }

  // Maus/Finger: kurzer Klick setzt oder entfernt einen Punkt,
  // Ziehen verschiebt einen vorhandenen Punkt (Drag & Drop).
  let drag = null;

  function svgPunkt(event) {
    const m = svg.getScreenCTM();
    return m ? new DOMPoint(event.clientX, event.clientY).matrixTransform(m.inverse()) : null;
  }

  function trefferRadius() {
    // ca. 16 Bildschirmpixel, egal wie stark die Fläche skaliert ist
    const breite = svg.getBoundingClientRect().width || W;
    return Math.max(11, 16 * (W / breite));
  }

  function raster(loc) {
    const r = (v, s) => Number((Math.round(v / s) * s).toFixed(6));
    const x = Math.min(view.xmax, Math.max(view.xmin, ix(loc.x)));
    const y = Math.min(view.ymax, Math.max(view.ymin, iy(loc.y)));
    return {
      x: r(x, niceStep(view.xmax - view.xmin) / 2),
      y: r(y, niceStep(view.ymax - view.ymin) / 2),
    };
  }

  function neuMitFesterAnsicht() {
    // Ansicht nicht verschieben, damit Punkte nicht „springen“.
    const alt = view;
    neuBerechnen();
    if (punkte.every((p) => p.x >= alt.xmin && p.x <= alt.xmax && p.y >= alt.ymin && p.y <= alt.ymax)) {
      view = alt;
      render();
    }
  }

  svg.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    const loc = svgPunkt(event);
    if (!loc) return;
    const radius = trefferRadius();
    let treffer = null;
    let best = Infinity;
    for (const p of punkte) {
      const d = Math.hypot(sx(p.x) - loc.x, sy(p.y) - loc.y);
      if (d < radius && d < best) { best = d; treffer = p; }
    }
    drag = { punkt: treffer, startX: event.clientX, startY: event.clientY, bewegt: false, view };
    if (treffer) {
      event.preventDefault();
      svg.setPointerCapture(event.pointerId);
      stopPlay();
    }
  });

  svg.addEventListener("pointermove", (event) => {
    if (!drag || !drag.punkt) return;
    if (!drag.bewegt && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 4) return;
    drag.bewegt = true;
    svg.classList.add("is-dragging");
    const loc = svgPunkt(event);
    if (!loc) return;
    view = drag.view;
    const ziel = raster(loc);
    // Laut Aufgabe sind alle x verschieden: Ist das Ziel-x belegt, bleibt x stehen.
    const belegt = punkte.some((q) => q !== drag.punkt && q.x === ziel.x);
    if (!belegt) drag.punkt.x = ziel.x;
    drag.punkt.y = ziel.y;
    errorBox.hidden = !belegt;
    if (belegt) errorBox.textContent = `x = ${fmt(ziel.x)} ist schon belegt – der Punkt bleibt bei x = ${fmt(drag.punkt.x)}.`;
    const { huelle, log } = konvexeHuelle(punkte);
    trace = log;
    stepIndex = trace.length - 1;
    zeigeErgebnis(huelle);
    render();
  });

  function beendeDrag(event, abgebrochen = false) {
    if (!drag) return;
    const d = drag;
    drag = null;
    svg.classList.remove("is-dragging");
    if (d.punkt && svg.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId);
    if (abgebrochen) return;

    if (d.punkt && d.bewegt) {
      // Verschieben beendet
      zuText();
      neuMitFesterAnsicht();
      return;
    }
    if (Math.hypot(event.clientX - d.startX, event.clientY - d.startY) >= 6) return;

    if (d.punkt) {
      // Kurzer Klick auf einen Punkt: entfernen
      punkte = punkte.filter((p) => p !== d.punkt);
    } else {
      // Kurzer Klick ins Leere: neuen Punkt setzen
      if (punkte.length >= MAX_PUNKTE) { zeigeFehler(`Es sind höchstens ${MAX_PUNKTE} Punkte erlaubt.`); return; }
      const loc = svgPunkt(event);
      if (!loc) return;
      const p = raster(loc);
      if (punkte.some((q) => q.x === p.x)) {
        zeigeFehler(`x = ${fmt(p.x)} ist schon belegt – laut Aufgabe müssen alle x-Koordinaten verschieden sein.`);
        return;
      }
      punkte = [...punkte, p];
    }
    zuText();
    neuMitFesterAnsicht();
  }

  svg.addEventListener("pointerup", (event) => beendeDrag(event));
  svg.addEventListener("pointercancel", (event) => beendeDrag(event, true));

  let debounce = null;
  textarea.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(ausText, 250);
  });

  btn("pg-example").addEventListener("click", () => { textarea.value = beispiel; ausText(); });
  btn("pg-clear").addEventListener("click", () => { textarea.value = ""; ausText(); });
  btn("pg-random").addEventListener("click", () => {
    const n = Number(btn("pg-random-n").value) || 20;
    const anzahl = Math.max(1, Math.min(MAX_PUNKTE, n));
    const xs = new Set();
    while (xs.size < anzahl) xs.add(Math.floor(Math.random() * 201) - 100);
    punkte = [...xs].map((x) => ({ x, y: Math.floor(Math.random() * 161) - 80 }));
    zuText();
    neuBerechnen();
  });
  btn("pg-first").addEventListener("click", () => { stopPlay(); gehe(0); });
  btn("pg-prev").addEventListener("click", () => { stopPlay(); gehe(stepIndex - 1); });
  btn("pg-next").addEventListener("click", () => { stopPlay(); gehe(stepIndex + 1); });
  btn("pg-last").addEventListener("click", () => { stopPlay(); gehe(trace.length - 1); });
  btn("pg-play").addEventListener("click", play);
  slider.addEventListener("input", () => { stopPlay(); gehe(Number(slider.value)); });

  textarea.value = beispiel;
  ausText();
})();
