# Testresultater — Hop og Rul, fysikversion 4
Dato: 16. september 2026.

## Ændring

RUL/duk-funktionen, animationstilstanden, tastaturgenvejene og knappen er
fjernet efter arrangørens valg. Kontrollerne er venstre, højre og HOP.
Automatisk glidning på slisker bevares. Banen, springtiming, hoppekraft,
bonusser og øvrige regler er ikke justeret i denne omgang.

Grafiklisten i GRAFIKOPGAVER.md er udvidet med retning, figurer, terræn,
baggrund, farer og effekter. Nye billeder er endnu ikke produceret:
figurerne bruger stadig de oprindelige billeder og en midlertidig glidepose.

## Automatiske tests

75 af 75 tests består: 31 for fysikken, 16 for browseradapteren og
28 regressionstests for den bevarede Hoppeborg Challenge.

Kørt fra projektroden: node --test game/tests/*.test.cjs

- Der er præcis tre spilkontroller i HTML: venstre, højre og HOP.
- Pil ned og S ændrer ikke simulationen. Gamle roll-input ignoreres også
  direkte af motoren, både på jord, pude og i luften. Der er ingen
  dukke-tilstand, reduceret kollisionsfigur eller udsat afsæt fra puder.
- Frisbee og pølse kan undviges med hop i de isolerede kollisionskontroller.
- Automatisk kompression/afsæt, perfekt timing, stigende hoppekraft og
  bonus for fem/ti perfekte hop består fortsat.
- Sidekontrol, skærmgrænser, kamera, stejle slisker og fart ud af slisker
  består fortsat. Skade giver AV!, tab af kraft/combo, straksfald og usårlighed.
- Samme simulation ved 30/60/120/144 billeder pr. sekund, korte tryk mellem
  billeder, samtidig touchstyring/hop, afbrudte tryk, pause, rotation og fokus.
- Nye v4-pointrekorder holdes adskilt fra v3. Navn, figur, valgt profil og
  lydvalg flyttes med; tidligere gemte data forbliver byte for byte uændrede.
  V3 prioriteres foran v2/v1 ved genbrug af profiler.
- Point inklusive bonus bestemmer rekorden; resultatet gemmes én gang
  med den tilhørende tid. Genindlæsning, lighed og dårligere forsøg er dækket.

En kontrolspiller med viden om banegeometri og begrænset planlægning
bruger alene hop-input. Uændret bane gennemføres i 220 sekunder fra
startfart og 60 sekunder fra maksimal grundfart uden skade eller redning.
Det viser, at der findes en rute uden RUL; det er ikke en test med børn.

Browseradapterens tests bruger efterlignet DOM, canvas, lyd og lagring.
Touchtesten er simuleret, ikke udført på en fysisk telefon.

## Afprøvet i browser denne omgang

Den lokale side på http://127.0.0.1:8765/ blev genindlæst.
- Testpige-profilen blev bevaret, og instruktionerne beskriver de tre
  kontroller og automatisk glidning.
- En tur blev startet ved 667 × 375. Puderne gav automatisk afsæt.
  Venstre/højre og HOP var synlige, og RUL-knappen var væk.
- HOP har fået mere bredde på den lille mobilvisning.
- Ingen JavaScript-fejl eller advarsler blev fundet i browserloggen.

Tidligere browserkontroller af bonus, timing, øvrige skærmstørrelser,
rotation og rekorder står i reference/FYSIK-3-TESTRESULTATER.md.
De er ikke alle gentaget manuelt i denne omgang; de automatiske
regressionskontroller er kørt på ny.

## Mangler fortsat

- Den nye grafik: fremadvendte figurer, rigtig størrelse på siddende
  glidepose, animationsbilleder, puder, slisker, omgivelser og farer.
  Den konkrete liste og rækkefølge står i GRAFIKOPGAVER.md.
- Afprøvning med børn på 6–12 år og på fysiske telefoner, inklusive ægte
  flerfingerinput, Safari/Chrome, lyd og skærmudskæringer.
- Fælles rangliste, deltagerkoder, servervalidering, Render, SQLite,
  backup/gendannelse og belastningstest.

Dette er fortsat lokalt øvespil. Der er ikke udgivet noget online.
