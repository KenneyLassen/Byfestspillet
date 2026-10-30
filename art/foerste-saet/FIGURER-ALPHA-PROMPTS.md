# Figurer – forsøg på transparent alpha

16. september 2026. Indbygget imagegen, to forsøg pr. figur: først baggrundsudtræk, derefter nyproduktion direkte fra godkendt stilreference. Alle fire resultater er visuelt ni højrevendte poser, men alle er RGB 1254 × 1254 uden alpha-kanal og med tern som billedindhold. Derfor er ingen af disse kopieret til produktionsfilerne dreng-hop.png eller pige-hop.png. Ingen billedredigering med andre værktøjer er foretaget. PIL blev kun brugt til aflæsning af billedmetadata.

De første forsøg refererede til de allerede producerede figurark. Nyproduktionen brugte kun ../stilproeve/stilproeve-01.png. Outputfilerne nedenfor er beholdt på imagegens oprindelige placering som kasserede varianter.

Den endelige integration bruger de tidligere figurark og maskering ved
indlæsning. Valgte kilder, deres nøjagtige prompts og begrænsninger står i
[pakkens README](README.md); de fire forsøg nedenfor er fortsat kasserede.

## Dreng

Output: /Users/kenneylassen/.codex/generated_images/01a0aafc-fe20-7a60-b666-95642e8c2512/exec-74b3babd-e2af-40b2-bbce-f1f748c85eb1.png

Resultat: RGB, 1254 × 1254, ingen alpha. Må ikke betegnes transparent.

```text
Use case: background-extraction.
Edit target: the supplied 3×3 boy sprite sheet.
Change ONLY the background into genuine transparent alpha. Preserve all NINE separate boy poses, their positions in the 3×3 layout, right-facing direction, faces, hair, red T-shirt, blue shorts, shoes, exact scale, colors and dark outline. Remove every gray AND white square outside the character silhouettes into alpha=0, including gaps between arms and body and between legs. Retain opaque white shoes, sock cuffs and eye whites.
Deliver an RGBA PNG whose background pixels are actually transparent, not RGB. Do not paint or reproduce a checkerboard: the existing checkerboard is an unwanted baked background to be REMOVED. No new background color, no scene, no border, no labels, no shadows, no new poses, no cropping or rearranging. This file will be used directly as a transparent sprite atlas over moving scenery.
```

## Pige

Output: /Users/kenneylassen/.codex/generated_images/01a0aafc-fe20-7a60-b666-95642e8c2512/exec-0cb8ebde-1730-4ef8-9727-3b469348cfc4.png

Resultat: RGB, 1254 × 1254, ingen alpha. Må ikke betegnes transparent.

```text
Use case: background-extraction.
Edit target: the supplied 3×3 girl sprite sheet.
Change ONLY the background into genuine transparent alpha. Preserve all NINE separate girl poses, their positions in the 3×3 layout, right-facing direction, faces, blonde ponytail, pink shirt, purple shorts, shoes, exact scale, colors and dark outline. Remove every gray AND white square outside the character silhouettes into alpha=0, including gaps between arms and body and between legs. Retain opaque white shoes, sock cuffs and eye whites.
Deliver an RGBA PNG whose background pixels are actually transparent, not RGB. Do not paint or reproduce a checkerboard: the existing checkerboard is an unwanted baked background to be REMOVED. No new background color, no scene, no border, no labels, no shadows, no new poses, no cropping or rearranging. This file will be used directly as a transparent sprite atlas over moving scenery.
```

## Dreng nyproduktion

Output: /Users/kenneylassen/.codex/generated_images/01a0aafc-fe20-7a60-b666-95642e8c2512/exec-bf75cb58-d8a7-450b-9fb1-95269d40cafe.png

Resultat: RGB, 1254 × 1254, ingen alpha. Må ikke betegnes transparent.

```text
Use case: stylized-concept.
Asset type: production transparent character-animation PNG for a children's 2D sidescrolling game.
Input image 1 is the APPROVED STYLE REFERENCE ONLY. Recreate exactly its little brown-haired BOY: tousled rich brown hair, big friendly eyes, red T-shirt, blue shorts, white socks, red sneakers with white soles and toe caps. Same illustrated painted highlights, crisp dark outlines, head/body proportions and colors as the reference.
Generate NINE complete separate cutout illustrations of this SAME BOY in a precisely aligned 3 by 3 arrangement on a square transparent canvas. ALL face clearly RIGHT. Same head size and scale in every pose. Each entire pose fits its own equal square cell with 25px clear padding, no contact with other poses.
Reading left to right, top to bottom: 1 upright neutral standing; 2 slight knees-bent preparation for takeoff, hands forward; 3 elongated pushing-off pose airborne diagonally up/right with both arms forward; 4 rising leap with near knee raised and other leg extended backward, fists cheerful; 5 apex of jump both knees bent and arms forward; 6 descending feet forward and knees slightly bent, arms spread for balance; 7 soft first landing knees bent; 8 compressed deeper landing, torso leaning slightly forward, arms down behind; 9 deepest landing compression, knees deeply flexed and arms down behind.
Background must be genuinely TRANSPARENT with an alpha channel, not a checkerboard illustration, not a white background. There must be nothing except the nine complete character cutouts: no ground, cast shadows, grass, cushion, scenery, lettering, labels, logos, watermark, border or frame. Retain opaque white eye and shoe areas. Fully contained characters, equal 3x3 cells.
```

## Pige nyproduktion

Output: /Users/kenneylassen/.codex/generated_images/01a0aafc-fe20-7a60-b666-95642e8c2512/exec-aa2012af-7b63-4123-823d-893b2f734e1a.png

Resultat: RGB, 1254 × 1254, ingen alpha. Må ikke betegnes transparent.

```text
Use case: stylized-concept.
Asset type: nine isolated illustrated cutouts, with a genuine transparent PNG alpha channel.
Input image 1 is the APPROVED STYLE REFERENCE ONLY. Recreate exactly its little blonde GIRL: yellow-blonde ponytail, pink hair tie, big friendly eyes, bright pink T-shirt, purple shorts, white socks, pink sneakers with white soles and toe caps. Same illustrated painted highlights, crisp dark outlines, head/body proportions and colors as the reference.
Generate NINE complete separate cutout illustrations of this SAME GIRL in a precisely aligned 3 by 3 arrangement on a square transparent canvas. ALL face clearly RIGHT. Same head size and scale in every pose. Each entire pose fits its own equal square cell with 25px clear padding, no contact with other poses.
Reading left to right, top to bottom: 1 upright neutral standing; 2 slight knees-bent preparation for takeoff, hands forward; 3 elongated pushing-off pose airborne diagonally up/right with both arms forward; 4 rising leap with near knee raised and other leg extended backward, fists cheerful; 5 apex of jump both knees bent and arms forward; 6 descending feet forward and knees slightly bent, arms spread for balance; 7 soft first landing knees bent; 8 compressed deeper landing, torso leaning slightly forward, arms forward; 9 deepest landing compression, knees deeply flexed and arms forward.
Background must be genuinely TRANSPARENT with an alpha channel, not a checkerboard illustration, not a white background. There must be nothing except the nine complete character cutouts: no ground, cast shadows, grass, cushion, scenery, lettering, labels, logos, watermark, border or frame. Retain opaque white eye and shoe areas. Fully contained characters, equal 3x3 cells.
```
