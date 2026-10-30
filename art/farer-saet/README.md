# Flyvende farer — pølse og frisbee

Første faresæt til Aulum Byfest: Hop og Rul, 27. oktober 2026. Begge billeder
følger den [godkendte stilprøve](../stilproeve/stilproeve-01.png): tydelige
mørke konturer, runde former, varme highlights og enkel malet skygge.

Billederne er fremstillet med to separate kald til indbygget imagegen og
kopieret uændret ind i projektet. Ingen CLI/API-fallback er brugt.
[De fulde prompts og kildefilnavne](PROMPTS.md) er bevaret.

| Fil | Indhold | Masterstørrelse | Synlig ramme ved alpha > 128 |
| --- | --- | --- | --- |
| [poelse.png](poelse.png) | Orange/rød grillpølse med grillmærker | 1816 × 866 | x 116–1716, y 215–692; 1601 × 478 |
| [frisbee.png](frisbee.png) | Lilla plastfrisbee med tydelig tyk kant | 2079 × 756 | x 126–1948, y 107–631; 1823 × 525 |

Begge filer er RGBA med reel alpha fra 0 til 255. Transparent margen
beskæres i spillets rendercache; originalerne og deres alpha ændres ikke.
Hvert billede har én grundstilling. Bevægelsen følger den eksisterende fare,
og fartstreger og advarselstekst tegnes separat i spillet. Rotation er ikke
med i denne første integration.

Pølsen tegnes inden for den eksisterende visuelle ramme på 77 × 45 spilenheder,
frisbeen inden for 66 × 24. Ens skalering i begge retninger giver en synlig
krop på cirka 77 × 23 og 66 × 19. Der er intet stræk. Kollisionsfelterne er
fortsat henholdsvis 61 × 29 og 66 × 24; fart, varsling, skade og point er
uændrede. De gamle `sausage.png` og `plate.png` er bevaret i spilmappen.
Hvis de nye billeder ikke kan indlæses, bruges den hidtidige reservegrafik.

[Forhåndsvisning i den isolerede baneprøve](forhaandsvisning.png) viser begge
billeder mod den eksisterende baggrund. De er også kontrolleret på en mindre
canvasflade i browseren, cirka 670 × 375 CSS-punkter. Det er en kontrol af
billedernes læsbarhed, ikke en fuld mobil- eller berøringstest.

Filernes SHA-256:

- Pølse: `e2ab614ec7d8a88eb9abadb6e342cc8b2de18edb78ac8bf27927172242734eb2`
- Frisbee: `a9e70bdc6998c2803ea05bc152ea4ff3db4cdc58263cb2ad491872b96cbdc343`

[Seneste testresultater og begrænsninger](../../TESTRESULTATER-RUNNER.md).
