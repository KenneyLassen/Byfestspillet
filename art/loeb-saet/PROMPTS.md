# Løbebilleder — genereringsprompts

Indbygget imagegen, 27. oktober 2026. Stilreference: ../stilproeve/stilproeve-01.png. Identitetsreference: ../foerste-saet/dreng-hop.png og pige-hop.png. Begge nye RGBA-masters er kopieret uændret.

## Dreng

Kilde: exec-d3411578-80a3-4738-a3e2-0cc74b2d1a7f.png

```text
Use case: stylized-concept.
Asset type: production transparent character sprite atlas for a 2D side-scrolling children's game.
Input image 1: approved scene STYLE reference only. Input image 2: existing character atlas IDENTITY AND ANATOMICAL SCALE reference only; ignore its baked checkerboard. Create new animation poses, do not copy that background.
Primary request: exactly NINE separate full-body drawings of the SAME CHILD, arranged in a precise uniform 3 columns by 3 rows square sprite sheet, with actual RGBA transparency. No lines between cells. Row-major order.
Frame 0, upper left: standing relaxed neutral calibration pose, arms down, same neutral proportions as frame0 of reference2.
Frames 1 through 8: eight successive small running/balancing steps on a springy inflatable surface, animated in place while facing RIGHT. Alternating contact foot, heel-to-toe roll, bent knees accepting weight, passing foot under hip, toe push-off, opposite leg repeating. Contralateral arm swings, slight natural forward torso lean, modest body bob and hair follow-through. Use short controlled strides with at least one planted shoe at the common baseline in each drawing; these are brief contact steps BETWEEN jumps, not high leaps, no flying jump poses. All eight poses must differ clearly and form one coherent repeating run cycle.
Direction: every head, nose, chest, knees and BOTH shoe toes points SCREEN RIGHT. Near side profile, slightly three-quarter face to match the identity reference. Never front facing or left facing.
Scale: LOCK head diameter, torso length, limbs, hands and shoes to neutral calibration in every cell. Only posture changes. No miniatures. All characters fully contained in their own cell with generous clear margins. Hip center at the horizontal center of each cell, foot baseline at 88% of cell height. Neutral fills about 75% of cell height. Never crop hands, ponytail or shoes; no overlap across cells.
Style: match reference's confident dark colored outlines, vivid colors, rounded child-friendly forms, warm upper-left highlights, restrained soft cel shading. Consistent line weight and facial identity in every pose.
Constraints: genuinely transparent pixels outside drawings and between limbs; no painted checkerboard, no background, no floor or shadow, no text, no numbers, no labels, no logo, no watermark, no scenery, no motion streaks, no extra limbs. Output only the sprite atlas.
Character: The boy from the references: tousled brown hair, cheerful face, red T-shirt, blue shorts, white socks, red and white sneakers. Keep his exact haircut, face and child proportions.
```

## Pige

Kilde: exec-a6eaaf7b-c82d-47e8-82f8-1e0217029f64.png

```text
Use case: stylized-concept.
Asset type: production transparent character sprite atlas for a 2D side-scrolling children's game.
Input image 1: approved scene STYLE reference only. Input image 2: existing character atlas IDENTITY AND ANATOMICAL SCALE reference only; ignore its baked checkerboard. Create new animation poses, do not copy that background.
Primary request: exactly NINE separate full-body drawings of the SAME CHILD, arranged in a precise uniform 3 columns by 3 rows square sprite sheet, with actual RGBA transparency. No lines between cells. Row-major order.
Frame 0, upper left: standing relaxed neutral calibration pose, arms down, same neutral proportions as frame0 of reference2.
Frames 1 through 8: eight successive small running/balancing steps on a springy inflatable surface, animated in place while facing RIGHT. Alternating contact foot, heel-to-toe roll, bent knees accepting weight, passing foot under hip, toe push-off, opposite leg repeating. Contralateral arm swings, slight natural forward torso lean, modest body bob and hair follow-through. Use short controlled strides with at least one planted shoe at the common baseline in each drawing; these are brief contact steps BETWEEN jumps, not high leaps, no flying jump poses. All eight poses must differ clearly and form one coherent repeating run cycle.
Direction: every head, nose, chest, knees and BOTH shoe toes points SCREEN RIGHT. Near side profile, slightly three-quarter face to match the identity reference. Never front facing or left facing.
Scale: LOCK head diameter, torso length, limbs, hands and shoes to neutral calibration in every cell. Only posture changes. No miniatures. All characters fully contained in their own cell with generous clear margins. Hip center at the horizontal center of each cell, foot baseline at 88% of cell height. Neutral fills about 75% of cell height. Never crop hands, ponytail or shoes; no overlap across cells.
Style: match reference's confident dark colored outlines, vivid colors, rounded child-friendly forms, warm upper-left highlights, restrained soft cel shading. Consistent line weight and facial identity in every pose.
Constraints: genuinely transparent pixels outside drawings and between limbs; no painted checkerboard, no background, no floor or shadow, no text, no numbers, no labels, no logo, no watermark, no scenery, no motion streaks, no extra limbs. Output only the sprite atlas.
Character: The girl from the references: blonde high ponytail with pink tie, cheerful face, pink T-shirt, purple shorts, white socks, pink and white sneakers. Keep her exact haircut, face and child proportions.
```

