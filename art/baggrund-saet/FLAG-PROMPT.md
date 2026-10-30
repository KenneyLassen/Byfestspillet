# Flag — baggrundssæt

Genereret 27. oktober 2026 med det indbyggede imagegen-værktøj.
Reference: [godkendt stilprøve](../stilproeve/stilproeve-01.png).

- Fil: [flag.png](flag.png), 1254 × 1254, RGBA med reel gennemsigtighed.
- Master kopieret uændret fra:
  `/Users/kenneylassen/.codex/generated_images/01a0aa49-b9d8-7970-8233-fa071e07e5ba/exec-261772b8-c722-4439-b44f-59c50ed2640f.png`.
- Fire farver i 2 × 2: rød/orange, gul, blå, turkis.
- Alpha64-udsnit, globale koordinater:
  (85,111,499,465), (673,111,493,465),
  (88,688,496,466), (677,687,498,469).
- Ingen efterbehandling af PNG-filen. Transparent margen beskæres i spillets
  indlæser. Ens skala i x og y bevarer materialets proportioner.
- Linen tegnes separat i canvas. Flag drejes roligt om midten af deres topkant;
  de holder fast i samme ophængspunkter. De er pynt og har ingen kollisioner.
- De leverede flag er bredere end den ønskede 2:3-form; visningen bevarer
  deres faktiske proportioner frem for at strække dem.

## Nøjagtig prompt

```text
Use case: stylized-concept.
Asset type: production bunting pennant sprite sheet for existing 2D children's browser game Hop og Rul.
Input image 1 is APPROVED STYLE REFERENCE ONLY. Match the triangular fabric festival pennants hanging across upper left in the image: warm red-orange, golden yellow, clear sky blue, turquoise teal. Friendly painterly cartoon illustration with softly highlighted folds, clean edges, subtle darker material near seam, daylight.
Primary request: EXACTLY FOUR isolated triangular cloth pennants, each hanging DOWN from a perfectly horizontal stitched top edge with one downward tip. Use a uniform 2 columns × 2 rows square sprite sheet. Top-left red-orange, top-right yellow, bottom-left blue, bottom-right teal. Same proportions and camera scale in all cells; triangles about 2:3 width:height, gentle slightly curved fabric edges but clearly triangular and readable small. A faint fold makes them feel like soft windblown fabric, but top edge remains HORIZONTAL because game animation will add motion.
Background: genuinely TRANSPARENT alpha zero outside fabric. No painted checkerboard, white/gray/black background. Generous empty margin in each cell; every pennant complete, no overlap, no cropped edge.
There is NO rope or string in this sprite sheet: the game draws the shared sagging cord behind the separately animated flags. No poles, scene, sky, trees, people, cast shadows, labels, text, numbers, border, logos or decorative symbols. Only four full fabric flags in four equal cells.
Match approved painted style and colors; avoid bold black outlines, plastic tubes, stickers, glossy buttons or 3D icons. The texture should stay simple when flags are shown roughly30px tall in the game.
```

