# Superhelte — genereringsprompts

Indbygget imagegen, tre separate kald, samme godkendte stilprøve. Masters kopieret uændret. Kilder og prompts:

## Dreng

Kilde: exec-2111647c-f727-437e-9646-a1a51292fb44.png

```text
Use case: stylized-concept.
Asset type: transparent superhero transformation SPRITE SHEET for a 2D children's side-scrolling game.
Input image 1: approved game scene, STYLE reference only. Input image 2: current child's character atlas, IDENTITY and anatomy reference only. Ignore its checkerboard. Preserve exactly the child's face, hairstyle, clothing colors and child proportions.
Primary request: exactly FOUR separate full-body drawings of this SAME child in a uniform 2 columns by 2 rows square atlas. Genuine RGBA transparency, generous empty margins, no cell borders. Upper left is a standing CALIBRATION pose; the other three cells show gentle flying poses toward SCREEN RIGHT. They must match the existing game drawings.
Costume: keep the original everyday shirt, shorts, socks and sneakers. Add a flowing deep purple superhero cape with a simple golden edge and a small gold STAR badge on the chest. No famous superhero logo, no mask covering the face.
Calibration (upper left): standing relaxed, facing right, full body, arms down, same head/body proportions as the existing neutral pose. Cape hangs behind without going below the shoes. Standing height about 60–65 percent of cell height so the other wide poses have room.
Upper right, lower left and lower right: the child is HORIZONTAL in joyful superhero flight, head and a leading fist toward RIGHT, legs extended toward LEFT behind the body, second arm bent close to the torso. The cape trails LEFT with three slightly different soft flutter waves across the three frames. Slightly different balance of shoes and free arm but same flying direction. No standing or running in these three cells.
Anatomical scale is LOCKED across all four cells. Same head diameter, torso length, limbs and shoe size as calibration. The flying silhouette is shorter vertically ONLY because horizontal; never shrink it to fit. Whole cape, hands, face and shoes fit in their own cell without overlap or clipping. A neutral background is NOT allowed.
Style: polished warm 2D cartoon, crisp dark colored outline, rounded forms, restrained soft cel shading and warm upper-left highlights, exactly like the approved scene.
Constraints: actual transparent pixels between and outside figures; no painted checkerboard, floor, shadows, scenery, text, labels, numbers, border, logo, watermark, speed streaks or other objects. No extra limbs. Output only the finished four-frame atlas.
Character: BOY: tousled brown hair, red T-shirt, blue shorts, white socks, red/white sneakers. Same cheerful boy from image2.
```

## Pige

Kilde: exec-61f415e3-7219-415f-9e01-24680276f746.png

```text
Use case: stylized-concept.
Asset type: transparent superhero transformation SPRITE SHEET for a 2D children's side-scrolling game.
Input image 1: approved game scene, STYLE reference only. Input image 2: current child's character atlas, IDENTITY and anatomy reference only. Ignore its checkerboard. Preserve exactly the child's face, hairstyle, clothing colors and child proportions.
Primary request: exactly FOUR separate full-body drawings of this SAME child in a uniform 2 columns by 2 rows square atlas. Genuine RGBA transparency, generous empty margins, no cell borders. Upper left is a standing CALIBRATION pose; the other three cells show gentle flying poses toward SCREEN RIGHT. They must match the existing game drawings.
Costume: keep the original everyday shirt, shorts, socks and sneakers. Add a flowing deep purple superhero cape with a simple golden edge and a small gold STAR badge on the chest. No famous superhero logo, no mask covering the face.
Calibration (upper left): standing relaxed, facing right, full body, arms down, same head/body proportions as the existing neutral pose. Cape hangs behind without going below the shoes. Standing height about 60–65 percent of cell height so the other wide poses have room.
Upper right, lower left and lower right: the child is HORIZONTAL in joyful superhero flight, head and a leading fist toward RIGHT, legs extended toward LEFT behind the body, second arm bent close to the torso. The cape trails LEFT with three slightly different soft flutter waves across the three frames. Slightly different balance of shoes and free arm but same flying direction. No standing or running in these three cells.
Anatomical scale is LOCKED across all four cells. Same head diameter, torso length, limbs and shoe size as calibration. The flying silhouette is shorter vertically ONLY because horizontal; never shrink it to fit. Whole cape, hands, face and shoes fit in their own cell without overlap or clipping. A neutral background is NOT allowed.
Style: polished warm 2D cartoon, crisp dark colored outline, rounded forms, restrained soft cel shading and warm upper-left highlights, exactly like the approved scene.
Constraints: actual transparent pixels between and outside figures; no painted checkerboard, floor, shadows, scenery, text, labels, numbers, border, logo, watermark, speed streaks or other objects. No extra limbs. Output only the finished four-frame atlas.
Character: GIRL: blonde high ponytail with pink tie, pink T-shirt, purple shorts, white socks, pink/white sneakers. Same cheerful girl from image2.
```

## Powerup

Kilde: exec-89a2d17f-5e97-4d37-b259-f7e3e6a03c81.png

```text
Use case: stylized-concept.
Asset type: one collectible powerup sprite for a 2D children's side-scroller.
Input image 1 is a STYLE reference only: match its warm confident dark colored outlines, vivid palette, glossy rounded forms and restrained soft cel shading.
Primary request: ONE recognizable magical superhero powerup: a chunky golden five-point STAR badge with a small deep purple superhero cape with gold trim flowing behind it to the LEFT. No character or face. The gold star is the central large readable symbol, the cape makes this clearly a superhero transformation pickup. Simple crisp silhouette readable at 42x42 game units.
Composition: single centered isolated object, complete star and cape inside image with generous clean transparent margin. Warm upper-left lighting, slightly glossy cartoon material matching the game reference.
Constraints: genuine alpha transparency. No text, letters, logo, watermark, checkerboard, background color, scene, floor, cast shadow, speed strokes, sparkles outside the silhouette or extra objects. Output only the isolated finished collectible.
```

