# Testresultater — Hop og Rul, fysikversion 2
Dato: 16. september 2026.

## Automatiske tests

62 af 62 tests består: 23 for spillets fysik, 11 for browseradapteren
og 28 regressionstests for den bevarede Hoppeborg Challenge.

Kørt fra projektroden: node --test game/tests/*.test.cjs

Fysikken testes direkte i runner-core.js. Browseradapteren i runner.js
afvikles i en testproces med efterlignet DOM, canvas, lyd og lagring.
Disse tests verificerer adfærd, ikke udseendet af de endelige billeder.

Kontrollerne omfatter:
- Gentagen sammenpresning og afsæt ved hver landing på samme hoppepude.
- Hårdere landinger giver mere energi; et frisk tryk før landing giver boost.
- Sammenhængende hastighed gennem afsæt, opstigning, toppunkt og fald.
  Slip af knappen ændrer acceleration uden at afkorte hastigheden brat.
- Fødder følger flader/slisker; kompression giver samme kontaktpunkt i fysikken.
- Stejle slisker øger farten, og fartoverskuddet bevares ud på flad grund.
- Særskilte tilstande for løb, opstigning, fald, kompression, rul og glidning.
- Kameraet holder hele figuren synlig uden at ændre springets hastighed.
- Tre liv, AV!, nulstilling af combo/kraft, nedadgående bevægelse ved skade,
  usårlighed og redning uden dobbeltskade eller gratis overlevelsestid.
- Blink veksler mellem synlig og delvist gennemsigtig figur; den forsvinder
  ikke helt. Glidende figur beholder lav pose, også mens skadesreaktionen er aktiv.
- Identisk simulation ved 30/60/120/144 billeder pr. sekund, korte input mellem
  billeder, pause, fokus, rotation og genstart.
- Gamle navne/figurer genbruges; upgrades giver ingen fordele.
- Fysikversion 2 får egne rekorder. Gamle gemte data forbliver uændrede,
  herunder første runners profiler, rekorder, valg og lydindstilling.
- Bedste resultat pr. profil genindlæses korrekt, og dobbelt afslutning ignoreres.

En kontrolspiller med præcis viden om geometri og begrænset planlægning
vælger almindelige hop-/rul-input. Den gennemfører 220 sekunder fra startfart
og 60 sekunder fra maksimal grundfart med alle tre liv og uden redninger.
Begge forløb omfatter de høje platforme og stejle slisker.
Det beviser en mulig rute; det beviser ikke, at timingen er let eller sjov for børn.

## Afprøvet i browser

Den faktiske lokale side på http://127.0.0.1:8765/ blev genindlæst:
- Den eksisterende Testpige-profil blev bevaret med en ny rekord på nul.
- Automatisk afsæt på første pude blev observeret uden hop-input.
- Forløb uden styring sluttede efter tredje mistede liv med 16,5 sekunder.
- Menuflow og nye instruktioner blev kontrolleret.
- Ingen JavaScript-fejl blev fundet i browserloggen.

Til præcis visuel kontrol blev en midlertidig testside genereret fra den
aktuelle renderer og den samme simulation. Den fastholdt en rigtig
sliskeposition og et rigtigt fald, så kontaktpunktet kunne undersøges.
- Sliske/figur blev kontrolleret ved desktopvisning og 844 × 390.
- En afstand mellem glidefigurens fødder og slisken blev fundet og rettet.
- Faldposen, udsynet og knapperne blev kontrolleret i liggende mobilvisning.
- Testsiden ændrede ikke gemte data og er fjernet efter kontrollen.

Tidligere browserkontroller af højformatpause, genoptagelse, 667 × 375 og
lagring efter genindlæsning er dokumenteret i
reference/PROTOTYPE-1-TESTRESULTATER.md. De er ikke alle gentaget manuelt
i denne fysikomgang; automatiske regressionskontroller består fortsat.

## Det der mangler

- Afprøvning af springtiming, gentagne afsæt og fart med børn på 6–12 år.
- Fysiske telefoner, Safari/Chrome og ægte flerfingerbetjening.
- Lydens oplevede kvalitet på en fysisk enhed.
- Færdige løbe-, afsæts-, fald-, glide- og rulleanimationer. Den nuværende
  visning bruger eksisterende billeder og midlertidig rotation.
- Træer, oppustelige puder og øvrig samlet grafikopdatering:
  se GRAFIKOPGAVER.md.
- Fælles rangliste, deltagerkoder, servervalidering, Render, SQLite,
  backup/gendannelse og belastningstest.

Dette er stadig lokalt øvespil, ikke den officielle præmiekonkurrence.
