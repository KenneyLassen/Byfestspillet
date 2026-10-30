# Sliske — grafikpakke 2

Genereret 27. oktober 2026 med det indbyggede imagegen-værktøj.
Referencer: den godkendte [stilprøve](../stilproeve/stilproeve-01.png) og den
eksisterende [hoppepude](../foerste-saet/hoppepude.png).

## Leveret master

- [sliske.png](sliske.png): 2172 × 724 pixel, RGBA med reel gennemsigtighed.
- Original output:
  `/Users/kenneylassen/.codex/generated_images/01a17e9d-be26-7122-926f-0e016a5d6cf6/exec-32af1a54-b30b-4097-9855-5f6eaabfccd3.png`.
- Masterens bytes er kopieret uændret til spilprojektet. Ingen billedredigering.
- Formen er et vandret modul: koral/orange glideflade med turkis oppustelig
  kant under. Spillets renderer drejer modulet til banens faktiske hældning.

## Aflæsning og integration

Alpha spænder fra 0 til 255; 901196 pixel er helt transparente. Ved alpha > 128
er synlig afgrænsning (43, 218)–(2131, 524), højre/nederste grænse eksklusive.
De afrundede yderkapper er ikke plane helt ude ved enderne.

Den centrale kontaktflade ligger nøjagtigt ved kilde-y=222 for x=250..1900.
Et praktisk fladt kildeudsnit er derfor x=250, y=222, bredde=1650, højde=302.
Midterområdet x=600..1500 er egnet til gentagelse. Brug én ens skala vandret og
lodret, og gentag midten for at danne lange slisker. Et endestykke på cirka
200 kildepixel i hver side kan bruges, og afrunding kan klippes i rendererens
lokale koordinater. Hele kildeudsnittet drejes samlet efter den fysiske
sliskelinje; det er ikke et perspektivbillede, der skal strækkes skråt.

Den synlige øverste kontaktkant skal lægges på fysikkens overflade. En eventuel
støttebygning under slisken kan bruge eksisterende pudemateriale. Det er ikke
malet ind i denne master, fordi spillet har forskellige længder og hældninger.
De to farvede bånd er ét samlet billede, ikke særskilte for-/baggrundslag.

Begrænsning: endekappernes dekorative buler skal holdes uden for den flade
kontaktzone eller klippes til ved spilvisningen. Gentagelse og samlinger skal
vurderes i faktisk spilskala ved integration.

## Nøjagtig prompt

```text
Use case: stylized-concept.
Asset type: production 2D side-scrolling game sprite, ONE modular inflatable slide surface strip.
Input image 1 is the approved art/style reference only; match its coral-orange slide, deep turquoise inflatable rails, painted glossy soft vinyl, dark colored outlines, friendly vivid cartoon rendering. Input image 2 is a matching existing cushion for material/color compatibility.
Primary request: create one isolated long HORIZONTAL slide strip in EXACT FLAT SIDE ELEVATION. The game will rotate this complete strip onto a steep slope later. The strip is a coral orange upper glide lane with a thin warm cream/coral highlight along its perfectly level upper contact edge, attached to a thick rounded turquoise inflatable side tube beneath it. Orange occupies upper 40 percent, turquoise lower 60 percent of the visible strip's thickness. Rounded caps at each end, but a perfectly straight flat top across at least 80 percent of the middle. The central 60 percent has near-uniform horizontal material shading so it can be tiled seamlessly. A few broad soft seam bands near the ends only. Complete visible shape width about 5 times its thickness, centered on a wide 3:1 canvas with generous empty margin.
The top is a precise horizontal physical contact line, no raised lip above it. No perspective, no receding rails, no diagonal or built-in slope, no curve or dip in the middle. This is a modular SIDE SPRITE, not a scene, cross-section diagram, or entire triangular slide building.
Background: genuinely transparent alpha zero outside the object. Export RGBA PNG, not a painted checkerboard, not a white/gray/black background.
No person, character, steps, ladder, grass, ground, cast shadow, scenery, text, labels, logo, watermark, border, extra object. Keep the whole strip visible; clean alpha edges.
```

