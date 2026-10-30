# Sliske og siddende glideposer

Dato: 27. oktober 2026. Genereret med det **indbyggede imagegen-værktøj**.
Reference: [den godkendte stilprøve](../stilproeve/stilproeve-01.png)
og de eksisterende [hoppeark](../foerste-saet/README.md).

## Billeder

| Fil | Indhold | Format |
| --- | --- | --- |
| [dreng-glid.png](dreng-glid.png) | Stående kalibrering + indgang, siddende glid, udgang | 1254 × 1254, RGBA |
| [pige-glid.png](pige-glid.png) | Samme fire poser til pigen | 1254 × 1254, RGBA |
| [sliske.png](sliske.png) | Koral/orange glideflade og turkis oppustelig kant | 2172 × 724, RGBA |

Alle tre filer har reel gennemsigtighed og er kopieret uændret fra imagegen.
Ingen ternmaskering eller billedredigering er nødvendig for dette sæt.
Stående kalibrering er kun til måling; de eksisterende hoppeark bruges fortsat
ved almindelig stående kontakt, hop og landing.

## Størrelse og sædekontakt

Arkene har fire poser i læserækkefølge: neutral, indgang, glid, udgang.
De er visuelt fordelt 2 × 2, men billedgeneratoren overholder ikke helt
ens celler. Derfor dokumenteres ekstra margen i kildeinddelingen, så sko
aldrig beskæres eller kommer med i nabobilledet.

| Ark | Lodrette cellegrænser | Vandrette rækkegrænser |
| --- | --- | --- |
| Dreng | 0, 627, 1254 | 0, 690, 1254 |
| Pige | 0, 690, 1254 | 0, 690, 1254 |

Kontaktankrene er målt ved shorts/sæde. Koordinaterne nedenfor er relative
til begyndelsen af hver celle:

| Figur | Indgang | Siddende glid | Udgang |
| --- | --- | --- | --- |
| Dreng | (273, 615) | (325, 478) | (237, 467) |
| Pige | (239, 618) | (420, 444) | (211, 451) |

Én skala bruges til alle poser på hvert ark. Drengens stående silhuet er
591 kildepixels høj og pigens 563. Begge kalibreres til samme ståhøjde på
70 spilenheder som hoppearkene. Den siddende figur tilpasses **ikke** det
lavere kollisionsfelt på 42 enheder. Hoved og krop beholder skalaen;
den kortere silhuet skyldes stillingen. Billederne strækkes ikke.

Sædet placeres ved fysikkens kontaktpunkt, og hele billedet roteres med
sliskens positive hældning. De første 22% af slisken bruger indgangsposen,
de midterste 56% siddende glid, de sidste 22% udgangsposen. Valget følger
`groundPlatformId` og fremdrift, så en fælles endekant ikke vælger den
forkerte naboplatform. Hop eller skade går straks tilbage til hoppearkets
aktuelle pose. Billedvalg og tegning skriver ikke til simulationen.

Usårlighed bevarer det eksisterende blink. På slisker følger markeringen
hele den siddende billedramme med seks enheders margen og samme rotation,
så hoved og sko også er omkranset. Reduceret bevægelse bruger stadig en
rolig markering.

## Slisken

Den koralfarvede flades overkant følger præcis den fysiske kontaktlinje.
Det flade kildeudsnit er (250, 222, 1650, 302); billedets yderste buede
kapper bruges ikke som kontaktflade. Endestykker på 200 kildepixels
og en gentaget midte fra x=600..1500 tegnes med ens skala i x og y.
Samlet tykkelse er 44 spilenheder. Hele konstruktionen roteres efter
banens faktiske hældning; der ændres ikke på selve banen.

Understøtningen genbruger det første sæts pude i vandrette rækker, klippet
til sliskens kile. Den turkise sidekant er integreret i det nye sliskebillede,
ikke et selvstændigt forgrundslag. Det holder ansigt, sæde og næste landing
synlige. Separate for-/bagkanter kan tilføjes ved et senere behov.
[Sliskens nøjagtige prompt, kilde og alphamåling](SLISKE-PROMPT.md).

## Kontrol og afgrænsning

- Samme fysikversion 4, kollisionsfelter, timing, scoring, profiler og rekorder.
- Visuel sammenligning af stående og alle tre siddende poser for begge figurer.
- Sliskekontakt og indgang/udgang set i browser på computer og 667 × 375.
- Kontrolleret afspilning fra sliskens begyndelse gennem rigtig fysik til
  pudelandinger og almindelige hop.
- Alle tre genererede hældninger dækkes af automatiske tests.
- Faktiske roterede billedrammer er beregnet: de holder sig inden for
  skærmen ved de eksisterende kameragrænser og højde på sliskerne.
- Fysiske telefoner, ægte touch og afprøvning med børn mangler.
- Dette er en lokal ændring; ingen branch, PR, Render-udgivelse eller
  fælles rangliste er oprettet.

[Fuld testrapport](../../TESTRESULTATER-RUNNER.md).

[Forhåndsvisning](forhaandsvisning.png) er et uændret browserskærmbillede
fra en kontrolleret grafikprøve. Den ekstra stående figur er med for at
sammenligne kropsstørrelser; almindeligt spil har én spillerfigur ad gangen.

## Kilder og præcise figurprompts

Drengens master:
`/Users/kenneylassen/.codex/generated_images/01a0aa49-b9d8-7970-8233-fa071e07e5ba/exec-628e6fca-3bc3-4e96-a10a-778a2a106827.png`.

Pigens master:
`/Users/kenneylassen/.codex/generated_images/01a0aa49-b9d8-7970-8233-fa071e07e5ba/exec-0c5f77f4-3f8b-4e47-bc8a-a800b6217729.png`.

Begge blev genereret med stilprøven som reference1 og deres tidligere
hoppeark som reference2, med `transparent_background=true`.

### Dreng

```text
Use case: stylized-concept.
Asset type: production sprite sheet for existing 2D side-scrolling children's game Hop og Rul.
Input image 1 is the approved art/style scene. Input image 2 is the existing BOY sprite sheet, for identity and anatomy matching. Create a NEW sheet of that SAME BOY, not a scene.
Layout: EXACTLY FOUR full-body sprites in a uniform 2 columns × 2 rows grid, no labels or cell lines. Square canvas, equal camera and anatomical scale in all four cells, generous empty margins. All four face SCREEN RIGHT. Genuine transparent alpha background, not a drawing of checkerboard. No floor, objects, slide, cast shadows, text or scenery.
Match the boy closely: brown spiky hair, red T-shirt, blue shorts, red and white trainers, warm skin, friendly dark outlines, soft glossy painted cel shading. Match head size and torso length to the standing calibration frame; seated sprites must NOT be miniature. Keep head diameter and limb lengths EXACTLY the same in all four cells, the overall seated silhouette is shorter only because the hips and knees bend. The whole figure, hair, hands, soles must fit in each cell.
Top-left: standing NEUTRAL calibration pose, relaxed arms, right-facing profile, matching original standing frame.
Top-right: SLIDE ENTRY, hips lowered all the way to a seated position, legs extend to the RIGHT, gently bent knees, torso leans backward about 25 degrees from vertical, hands beside hips for balance, happy anticipation.
Bottom-left: SEATED GLIDE, sits on bottom of shorts, both legs together extend RIGHT on an imaginary HORIZONTAL floor through the seat contact point, soles slightly raised, knees softly bent, torso leans backward 25 degrees, hands beside hips, smiling. It is the seated slide pose from approved reference, drawn in local horizontal coordinates so game can rotate it onto a steep downhill slope.
Bottom-right: SEATED EXIT, still sitting with same seat height and torso/head size, knees a little more bent and arms forward preparing for takeoff from slide. Cheerful, no jumping or standing yet.
For all seated poses the underside of shorts is a clear seat contact point, soles are at or just above the same horizontal line, and no part of the figure sits below that imaginary supporting line. Seated leg direction must be horizontal RIGHT in the PNG; do not draw a diagonal ramp or rotate the sprite. Identical anatomical scale across the standing and three seated cells is critical.
Deliver a clean transparent sprite sheet ready for in-game use, only these four isolated right-facing boy poses.
```

### Pige

```text
Use case: stylized-concept.
Asset: new 2x2 sprite sheet, FOUR isolated full-body poses of the SAME GIRL for existing 2D children's side-scroller Hop og Rul. Image 1 is approved style, image 2 is existing girl sprite sheet for exact character identity and anatomy.
Match blonde high ponytail with pink tie, pink shirt, purple shorts, pink/white sneakers, dark friendly outlines, soft colorful cel painting. All four poses face SCREEN RIGHT in profile. Genuine transparent alpha background. NO painted checkerboard, shadows, slide, floor, text, cell borders or scenery.
Uniform TWO columns by TWO rows on a square canvas with generous empty margins. Locked camera and SAME HEAD DIAMETER, TORSO LENGTH, LIMB LENGTHS in all four cells. Seated poses must not be miniature: they are shorter only because the body bends.
Top-left: STANDING NEUTRAL calibration pose, relaxed arms, matching the old standing frame.
Top-right: SLIDE ENTRY, already seated low on bottom of shorts, both legs extended RIGHT, knees softly bent, hands beside hips, happy anticipation.
Bottom-left: SEATED GLIDE, sits on bottom of shorts, legs together extended horizontally RIGHT, soles a little raised, torso leans backward about 25 degrees from vertical, arms beside hips for balance, cheerful smile.
Bottom-right: SEATED EXIT, still sitting with same head/body size and seat height, knees a little more bent, arms forward preparing for next takeoff, cheerful.
For all seated poses an imaginary HORIZONTAL support line goes through the underside of shorts; all shoes and hands must be ON or ABOVE that line. The seat is a clear contact anchor. Do not draw a ramp: these are local-horizontal sprite poses the game rotates by about43 degrees onto the actual downhill slide. No diagonal legs in PNG. Keep complete hands, hair and shoes inside their cells. Match approved style and keep anatomy exactly consistent across standing and sitting. Deliver only the four isolated right-facing sprites on real transparent alpha.
```

