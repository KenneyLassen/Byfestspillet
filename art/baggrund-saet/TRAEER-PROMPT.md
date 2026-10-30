# Træer — baggrundssæt

Genereret 27. oktober 2026 med det indbyggede imagegen-værktøj.
Stilreference: [den godkendte stilprøve](../stilproeve/stilproeve-01.png).

## Produktionsfil og kilde

- [traeer.png](traeer.png): 2172 × 724 pixel, RGBA med reel alpha.
- Original: `/Users/kenneylassen/.codex/generated_images/01a17eb7-25ed-72c1-bcd5-a3f5b03fa5c1/exec-a385e321-fa8a-4340-89dc-bbb46caf2914.png`.
- Masterens bytes er kopieret uændret. Ingen billedredigering eller efterbehandling.
- SHA-256: `ee82edb063388cc06ea7a69405a394f5625f971572a208b2ee126cd63f176cf9`.
- Filstørrelse: 1497941 bytes. 743698 pixels har alpha 0. De øvrige omfatter
  antialias og blød malet rand; baggrunden er ikke et ternmønster.

## Visuel kontrol og kildeudsnit

Tre adskilte træer med forskellig silhuet, synlige brune stammer og grene og
malede grønne kroner. Venstre træ er bredt og eg-lignende, midtertræet har
buet stamme og rundere krone, højre træ er højere og smallere. Hele silhuetter
er inde i billedet. Stammernes synlige underkant ligger ved y702–703.

Bestillingen krævede lige celler, men billedgeneratoren fordelte træerne
ulige. Brug derfor de målte udsnit nedenfor i stedet for en fast tredeling.
Koordinaterne er globale kildepixels, bredde/højde inkluderer den synlige
silhuet ved alpha ≥128:

| Træ | x | y | bredde | højde |
| --- | ---: | ---: | ---: | ---: |
| Bred eg | 20 | 22 | 829 | 682 |
| Rund, buet stamme | 881 | 73 | 598 | 631 |
| Høj, smal krone | 1568 | 14 | 584 | 689 |

Der er tomme mellemrum mellem x849–880 og x1479–1567 ved samme alpha-grænse.
Ved alpha ≥8 er de bløde yderkanters udsnit henholdsvis (19,20,831,685),
(880,71,600,635) og (1567,14,587,691). Disse er sikre kilder uden nabotræer.
Brug ens x/y-skala, og placer stammens underkant ved baggrundsbasis.
Kronerne er ret farvemættede; rendererens baggrundslag kan dæmpe opacity for
at bevare læsbarhed af spiller og farer. Intet forgrundsobjekt er malet ind.

## Nøjagtig prompt

```text
Use case: stylized-concept.
Asset type: production background sprite sheet for existing 2D children's side-scroller Hop og Rul.
Input image 1 is the APPROVED STYLE REFERENCE only. Match its friendly illustrated broadleaf trees: recognizable branching warm brown trunks, organic layered leafy canopies, painterly cel shading, soft sunny yellow-green highlights and natural mid-green leaves. These are Danish summer village trees for the background, with lighter softer outlines than a player sprite.
Create EXACTLY THREE complete isolated different broadleaf trees, laid out in THREE equal-width columns in ONE horizontal row on a wide approximately 3:1 canvas.
LEFT: a broad oak-like tree with spreading branches and uneven rounded crown.
MIDDLE: a rounder compact deciduous tree with a slightly curved trunk and visible forked branches.
RIGHT: a slightly taller oval broadleaf tree with a narrower trunk and a distinct asymmetrical crown.
Give every tree a naturally different silhouette, not repeated copies. All three have visible brown trunks and some visible main branches beneath their dense bright leafy crowns. Full height including crown tips and the bottom of the trunk must fit well inside each cell with generous empty transparent margins. All trunk bottoms share the same horizontal baseline. No tree touches another cell and no canopy is cropped by the canvas edge.
Genuine transparent alpha background. PNG with alpha zero outside trees; not a painted checkerboard, not white/black/gray background. No ground, grass, bushes, shadows, sky, people, animals, faces, labels, text, logos or extra scenery. Only three complete clean isolated tree sprites, crisp clean alpha edges.
```

