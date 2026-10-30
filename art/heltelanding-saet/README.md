# Superheltens landingsposer

28. oktober 2026. Nye poser til begge figurer i det sidste sekund af
superhelteflyvningen. Knæene kommer frem, benene sænkes fremad og ned,
og fødderne gøres klar til kontakt. Flyvetid, bevægelse og landing i Core
bevares; dette sæt ændrer kun billedvisningen.

## Filer og produktion

| Master | Mål og format | Bytes | Neutralens højde |
| --- | --- | ---: | ---: |
| [dreng-landing.png](dreng-landing.png) | 1254 × 1254, RGBA | 1.022.081 | 541 |
| [pige-landing.png](pige-landing.png) | 1254 × 1254, RGBA | 1.307.464 | 570 |

Begge har reel alpha 0–255. De er lavet i to separate kald til indbygget
imagegen og kopieret uændret fra værktøjets output. Ingen CLI/API-fallback,
maskering, beskæring eller omskalering af masterfilerne. De eksisterende
superhelteark og den godkendte stilprøve er referencer sammen med en
teknisk [poseguide](poseguide.png). [Fuld prompttekst og kildefilnavne](PROMPTS.md).

SHA-256:

```text
104b6b69df3c7eab5c5d605a2bd02b306171fb32d2f9dc2354ea1d8a19bbe242  dreng-landing.png
5e9a83e753e341748d50ff56e16017454234fbe5ad9ea29b591467de23596438  pige-landing.png
```

Kilder: `exec-51f07b91-22c7-403a-8955-97d82ee9856c.png` og
`exec-1ccdbe8e-bd4d-4d36-a989-ce14b6552af6.png`.
De to PNG-filer fylder samlet 2.329.545 bytes og er endnu ikke optimeret
for langsomme mobilforbindelser. Poseguiden indlæses ikke af spillet.

## Billedområder og skala

Pose 0 er stående kalibrering. Pose 1 bremser med knæene fremme, pose 2 fører
benene frem og ned, og pose 3 har fødderne nedenunder og bløde knæ.
Alle vender mod højre og har den samme lilla/guld-kappe, stjerne og
oprindelige tøjfarver som flyvefigurerne.

Lange kapper går ud over en almindelig 2×2-cellegrænse. Derfor bruges
målte, uafhængige områder i HERO_LANDING_SHEETS, ligesom for flyvearkene.
Højre og bund er eksklusive. Ankre er globale koordinater i masteren:
manuelt målt hofte-x og den synlige alpha-bund ved alpha≥64.

| Figur / pose | Område: venstre, top, højre, bund | Anker: x,y |
| --- | --- | --- |
| Dreng 0 | 0,0,540,640 | 342,619 |
| Dreng 1 | 550,0,1254,640 | 1018,582 |
| Dreng 2 | 0,650,650,1254 | 419,1167 |
| Dreng 3 | 680,650,1254,1254 | 1010,1199 |
| Pige 0 | 0,0,550,640 | 341,628 |
| Pige 1 | 565,0,1254,640 | 1006,563 |
| Pige 2 | 0,640,690,1254 | 442,1198 |
| Pige 3 | 700,640,1254,1254 | 1035,1220 |

Indlæseren genbruger den eksisterende analyse af alpha i hvert område.
Én fælles skala, 70/541 eller 70/570, bruges gennem hele arket og ens i
begge retninger. En siddende positur bliver lavere på grund af stillingen;
figuren skaleres ikke individuelt for at fylde en 70-enheders ramme.

## Tid og kontakt

| FlightTicks tilbage | Tid tilbage | Billede |
| --- | --- | --- |
| 840–121 | Mere end 1 sek. | Eksisterende vandret flyveanimation |
| 120–91 | 1,00–0,76 sek. | Pose 1, knæ frem |
| 90–49 | 0,75–0,41 sek. | Pose2, ben frem/ned |
| 48–1 | 0,40–0,01 sek. | Pose3, fødder klar |
| 0 | Kontakt | Eksisterende almindelig landingsgrafik |

Den første pose begynder 20 spilenheder over fysikkens fodpunkt, tæt på
den vandrette flyveposes synlige sko. Offset føres lineært til 0 gennem
første fase. De næste poser bruger fysikkens fodpunkt direkte, så den
sidste synlige skobund rammer kontaktfladen. Offset flytter kun billedet.
Det faktiske fald og den sikre landing kommer stadig fra Core.

Pause fryser fasen. Reduceret bevægelse bruger kun den rolige pose 3 i
sidste sekund, uden offset. Et manglende eller ugyldigt landingsark bruger
det gamle flyveark frem til kontakt; et helt råt billedark vises aldrig.
Efter udløb genoptages den eksisterende beskyttelse med blink og omrids.

## Kontrol

[146 automatiske tests består](../../TESTRESULTATER-RUNNER.md), inklusive
faktisk Core-opsamling og alle 840 flyvetrin, fasegrænser, fælles skala,
fodkontakt, pause, reduceret bevægelse og billedfallback. En parallel
simulation uden tegning forbliver identisk med den tegnede simulation.
Lageret ændres ikke af animationen.

Begge figurer er set i 13 browsertrin ved 1280 × 720 fra 1,2 sekunder før kontakt
til kontakt på en reel pude. Den isolerede prøve bruger den aktuelle
renderer og faktisk Core, syntetiske profiler og et inaktivt prøvelager.
En afsluttet prøverunde gav nul skrivninger og bevarede virkelige data
byte for byte. Den midlertidige HTML-side er fjernet efter kontrollen.

- [Browserbillede](browserproeve.png).
- [Tre poser og kontakt](sekvenskontrol.png).
- [Animationsprøve](landing.gif), beskåret fra de gemte browserbilleder,
  100 ms pr. trin. Sidste billede viser den eksisterende beskyttelsesblinkning.

Prøven er en grafikgennemgang, ikke en fuld menneskelig spiltest. Fysiske
telefoner og ægte berøringsinput er stadig ikke afprøvet i denne levering.
