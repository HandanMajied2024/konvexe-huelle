import unittest

from konvexe_huelle import Punkt, konvexe_huelle, orientierung


class KonvexeHuelleTest(unittest.TestCase):
    def test_beispiel_mit_inneren_punkten(self) -> None:
        punkte = [
            Punkt(2, 0),
            Punkt(0, 0),
            Punkt(4, 0),
            Punkt(1, 1),
            Punkt(3, 3),
        ]

        self.assertEqual(
            konvexe_huelle(punkte),
            [Punkt(0, 0), Punkt(3, 3), Punkt(4, 0)],
        )

    def test_alle_punkte_auf_einer_geraden(self) -> None:
        punkte = [Punkt(0, 0), Punkt(1, 1), Punkt(2, 2), Punkt(3, 3)]
        self.assertEqual(konvexe_huelle(punkte), [Punkt(0, 0), Punkt(3, 3)])

    def test_null_bis_zwei_punkte(self) -> None:
        self.assertEqual(konvexe_huelle([]), [])
        self.assertEqual(konvexe_huelle([Punkt(1, 2)]), [Punkt(1, 2)])
        self.assertEqual(
            konvexe_huelle([Punkt(2, 3), Punkt(1, 4)]),
            [Punkt(1, 4), Punkt(2, 3)],
        )

    def test_doppelte_x_koordinate_wird_abgelehnt(self) -> None:
        with self.assertRaisesRegex(ValueError, "unterschiedliche x-Koordinaten"):
            konvexe_huelle([Punkt(1, 2), Punkt(1, 5)])

    def test_mehr_als_100_punkte_werden_abgelehnt(self) -> None:
        with self.assertRaisesRegex(ValueError, "hoechstens 100"):
            konvexe_huelle([Punkt(x, x * x) for x in range(101)])

    def test_orientierung(self) -> None:
        p, q = Punkt(0, 0), Punkt(1, 0)
        self.assertGreater(orientierung(p, q, Punkt(1, 1)), 0)
        self.assertLess(orientierung(p, q, Punkt(1, -1)), 0)
        self.assertEqual(orientierung(p, q, Punkt(2, 0)), 0)


if __name__ == "__main__":
    unittest.main()
