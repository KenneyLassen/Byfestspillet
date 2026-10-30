# Testresultater — første grafikpakke på fysikversion 4

Dato: 16. september 2026.

## Ændring

To nye 3 × 3 figurark giver ni højrevendte poser til hver figur: neutral,
afsæt, opstigning, fald og landing. Én ny gul/orange pude med turkis bund
tegnes som gentagne udsnit og rækker på banens flade platforme.

Visningen vælger billeder ud fra eksisterende fysik. Den bruger fælles
kropsskala gennem hver figurs poser og lægger skoenes underkant ved det
fysiske fodpunkt. Pudens overkant følger sammenpresningen. Nye billeder
indlæses én gang; ved fejl bruges de tidligere billeder/tegnede puder.

Runner-core.js og spilreglerne er uændrede i denne grafikopgave. Kontroller,
timing, kollisionsfelter, bonus, skade, lagringsversion og v4-rekorder er bevaret.
Den tidligere testrapport er arkiveret i
[reference/FYSIK-4-TESTRESULTATER.md](reference/FYSIK-4-TESTRESULTATER.md).

## Automatiske tests

**88 af 88 tests består; ingen fejlede eller oversprungne.**

Kørt med Node v24 fra projektroden: `node --test game/tests/*.test.cjs`.

| Område | Antal |
| --- | ---: |
| Fysikversion 4 | 31 |
| Browseradapter, input, gemte data og integration af grafik | 20 |
| Billedmaskering, posevalg og placering | 9 |
| Regression for den bevarede Hoppeborg Challenge | 28 |

Nye kontroller omfatter:

- Hele hoppets poseforløb følger den faktiske simulation uden at ændre den.
- Skade, afsæt og kanten af platforme får forventede billedvalg.
- 3 × 3 celler findes også ved billedmål, der ikke går op i tre.
- Hver figur bruger fælles skala; bøjede poser bliver ikke forstørret til
  neutralposens højde. Fodpunktet holder ved flytning og sammenpresning.
- Baggrundsmaskering fjerner kantforbundet neutralt mønster og bevarer
  indrammede hvide sko/øjne. Ægte alpha-data forbliver uændrede.
- Begge figurers forberedte ark tegnes som ét udsnit med korrekt fodanker.
- Tomme/uegnede ark udløser reservegrafik og indlæsningsbesked.
- Lange, høje og sammenpressede puder bruger ens x/y-skala. Alle udsnit
  holder sig inden for det endelige kildeudsnit (180, 190, 1810, 339).
- Tegning ændrer hverken simulationen eller v4-lagring.

Eksisterende regressionskontroller består fortsat: tre kontroller uden RUL,
automatisk afsæt, perfekt timing og fem-hop-bonus, sidekontrol, kamera og
skærmgrænser, sliskefart, AV!/straksfald/tab af kraft, usårlighed, pause,
rotation/fokustab, korte tryk, samtidig simuleret touchstyring/hop, ens
simulation ved forskellige billedhastigheder samt profil-/rekordbevarelse.
Kontrolspillerens rute uden skade/redning består også: 220 sekunder fra
startfart og 60 sekunder fra maksimal grundfart.

Browseradapterens automatiske tests bruger efterlignet DOM, canvas, lyd
og lagring. De erstatter ikke visuel kontrol eller afprøvning på en telefon.

## Visuelt afprøvet i browser denne omgang

- Alle ni poser for hver figur vist i et midlertidigt galleri med den
  faktiske renderer. Retning, skala, hvide sko/øjne og fravær af synlige
  baggrundstern blev kontrolleret.
- Lange og høje puder samt sammenpresning set i en midlertidig prøve med
  den faktiske terrænrenderer. Ender og gentagelser blev tilpasset efter
  denne kontrol. Ingen vandret udstrækning af teksturen.
- Landing i dyb sammenpresning kørt frem med den faktiske simulation og
  vist statisk: pige ved 667 × 375, dreng i computervisning. Skoene ligger
  på pudens synlige top.
- Den almindelige side genindlæst. Den eksisterende Testpige-profil var
  bevaret. En rigtig tur blev startet ved 667 × 375: ny figur i bevægelse,
  automatisk hop, tre synlige spilkontroller og nye puder.
- Browserloggen viste ingen JavaScript-fejl eller advarsler under kontrollen.
- Midlertidig testside fjernet efter kontrollen; browseren efterladt på
  den almindelige spilside med normal skærmstørrelse.

Galleriet og landingsprøverne var kontrollerede visninger, ikke komplette
spilgennemløb. Bonus, rotation og rekordflow er ikke alle gentaget manuelt
denne omgang; de er dækket af de automatiske regressionstests og tidligere
testrapporter.

## Kendte begrænsninger og næste opgaver

- Figur-masterfilerne er RGB med en tegnet ternet baggrund trods flere
  imagegen-forsøg på alpha. Spillet maskerer dem til gennemsigtighed ved
  indlæsning. De er ikke selvstændige transparente PNG-filer til andre
  programmer. Alle 18 poser er kontrolleret uden synlige tern i browseren.
  Puden har reel alpha. Se [billeddokumentation](art/foerste-saet/README.md).
- Sliskeposen er fortsat det gamle roterede ståbillede. Siddende glidning
  i korrekt størrelse, sliskens nye grafik, løb/balance, bonusglæde, skade,
  omgivelser og farer er næste grafikopgaver.
- Nye PNG-filer fylder samlet cirka 5 MB; filstørrelser og indlæsning på
  langsomme mobilforbindelser skal optimeres og måles før offentlig udgivelse.
- Fysiske telefoner, ægte flerfingerinput, Safari/Chrome, lyd, skærmudskæringer
  og spiltest med børn på 6–12 år mangler fortsat.
- Fælles rangliste, deltagerkoder, servervalidering, Render, SQLite,
  backup/gendannelse og belastningstest er endnu ikke lavet.

Dette er fortsat lokalt øvespil. Der er ikke udgivet noget online.
