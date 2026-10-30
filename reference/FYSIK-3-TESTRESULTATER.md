# Testresultater — Hop og Rul, fysikversion 3
Dato: 16. september 2026.

## Automatiske tests

75 af 75 tests består: 32 for spillets fysik, 15 for browseradapteren
og 28 regressionstests for den bevarede Hoppeborg Challenge.

Kørt fra projektroden: node --test game/tests/*.test.cjs

Fysikken testes direkte i runner-core.js. Browseradapteren i runner.js
køres med efterlignet DOM, canvas, lyd og lagring. De kontrollerer adfærd;
flerfingerinput her er simuleret og er ikke en test af en fysisk telefon.

Kontrollerne omfatter:
- Alle genererede flader er hoppepuder eller slisker, også startfladen.
  Puder sammenpresses og fjedrer ved hver landing, og projektiler spawner stadig.
- Venstre/højre virker på jorden og i luften med glidende acceleration
  og opbremsning. Banen fortsætter ved begge retninger; figuren holdes
  inden for skærmen. Modsatte input ophæver hinanden.
- Perfekt timing fra 100 ms før til 50 ms efter en virkelig landing.
  Ét frisk tryk vurderes pr. landing; tidlige tryk kan ikke erstattes med spam,
  og en holdt HOP-knap giver ikke gentagne perfekte hop.
- Perfekte landinger bygger hoppekraft til fem trin. En brudt serie
  nulstiller combo og sænker kraften; skade nulstiller begge dele.
- Fem perfekte i træk giver præcis 100 bonuspoint; ti giver præcis 200.
  Det samlede pointtal er hele tidspoint plus optjente bonusser.
- Fødder følger flader og stejle slisker. Fart følger med ud af slisken.
  Rul er kortvarigt, virker i luften og udsætter pudens afsæt ved jordkontakt.
- Kameraet bevarer springets bevægelse og holder hele figuren synlig.
- Tre liv, én skade ved samtidige træf, AV!, nulstilling af kraft og momentum,
  straks nedadgående bevægelse, usårlighed og redning uden gratis point.
- Særskilte bevægelsestilstande og blink med vedvarende synlig silhuet.
- Samme simulation ved 30/60/120/144 billeder pr. sekund, inklusive sideinput.
- Korte tryk mellem billeder, flere taster til samme retning, store/små
  bogstaver, samtidig touchstyring og hop, pointercancel og lostpointercapture.
- Alle fire kontroller slipper ved fokus-/faneskift, pause og genstart.
  Rotation pauser, og genoptagelse nulstiller ophobede tidstrin/input.
- Navne/figurer genbruges. Fysikversion 3 får egne pointrekorder;
  v2, v1 og gamle køb/rekorder ændres ikke. V2 prioriteres ved migration.
- Højeste pointtal bestemmer rekorden, også når turen er kortere.
  Tid tilhører samme vindende tur, point genindlæses, og afslutning gemmes én gang.
- HUD viser point, perfekt-serie, kraft og timing samt nulstilling ved skade.

En kontrolspiller med præcis viden om geometri og begrænset planlægning
vælger almindelige hop-/rul-input. Den gennemfører 220 sekunder fra startfart
og 60 sekunder fra maksimal grundfart med alle tre liv og uden redninger.
Det beviser en mulig rute gennem høje puder og slisker. Det beviser ikke,
at timingen og styringen er let eller sjov for børn.

## Afprøvet i browser

Den faktiske lokale side på http://127.0.0.1:8765/ blev genindlæst:
- Testpige-profilen blev bevaret, og menuen viser den nye styring og scoring.
- Automatiske afsæt og det nye informationsfelt blev observeret på desktop.
- En tur uden input sluttede efter tredje mistede liv: 14,0 sekunder,
  140 point og ingen bonus. Resultatsiden viste den korrekte opdeling.
- Ranglisten viste 140 point; samme rekord blev bevaret efter genindlæsning.
- Rotation fra bredformat til 390 × 844 viste pause med besked om at vende
  telefonen. Ved 844 × 390 kunne turen genoptages, og tid/point fortsatte.
- Ingen JavaScript-fejl eller advarsler blev fundet i browserloggen.

En midlertidig visuel testside brugte den aktuelle renderer og den samme
simulation med en ekstra lang, ufarlig testpude. Rigtige timing-input byggede
fire/fem perfekte hop og flyttede figuren til den højre skærmgrænse.
Scenerne blev fastholdt, så mobilvisningen kunne undersøges præcist:
- 844 × 390: fem perfekte, fuld hoppekraft, +100-bonus og pointtal.
- 667 × 375: fire perfekte og grøn HOP-knap med teksten HOP NU! før landing.
- Fire knapper, informationsfelter og figur var inden for billedet uden overlap.
- Testsiden gemte ingen resultater og er fjernet efter kontrollen.
Dette var visuel kontrol af kontrollerede scener, ikke en håndspillet
perfektserie gennem den normale bane.

Tidligere visuel kontrol af sliske, faldpose og billeder er dokumenteret i
reference/FYSIK-2-TESTRESULTATER.md og reference/PROTOTYPE-1-TESTRESULTATER.md.
Sliskeposens udseende er ikke gentestet manuelt i denne omgang;
automatiske regressionskontroller består.

## Det der mangler

- Afprøvning med børn på 6–12 år: sidekontrol, timingvinduet, opbygget
  hoppekraft, bonusstørrelse og banens stigende fart.
- Fysiske telefoner, Safari/Chrome og ægte flerfingerbetjening, inklusive
  skærmudskæringer og browserbjælker. Lyd på fysiske enheder.
- Færdige løbe-, afsæts-, fald-, glide- og rulleanimationer samt puder,
  træer og øvrig grafik: se GRAFIKOPGAVER.md.
- Fælles rangliste, deltagerkoder, servervalidering, Render, SQLite,
  backup/gendannelse og belastningstest.

Dette er stadig lokalt øvespil, ikke den officielle præmiekonkurrence.
