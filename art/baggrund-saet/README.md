# Baggrund — træer, skyer, sol og flagline

Integreret 27. oktober 2026. Billederne er lavet med det **indbyggede imagegen**
ud fra den [godkendte stilprøve](../stilproeve/stilproeve-01.png).

## Filer og prompts

| Fil | Motiver | Format |
| --- | --- | --- |
| [traeer.png](traeer.png) | Tre forskellige løvtræer | 2172 × 724, RGBA |
| [skyer.png](skyer.png) | Tre hvide/lyseblå skyer | 2172 × 724, RGBA |
| [sol.png](sol.png) | Gul sol med afrundede stråler | 1254 × 1254, RGBA |
| [flag.png](flag.png) | Rød/orange, gul, blå og turkis vimpel | 1254 × 1254, RGBA |
| [forhaandsvisning.png](forhaandsvisning.png) | Uændret browserskærmbillede | PNG |

11 motiver på fire billedark, samlet cirka 3,5 MB. Alle masters har reel
gennemsigtighed og er kopieret uændret. SHA-256 matcher originalerne.
Præcise kildeoutput og prompts: [træer](TRAEER-PROMPT.md),
[skyer/sol](HIMMEL-PROMPTS.md) og [flag](FLAG-PROMPT.md).

## Kildeinddeling og størrelse

Træer og skyer blev leveret med ulige mellemrum. Lodrette cellegrænser er
0/860/1525/2172 for træer og 0/765/1530/2172 for skyer. Grænserne tilpasses
proportionalt til billedbredden. Flagarket deles i 2 × 2; solen er én celle.
Hver celle beskæres til sin alpha ≥64-silhuet i indlæsningscachen. Selve PNG
ændres ikke. Billederne skaleres ens i x og y, så brede kroner/skyer vises
hele, og flagene beholder deres faktisk leverede proportioner.

Sol- og skyarkene har enkelte løse pixels synlige i fuld opløsning.
Et målrettet imagegen-forsøg på oprydning af solen blev kasseret, fordi det
gav et dårligere resultat. Ved solens afprøvede bredde på 138 spilenheder
ses ingen forstyrrende farveprikker. Se den præcise begrænsning og det
kasserede forsøg i HIMMEL-PROMPTS.md.

## Lag og vind

Himmel, sol, skyer, bakker, træer, det eksisterende hoppeborgmotiv og flagline
tegnes før bane, farer og figur. Trælagene bruger alpha 0,35 og 0,72;
skyer 0,9 og flag 0,86. Hoppeborgmotivet er mindre og dæmpet som baggrund.
De eksisterende canvas-bakker og græs er genbrugt; de har ikke nye billedfiler.

Træerne ruller med 15% og 30% af kameraets vandrette bevægelse. Skyerne
følger 10% og driver yderligere tre spilenheder/sekund. Motiverne følger
deres verdensindeks, så en gentagelsesgrænse ikke skifter deres variant.

Linen går fra (0,170) til (1200,170), kontrolpunkt (600,240). De 21 flag
sidder ved x=60,114,…,1140 og følger præcis samme kurve. De drejer om
topkantens midte, højst ±0,065 radianer (cirka 3,7 grader) ud over linens
hældning. Vind og drift bruger simulationens tid og fryser derfor ved
pause og på resultat-/menusider. `prefers-reduced-motion: reduce` fjerner
flagblafren og skyernes egen drift; kamerabevægelsen bevares.

## Kontrol og status

99 automatiske tests består. Lag, proportioner, ulige celler, vind/pause,
reduceret bevægelse og reservegrafik er testet ved de eksisterende testgrænser.
Baggrunden er set ved 1280 × 720, 556 × 312 og 666 × 375 CSS-punkter, også
med figur ved flaglinen og frisbee foran skyerne. Isoleret prøvetur og pause
er afprøvet. Grafikprøven kan hverken læse eller skrive rigtigt profillager;
det blev kontrolleret før brug. [Fuld testrapport](../../TESTRESULTATER-RUNNER.md).

Fysiske telefoner, ydelse på ældre mobiler og spiltest med børn mangler.
Ingen fysik-, input-, score- eller lagringsændringer. Ingen branch, PR,
Render-udgivelse eller fælles rangliste er oprettet. Nye buske/bakker/græs,
farer, bonusglæde, skade og løb/balance står fortsat i
[grafiklisten](../../GRAFIKOPGAVER.md).
