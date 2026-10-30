# Testresultater — pølser og frisbees i den godkendte stil

Dato: 27. oktober 2026. Spillets fysikversion 4 er bevaret.

## Ændringen

- En orange/rød grillpølse og en lilla frisbee bruger nu egne rasterbilleder
  i samme stil som figurerne, puderne, sliskerne og baggrunden.
- Billederne har reel alpha og skaleres ens i begge retninger. Transparent
  margen beskæres i rendercachen, uden at masterfilerne ændres.
- De eksisterende visuelle rammer, kollisionsfelter, bevægelse og varsling
  er bevaret. Fartstreger og advarselstekst er stadig separate effekter.
- Ét grundbillede pr. fare er integreret. Ingen rotationsanimation er tilføjet.
  Ved billedfejl bruges den hidtidige reservegrafik.

De to billeder er fremstillet med separate kald til indbygget imagegen med
[den godkendte stilprøve](art/stilproeve/stilproeve-01.png) som reference og
kopieret uændret ind i projektet. Ingen CLI/API-fallback er brugt.
[Billedfiler, mål, prompts og forhåndsvisning](art/farer-saet/README.md).

## Udgangspunkt og testmetode

Mappen har ingen Git-historik. De 64 eksisterende filer under `game` blev
kopieret til `/private/tmp/aulum-farer-20261027-before/game` før arbejdet,
og SHA-256 blev registreret. Alle 114 eksisterende tests bestod ved udgangspunktet.
Den foregående rapport er bevaret byte for byte i
[reference/GRAFIK-4-TESTRESULTATER.md](reference/GRAFIK-4-TESTRESULTATER.md).

TDD er brugt ved den allerede aftalte grænse: den faktiske browseradapter
mod canvas, billedindlæsning, DOM og lokalt lager. Simulationen og
billedindlæseren afvikles fra projektets kode; browsergrænserne efterlignes.

En ny test fejlede først med “sausage loads its new picture”, fordi spillet
stadig brugte den gamle billedsti. Efter den afgrænsede integration består
testen for begge billeder, alpha-beskæring, proportioner og kameraoffset.
Den kontrollerer også de eksisterende visuelle rammer og uændret tur/lager.
En yderligere regressionstest bekræfter synlig reservegrafik for begge
billeder ved indlæsningsfejl, fejlbesked og fortsat spil.

## Automatiske resultater

**116 af 116 tests består. 0 fejlede, 0 oversprungne.**

Kørt med Node v24.22.1: `node --test game/tests/*.test.cjs`.

| Område | Antal |
| --- | ---: |
| Uændret fysikversion 4 | 31 |
| Browseradapter, input, lagring og grafik | 35 |
| Billeddata, placering og vindlayout | 14 |
| Bevaret Hoppeborg Challenge | 28 |
| Sponsorformat og validering | 5 |
| Sponsoreditor | 3 |

De 35 adaptertests består også som målrettet kontrol. Alle tidligere tests
af styring, timing, momentum, bonus, slisker, skade, usårlighed, skærmgrænser,
pause, profiler, rekorder, forgrund og sponsorbilleder består fortsat.

Rødt testoutput er gemt i `/private/tmp/aulum-farer-red.txt`, målrettet grønt
output i `/private/tmp/aulum-farer-targeted.txt`, og den samlede slutkontrol
ligger i `/private/tmp/aulum-farer-final-tests.txt`.

`runner-core.js` og alle 22 eksisterende billedfiler er sammenlignet med
udgangspunktet og er byte for byte uændrede. Ni kontrolfiler, herunder
fysik, billedlayout, CSS, forside, sponsorfiler og det tidligere spil, er
også uændrede. Begge nye masterfiler matcher deres genererede kildefiler.
De nye masterfiler er RGBA med
alpha 0–255. Målingerne giver synlige rammer på 1601 × 478 pixels for pølsen
og 1823 × 525 for frisbeen. De bevarer proportionerne inden for de tidligere
visuelle rammer; de synlige kroppe er cirka 77 × 23 og 66 × 19 spilenheder.
Kollisionsfelterne er fortsat 61 × 29 og 66 × 24.

Adaptertests bruger efterlignet canvas og browsergrænser. De erstatter ikke
visuel kontrol, ægte berøringsinput eller ydelsesmålinger på en telefon.

## Afprøvet i browser

- Begge farer er set på en isoleret lav hoppepude mod den eksisterende
  baggrund, med deres transparente kanter og uden stræk eller billedbaggrund.
- Bekræftet desktop-viewport: 1536 × 864.
- En midlertidig prøvevisning gav en mindre canvasflade på cirka
  669,773 × 375 CSS-punkter. Begge farer blev kontrolleret ved denne størrelse
  og kunne genkendes. Det var en ændring af prøvens canvaslayout, ikke en
  bekræftet mobil-viewport eller en afprøvning af mobilmenu og touchstyring.
- [Forhåndsvisning fra den isolerede baneprøve](art/farer-saet/forhaandsvisning.png).
- Browserens konsol viste ingen fejl eller advarsler under slutkontrollen.

Prøven bruger isoleret lager og tilgår ikke browserens virkelige
`localStorage`. En separat kontrol af prøvens afslutning bestod: de
oprindelige spillerdata blev bevaret byte for byte med nul virkelige
lagerskrivninger. Kontrollen blev kørt som
`/private/tmp/aulum-hazard-isolation.cjs`.
Den midlertidige prøveside er fjernet. Det almindelige spil er genåbnet på
startmenuen med samme profil, og sponsorredigeringen er bevaret.

## Review

To uafhængige underagenter har gennemgået ændringen mod samme gemte
udgangspunkt, inklusive de nye filer:

- Standarder: ingen resterende fund.
- Krav: ingen resterende fund.

Begge reviewakser er afsluttet, og begge gennemgange bekræftede 116 beståede
tests. Der er ikke oprettet et Git-commit for at gennemføre reviewet.

## Begrænsninger og leveringsstatus

- Fysiske telefoner, ægte berørings- og flerfingerinput, ydelse på ældre
  mobiler, langsomme netforbindelser og spiltest med børn er ikke afprøvet
  i denne runde. Den mindre canvasprøve dækker kun visuel læsbarhed.
- Ekstra rotations-/vippebilleder er et muligt senere grafikarbejde.
  Ét grundbillede af hver fare var tilstrækkeligt til denne integration.
- Nye buske, bakke-/græsbilleder, bonusglæde, skadereaktion og
  løbe-/balanceposer er stadig kommende grafikarbejde.
- Ændringerne ligger lokalt. Ingen Git-branch, PR eller Render-udgivelse er
  oprettet. Der er fortsat ingen fælles rangliste eller konkurrenceserver.

Tidligere rapport: [forgrund, hoppeborg og sponsorbilleder](reference/GRAFIK-4-TESTRESULTATER.md).
