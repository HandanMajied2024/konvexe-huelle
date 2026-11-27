# Bonusaufgabe: Inkrementelle konvexe Hülle

## 1. Was ist verlangt?

Gegeben sind höchstens 100 Punkte der Form `P = (x, y)`. Je zwei Punkte haben
unterschiedliche x-Koordinaten. Gesucht ist die Teilmenge der Punkte, die die
**konvexe Hülle** bilden.

Anschaulich kann man sich die Punkte als Nägel in einem Brett vorstellen. Legt man
ein Gummiband um alle Nägel, dann sind genau die vom Band berührten äußeren Punkte
die Eckpunkte der konvexen Hülle.

Die Implementierung folgt dem inkrementellen Algorithmus von Folie 12:

1. Punkte nach ihrer x-Koordinate sortieren.
2. Die obere Hülfte von links nach rechts aufbauen.
3. Die untere Hälfte von rechts nach links aufbauen.
4. Beide Hälften ohne doppelte Endpunkte verbinden.

## 2. Idee des Algorithmus

Beim Aufbau einer Hälfte stehen die bisher akzeptierten Punkte in einer Liste. Ein
neuer Punkt wird hinten angefügt. Danach werden immer die letzten drei Punkte
`p`, `q` und `r` betrachtet:

- Bilden sie eine Rechtskurve, bleibt `q` in der Hülle.
- Bilden sie eine Linkskurve oder liegen sie auf einer Geraden, kann `q` kein
  benötigter Eckpunkt sein und wird entfernt.
- Nach einer Entfernung wird derselbe Test mit den neuen letzten drei Punkten
  wiederholt.

Die Orientierung wird mit einer Determinante beziehungsweise einem Kreuzprodukt
bestimmt:

```text
D(p, q, r) = (qx - px)(ry - py) - (qy - py)(rx - px)

D > 0: Linkskurve
D < 0: Rechtskurve
D = 0: kollinear (alle drei Punkte liegen auf einer Geraden)
```

Kollineare Punkte zwischen zwei Eckpunkten werden nicht in die Ergebnisliste
aufgenommen. Die ausgegebenen Eckpunkte stehen im Uhrzeigersinn.

## 3. Benötigte Datenstrukturen

- `Punkt`: unveränderliches Objekt mit den Koordinaten `x` und `y`.
- `list[Punkt]` für die Eingabepunkte.
- `list[Punkt]` als dynamischer Stack für obere und untere Hülle. Benötigt werden
  nur das Anhängen eines Punktes, der Zugriff auf die letzten drei Punkte und das
  Entfernen des vorletzten Punktes.

## 4. Benötigte Elementaroperationen

- `orientierung(p, q, r)`: berechnet die Determinante und erkennt Links- oder
  Rechtskurve beziehungsweise Kollinearität.
- `sorted(...)`: sortiert alle Punkte aufsteigend nach x.
- `_rechte_randkette(...)`: baut aus einer Punktreihenfolge eine Randkette, die
  nur aus Rechtskurven besteht.
- `konvexe_huelle(...)`: erzeugt obere und untere Hülle und verbindet sie.
- `validiere_punkte(...)`: prüft die Grenze von 100 Punkten und die paarweise
  verschiedenen x-Koordinaten.
- `lies_punkte(...)`: liest die Punktmenge aus einer Textdatei.

## 5. Korrektheitsidee

Die sortierten Punkte werden nacheinander verarbeitet. Vor jedem neuen Punkt ist
die bisherige Randkette konvex. Entsteht durch den neuen Punkt keine Rechtskurve,
liegt der mittlere der letzten drei Punkte auf oder innerhalb der neu entstehenden
Kante. Er kann daher kein notwendiger Eckpunkt sein und wird entfernt. Das wird
so lange wiederholt, bis die Kette wieder konvex ist. Somit ist nach jedem Schritt
die korrekte Hülle der bisher betrachteten Punkte gespeichert. Dasselbe Argument
gilt spiegelbildlich für die untere Hülle. Beide zusammen bilden die gesamte
konvexe Hülle.

## 6. Laufzeit und Speicherbedarf

- Sortieren: `O(n log n)`
- Aufbau beider Hüllenteile: zusammen `O(n)`, weil jeder Punkt höchstens einmal
  eingefügt und einmal entfernt wird
- Gesamtlaufzeit: **`O(n log n)`**
- Zusätzlicher Speicher: **`O(n)`**

## 7. Programm ausführen

Voraussetzung ist Python 3. Es werden keine zusätzlichen Bibliotheken benötigt.

Jede nicht leere Zeile der Eingabedatei enthält `x y`. Kommentare beginnen mit
`#`. Komma oder Semikolon dürfen ebenfalls als Trennzeichen verwendet werden.

```bash
cd 05_Bonusaufgabe_Konvexe_Huelle
python3 konvexe_huelle.py beispielpunkte.txt
```

Erwartete Ausgabe für die beigefügten Beispieldaten:

```text
Eingabe: 8 Punkte
Konvexe Huelle: 7 Punkte (im Uhrzeigersinn)
(-3, 0)
(-2, 2)
(0, 3)
(3, 1)
(4, 0)
(2, -2)
(-1, -1)
```

Automatische Tests starten:

```bash
python3 -m unittest -v
```

## 8. Interaktive Erklärung öffnen

Im Ordner `visualisierung` liegt eine eigenständige HTML-Erklärung. Sie zeigt
links den jeweils ausgeführten Python-Code und rechts die Wirkung auf die Punkte.
Die acht Schritte lassen sich durch Scrollen, mit den Pfeiltasten oder über die
Schaltflächen `Zurück` und `Weiter` durchgehen.

Im Abschnitt **„Selbst ausprobieren“** lassen sich eigene Punkte eingeben, im selben
Format wie die Eingabedatei, oder per Klick in die Fläche setzen. Die Hülle wird mit
demselben Algorithmus berechnet. Mit `Abspielen` oder Schritt für Schritt sieht man,
wann ein Punkt angehängt, getestet und entfernt wird. Ganz am Ende der Seite stehen die
Antworten auf die Fragen nach Datenstrukturen und Elementar-Operationen.

### Einfachster Weg auf dem Mac

Im Projektordner die Datei `Vorschau_in_Firefox.command` doppelklicken. Sie sucht
automatisch einen freien lokalen Port, startet den Vorschau-Server und öffnet die
Erklärung in Firefox. Das dabei geöffnete Terminalfenster muss während der Vorschau
offen bleiben. Mit `Strg+C` wird der Server beendet.

Falls macOS beim ersten Start nachfragt: Rechtsklick auf die Datei, `Öffnen` wählen
und den Start einmal bestätigen.

### Direkter oder manueller Start

Die Datei kann alternativ direkt im Browser geöffnet werden:

```text
visualisierung/index.html
```

Alternativ kann im Projektordner ein kleiner lokaler Webserver gestartet werden:

```bash
python3 -m http.server 8000
```

Danach ist die Erklärung unter
`http://localhost:8000/visualisierung/` erreichbar.
