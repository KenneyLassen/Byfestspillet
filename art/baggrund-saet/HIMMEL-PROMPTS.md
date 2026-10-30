# Skyer og sol — baggrundssæt

Dato: 27. oktober 2026. Produceret med det **indbyggede imagegen-værktøj**.
Referencebilledet var [den godkendte stilprøve](../stilproeve/stilproeve-01.png).
Masterfilerne er kopieret uændret. Der er ikke udført billedredigering med
andre værktøjer; Pillow blev kun brugt til metadata- og pixelanalyse.

## Valgte filer og kilder

| Fil | Kildeoutput | Format |
| --- | --- | --- |
| [skyer.png](skyer.png) | exec-3b2a13b8-c76b-4335-ad97-0ac771cf2b4b.png | 2172 × 724, RGBA |
| [sol.png](sol.png) | exec-20325693-37a1-4b08-a668-001030e3f409.png | 1254 × 1254, RGBA |

Originalerne ligger under:
`/Users/kenneylassen/.codex/generated_images/01a17eb7-43e1-7611-9eff-b7c2e96523ff/`.

Valgte originalfiler:
- `/Users/kenneylassen/.codex/generated_images/01a17eb7-43e1-7611-9eff-b7c2e96523ff/exec-3b2a13b8-c76b-4335-ad97-0ac771cf2b4b.png`.
- `/Users/kenneylassen/.codex/generated_images/01a17eb7-43e1-7611-9eff-b7c2e96523ff/exec-20325693-37a1-4b08-a668-001030e3f409.png`.

Begge masterfiler har reel alpha fra 0 til 255. Der er ingen tegnet ternet
baggrund. Farverne er hvid/lys kølig blå til skyerne og gylden gul til solen,
med bløde malede højlys i samme retning som stilprøven. Solen har ingen ansigt.

## Kildeinddeling og visning

Skyarket var bestilt som tre ens celler, men de faktiske skyer går lidt ud
over de matematiske tredjedele. Brug derfor lodrette grænser
**0, 765, 1530, 2172** og én række. Alle tre skyer er komplette med denne inddeling.
Tight source rectangles ved alpha ≥64:

| Sky | x | y | bredde | højde |
| --- | ---: | ---: | ---: | ---: |
| 1, høj rund kuppel | 41 | 197 | 707 | 348 |
| 2, lavere og bred | 789 | 267 | 725 | 273 |
| 3, kompakt høj | 1561 | 180 | 585 | 369 |

Alpha ≥128 giver næsten samme afgrænsninger:
(41,197,706,348), (790,268,724,272), (1562,180,583,368).
Billedernes proportioner bevares i spillet; skyerne må gerne variere i størrelse.
Der er enkelte små lyse pixels nær skykanterne i masterens fulde opløsning,
så den endelige spilvisning skal vurderes i faktisk størrelse.

Solens tight source rectangle ved alpha ≥64 er
**x=102, y=101, bredde=1066, højde=1032**. Ved alpha >128 er det
(102,101,1066,1031). Den primære form er en rund gul skive med ni korte,
afrundede, adskilte stråler.

## Kendt begrænsning på solmasteren

I fuld opløsning indeholder den valgte solmaster små løse rødlige/gule
pixels mellem strålerne. En målrettet rettelse med imagegen nedenfor gav
flere sådanne pixels og blev kasseret. Den oprindelige version beholdes.
De er ikke fjernet med anden billedbehandling. Integrationen er visuelt
vurderet ved cirka 138 spilenheders bredde; små pixelstøjfelter skal også
vurderes på den faktiske mobilvisning. Dokumentationen kalder ikke masteren
helt fri for pixelstøj.

## Nøjagtig prompt — skyer

```text
Use case: stylized-concept.
Asset type: production background sprite sheet for a children's 2D side-scrolling game.
Input image 1 is the APPROVED ART STYLE reference only. Match the soft illustrated white clouds in that sunny blue sky: friendly hand-painted cel shading, bright white illuminated tops, subtle pale cool-blue lower shadows, gentle rounded readable shapes, soft crisp edges appropriate for a colorful illustrated game.
Create exactly THREE DISTINCT isolated fluffy cloud sprites in one wide sheet, THREE uniform columns and ONE row. Each cloud must fit completely inside its own cell with generous transparent margins and clear separation. All three are side-view sky clouds, no perspective ground.
Cloud1: medium broad cumulus with one rounded high peak and low flat-soft underside.
Cloud2: low wider cloud with a cluster of three uneven rounded lobes.
Cloud3: compact taller fluffy cloud with a high central dome and small side puffs.
The silhouettes must be visibly different but share the same material/style, light direction from upper left, and soft low-contrast shading. Avoid tiny wisps that disappear at mobile size. Use no dark cartoon outline.
Export real RGBA PNG with genuinely transparent alpha outside each cloud, including between the clouds. There is no painted background and no checkerboard illustration.
No sky panel, horizon, sun, rays, trees, characters, scene, faces, text, labels, borders, shadows cast on ground, or extra objects. Wide 3:1 canvas, only three complete white/pale-blue cloud cutouts.
```

## Nøjagtig prompt — sol, valgt original

```text
Use case: stylized-concept.
Asset type: isolated production background sun sprite for the children's 2D side-scrolling game Hop og Rul.
Input image 1 is the APPROVED ART STYLE reference. Match its sunny golden-yellow sun with simple short friendly rounded yellow rays.
Create ONE complete sun cutout centered on a square transparent canvas, with generous transparent margin. A warm golden-yellow circular disk, gentle hand-painted lighter-yellow highlight at upper left and very subtle warm lower-right shading. Surround the disk with about ten short separate rounded rays arranged evenly but with a relaxed hand-painted feeling. Keep the silhouette readable at small mobile size.
Style: soft colorful illustrated children's game art, like the reference scene. Soft crisp edges, no heavy dark outline, no lens flare, no bloom cloud or opaque halo.
Export real RGBA PNG with genuinely transparent alpha outside the disk and rays, including spaces between rays. Do not draw a white/gray/checkerboard backdrop.
NO face, eyes, mouth, sunglasses, symbols, text, lettering, clouds, sky panel, scenery, shadows, extra objects, watermark or border. Only the isolated warm yellow sun and its rounded rays.
```

## Kasseret rettelsesforsøg — sol

Kilde:
`/Users/kenneylassen/.codex/generated_images/01a17eb7-43e1-7611-9eff-b7c2e96523ff/exec-905208f0-f59f-472f-a8a7-f3bdf376c5e4.png`.

Resultatet blev kun vurderet og blev **ikke** kopieret til produktionsfilen.
Det bevarede samme grundmotiv, men gav flere løse farvede pixels.

```text
Use case: precise-object-edit.
Edit target: attached isolated yellow sun sprite. Preserve its central round golden yellow disk and nine rounded separated rays, their exact arrangement, shapes, sizes and soft painted yellow shading.
Change ONLY unwanted stray pixels: remove ALL reddish specks, yellow flecks, detached tiny scratches/noise between rays and outside the sun. All open space between and around the disk/rays must be genuinely transparent alpha zero. Deliver a clean RGBA PNG cutout. No visible red/orange scratches outside the actual sun. The only opaque contents should be the single clean yellow disk and its nine intentional rounded rays.
Keep the yellow artwork intact with smooth antialiased outer edges. Do not add any background, halo, checkerboard, face, text, extra rays or objects. Maintain original square canvas and sun scale/position.
```

