# Første grafikpakke — figurer og hoppepude

Produceret og integreret 16. september 2026 med det indbyggede imagegen-værktøj.
Alle billeder følger den [godkendte stilprøve](../stilproeve/stilproeve-01.png).
Fysikversion 4, scoring, kontroller og gemte v4-rekorder er uændrede.

## Leverede filer

| Fil | Indhold | Format |
| --- | --- | --- |
| [dreng-hop.png](dreng-hop.png) | Ni højrevendte poser i et 3 × 3 ark | 1254 × 1254, RGB |
| [pige-hop.png](pige-hop.png) | Samme ni bevægelser til pigen | 1254 × 1254, RGB |
| [hoppepude.png](hoppepude.png) | Gul/orange pude med turkis bund | 2172 × 724, RGBA |

PNG-masterfilerne er kopieret uændret fra imagegens output. De to figurark
indeholder desværre en tegnet ternet baggrund, selv efter flere forsøg med
udtrykkelig bestilling af reel gennemsigtighed. Spillets indlæsning gør denne
baggrund transparent én gang i en canvas-cache; selve PNG-filerne har ikke
alpha. Indrammede hvide sko og øjne bevares. Alle 18 poser er visuelt
kontrolleret i spillets faktiske renderer uden synlige tern.
Hoppepuden har reel alpha fra imagegen.

Figurarkene skal derfor bruges gennem `runner-art.js` og indlæsningen i
`runner.js`; de er endnu ikke selvstændige transparente filer til direkte
brug som almindelige HTML-billeder. Fremtidige rigtige alpha-ark kan indlæses
uden denne maskering. [Ekstra alpha-forsøg](FIGURER-ALPHA-PROMPTS.md) er
dokumenteret særskilt og er ikke produktionsfiler.

## Rækkefølge og kontaktpunkter

Begge ark læses fra venstre mod højre, øverste række først:

| Indeks | Navn i visningen | Bevægelse |
| ---: | --- | --- |
| 0 | neutral | Klar/neutral |
| 1 | takeoff-1 | Tidligt afsæt |
| 2 | takeoff-2 | Udstrakt afsæt |
| 3 | rise-1 | Opstigning |
| 4 | rise-2 | Sen opstigning mod toppen |
| 5 | fall-1 | Begyndende fald |
| 6 | fall-2 | Fald og forberedelse til landing |
| 7 | land-1 | Første sammenpresning |
| 8 | land-2 | Dyb sammenpresning |

Alle billeder vender mod højre, også når spilleren korrigerer mod venstre.
Hver figur får én fælles skala: neutralposen er 70 spilenheder høj; øvrige
poser bruger samme skala uden at blive strakt til ens ydre størrelse.
Føddernes laveste synlige kant er lodret kontaktanker. Vandret anker findes
midt i de nederste skopixels. Transparent margen påvirker ikke placeringen.

Billeder vælges fra den eksisterende fysik: ved pudekontakt vises land-1
ved mindst syv resterende kompressionstrin, land-2 ved fem/seks, takeoff-1
ved tre/fire og takeoff-2 ved et/to. Simulationen kører med 120 trin pr.
sekund. Efter afsæt vises takeoff-2 kortvarigt, derefter rise-1/rise-2 efter
opadgående fart. Fald skifter fra fall-1 til fall-2 ved 300 spilenheder/s.
Animationen ændrer ikke fart, hoppekraft, kollisionsfelt, timingvindue eller
point. Skade bruger foreløbig fall-1 sammen med eksisterende AV! og blink.
Ved dette sæts første aflevering brugte slisker det gamle midlertidige billede.
Det er siden erstattet af [sliskesættet](../sliske-saet/README.md).

## Puden i spillet

Rendererens endelige udsnit er x=180, y=190, bredde=1810, højde=339.
Det vælger den flade kontaktkant frem for masterens kraftigt afrundede yderender.
Puden bygges med endestykker, gentaget midte og flere rækker på høje flader.
Alle billedudsnit skaleres ens i begge retninger; lange platforme strækker
derfor ikke teksturen. Rækkerne får en lille afrundet klippekant i canvas.
Antallet af rækker beregnes ud fra platformens hvilehøjde, så det er stabilt
under kompression. Den synlige overkant følger fysikkens sammenpresning og
figurens fødder. [Pudens nøjagtige prompt og kilde](HOPPEPUDE-PROMPT.md).

## Kontrol og næste sæt

- Alle 18 poser kontrolleret for retning, synlige baggrundsrester og sko/øjne.
- Lange og høje puder samt sammenpresning kontrolleret i browser.
- Landing kontrolleret med den faktiske simulation og renderer for begge figurer.
- En almindelig tur startet ved 667 × 375; tre kontroller synlige og ingen
  JavaScript-fejl/advarsler i browserloggen.
- 88 automatiske tests består; [fuld testrapport](../../TESTRESULTATER-RUNNER.md).
- Fysisk telefon, ægte flerfingerinput og spiltest med børn mangler fortsat.

Sliskeposer og selve slisken er siden leveret i sliskesættet.
Næste grafik er bonusglæde, skadereaktion, korte løbe-/balanceovergange, farer og baggrund.
De er ikke med i denne første pakke. En særskilt toppose kan tilføjes senere;
nu dækkes toppen af sen opstigning og begyndende fald.

## Kilder og nøjagtige figurprompts

Værktøj: indbygget imagegen, ikke CLI/API.
Stilreference til første drengeark og pigearket:
`../stilproeve/stilproeve-01.png`.

Drengens første ark blev genereret som:
`/Users/kenneylassen/.codex/generated_images/01a0aa49-b9d8-7970-8233-fa071e07e5ba/exec-5a76fcf7-5320-4ab2-b66f-4d653f613f66.png`.

Det blev derefter brugt som redigeringsmål i baggrundsforsøget nedenfor.
Valgt drengemaster, kopieret til `dreng-hop.png`:
`/Users/kenneylassen/.codex/generated_images/01a0aa49-b9d8-7970-8233-fa071e07e5ba/exec-62e631f9-62ea-4bbd-8c03-a7c8adb0db87.png`.

Valgt pigemaster, kopieret til `pige-hop.png`:
`/Users/kenneylassen/.codex/generated_images/01a0aa49-b9d8-7970-8233-fa071e07e5ba/exec-86b2e196-41f0-44fa-b227-800160ca7844.png`.

### Dreng: oprindelig bestilling

```text
Use case: stylized-concept.
Asset type: production-ready transparent character SPRITE ATLAS for the 2D children's side-scroller Hop og Rul.
Reference image 1 is the APPROVED art direction and character identity. Extract the BOY's recognizable design: brown spiky hair, red T-shirt, blue shorts, red/white sneakers, warm skin, cheerful face, dark colored outlines and simple soft cel shading. Match the approved side-view style closely.
Create exactly NINE full-body poses of this SAME BOY in a precise 3 columns by 3 rows uniform grid on one square PNG with a genuinely TRANSPARENT alpha background. No background colors or checkerboard, no tile borders, labels, numbers, text, shadows, terrain or other objects. Each cell contains one complete character and generous transparent margins; all hands, hair and shoes remain inside its own cell.
Every pose faces SCREEN RIGHT in side profile: nose, chest and both shoe toes point right. Do not turn toward the viewer or flip left. Maintain identical head size, torso length, limb lengths and line thickness in every frame; bending changes posture, not scale. Use the same horizontal body center in each cell. Use a common foot anchor near 88% of each cell's height: the lowest shoe touches that baseline in all nine cells, including airborne poses. Camera and scale are locked.
Read the nine cells LEFT TO RIGHT, TOP ROW TO BOTTOM ROW:
1. NEUTRAL ready pose: standing relaxed, feet on baseline, arms naturally down.
2. TAKEOFF early: knees slightly bent, heels lifting, arms swinging forward, beginning upward push.
3. TAKEOFF extension: legs extend with toes pointing down-right, chest rising, arms forward-up below head height.
4. RISING 1: airborne, one knee gently forward and the other leg trailing, arms lift for balance.
5. RISING 2 / APEX approach: airborne with knees comfortably bent and forearms raised, relaxed excited face.
6. FALLING 1: legs extend downward toward next landing, arms spread slightly forward/back for balance, gaze down-right.
7. FALLING 2: preparing to land, both shoes underneath the hips, softly bent knees, arms forward at chest height.
8. LANDING initial: both shoes planted on baseline, moderate knee bend, torso leans a little forward, arms absorb impact.
9. LANDING deepest compression: knees more deeply bent, hips lower, feet firmly planted, torso inclines forward, head stays full-sized. This is spring landing, not a duck/roll action.
The frames must read as a natural spring jump sequence, with clearly different takeoff, rising, falling and compression silhouettes. No tumbling, rolling, sitting or sliding poses in this atlas. Proportion consistency and exact 3x3 separated layout matter more than decorative detail. Aim for a square high-resolution atlas, all nine equal cells. Transparent outside the characters, clean alpha edges, no cast shadow.
```

### Dreng: efterfølgende baggrundsforsøg, valgt master

Bestillingen krævede alpha, men det modtagne resultat var stadig RGB.
Dette er dokumentation for prompten, ikke en påstand om leveret alpha.

```text
Use case: background-extraction.
Edit target: the attached 3x3 sprite atlas of the brown-haired boy. Keep ALL NINE character drawings, poses, colors, arrangement and size exactly intact.
REMOVE THE ENTIRE CHECKERBOARD BACKGROUND. The existing gray/white checker pattern is baked into the image and is NOT transparency. Replace all background with a genuinely transparent alpha channel. Export a PNG with actual RGBA transparency, alpha zero outside characters, including gaps between arms/legs and around hair. Clean antialiased edges, preserve white shoe details and eye highlights. NO replacement color, NO new checker pattern, NO cast shadows or ground. Do not redraw, rescale, shift, crop, relight or re-pose the sprites. Keep the original square canvas and exact 3x3 layout. Transparent PNG game asset, not a visualization of transparency.
```

### Pige: bestilling, valgt master

Også her var modtaget format RGB trods bestilt alpha.

```text
Use case: stylized-concept.
Asset type: production-ready transparent character SPRITE ATLAS for the 2D children's side-scroller Hop og Rul.
Reference image 1 is the APPROVED art direction and character identity. Extract the GIRL's recognizable design: blonde high ponytail with pink hair tie, pink T-shirt, purple shorts, pink/white sneakers, warm skin, cheerful face, dark colored outlines and simple soft cel shading. Match the approved side-view style closely.
Create exactly NINE full-body poses of this SAME GIRL in a precise 3 columns by 3 rows uniform grid on one square PNG with a genuinely TRANSPARENT alpha background. Export RGBA with empty pixels outside the figure silhouettes. There is no painted background. No tile borders, labels, numbers, text, shadows, terrain or other objects. Each cell contains one complete character and generous transparent margins; all hands, hair and shoes remain inside its own cell.
Every pose faces SCREEN RIGHT in side profile: nose, chest and both shoe toes point right. Do not turn toward the viewer or flip left. Maintain identical head size, torso length, limb lengths and line thickness in every frame; bending changes posture, not scale. Use the same horizontal body center in each cell. Use a common foot anchor near 88% of each cell's height: the lowest shoe touches that baseline in all nine cells, including airborne poses. Camera and scale are locked.
Read the nine cells LEFT TO RIGHT, TOP ROW TO BOTTOM ROW:
1. NEUTRAL ready pose: standing relaxed, feet on baseline, arms naturally down.
2. TAKEOFF early: knees slightly bent, heels lifting, arms swinging forward, beginning upward push.
3. TAKEOFF extension: legs extend with toes pointing down-right, chest rising, arms forward-up below head height.
4. RISING 1: airborne, one knee gently forward and the other leg trailing, arms lift for balance.
5. RISING 2 / APEX approach: airborne with knees comfortably bent and forearms raised, relaxed excited face.
6. FALLING 1: legs extend downward toward next landing, arms spread slightly forward/back for balance, gaze down-right.
7. FALLING 2: preparing to land, both shoes underneath the hips, softly bent knees, arms forward at chest height.
8. LANDING initial: both shoes planted on baseline, moderate knee bend, torso leans a little forward, arms absorb impact.
9. LANDING deepest compression: knees more deeply bent, hips lower, feet firmly planted, torso inclines forward, head stays full-sized. This is spring landing, not a duck/roll action.
The frames must read as a natural spring jump sequence, with clearly different takeoff, rising, falling and compression silhouettes. No tumbling, rolling, sitting or sliding poses in this atlas. Proportion consistency and exact 3x3 separated layout matter more than decorative detail. Aim for a square high-resolution atlas, all nine equal cells. Transparent outside the characters, clean alpha edges, no cast shadow.
```

