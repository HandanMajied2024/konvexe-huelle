#!/usr/bin/env python3
"""Startet die HTML-Erklärung lokal und öffnet sie in Firefox."""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import shutil
import subprocess
import sys
import threading
import webbrowser


PROJEKTORDNER = Path(__file__).resolve().parent


class VorschauHandler(SimpleHTTPRequestHandler):
    """Liefert die Projektdateien aus und hält die Konsole übersichtlich."""

    def log_message(self, format: str, *args: object) -> None:
        pass


def firefox_oeffnen(url: str) -> None:
    """Öffnet bevorzugt Firefox und fällt sonst auf den Standardbrowser zurück."""

    if sys.platform == "darwin" and shutil.which("open"):
        ergebnis = subprocess.run(
            ["open", "-a", "Firefox", url],
            check=False,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        if ergebnis.returncode == 0:
            return

    webbrowser.open(url)


def main() -> None:
    handler = partial(VorschauHandler, directory=str(PROJEKTORDNER))

    # Port 0 bedeutet: Das Betriebssystem wählt automatisch einen freien Port.
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    port = server.server_address[1]
    url = f"http://127.0.0.1:{port}/visualisierung/"

    print("\nKonvexe Hülle - Firefox-Vorschau")
    print(f"Projekt: {PROJEKTORDNER}")
    print(f"Adresse: {url}")
    print("Zum Beenden dieses Fensters Strg+C drücken.\n")

    # Kurz nach dem Serverstart öffnet sich Firefox automatisch.
    threading.Timer(0.2, firefox_oeffnen, args=(url,)).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nVorschau beendet.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
