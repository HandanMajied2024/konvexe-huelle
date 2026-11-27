const points = [
  { id: "A", x: -3, y: 0 },
  { id: "B", x: -2, y: 2 },
  { id: "C", x: -1, y: -1 },
  { id: "D", x: 0, y: 3 },
  { id: "E", x: 1, y: 0 },
  { id: "F", x: 2, y: -2 },
  { id: "G", x: 3, y: 1 },
  { id: "H", x: 4, y: 0 },
];

// So stehen die Punkte beispielhaft in der Eingabedatei: noch nicht sortiert.
const inputOrder = ["D", "A", "H", "C", "F", "B", "G", "E"];

const unsortiertePunkte = "[Punkt(0, 3), Punkt(-3, 0), Punkt(4, 0), Punkt(-1, -1), Punkt(2, -2), Punkt(-2, 2), Punkt(3, 1), Punkt(1, 0)]";
const sortiertePunkte = "[Punkt(-3, 0), Punkt(-2, 2), Punkt(-1, -1), Punkt(0, 3), Punkt(1, 0), Punkt(2, -2), Punkt(3, 1), Punkt(4, 0)]";
const obereHuelle = "[Punkt(-3, 0), Punkt(-2, 2), Punkt(0, 3), Punkt(3, 1), Punkt(4, 0)]";
const untereHuelle = "[Punkt(4, 0), Punkt(2, -2), Punkt(-1, -1), Punkt(-3, 0)]";
const fertigeHuelle = "[Punkt(-3, 0), Punkt(-2, 2), Punkt(0, 3), Punkt(3, 1), Punkt(4, 0), Punkt(2, -2), Punkt(-1, -1)]";

const flowStages = [
  {
    name: "lies_punkte()",
    explanation: "Jede Textzeile wird zu einem Punkt-Objekt.",
    beforeLabel: "Vorher · Textdatei",
    before: 'datei = ["0 3", "-3 0", "4 0", "-1 -1", "2 -2", "-2 2", "3 1", "1 0"]',
    afterLabel: "Nachher · lies_punkte()",
    after: `punkte = ${unsortiertePunkte}`,
  },
  {
    name: "validiere_punkte()",
    explanation: "Die Liste bleibt gleich. Die Funktion bestätigt nur: höchstens 100 Punkte und eindeutige x-Werte.",
    beforeLabel: "Vorher · ungeprüfte Liste",
    before: `punkte = ${unsortiertePunkte}`,
    afterLabel: "Nachher · gültige Liste ✓",
    after: `punkte = ${unsortiertePunkte}`,
  },
  {
    name: "sorted(..., key=x)",
    explanation: "Dieselben Punkt-Objekte werden von kleinem zu großem x angeordnet.",
    beforeLabel: "Vorher · Reihenfolge aus Datei",
    before: `punkte = ${unsortiertePunkte}`,
    afterLabel: "Nachher · nach x sortiert",
    after: `sortiert = ${sortiertePunkte}`,
  },
  {
    name: "_rechte_randkette(sortiert)",
    explanation: "Von links nach rechts bleiben nur die Punkte der oberen Hülle übrig.",
    beforeLabel: "Vorher · sortierte Liste",
    before: `sortiert = ${sortiertePunkte}`,
    afterLabel: "Nachher · obere Hälfte",
    after: `oben = ${obereHuelle}`,
  },
  {
    name: "_rechte_randkette(reversed(...))",
    explanation: "Rückwärts gelesen entsteht mit derselben Funktion die untere Hülle.",
    beforeLabel: "Vorher · rückwärts sortiert",
    before: "rueckwaerts = [Punkt(4, 0), Punkt(3, 1), Punkt(2, -2), Punkt(1, 0), Punkt(0, 3), Punkt(-1, -1), Punkt(-2, 2), Punkt(-3, 0)]",
    afterLabel: "Nachher · untere Hälfte",
    after: `unten = ${untereHuelle}`,
  },
  {
    name: "oben + unten[1:-1]",
    explanation: "Die doppelten Endpunkte fallen weg. Beide Hälften werden eine Hüllenliste.",
    beforeLabel: "Vorher · zwei Teillisten",
    before: `oben = ${obereHuelle}\nunten = ${untereHuelle}`,
    afterLabel: "Nachher · eine Hüllenliste",
    after: `huelle = ${fertigeHuelle}`,
  },
  {
    name: "main()",
    explanation: "main gibt dieselben Hüllenpunkte als gut lesbare Textzeilen aus.",
    beforeLabel: "Vorher · Hüllenliste",
    before: `huelle = ${fertigeHuelle}`,
    afterLabel: "Nachher · Ausgabe",
    after: 'ausgabe = ["(-3, 0)", "(-2, 2)", "(0, 3)", "(3, 1)", "(4, 0)", "(2, -2)", "(-1, -1)"]',
  },
];

const chapters = [
  {
    title: "Der Punkt",
    note: "Die Klasse gibt jedem Zahlenpaar einen klaren Namen: Punkt.x und Punkt.y.",
    highlight: [1, 2, 3],
    lineNumbers: [17, 18, 29, 30],
    code: [
      "@dataclass(frozen=True)",
      "class Punkt:",
      "    x: float",
      "    y: float",
    ],
    debug: [["Objekt", "D = Punkt(0, 3)"], ["Inhalt", "x = 0, y = 3"]],
  },
  {
    title: "Kurvenrichtung prüfen",
    note: "Beispiel A → B → C: Das Ergebnis -5 ist negativ. Also ist es eine Rechtskurve und B bleibt.",
    highlight: [1, 2, 3],
    lineNumbers: [33, 49, 50, 51],
    code: [
      "def orientierung(p: Punkt, q: Punkt, r: Punkt) -> float:",
      "    a: float = (q.x - p.x) * (r.y - p.y)",
      "    b: float = (q.y - p.y) * (r.x - p.x)",
      "    return a - b",
    ],
    debug: [
      ["Punkte", "p = A(-3, 0), q = B(-2, 2), r = C(-1, -1)"],
      ["Rechnung", "(1 · -1) - (2 · 2) = -5"],
      ["Ergebnis", "-5 < 0 → Rechtskurve → q bleibt"],
    ],
    debugTone: "keep",
  },
  {
    title: "Nach x sortieren",
    note: "sorted ordnet die Liste neu. key sagt: Vergleiche nur die x-Werte.",
    highlight: [2],
    lineNumbers: [106, 116, 119],
    code: [
      "def konvexe_huelle(punkte: list[Punkt]) -> list[Punkt]:",
      "    validiere_punkte(punkte)",
      "    sortiert: list[Punkt] = sorted(punkte, key=lambda punkt: punkt.x)",
    ],
    debug: [["vorher", `punkte = ${unsortiertePunkte}`], ["nachher", `sortiert = ${sortiertePunkte}`]],
    debugTone: "sort",
  },
  {
    title: "Punkt anhängen",
    note: "append hängt den neuen Punkt immer hinten an die Liste.",
    highlight: [3, 4],
    lineNumbers: [74, 84, 85, 86, 88],
    code: [
      "def _rechte_randkette(punkte: Iterable[Punkt]) -> list[Punkt]:",
      "    kette: list[Punkt] = []",
      "",
      "    for punkt in punkte:",
      "        kette.append(punkt)",
    ],
    debug: [],
    debugCompare: [
      {
        label: "vorher",
        lines: ["kette = [", "    Punkt(-3, 0),", "    Punkt(-2, 2),", "    Punkt(-1, -1),", "]"],
      },
      {
        label: "nachher · append",
        lines: ["kette = [", "    Punkt(-3, 0),", "    Punkt(-2, 2),", "    Punkt(-1, -1),", "    Punkt(0, 3),", "]"],
        mark: [4],
      },
    ],
  },
  {
    title: "Mittleren Punkt entfernen",
    note: "p, q und r sind die letzten drei Punkte. Nur der mittlere Punkt q kann herausfliegen.",
    highlight: [1, 2, 3, 5],
    lineNumbers: [91, 92, 96, 97, 98, 101],
    code: [
      "while len(kette) >= 3:",
      "    p, q, r = kette[-3:]",
      "    if orientierung(p, q, r) < 0:",
      "        break",
      "",
      "    del kette[-2]",
    ],
    debug: [
      ["vorher", "kette = [Punkt(-3, 0), Punkt(-2, 2), Punkt(-1, -1), Punkt(0, 3)]"],
      ["del q", "kette = [Punkt(-3, 0), Punkt(-2, 2), Punkt(0, 3)]"],
    ],
    debugTone: "remove",
  },
  {
    title: "Obere Hülle",
    note: "Von links nach rechts entsteht die obere Hälfte.",
    highlight: [1],
    lineNumbers: [125, 126],
    code: [
      "# Vorwärts entsteht der obere Rand.",
      "oben: list[Punkt] = _rechte_randkette(sortiert)",
    ],
    debug: [["Eingabe", `sortiert = ${sortiertePunkte}`], ["oben", `oben = ${obereHuelle}`]],
    debugTone: "keep",
  },
  {
    title: "Untere Hülle",
    note: "reversed liest dieselbe Liste von rechts nach links.",
    highlight: [1],
    lineNumbers: [128, 129],
    code: [
      "# Rückwärts erzeugt dieselbe Funktion den unteren Rand.",
      "unten: list[Punkt] = _rechte_randkette(reversed(sortiert))",
    ],
    debug: [
      ["Eingabe", "rueckwaerts = [Punkt(4, 0), Punkt(3, 1), Punkt(2, -2), Punkt(1, 0), Punkt(0, 3), Punkt(-1, -1), Punkt(-2, 2), Punkt(-3, 0)]"],
      ["unten", `unten = ${untereHuelle}`],
    ],
    debugTone: "keep",
  },
  {
    title: "Zusammenfügen",
    note: "[1:-1] lässt die zwei doppelten Endpunkte weg.",
    highlight: [0],
    lineNumbers: [133],
    code: [
      "return oben + unten[1:-1]",
    ],
    debug: [
      ["oben", `oben = ${obereHuelle}`],
      ["unten[1:-1]", "[Punkt(2, -2), Punkt(-1, -1)]"],
      ["Hülle", `huelle = ${fertigeHuelle}`],
    ],
    debugTone: "keep",
  },
];

const codeTitle = document.querySelector("#code-title");
const codeBlock = document.querySelector("#code-block");
const codeNote = document.querySelector("#code-note");
const debugOutput = document.querySelector("#debug-output");
const stepCount = document.querySelector("#step-count");
const progressBar = document.querySelector("#progress-bar");
const steps = [...document.querySelectorAll(".step")];
const prevButton = document.querySelector("#prev");
const nextButton = document.querySelector("#next");
const dots = document.querySelector("#dots");
const lesson = document.querySelector("#lektion");
const flowButtons = [...document.querySelectorAll("[data-flow-stage]")];
const flowStepNumber = document.querySelector("#flow-step-number");
const flowFunctionName = document.querySelector("#flow-function-name code");
const flowExplanation = document.querySelector("#flow-explanation");
const flowBeforeLabel = document.querySelector("#flow-before-label");
const flowBeforeList = document.querySelector("#flow-before-list");
const flowAfterLabel = document.querySelector("#flow-after-label");
const flowAfterList = document.querySelector("#flow-after-list");
const flowLists = document.querySelector(".flow-lists");
let activeIndex = 0;

const NS = "http://www.w3.org/2000/svg";

function svgElement(name, attributes = {}, text = "") {
  const element = document.createElementNS(NS, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  if (text) element.textContent = text;
  return element;
}

function addArrowMarker(svg) {
  const defs = svgElement("defs");
  const marker = svgElement("marker", {
    id: "arrow", viewBox: "0 0 10 10", refX: "8", refY: "5",
    markerWidth: "6", markerHeight: "6", orient: "auto-start-reverse",
  });
  marker.append(svgElement("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: "#2563eb" }));
  defs.append(marker);
  svg.append(defs);
}

function mapPoint(point) {
  const left = 62;
  const top = 36;
  const width = 596;
  const height = 300;
  return {
    x: left + ((point.x + 3) / 7) * width,
    y: top + ((3 - point.y) / 5) * height,
  };
}

function pointById(id) {
  return points.find((point) => point.id === id);
}

function addAxes(svg) {
  svg.append(
    svgElement("line", { x1: 42, y1: 336, x2: 690, y2: 336, class: "axis axis-x" }),
    svgElement("line", { x1: 42, y1: 24, x2: 42, y2: 346, class: "axis axis-y" }),
    svgElement("text", { x: 678, y: 326, class: "small label-x" }, "x"),
    svgElement("text", { x: 52, y: 34, class: "small label-y" }, "y"),
  );
}

function addPoint(svg, point, options = {}) {
  const mapped = mapPoint(point);
  const classes = ["point", "fade-in"];
  if (options.active) classes.push("active");
  if (options.removed) classes.push("removed");

  const circle = svgElement("circle", {
    cx: mapped.x, cy: mapped.y, r: options.radius || 7, class: classes.join(" "),
  });
  const label = svgElement(
    "text",
    { x: mapped.x + 11, y: mapped.y - 11, class: options.removed ? "removed-label" : "" },
    options.label || `${point.id} (${point.x}|${point.y})`,
  );
  svg.append(circle, label);
}

function addChain(svg, ids, className = "chain", close = false) {
  const coordinates = ids.map((id) => mapPoint(pointById(id)));
  if (close && coordinates.length) coordinates.push(coordinates[0]);
  const polyline = svgElement("polyline", {
    points: coordinates.map((point) => `${point.x},${point.y}`).join(" "),
    class: `${className} draw`,
  });
  svg.append(polyline);
}

function basePlot(svg, caption) {
  svg.setAttribute("viewBox", "0 0 720 380");
  svg.replaceChildren();
  addArrowMarker(svg);
  addAxes(svg);
  if (caption) svg.append(svgElement("text", { x: 54, y: 365, class: "small" }, caption));
}

function drawPointChapter(svg) {
  basePlot(svg, "Der Punkt D liegt bei x = 0 und y = 3.");
  const p = pointById("D");
  const m = mapPoint(p);
  svg.append(
    svgElement("line", { x1: m.x, y1: m.y, x2: m.x, y2: 336, class: "guide guide-x" }),
    svgElement("line", { x1: 42, y1: m.y, x2: m.x, y2: m.y, class: "guide guide-y" }),
    svgElement("text", { x: m.x - 5, y: 355, class: "label-x" }, "x = 0"),
    svgElement("text", { x: 50, y: m.y - 8, class: "label-y" }, "y = 3"),
  );
  addPoint(svg, p, { active: true, radius: 9, label: "D = Punkt(0, 3)" });
}

function drawOrientationChapter(svg) {
  svg.setAttribute("viewBox", "0 0 720 330");
  svg.replaceChildren();
  svg.append(svgElement("text", { x: 24, y: 28, class: "orientation-title" }, "Was passiert mit dem mittleren Punkt q?"));

  const cards = [
    {
      x: 20, title: "RECHTSKURVE", condition: "D(p, q, r) < 0", result: "q bleibt", tone: "right",
      points: [[30, 125], [100, 70], [170, 125]],
    },
    {
      x: 255, title: "LINKSKURVE", condition: "D(p, q, r) > 0", result: "q raus", tone: "left",
      points: [[30, 75], [100, 130], [170, 75]],
    },
    {
      x: 490, title: "GERADE", condition: "D(p, q, r) = 0", result: "q raus", tone: "straight",
      points: [[30, 105], [100, 105], [170, 105]],
    },
  ];

  cards.forEach((card) => {
    const group = svgElement("g", { class: `turn-card turn-card-${card.tone}` });
    group.append(
      svgElement("rect", { x: card.x, y: 48, width: 210, height: 245, rx: 8, class: "turn-card-bg" }),
      svgElement("text", { x: card.x + 18, y: 78, class: "turn-card-title" }, card.title),
      svgElement("polyline", {
        points: card.points.map(([x, y]) => `${card.x + x},${y + 52}`).join(" "),
        class: "turn-example",
      }),
    );

    card.points.forEach(([x, y], index) => {
      group.append(
        svgElement("circle", { cx: card.x + x, cy: y + 52, r: 7, class: "turn-dot" }),
        svgElement("text", { x: card.x + x - 4, y: y + 36, class: "turn-point-label" }, ["p", "q", "r"][index]),
      );
    });

    group.append(
      svgElement("text", { x: card.x + 105, y: 228, class: "turn-condition" }, card.condition),
      svgElement("rect", { x: card.x + 18, y: 246, width: 174, height: 30, rx: 15, class: "turn-result-bg" }),
      svgElement("text", { x: card.x + 105, y: 267, class: "turn-result" }, card.result),
    );
    svg.append(group);
  });
}

function drawSortedChapter(svg) {
  svg.setAttribute("viewBox", "0 0 720 360");
  svg.replaceChildren();

  const cardWidth = 74;
  const gap = 10;
  const startX = 29;
  const oldY = 58;
  const newY = 242;

  svg.append(
    svgElement("text", { x: startX, y: 32, class: "sort-heading" }, "VORHER · Reihenfolge aus der Datei"),
    svgElement("text", { x: 360, y: 190, class: "sort-command" }, "sorted(..., key = x)"),
    svgElement("text", { x: startX, y: 226, class: "sort-heading" }, "NACHHER · von kleinem zu großem x"),
  );

  function addSortCard(id, x, y, className = "") {
    const point = pointById(id);
    const group = svgElement("g", { class: `sort-card ${className}`.trim() });
    group.append(
      svgElement("rect", { x, y, width: cardWidth, height: 62, rx: 6 }),
      svgElement("text", { x: x + 12, y: y + 25, class: "sort-id" }, id),
      svgElement("text", { x: x + 12, y: y + 47, class: "sort-x" }, `x = ${point.x}`),
    );
    return group;
  }

  inputOrder.forEach((id, index) => {
    svg.append(addSortCard(id, startX + index * (cardWidth + gap), oldY));
  });

  points.forEach((point, newIndex) => {
    const targetX = startX + newIndex * (cardWidth + gap);
    const oldIndex = inputOrder.indexOf(point.id);
    const oldX = startX + oldIndex * (cardWidth + gap);
    const group = addSortCard(point.id, targetX, newY, "sorted-card");
    group.append(svgElement("animateTransform", {
      attributeName: "transform",
      type: "translate",
      from: `${oldX - targetX} ${oldY - newY}`,
      to: "0 0",
      begin: `${0.15 + newIndex * 0.1}s`,
      dur: "0.75s",
      fill: "freeze",
      calcMode: "spline",
      keySplines: ".22 1 .36 1",
    }));
    svg.append(group);
  });

  svg.append(
    svgElement("line", { x1: startX, y1: 330, x2: 682, y2: 330, class: "sort-axis" }),
    svgElement("text", { x: 29, y: 351, class: "sort-axis-label" }, "kleines x"),
    svgElement("text", { x: 628, y: 351, class: "sort-axis-label" }, "großes x"),
  );
}

function drawAppendChapter(svg) {
  basePlot(svg, "D wird zunächst angehängt. Danach prüfen wir B, C und D.");
  points.forEach((p) => addPoint(svg, p, { active: ["A", "B", "C"].includes(p.id), label: p.id }));
  addChain(svg, ["A", "B", "C"], "chain");
  addChain(svg, ["C", "D"], "candidate");
  const d = pointById("D");
  addPoint(svg, d, { active: true, radius: 10, label: "D neu" });
  const dm = mapPoint(d);
  svg.append(svgElement("text", { x: dm.x + 45, y: dm.y + 22 }, "append(D)"));
}

function drawRemoveChapter(svg) {
  basePlot(svg, "B → C → D ist eine Linkskurve. Deshalb wird C entfernt.");
  ["A", "B", "D"].forEach((id) => addPoint(svg, pointById(id), { active: true, label: id }));
  addPoint(svg, pointById("C"), { removed: true, radius: 9, label: "C wird entfernt" });
  addChain(svg, ["A", "B", "C", "D"], "candidate");
  addChain(svg, ["A", "B", "D"], "chain");
  const c = mapPoint(pointById("C"));
  svg.append(
    svgElement("line", { x1: c.x - 12, y1: c.y - 12, x2: c.x + 12, y2: c.y + 12, class: "remove-line" }),
    svgElement("line", { x1: c.x + 12, y1: c.y - 12, x2: c.x - 12, y2: c.y + 12, class: "remove-line" }),
  );
}

function drawUpperChapter(svg) {
  basePlot(svg, "Obere Hülle: A → B → D → G → H");
  points.forEach((p) => addPoint(svg, p, { active: ["A", "B", "D", "G", "H"].includes(p.id), label: p.id }));
  addChain(svg, ["A", "B", "D", "G", "H"]);
  svg.append(svgElement("text", { x: 270, y: 52 }, "von links nach rechts"));
}

function drawLowerChapter(svg) {
  basePlot(svg, "Untere Hülle: H → F → C → A");
  points.forEach((p) => addPoint(svg, p, { active: ["H", "F", "C", "A"].includes(p.id), label: p.id }));
  addChain(svg, ["H", "F", "C", "A"]);
  svg.append(svgElement("text", { x: 270, y: 320 }, "von rechts nach links"));
}

function drawFinalChapter(svg) {
  basePlot(svg, "Fertige Hülle im Uhrzeigersinn");
  const ids = ["A", "B", "D", "G", "H", "F", "C"];
  const coords = ids.map((id) => mapPoint(pointById(id)));
  svg.append(svgElement("polygon", {
    points: coords.map((p) => `${p.x},${p.y}`).join(" "), class: "hull-fill fade-in",
  }));
  points.forEach((p) => addPoint(svg, p, { active: ids.includes(p.id), label: p.id }));
  svg.append(svgElement("text", { x: 292, y: 180 }, "innen: E"));
}

const drawings = [
  drawPointChapter,
  drawOrientationChapter,
  drawSortedChapter,
  drawAppendChapter,
  drawRemoveChapter,
  drawUpperChapter,
  drawLowerChapter,
  drawFinalChapter,
];

function appendColoredCode(parent, line) {
  const tokenPattern = /(\.x|\bx\b|\.y|\by\b|\bappend\b|\bdel\b|\breturn\b|\bsorted\b|\breversed\b|\borientierung\b|\b_rechte_randkette\b|\bkonvexe_huelle\b)/g;
  let start = 0;

  for (const match of line.matchAll(tokenPattern)) {
    parent.append(document.createTextNode(line.slice(start, match.index)));
    const token = document.createElement("span");
    token.textContent = match[0];

    if (["x", ".x"].includes(match[0])) token.className = "token-x";
    else if (["y", ".y"].includes(match[0])) token.className = "token-y";
    else if (["del"].includes(match[0])) token.className = "token-remove";
    else if (["return", "_rechte_randkette", "konvexe_huelle"].includes(match[0])) token.className = "token-keep";
    else token.className = "token-function";

    parent.append(token);
    start = match.index + match[0].length;
  }

  parent.append(document.createTextNode(line.slice(start) || (line ? "" : " ")));
}

function highlightCompleteCode() {
  const block = document.querySelector("#complete-code-block");
  if (!block) return;

  const source = block.textContent;
  const keywords = new Set([
    "as", "break", "class", "continue", "def", "else", "except", "for",
    "from", "if", "import", "in", "is", "lambda", "not", "or", "pass",
    "raise", "return", "try", "while",
  ]);
  const types = new Set([
    "Punkt", "Path", "Iterable", "Namespace", "None", "bool", "float",
    "int", "list", "set", "str",
  ]);

  // Die Reihenfolge ist wichtig: Lange Strings und Kommentare werden zuerst
  // erkannt, damit Wörter in ihnen nicht versehentlich als Python-Code gefärbt werden.
  const tokenPattern = /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|#[^\n]*|@[A-Za-z_]\w*|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b)/g;
  let start = 0;
  block.replaceChildren();

  for (const match of source.matchAll(tokenPattern)) {
    block.append(document.createTextNode(source.slice(start, match.index)));

    const value = match[0];
    const token = document.createElement("span");
    token.textContent = value;

    if (value.startsWith("#")) token.className = "syntax-comment";
    else if (value.startsWith("\"") || value.startsWith("'")) token.className = "syntax-string";
    else if (value.startsWith("@")) token.className = "syntax-decorator";
    else if (/^\d/.test(value)) token.className = "syntax-number";
    else if (keywords.has(value)) token.className = "syntax-keyword";
    else if (types.has(value)) token.className = "syntax-type";
    else {
      const afterToken = source.slice(match.index + value.length);
      if (/^\s*\(/.test(afterToken)) token.className = "syntax-function";
    }

    block.append(token);
    start = match.index + value.length;
  }

  block.append(document.createTextNode(source.slice(start)));

  // Jede sichtbare Codezeile bekommt einen eigenen Block. Die Nummer selbst
  // kommt per CSS davor und gehört deshalb beim Kopieren nicht zum Python-Code.
  const coloredNodes = [...block.childNodes];
  const lines = [];
  let line = document.createElement("span");

  function finishLine() {
    line.className = "complete-code-line";
    line.dataset.line = String(lines.length + 1);
    lines.push(line);
    line = document.createElement("span");
  }

  coloredNodes.forEach((node) => {
    const pieces = node.textContent.split("\n");

    pieces.forEach((piece, index) => {
      if (piece) {
        if (node.nodeType === Node.TEXT_NODE) {
          line.append(document.createTextNode(piece));
        } else {
          const coloredPiece = node.cloneNode(false);
          coloredPiece.textContent = piece;
          line.append(coloredPiece);
        }
      }

      if (index < pieces.length - 1) finishLine();
    });
  });

  finishLine();
  block.replaceChildren(...lines);
}

function renderFlowStage(index) {
  const stage = flowStages[index];
  flowStepNumber.textContent = `Schritt ${index + 1} von ${flowStages.length}`;
  flowFunctionName.textContent = stage.name;
  flowExplanation.textContent = stage.explanation;
  flowBeforeLabel.textContent = stage.beforeLabel;
  flowBeforeList.textContent = stage.before;
  flowAfterLabel.textContent = stage.afterLabel;
  flowAfterList.textContent = stage.after;

  flowButtons.forEach((button, buttonIndex) => {
    const isActive = buttonIndex === index;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  flowLists.classList.remove("flow-changing");
  void flowLists.offsetWidth;
  flowLists.classList.add("flow-changing");
}

function renderCode(index) {
  const chapter = chapters[index];
  codeTitle.textContent = chapter.title;
  codeNote.textContent = chapter.note;
  stepCount.textContent = `${index + 1} / ${chapters.length}`;
  codeBlock.replaceChildren();

  chapter.code.forEach((line, lineIndex) => {
    const span = document.createElement("span");
    span.className = "code-line";
    if (line.trim().startsWith("#")) span.classList.add("comment");
    if (chapter.highlight.includes(lineIndex)) span.classList.add("highlight");
    span.dataset.line = String(chapter.lineNumbers?.[lineIndex] ?? lineIndex + 1);
    appendColoredCode(span, line);
    codeBlock.append(span);
  });

  debugOutput.className = `debug-output ${chapter.debugTone ? `debug-${chapter.debugTone}` : ""}`.trim();
  debugOutput.replaceChildren();
  chapter.debug.forEach(([label, value], rowIndex) => {
    const row = document.createElement("div");
    row.className = "debug-row";
    if (chapter.debugTone === "sort") row.style.animationDelay = `${rowIndex * 0.3}s`;

    const name = document.createElement("span");
    name.textContent = label;
    const state = document.createElement("code");
    state.textContent = value;
    row.append(name, state);
    debugOutput.append(row);
  });

  // Vorher/Nachher als zwei Kästen nebeneinander, ein Listeneintrag pro Zeile.
  if (chapter.debugCompare) {
    debugOutput.classList.add("debug-compare");
    chapter.debugCompare.forEach((box, boxIndex) => {
      if (boxIndex > 0) {
        const arrow = document.createElement("span");
        arrow.className = "compare-arrow";
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "→";
        debugOutput.append(arrow);
      }
      const card = document.createElement("div");
      card.className = `compare-box${boxIndex > 0 ? " compare-after" : ""}`;
      const label = document.createElement("span");
      label.className = "compare-label";
      label.textContent = box.label;
      const pre = document.createElement("pre");
      box.lines.forEach((line, lineIndex) => {
        const code = document.createElement("code");
        code.textContent = line;
        if (box.mark?.includes(lineIndex)) code.className = "compare-new";
        pre.append(code);
      });
      card.append(label, pre);
      debugOutput.append(card);
    });
  }
}

function setActive(index, shouldScroll = false) {
  const nextIndex = Math.max(0, Math.min(index, chapters.length - 1));
  const changed = nextIndex !== activeIndex;
  activeIndex = nextIndex;
  steps.forEach((step, i) => step.classList.toggle("active", i === activeIndex));
  [...dots.children].forEach((dot, i) => dot.classList.toggle("active", i === activeIndex));
  renderCode(activeIndex);
  progressBar.style.width = `${((activeIndex + 1) / chapters.length) * 100}%`;
  prevButton.disabled = activeIndex === 0;
  nextButton.disabled = activeIndex === chapters.length - 1;
  if (changed) drawings[activeIndex](steps[activeIndex].querySelector(".viz"));
  if (shouldScroll) steps[activeIndex].scrollIntoView({ behavior: "smooth", block: "start" });
}

steps.forEach((step, index) => {
  const svg = step.querySelector(".viz");
  drawings[index](svg);

  const dot = document.createElement("button");
  dot.type = "button";
  dot.className = "dot-button";
  dot.setAttribute("aria-label", `Zu Schritt ${index + 1}`);
  dot.addEventListener("click", () => setActive(index, true));
  dots.append(dot);
});

flowButtons.forEach((button) => {
  button.addEventListener("click", () => renderFlowStage(Number(button.dataset.flowStage)));
});

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActive(Number(visible.target.dataset.step));
  },
  { threshold: [0.35, 0.55, 0.75] },
);

steps.forEach((step) => observer.observe(step));

function syncLessonChrome() {
  const lessonPosition = lesson.getBoundingClientRect();
  const isInsideLesson = lessonPosition.top <= 1 && lessonPosition.bottom > window.innerHeight * 0.2;
  document.body.classList.toggle("in-lesson", isInsideLesson);
}

window.addEventListener("scroll", syncLessonChrome, { passive: true });
window.addEventListener("resize", syncLessonChrome);

prevButton.addEventListener("click", () => setActive(activeIndex - 1, true));
nextButton.addEventListener("click", () => setActive(activeIndex + 1, true));

document.addEventListener("keydown", (event) => {
  // Beim Tippen in Eingabefeldern oder im Ausprobier-Bereich nicht weiterblättern.
  const target = event.target;
  if (target.closest && (target.closest("input, textarea, select") || target.closest("#ausprobieren"))) return;
  if (["ArrowRight", "PageDown"].includes(event.key)) {
    event.preventDefault();
    setActive(activeIndex + 1, true);
  }
  if (["ArrowLeft", "PageUp"].includes(event.key)) {
    event.preventDefault();
    setActive(activeIndex - 1, true);
  }
});

setActive(0);
renderFlowStage(0);
highlightCompleteCode();
syncLessonChrome();
