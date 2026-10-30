# Testresultater — superheltens landingsanimation

28. oktober 2026. Lokal prototype. Der er tilføjet tre landingsposer til
begge figurer i det sidste sekund af superhelteflyvningen.

## Udgangspunkt og afgrænsning

I starten af arrangørens vedhæftede skærmoptagelse bliver den vandrette
flyvepose ved frem til kontakt og skifter derefter direkte til normal
landing. De første tre sekunder af optagelsen er udtrukket i trin på
0,1 sekund; selve den viste overgang ligger i begyndelsen.

Ændringen viser knæ frem, ben frem/ned og fødder klar. Den eksisterende
nedflyvning og sikre landing bruges fortsat. Core, Art, de syv sekunder,
point, input, profiler, lokale rekorder, sponsorer og det tidligere spil
bevares uændret. Der er ingen nye fysiske regler eller landingsbonus.

Udgangspunktet er gemt med SHA-256-manifest i
`/private/tmp/aulum-heltelanding-20261028-before/game`. Alle 143 tests bestod
før ændringerne. Der findes ingen Git i projektet. Den tidligere samlede
rapport er arkiveret byte-identisk i
[reference/GRAFIK-9-TESTRESULTATER.md](reference/GRAFIK-9-TESTRESULTATER.md).

## Ændring og billeder

- Nye landingsark i [heltelanding-saet](art/heltelanding-saet/README.md).
- Den eksisterende strenge alpha-/regionindlæser genbruges med nye målte
  områder og hofte-/fodankre. Hvert ark bruger én neutral kalibrering på 70
  spilenheder; alle poser skaleres ens i begge retninger.
- Ved 120–91 flightTicks tilbage bruges pose 1, 90–49 pose 2 og 48–1 pose 3.
  Pose 1 begynder 20 spilenheder over fysikkens fodpunkt, tæt på den gamle
  flyveposes synlige sko, og billedoffset går mod0 i første fase.
  Pose2/3 følger fodpunktet direkte. Ved 0 genoptages normal landingsgrafik.
- Reduceret bevægelse bruger kun den rolige pose 3 i sidste sekund.
  Manglende eller ugyldigt nyt ark bruger den eksisterende flyvegrafik.
- Forsidens runner-script er versionsmærket `?v=heltelanding-1`.

Begge nye RGBA-masters er fremstillet med indbygget imagegen og kopieret
uændret. De har reel alpha 0–255. Filer, kildeoplysninger, prompts,
SHA-256 og ankertabeller er gemt i sættets README. Oprindelige billedfiler
er bevaret. De to nye billeder fylder samlet cirka 2,33 MB og er ikke
optimeret til langsomme mobilforbindelser.

## Automatiske kontroller

**146 af 146 tests består. 0 fejlede, 0 oversprungne.**

Kørt med Node v24.22.1:

```text
node --test game/tests/*.test.cjs
```

Samlet output: `/private/tmp/aulum-heltelanding-final-tests.txt`.
Tre nye kontroller bruger den allerede aftalte browseradaptergrænse:

1. Faktisk powerup-opsamling og alle 840 Core-trin for begge figurer.
   Observerer gamle flyvebilleder før sidste sekund, nye fasekilder ved
   120/91/90/49/48/1, visuelt offset, kamera, fælles skala og fodkontakt.
   En parallel simulation uden tegning forbliver identisk; liv, serie,
   hoppekraft, bonuspoint og lager ændres ikke af tegningen.
2. Indlæsning gennem den faktiske region-/alphaindlæser med syntetiske
   billeddata ved de målte ankre. Fire adskilte rammer, fælles neutral skala
   og ensartet kontakt i alle tre landingsposer.
3. Reduceret bevægelse, manglende ark og ugyldige 100 × 100-ark for begge
   avatarer. Der bruges en rolig pose eller den gamle flyvegrafik;
   et helt råt billedark bliver aldrig vist som én figur.

Den første regression blev skrevet før produktionsændringen og kørt rød:
“dreng shows the landing artwork with 120 flight ticks left”. Den består
nu med den samme navngivne test:

- `/private/tmp/aulum-heltelanding-phase-red.txt`: 0/1 bestået.
- `/private/tmp/aulum-heltelanding-phase-green.txt`: 1/1 bestået.
- `/private/tmp/aulum-heltelanding-support-tests.txt`: 3/3 målrettede tests.

De to øvrige kontroller er supplerende efter den første grønne test;
der hævdes ikke et separat rød/grønt forløb for dem. Automatiske tests
fastholder tid, kildevalg og placering; den kunstneriske bevægelse skal
også vurderes visuelt.

## Browserkontrol

Begge figurer er kontrolleret i den indbyggede browser ved 1280 × 720.
Tretten gemte trin pr. figur følger de sidste 1,2 sekunder frem til
kontakt, med faktisk Core-opsamling og nedflyvning. Alle tre nye poser er
synlige: knæene kommer frem, benene sænkes, og fødderne rammer puden.
Kropsskala og retning mod højre er stabile i spilstørrelse.

Prøven bruger en kontrolleret opsamling på den reelle startpude ved x=1200
og lander på section-7. Det giver frit udsyn til billederne uden at ændre
trælaget eller den rigtige bane. En tidligere prøvestrækning havde et
forgrundstræ foran midterposen; den er ikke brugt som visuel godkendelse.

HUD viser uændrede liv/serie/hoppekraft og nedtælling. Ved udløb bliver
HOP aktiv igen, og den eksisterende beskyttelse med blink og omrids vises.
Ingen fejl eller advarsler blev registreret i prøvens browserlog.

Prøven er isoleret med syntetiske profiler og et inaktivt prøvelager.
En afsluttet prøverunde gav nul skrivninger og bevarede virkelige data
byte for byte. Kontrollør: `/private/tmp/aulum-landing-isolation.cjs`.
Den midlertidige HTML-prøve er fjernet efter kontrollen.

- [Browserbillede](art/heltelanding-saet/browserproeve.png).
- [Poser og fodkontakt](art/heltelanding-saet/sekvenskontrol.png).
- [Animationsprøve](art/heltelanding-saet/landing.gif), sammensat af de gemte
  browserbilleder med100 ms pr. trin. Sidste billede viser normal blinkning.

## To uafhængige reviewakser

**Standards: 0 fund.** Snapshotdiff, genbrug af indlæser, testkvalitet,
alpha, billedområder og fodankre er gennemgået. Begge masters matcher
værktøjets valgte output byte for byte; alle otte områder har fri margen,
og anker-y svarer til den synlige alpha-bund. Reviewer genkørte hele
samlingen: 146/146 bestået. Log:
`/private/tmp/aulum-heltelanding-standards-tests.txt`.

**Spec: 0 fund.** Reviewer gennemgik alle 13 rene browsertrin for begge
figurer, fandt tydelig progression frem/ned til fodkontakt og genkørte de
tre nye tests: 3/3 bestået. Ingen manglende krav eller utilsigtet scope.
Log: `/private/tmp/aulum-heltelanding-spec-tests.txt`.

Begge akser bekræftede Core/Art/sponsor/ældre spil uændret byte for byte.

## Begrænsninger og leveringsstatus

- Browserprøven er en kontrol af landingsgrafik, ikke en menneskelig fuld
  spilrunde. Fysiske telefoner og ægte berøringsinput er ikke afprøvet.
- Nye billedfiler er endnu ikke optimeret til langsomt net.
- Ændringerne ligger lokalt. Ingen Git-branch, PR eller Render-udgivelse
  er oprettet. Der er fortsat ingen fælles konkurrenceserver.
