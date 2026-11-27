"""Berechnet die konvexe Huelle einer Punktmenge.

Die konvexe Huelle ist der kleinste Rand, der alle Punkte einschliesst.
Anschaulich kann man sie sich wie ein Gummiband um die aeusseren Punkte
vorstellen.
"""

import argparse
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


# Laut Aufgabenstellung duerfen hoechstens 100 Punkte verarbeitet werden.
MAX_PUNKTE: int = 100


@dataclass(frozen=True)
class Punkt:
    """Speichert genau eine x- und eine y-Koordinate.

    ``frozen=True`` verhindert, dass die Koordinaten spaeter versehentlich
    veraendert werden.
    """

    x: float
    y: float


def orientierung(p: Punkt, q: Punkt, r: Punkt) -> float:
    """Bestimmt die Kurvenrichtung der drei Punkte p, q und r.

    Ein negativer Rueckgabewert bedeutet Rechtskurve, ein positiver Wert
    Linkskurve und 0 eine gerade Linie. Dabei ist q der mittlere Punkt, der
    beim Aufbau der Randkette eventuell entfernt werden muss.
    """

    # Beide Produkte bilden zusammen die 2D-Determinante. Ihr Vorzeichen
    # verraet, auf welcher Seite der mittlere Punkt q liegt.
    a: float = (q.x - p.x) * (r.y - p.y)
    b: float = (q.y - p.y) * (r.x - p.x)
    return a - b


def validiere_punkte(punkte: list[Punkt]) -> None:
    """Prueft die maximale Anzahl und eindeutige x-Koordinaten.

    Raises:
        ValueError: Wenn eine Vorgabe der Aufgabenstellung verletzt wird.
    """

    if len(punkte) > MAX_PUNKTE:
        raise ValueError(f"Es sind hoechstens {MAX_PUNKTE} Punkte erlaubt.")

    # Ein Set enthaelt jeden Wert nur einmal. Ist es kuerzer als die Liste,
    # kommt mindestens eine x-Koordinate doppelt vor.
    x_werte: set[float] = {punkt.x for punkt in punkte}
    if len(x_werte) != len(punkte):
        raise ValueError("Alle Punkte muessen unterschiedliche x-Koordinaten haben.")


def _rechte_randkette(punkte: Iterable[Punkt]) -> list[Punkt]:
    """Baut eine Randkette, die nur aus Rechtskurven besteht.

    Die Punkte werden in der gelieferten Reihenfolge verarbeitet. Innen
    liegende Punkte werden wieder entfernt. Zurueck kommt nur der Rand.
    """

    kette: list[Punkt] = []

    for punkt in punkte:
        # Der naechste Punkt wird zuerst probeweise angehaengt.
        kette.append(punkt)

        # Erst drei Punkte bilden eine Kurve. Nach jedem Entfernen wird die
        # neue letzte Dreiergruppe noch einmal geprueft.
        while len(kette) >= 3:
            p, q, r = kette[-3:]
            if orientierung(p, q, r) < 0:  # Rechtskurve: q bleibt.
                break

            # Bei Links- oder Geradeauskurve liegt q nicht am Rand.
            del kette[-2]

    return kette


def konvexe_huelle(punkte: list[Punkt]) -> list[Punkt]:
    """Gibt die Eckpunkte der konvexen Huelle im Uhrzeigersinn zurueck."""

    validiere_punkte(punkte)

    # Der Algorithmus muss die Punkte von links nach rechts durchlaufen.
    sortiert: list[Punkt] = sorted(punkte, key=lambda punkt: punkt.x)

    # Null, ein oder zwei Punkte bilden bereits selbst ihre Huelle.
    if len(sortiert) <= 2:
        return sortiert

    # Vorwaerts entsteht der obere, rueckwaerts der untere Rand.
    oben: list[Punkt] = _rechte_randkette(sortiert)
    unten: list[Punkt] = _rechte_randkette(reversed(sortiert))

    # Erster und letzter Punkt stehen in beiden Listen.
    return oben + unten[1:-1]


def lies_punkte(datei: Path) -> list[Punkt]:
    """Liest und prueft eine Textdatei mit einer Zeile ``x y`` pro Punkt.

    Leerzeilen und Text hinter einem ``#`` werden ignoriert. Als Trennzeichen
    sind Leerzeichen, Komma und Semikolon erlaubt.
    """

    punkte: list[Punkt] = []

    for zeilennummer, rohe_zeile in enumerate(
        datei.read_text(encoding="utf-8").splitlines(), start=1
    ):
        # Kommentare abschneiden und leere Zeilen ueberspringen.
        zeile: str = rohe_zeile.split("#", maxsplit=1)[0].strip()
        if not zeile:
            continue

        try:
            x_text, y_text = zeile.replace(",", " ").replace(";", " ").split()
            punkte.append(Punkt(float(x_text), float(y_text)))
        except ValueError as fehler:
            raise ValueError(
                f"Ungueltige Zeile {zeilennummer}: Erwartet werden zwei Zahlen."
            ) from fehler

    validiere_punkte(punkte)
    return punkte


def _formatiere_zahl(wert: float) -> str:
    """Gibt ganze Zahlen ohne unnoetige Nachkommastelle aus."""

    return str(int(wert)) if wert.is_integer() else f"{wert:g}"


def formatiere_punkt(punkt: Punkt) -> str:
    """Formatiert einen Punkt gut lesbar als ``(x, y)``."""

    return f"({_formatiere_zahl(punkt.x)}, {_formatiere_zahl(punkt.y)})"


def main() -> None:
    """Liest die Datei, berechnet die Huelle und gibt sie aus."""

    parser = argparse.ArgumentParser(
        description="Berechnet die konvexe Huelle einer Punktmenge."
    )
    parser.add_argument("datei", type=Path, help="Textdatei mit 'x y' pro Zeile")
    args = parser.parse_args()

    try:
        punkte = lies_punkte(args.datei)
        huelle = konvexe_huelle(punkte)
    except (OSError, ValueError) as fehler:
        parser.error(str(fehler))

    print(f"Eingabe: {len(punkte)} Punkte")
    print(f"Konvexe Huelle: {len(huelle)} Punkte (im Uhrzeigersinn)")
    for punkt in huelle:
        print(formatiere_punkt(punkt))


# Nur beim direkten Start ausfuehren. Beim Import in den Tests bleibt main aus.
if __name__ == "__main__":
    main()
