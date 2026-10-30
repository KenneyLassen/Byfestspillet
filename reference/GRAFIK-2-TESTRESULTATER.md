# Testresultater — sliske og siddende glideposer

Dato: 27. oktober 2026. Fysikversion 4.

## Leveret

- Ny koral/orange glideflade med turkis kant og understøtning i pudemateriale.
- Tre siddende poser pr. figur: indgang, glid og udgang. Begge vender mod højre.
- Stående kalibreringsbillede på hvert nyt ark sikrer fælles kropsskala gennem
  alle poser. Sædeanker følger den synlige sliskekant. Ingen tilpasning til det
  lave kollisionsfelts højde og ingen stræk af figurer eller slisketekstur.
- Posevalg følger faktisk fremdrift; hop, pudelanding og skade skifter straks
  tilbage til den relevante hoppepose.
- Usårlighed bevarer blinket; omridset omfatter nu hele den siddende billedramme.
- Alle tre nye masterfiler har reel alpha og er kopieret uændret fra imagegen.

Fysik, kollisionsfelter, scoring, kontroller, lagring og rekordversion er bevaret.
Runner-core.js er byte for byte identisk med udgangspunktet.
[Billedfiler, prompts og kontaktankre](art/sliske-saet/README.md).

## Udgangspunkt og metode

Mappen har ingen Git-historik. Før ændringerne blev de 38 eksisterende filer
under game kopieret til /private/tmp/aulum-sliske-20261027-before, og deres
SHA-256-værdier registreret. De daværende 88 tests bestod.

Testgrænserne er genbrugt fra projektet: RunnerArt-grænsefladen til billeddata
og placering samt den eksisterende browseradapter mod canvas/DOM/lagring.
TDD-skillen blev læst sammen med dens test- og mockingreferencer.

Fem relevante røde tests blev observeret før deres minimale implementering:

1. Fire siddende/kalibreringsposer blev fortolket som ni; forventning4, faktisk9.
2. Canvas brugte ikke den siddende figur ved indgang, glid og udgang.
3. Ens cellegrænser beskår udstrakte sko og blandede naboposer.
4. Den nye slisketekstur blev ikke tegnet på de genererede hældninger.
5. Markeringen ved usårlighed fulgte ikke hele den siddende figur.

Hver blev derefter kørt grøn. En yderligere integrationstest kontrollerer det
samlede forløb gennem den faktiske sliskefysik og tilbage til hoppeposer.
To ældre forventninger til det roterede ståbilledes vinkel blev opdateret til
siddende grafiks lokale hældning; blink- og skadeforventninger blev bevaret.

## Automatiske kontroller

**94 af 94 tests består. 0 fejlede, 0 oversprungne.**

Kørt med Node v24.22.1: `node --test game/tests/*.test.cjs`.

| Område | Antal |
| --- | ---: |
| Uændret fysikversion 4 | 31 |
| Browseradapter, input, gemte data og grafik | 24 |
| Billedmaskering, posevalg og placering | 11 |
| Bevaret Hoppeborg Challenge | 28 |

Nye kontroller dækker begge figurers skala og sædeanker i alle tre poser,
uregelmæssige kildeceller, markeringsstørrelse og blink, og teksturens ens
x/y-skala på alle tre aktuelle slisker: bredde 185/fald 160, bredde 235/fald 215
og bredde 240/fald 225. Billedvalg og tegning ændrer hverken turen eller gemte data.
En faktisk simulation når indgang/glid/udgang, pudelanding, opstigning og fald;
skade forlader den siddende tilstand.

Tidligere regressionskontroller består fortsat: timing, momentum, bonus,
sidekontrol, skærmgrænser, AV!/straksfald, tre liv, usårlighed, pause,
rotation/fokustab, input ved forskellige billedhastigheder, profiler og rekorder.
Kontrolspillerens mulige rute gennem banen består stadig.

De automatiske adaptertests bruger efterlignet DOM, canvas, lyd og lagring.
De tester adfærd og billedgeometri, ikke selve tegningernes æstetik.

## Browser og billedkontrol

- Alle seks nye siddende poser blev vist sammen med de almindelige stående
  figurer i en midlertidig grafikprøve med den faktiske renderer.
  Højrevendt retning, intakte hænder/sko, gennemsigtighed og kropsskala blev set.
- Den nye sliske, kontaktpunkt, understøtning og sammenføjninger blev set i
  computervisning og 667 × 375 mobilbredformat. Indgang og udgang blev set.
- Kontrolleret afspilning fra begyndelsen af slisken med rigtig fysik viste
  glidning, efterfølgende pudelandinger og tilbagevenden til hoppeposer.
  Det var en isoleret prøvetur, ikke en hel tur fra spillets startmenu.
- Den nye markering ved usårlighed blev visuelt kontrolleret efter rettelsen.
- Alle billeder blev indlæst uden reservegrafikbesked. Browserloggen viste
  ingen JavaScript-fejl eller advarsler under kontrollen.
- Pixeldata blev kun aflæst, ikke redigeret. Kildekopiernes SHA-256 matcher
  imagegens masterfiler. Alle tre nye billeder har reel RGBA-gennemsigtighed.
- Roterede billedrammer blev beregnet for begge figurer, alle tre poser og
  alle aktuelle sliskehældninger. De rækker højst ca. 34 enheder bagud,
  61 frem, 66 op og 28 ned fra sædet og holder sig inden for skærmen med
  de eksisterende grænser.
- Den normale side genindlæses til aflevering. Den midlertidige testside
  fjernes, og skærmstørrelsen sættes tilbage til normal.

[Gemte forhåndsvisning](art/sliske-saet/forhaandsvisning.png) er en kontrolleret
sammenligning med en ekstra stående figur. Almindeligt spil har én figur.

## Fejl i den midlertidige grafikprøve — rettet og data gendannet

Den afspillede prøve brugte et isoleret dataobjekt, men havde ved en fejl
bevaret spillets rigtige lagernøgle. Da prøveturen sluttede, overskrev den
v4-lageret med sin egen testprofil. Det blev opdaget ved den afsluttende
kontrol af startsidens profilnavn. Diagnosing-bugs-skillen blev læst.

Den oprindelige v4-værdi kunne gendannes præcist fra browserlagerets
bevarede tidligere post, aflæst uden at ændre lagerfilerne. Gendannelsen
blev udført gennem en midlertidig lokal knap med kontrol af, at den aktuelle
værdi stadig var netop grafikprøvens testprofil. Den gendannede tekst blev
sammenlignet med originalen og var identisk. Begge profiler, rekorder,
spilantal, valgt spiller og lydvalg er dermed tilbage. Startsiden viste igen
Testpige, og rekordlisten viste den oprindelige rekord på 140 point.

En separat hurtig kontrol med den faktiske prøvekode og browseradapterens
efterlignede lager reproducerede overskrivningen. Efter skift til prøvens
egen nøgle aulumSlidePreview_20261027 bestod kontrollen: afslutning af turen
bevarede den almindelige lagring byte for byte og skrev kun til prøvenøglen.
Dette er én ekstra rød/grøn kontrol ud over de 94 vedvarende tests. Den direkte
lagernøglekollision var reproduceret, så ingen bred fejlsøgning eller ændring
af spillets produktionslagring var nødvendig. Prøve- og gendannelsessiderne
er fjernet fra projektet efter kontrollen. README beskriver isolationskravet.

## Review

Code-review-skillen blev læst. Uden Git blev samme gemte udgangspunkt brugt
for to uafhængige underagenters review af standarder og krav.

- Standarder: ingen regelbrud; én valgfri bemærkning om lidt gentaget kode
  ved puders/sliskers endestykker. Ingen bred refaktorering var nødvendig.
- Krav: én mindre fejl i markeringen ved usårlighed blev fundet, rettet med
  rød/grøn test og efterkontrolleret. Ingen udestående kravfund.

Der blev ikke brugt en issue-tracker; brugerens konkrete bestilling,
GRAFIKOPGAVER.md og den godkendte stilprøve var kravgrundlaget.

## Mangler og leveringsstatus

- Fysiske telefoner, ægte flerfingerinput, Safari/Chrome på enheder, lyd og
  skærmudskæringer samt afprøvning med børn er ikke gentaget/verificeret her.
- Glidningen er tre fysiske stadier, ikke en lang sekvens af tegnede mellemposer.
  Separate for-/bagkanter på slisken er endnu ikke nødvendige i sidevisningen.
- Løb/balance, bonusglæde, skadereaktion, omgivelser og farer mangler fortsat
  opdatering til den godkendte stil. Se GRAFIKOPGAVER.md.
- De nye masters fylder cirka 2,6 MB tilsammen; indlæsning på en langsom
  mobilforbindelse er endnu ikke målt.
- Ændringerne ligger lokalt i projektets filer. Ingen Git-branch eller PR,
  ingen udgivelse på Render og ingen fælles rangliste er oprettet.

Tidligere rapport: [første grafikpakke](reference/GRAFIK-1-TESTRESULTATER.md).
