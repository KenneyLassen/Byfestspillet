# Hoppepude – første grafikpakke

Genereret med det indbyggede imagegen-værktøj den 16. september 2026. Referencen er den godkendte `../stilproeve/stilproeve-01.png`. Dette er en selvstændig pude i samme stil.

## Filer

- Produktionsfil: `hoppepude.png`.
- Original outputfil: `/Users/kenneylassen/.codex/generated_images/01a0aafc-fe20-7a60-b666-95642e8c2512/exec-0bd75451-d54c-4106-8af7-1ec5d4fbd4d4.png`.
- Originalens bytes er kopieret uændret ind i projektet. Ingen billedredigering eller efterbehandling.
- PNG: 2172 × 724 pixel, RGBA, reel gennemsigtighed.

## Kontrol og forslag til spillets visning

Visuelt kontrolleret: gul/orange oppustelig overdel, lav turkis bund, vandret flade, afrundede ender, ingen baggrund eller tekst.

Der findes næsten usynlige alpha-værdier på 1–8 uden for selve puden. Derfor er hele alpha-bounding-boxen (44, 47)–(2130, 636) ikke egnet som synlig geometri. Den væsentlige silhuet ved alpha > 8 er (46, 189)–(2126, 529), højre og nederste koordinat eksklusive. Kroppens alpha er hovedsageligt 252–254; transparent baggrund har alpha 0.

Foreslået kildeudsnit til drawImage: x=46, y=189, width=2080, height=340. Kontaktfladen ligger omkring kilde-y=190 fra x=200 til x=1950. Brug denne top som fysisk fodkontakt, og behold de afrundede ender uden vandret stræk. Eksempel på endestykker: x=46–300 og x=1872–2126. Midtersektionen x=600–1500 er næsten ensartet og kan bruges til at forlænge puden; sømløs gentagelse bør kontrolleres i spillets visningsstørrelse. Puden har ingen central lodret panelsøm, så eventuelle panelinddelinger kan knyttes til pudemodulerne.

## Nøjagtig prompt

Integrationens endelige udsnit blev x=180, y=190, width=1810, height=339,
så fødderne følger den flade kontaktkant. De kraftigste ydre rundinger er
udeladt, og hver række får en lille afrundet canvas-klippekant. Midten gentages,
og høje platforme bygges i rækker. Se [pakkens README](README.md).

```text
Use case: stylized-concept.
Asset type: production 2D sidescrolling children's browser-game environment sprite, ONE isolated inflatable bounce cushion.
Input image 1 is the APPROVED STYLE REFERENCE ONLY. Match its rounded golden yellow and orange inflatable cushions with a shallow turquoise/teal inflatable base, warm painted highlights, friendly crisp illustrated outlines, glossy soft vinyl, subtle broad panel seams.
Generate one single wide cushion, viewed in exact flat side elevation, perfectly horizontal top and bottom. Long flat central top occupies at least 70% of the width. Gently rounded capped ends. A very narrow visible top lip only, no deep perspective or diagonal foreshortening. The yellow cushion is about 75% of total height, the teal base about 25%. Desired visible silhouette aspect ratio about 4.5:1, centered with generous transparent margin on a wide approximately 3:1 canvas. Broad nearly uniform central section suitable for repeated tiling; no vertical seam in the central third. Top contact edge needs to remain level across the central span.
Background must be genuinely TRANSPARENT with an alpha channel, not a checkerboard illustration, not a white background. There must be nothing except this one complete cushion: no ground, cast shadow, grass, people, slide, tree, sky, scenery, lettering, labels, logos, watermark, border or frame. Retain subtle material shading and highlight strokes within the cushion itself. Entire object visible and fully contained.
```
