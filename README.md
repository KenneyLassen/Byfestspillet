# Aulum Byfest: Hop og Rul

Dette repository indeholder den aktuelle spilversion, som den 30. oktober
2026 erstatter den tidligere udgave på `main`. Kode, billeder, tests,
sponsoreditor og projektplan ligger i repositoryets rod. Den tidligere
Git-historik er bevaret.

Spillet består af statiske HTML-, CSS-, JavaScript- og billedfiler og har
ingen installation eller bygning af selve spillet. Det kan udgives som et
statisk website. Fælles profiler, officiel rangliste og resultatkontrol
på en server er stadig planlagt arbejde; den nuværende udgave gemmer lokalt
i spillerens browser.

Lokal sideruller med fjerde fysikudgave, hoppegrafik, siddende sliskeposer
og malet baggrund med træer, skyer, sol og flagline med rolig vindbevægelse.
Pølser og frisbees har nu egne billeder i samme godkendte stil.
Begge figurer har højrevendte løbe-/balancetrin ved jord- og pudekontakt,
nu med en roligere takt, der følger aktiv kontakttid. Den 28. oktober er
posesættet rettet efter video: tydeligere benpassager erstatter den
gentagne brede benstilling og den dybe sammenkrøbning.
Banen har nu også jordstrækninger til længere løb, og flaglinen hænger
på træstolper forankret i spilverdenen, så høje hop kan komme over den.
Enkelte høje træer i forgrunden skjuler kort figuren, og sponsorbilleder kan
lægges på pudernes forsider via en separat lokal editor.
Flere varslede pølser og frisbees samt en sjælden superhelte-powerup giver
variation: stjernen med kappe giver syv sekunders beskyttet flyvning langt frem.
Det sidste sekund har tre nye landingsposer, hvor knæ og fødder føres frem
og ned, før den almindelige pudelanding tager over.
Bygget videre på Hoppeborg Challenge.
Den samlede [projektplan og status](HOP-OG-RUL-PLAN.md) er opdateret
30. oktober 2026 med GitHub-levering, færdigt arbejde, manglende konkurrenceserver,
hostinganbefaling og acceptprøver før udgivelse.
Åbn denne mappe via en lokal webserver og besøg forsiden, eksempelvis
http://127.0.0.1:8765/?v=heltelanding-1. Den tidligere udgave ligger i hoppeborg.html;
den hentede GitHub-original er stadig i reference/index.original.html.

## Spil

Vælg en eksisterende spiller eller opret et kaldenavn. Banen bevæger sig
fremad. Styr med venstre/højre pil eller A/D, også i luften, og vælg dine
afsæt og landinger. Mellemrum, pil op eller W svarer til HOP. Escape eller
pauseknappen pauser. På telefon spilles i bredformat med tre knapper:
venstre, højre og HOP. Styring og HOP kan
bruges samtidig. Rotation til højformat og skift til en anden fane pauser
turen; fortsæt selv, når du er klar.

Banen veksler mellem hoppepuder, jordstrækninger og slisker. Hoppepuderne
trykkes sammen og sender automatisk figuren op igen. Tryk HOP tæt på landingen, når knappen lyser grønt, for et
perfekt afsæt. Perfekte hop bygger en serie og hoppekraft op til fem trin.
Mindre præcis eller manglende timing bryder serien og sænker hoppekraften
ét trin. At holde HOP nede giver ikke gentagne perfekte hop. Figuren glider
automatisk ned ad de stejle slisker, accelererer og tager farten med ud i
næste spring. Kameraet følger de høje spring. Rulle-/dukkefunktionen er
fjernet; pil ned og S påvirker ikke spillet.

På jorden løber figuren uden automatisk afsæt. Tryk HOP for at komme op på
næste pude; et kort tryk og et hold giver begge mulige returspring. Hjælpen
viser, når det er tid til at hoppe op. Jordløb, jordafsæt og jordlanding
bevarer den perfekte serie, hoppekraft og optjente bonuspoint. Første
pudelanding bagefter bedømmes normalt. Et manglende eller for lavt hop ind
i pudens lodrette front giver AV!, ét livstab og sikker fremadredning.

Undgå flyvende frisbees og pølser. Du har tre liv; skade giver AV!, tab af
serie og hoppekraft, et straksfald og 1,5 sekunders beskyttelse. Missede
landinger giver sikker redning. Tredje mistede liv afslutter turen. Farten
stiger gradvist med et loft. Der er ingen opgraderinger i runneren.

De første otte aktive sekunder er rolige. Derefter kan første jordstrækning
give én varslet frisbee med plads til at undvige før returpuden. Flere lange
puder har projektiler; et nyt kast kræver både mindst 3,2 sekunders mellemrum
og tilstrækkelig sikker bane. Slisker og de direkte returpuder har ingen kast.

Saml den gyldne stjerne med kappe for at blive superhelt. Den kan tidligst
dukke op efter 30 aktive sekunder og siden med mindst 55 aktive sekunders
mellemrum på en egnet bred flade. Flyvningen varer syv aktive sekunder og
fører hurtigt frem på banen uden skader. Der skal ikke hoppes imens; HOP
viser automatisk flyvning, og nedtællingen vises på skærmen. Figuren glider
ned på en bred sikker flade med kort beskyttelse, og den automatiske
tilbagekomst bryder ikke perfektserien eller bruger hoppekraft. Flyvningen
giver almindelige tidspoint; der er ingen særskilt pointbonus. Pause fryser
også flyvetiden. Placeringen følger samme regler og bane for alle.

Resultatet er 10 point pr. overlevet sekund plus 100 bonuspoint for hver
serie på fem perfekte hop: ved 5, 10, 15 osv. Pause og redning giver hverken
overlevelsestid eller tidspoint. Optjente bonuspoint beholdes efter skade.
Resultatsiden viser tidspoint og bonus hver for sig; ranglisten sorterer
efter det samlede pointtal.

## Genbrug og lagring

Billedindlæsning, maskering af baggrund, ensartet skalering, lyd, profiltyper,
menuflow og inputhåndtering bygger på den eksisterende kode. Begge figurer har
nu ni højrevendte poser til neutral, afsæt, opstigning, fald og landing.
Hoppepuderne bruger nye gul/turkise billeder med gentagne udsnit, så de ikke
strækkes til platformenes længde. Fodankre og pudetop følger den eksisterende
fysik og sammenpresning. Kropsskalaen er fælles gennem hver figurs animation.
[Det korrigerede løbesæt](art/loeb-saet-v2/README.md) tilføjer en neutral kalibrering og otte
løbe-/balancetrin pr. figur. Fasen følger aktiv tid med fysisk jord- og
pudekontakt: ni billeder i sekundet ved almindelig løbefart, højst tolv ved
høj fart. Pause og tid i luften driver ikke benenes billedloop frem.
Hop, de sidste afsætstrin, skade og glidning har deres egne poser;
figuren løber ikke i luften, og pudens korte kontakttid er bevaret.
Sliskerne har nu koral/orange glideflade, turkis kant og oppustelig støtte.
Begge figurer har tre siddende poser, som følger indgang, glidning og udgang.
En stående reference på hvert nyt ark styrer skalaen, så hoved og krop
beholder størrelsen under glidning; sædet følger kontaktpunktet.
Tre forskellige træer, tre skyer, en sol og fire flag følger den godkendte
stilprøve. Omgivelserne bevæger sig langsommere end banen, og flagene svinger
roligt på linen. Snoren gentages i faste verdenssektioner på 1200 spilenheder
ved y=170–205 og følger kameraet ligesom banen. Den ligger bag figuren, så
høje hop kan gå over den. Træstolper ved hvert høje ophæng står bag
puder, figurer og sponsorbannere. Hver stolpe klippes ved den nærmeste
baneflades top, så træ ikke skinner igennem pudens gennemsigtige bundmargen.
Stolper, græs og jordbund tegnes i canvas;
der er ikke fremstillet nye billedfiler til dem. Vind og skydrift fryser
ved pause og står stille ved
reduceret bevægelse. Hoppeborgen står nu på en græsplet med skygge;
gennemsigtige billedmargener tæller ikke med i placeringen af dens bund.
Hoppeborgen i baggrunden bruger det originale billede.
Pølser og frisbees bruger nye transparente billeder i den godkendte stil;
fartstreger og advarsler tegnes separat. Enkle bakker og græs tegnes stadig i canvas.
Originale PNG-filer er bevaret, og nye masterfiler er kopieret uændret.
De første hoppearks tegnede tern maskeres ved indlæsning; disse PNG-filer er RGB.
De nye løbeark har reel alpha og behøver ingen baggrundsmaskering.
Puden har reel alpha. [Billedfiler, prompts og detaljer](art/foerste-saet/README.md).
Det nye [sliskesæt](art/sliske-saet/README.md) har reel alpha i alle tre filer.
Det nye [baggrundssæt](art/baggrund-saet/README.md) har reel alpha i alle fire
masterfiler og bevarer billedproportionerne ved alle viste størrelser.
Det nye [faresæt](art/farer-saet/README.md) indeholder én pølse og én lilla
frisbee med reel alpha. De følger de eksisterende farer uden stræk og uden
ændringer i størrelse på visuelle rammer eller kollisionsfelter.
Det nye [superheltesæt](art/superhelt-saet/README.md) indeholder én neutral
kalibrering og tre højrevendte flyveposer til hver figur samt en stjerne med
kappe. Samme målte kropsskala bruges gennem hver serie; vandret flyvning
gør silhuetten lavere uden at krympe hoved og krop.
[Landingssættet](art/heltelanding-saet/README.md) tilføjer tre positurer
til den sidste nedflyvning, med én fælles neutral skala og målte fodankre.
Der er ikke tilføjet
frameworks, eksterne skrifttyper eller andre netværksafhængigheder.

Den lokale prototype beholder regellabel 4 og nøglen aulumHopOgRul_v4,
så eksisterende profiler og rekorder fortsætter. Jordforløb, projektiltæthed
og superhelteflyvning ændrer banen og spilforløbet; de er ikke kun grafik.
Gravitation, afsætshastigheder og pudernes timingværdier er bevaret.
Forsidens scriptadresser er versionsmærket, så browseren henter den nye
Core, Art og Runner frem for en tidligere cachet udgave.
Før en officiel konkurrence låses bane og regler i en særskilt version.

Ved første åbning genbruges navn, id, figur, valgt profil og lydvalg fra aulumHopOgRul_v3,
ellers aulumHopOgRul_v2, aulumHopOgRul_v1 og til sidst aulumByfestData_v2
eller v1. Tidligere
rekorder bliver i deres gamle lagringsnøgle, så de nye pointrekorder ikke
blandes med gamle resultater. Gamle køb, mønter og highscores påvirker ikke
spillet og bliver ikke slettet eller overskrevet. Kun bedste pointresultat
pr. profil vises; den gemte tid hører til dette vindende forsøg. Gemte
profiler bliver på samme browser/origin; de synkroniseres endnu ikke mellem
enheder.

## Forgrund og sponsorbilleder

Efter indledningen står enkelte af de eksisterende træer foran figuren på
lange, lave hoppepuder. De følger banen og giver korte passager med skjult
figur. Træernes højde er 434 spilenheder, svarende til stolpernes højde.
Flyvende farer, superhelte-powerup og skadebeskeden AV! tegnes foran træerne.

Åbn [sponsoreditoren](sponsorer.html) på den samme lokale webserver for at
tilføje PNG-, JPEG- eller WebP-billeder og vælge rækkefølge. Billederne vises
hele uden stræk på pudernes gule/blå forsider. Bannerkortene tegnes foran
træerne; en intern betegnelse bruges kun i editorens oversigt og vises
aldrig som erstatning for et sponsorbillede i spillet.

Editoren henter en fil, som du selv skal lægge i spillets mappe og udgive.
Den skriver ikke til serveren eller spillerlageret. Den medfølgende
`sponsorer.json` er tom, så der vises ingen sponsorbannere endnu.
[Kort brugsgang og filgrænser](SPONSORER.md).

## Filer

- index.html, runner.css og runner.js: visning, menuer, kontroller og lagring.
- runner-core.js: faste simulationstrin, bane, kollisioner og resultater.
- runner-art.js: billedbaggrund, animationsvalg, fælles skala og fodankre.
- sponsorer.html og sponsor-editor.js: lokal editor til sponsorbilleder.
- sponsor-config.js og sponsorer.json: fælles sponsorformat og den udgivne liste.
- SPONSORER.md: tilføj billeder, hent sponsorfilen og gør den fælles ved udgivelse.
- art/foerste-saet/: to figurark, hoppepude og billeddokumentation.
- art/loeb-saet/: den bevarede første løbegrafik og historiske prøver.
- art/loeb-saet-v2/: korrigerede løbeark, målte ankre, poseguide og før/efter-prøve.
- art/sliske-saet/: to glideark, sliske, forhåndsvisning og prompts.
- art/baggrund-saet/: træer, skyer, sol, flag, forhåndsvisning og prompts.
- art/farer-saet/: pølse, frisbee, forhåndsvisning og genereringsprompts.
- art/jord-stolper/: noter om canvasgrafik, jordløb og browserprøver.
- art/superhelt-saet/: to flyveark, powerup, målte udsnit og genereringsprompts.
- art/heltelanding-saet/: tre landingsposer til hver figur, ankre, browserprøve og prompts.
- hoppeborg.html: bevaret tidligere spil inklusive shop og gamle rekorder.
- tests/runner.test.cjs: spilregler og en mulig rute gennem banen.
- tests/runner-ui.test.cjs: menuadapter, input, tidsstyring og gemte data.
- tests/runner-art.test.cjs: billedmaskering, positurer og fodplacering.
- tests/sponsor-config.test.cjs og tests/sponsor-editor.test.cjs: sponsorformat og editorens indlæsning, billeder og eksport.
- tests/gameplay.test.cjs: regression for den tidligere hoppeborg.
- HOP-OG-RUL-PLAN.md: retning og kommende konkurrenceserver.
- GRAFIKOPGAVER.md: samlet rækkefølge for figuranimationer, puder, slisker og træer.
- TESTRESULTATER-RUNNER.md: testresultater og kendte afgrænsninger.

Kør testene fra repositoryets rod med: node --test tests/*.test.cjs

Midlertidige grafikprøver skal bruge en særskilt browser-origin eller
lagernøgle. Et separat testdataobjekt isolerer ikke i sig selv browserens
lokale lager. Kontrollér, at afslutning af en prøvetur bevarer den almindelige
lagring byte for byte, før prøven afspilles i samme browser som spillet.

## Næste afprøvning

Dette er lokalt øvespil. Der er endnu ingen fælles rangliste, deltagerkoder,
serverkontrol af forsøg, database eller onlineudgivelse. Seneste anbefaling
er Render Static Site, betalt Node-webservice og administreret Postgres;
ingen af disse ressourcer er oprettet. Pauser er frie her; officielle
konkurrenceregler tilføjes sammen med serveren.

Afprøv især om børn på 6–12 år kan styre landingerne, forstå det grønne
timingsignal og mærke forskellen i hoppekraft. Hoppe- og landingsposerne er
integreret sammen med siddende indgang, glidning og udgang på sliskerne.
Træer, skyer, sol og bevægelig flagline er også integreret, sammen med
enkelte træer i forgrunden og en hoppeborg med synlig kontakt til græsset.
Pølser og frisbees bruger også den nye stil og er kontrolleret på en mindre
spilleflade; den kontrol erstatter ikke afprøvning på en rigtig telefon.
Løbe-/balanceovergangene bruges nu også på de længere jordstrækninger og
afspilles langsommere. Superhelteflyvning og tættere projektiler er dækket
af automatiske simulationer; menneskelig læsbarhed og sværhedsgrad skal
stadig afprøves med børn.
Den første jord ligger tidligt i introen, og der følger flere i den faste
gentagelige bane. Jordstrækningerne er 1500 spilenheder lange ved y=550,
med brede returpuder ved y=435. [Jord og stolper](art/jord-stolper/README.md).
Bonusglæde, skadereaktion og resten af banegrafikken mangler stadig;
se GRAFIKOPGAVER.md. Usårlighed blinker på
figuren med et vedvarende omrids; reduceret bevægelse giver en rolig markering.
Markeringen følger hele den siddende billedramme på sliskerne.
Jordløb, frontkollisioner og superhelteflyvning udvider spillet, mens
pointrate og lagringsnøgler er bevaret: eksisterende v4-profiler og rekorder
fortsætter. Træerne i forgrunden ændrer, hvor meget
af figuren man kan se i korte passager. Banen bruger foreløbig
en fast gentagelig rækkefølge. Afprøv spilglæden, før mere grafik og flere
banemønstre tilføjes. Fysiske telefoner og samtidig flerfingerbetjening
kræver stadig afprøvning.
