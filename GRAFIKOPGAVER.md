# Grafikliste og arbejdsrækkefølge — Aulum Byfest: Hop og Rul

Status gennemgået 28. oktober 2026. Se den samlede
[projektplan](HOP-OG-RUL-PLAN.md) for konkurrence, hosting og manglende afprøvning.

Status: [stilprøve 01](art/stilproeve/stilproeve-01.png) er godkendt af
arrangøren den 16. september 2026 og er fast reference for hele grafikproduktionen.
Billedet er produceret med imagegen. [Prompts og noter](art/stilproeve/README.md)
beskriver retningen og kontrollen. [Første grafikpakke](art/foerste-saet/README.md)
er nu integreret: ni poser til hver figur samt en gul/turkis hoppepude.
Den 27. oktober 2026 er [sliskesættet](art/sliske-saet/README.md) også
integreret med tre siddende poser pr. figur og ny sliskegrafik.
Samme dag er [baggrundssættet](art/baggrund-saet/README.md) integreret:
tre træer, tre skyer, sol og flagline med rolig vindbevægelse.
Det er efterfulgt af enkelte træer i forgrunden, kontakt mellem hoppeborg
og græs samt sponsorbilleder på pudernes forsider med en lokal editor.
De flyvende [pølser og frisbees](art/farer-saet/README.md) er nu også integreret
som transparente billeder i den godkendte stil.
[Det korrigerede løbesæt](art/loeb-saet-v2/README.md) tilføjer otte højrevendte kontakttrin til
hver figur. Jordstrækninger giver nu længere løb med manuelle hop tilbage
på puderne. Flaglinen er fast i spilverdenen og hænger på træstolper ved
hvert høje ophæng, så figuren kan hoppe over den.
Der er også integreret [superhelte og powerup](art/superhelt-saet/README.md):
neutral kalibrering og tre flyveposer til hver figur samt en gylden stjerne
med kappe. Løbet har nu roligere takt, forgrundstræerne har stolpehøjde,
og træstolperne klippes ved banefladens top.
Seneste sæt er [superheltens landing](art/heltelanding-saet/README.md):
tre poser til hver figur, som fører knæ og fødder frem og ned i sidste sekund.
Listen bygger på
spillets nuværende figurer, banedele, farer og visning. Fysik og scoring er
udgangspunktet for animationerne.

Seneste beslutninger:
- Den godkendte stilprøves figurdesign, farver, konturer, materialer og
  proportioner videreføres i alle animationsbilleder, banedele og omgivelser.
- Banen veksler mellem hoppepuder, slisker og jordstrækninger. Jordløb
  bruger løbeanimationen og bevarer perfektserie, hoppekraft og bonuspoint;
  tilbage på en pude bedømmes timingen normalt.
- Begge figurer vender fremad mod højre langs banen. Ansigt, bryst og fødder
  peger frem; en let trekvartvinkel gør ansigterne synlige. De vender ikke om,
  når spilleren kort styrer til venstre.
- Hele RUL/duk-funktionen og dens knap fjernes. Der skal derfor ikke produceres
  dukke- eller rulleanimationer. Glidning på slisker bevares.
- Figurerne skal have samme kropsstørrelse i alle poser, også på slisken.
- Grafikken skal fungere på både computer og en telefon i bredformat.
- Enkelte træer må kort skjule spilleren efter indledningen. Flyvende farer,
  superhelte-powerup, skadebeskeden AV! og sponsorbannere skal fortsat kunne
  ses foran træerne.
- Den sjældne superhelte-powerup giver syv aktive sekunders flyvning. De
  nye vandrette poser skal bevare kroppens mål fra den neutrale reference.
- Sponsorer vises som uploadede billeder. Betegnelser i editoren er interne
  og erstatter aldrig et manglende billede i spillet.

## 1. Fælles stilprøve — godkendt

Den godkendte scene viser:
- [x] Dreng og pige i neutral pose, vendt mod højre med synlige ansigter.
- [x] Én genkendelig hoppepude med blød top, rund kant, volumen og sømme.
- [x] Én stejl sliske med en siddende figur i korrekt størrelse.
- [x] Ét træ med tydelig stamme, grene og organisk krone.
- [x] Én flyvende pølse som stilreference. Endelig størrelse afprøves ved integration.

Udtrykket skal være farverigt og venligt til børn på 6–12 år. Figuren og farerne
skal stå tydeligt mod baggrunden. Prøven vurderes både i fuld størrelse og i
spillets faktiske størrelse på en liggende mobilskærm. Retningen er valgt;
scenen bruges som fælles reference for alle efterfølgende billeder.

## 2. Figurer — samme serie til dreng og pige

Bevar de to eksisterende figurers genkendelighed som udgangspunkt. Begge får
samme sæt bevægelser, proportioner og spilregler. Billedantallene nedenfor er et
arbejdsbudget, ikke et krav om et bestemt antal filer: flere billeder kan samles
på ét spriteark, og antallet tilpasses efter en prøve i spillet.

| Tilstand | Forslag pr. figur | Hvad billedserien skal vise |
| --- | ---: | --- |
| Neutral/start | 1 | Afslappet og tydeligt fremadvendt; kan også bruges i menuen. |
| Afsæt | 2 | Kroppen strækkes fra sammenpresning til løft fra puden. |
| Opadgående hop | 2 | Naturlig kropsholdning med ansigtet fremad; tydelig opstigning. |
| Hoppets top | 1 | Kort overgang fra opstigning til fald. |
| Nedadgående hop | 2 | Ben og arme forbereder landingen; forskellig fra opstigningen. |
| Landing/sammenpresning | 2 | Bøjede ben og vægt i puden, før næste afsæt. |
| Glidning på sliske | 3 | Overgang ind, siddende glidning med benene frem, overgang ud. |
| “Juhuu!” ved bonus | 3 | Glad reaktion og løftede arme; stadig læselig midt i et hop. |
| Skade | 1 | Kort overrasket/øm reaktion til “AV!”. |
| **Grundserie** | **17** | **34 billeder i alt for de to figurer som foreløbigt budget.** |
| Kort løb/balance | 8 ekstra | Til korte bevægelser med jordkontakt; aldrig løb, mens figuren hopper. |
| **Samlet med løb** | **25** | **50 billeder for begge figurer som foreløbigt budget.** |
| Superhelt | 1 kalibrering + 3 flyveposer | Vandret mod højre, kappe og stjernemærke; samme kropsskala gennem arket. |
| Superheltens landing | 1 kalibrering + 3 landingsposer | Knæ frem, ben frem/ned og fødder klar før kontakt; samme kropsskala. |

- [ ] Drengens grundserie.
- [ ] Pigens grundserie.
- [x] Korte løbe-/balanceovergange til begge figurer. De kobles kun til jordkontakt.
- [x] Tre superhelteflyveposer og neutral kalibrering til begge figurer.
- [x] Tre landingsposer og neutral kalibrering til begge superhelte.
- [ ] Eventuelle nye profilportrætter afledes af neutralposen; de gamle kan
  fortsat bruges, så særskilte portrætter er ikke nødvendige i første omgang.

Første del er færdig for begge figurer: neutral, to afsæt, to opadgående,
to nedadgående og to landingsposer. Der er ni billeder pr. figur på hvert
sit 3 × 3 ark. Sen opstigning og tidligt fald dækker foreløbig hoppets top.
Grundserierne mangler stadig bonus, skade og en eventuel særskilt toppose.

Glidning er nu tegnet og integreret: indgang, siddende glid og udgang til
begge figurer.

Korte løbe-/balancetrin er nu tegnet i to nye 3 × 3 ark med reel alpha.
Hvert ark har neutral kalibrering og otte trin. Samme målte skala bruges
gennem hvert ark; hofte- og skoankre holder kroppen stabil og foden på
pudens eller jordens kontaktflade. Trinene følger aktiv tid ved jordkontakt,
også på de længere strækninger uden puder: ni billeder i sekundet ved
almindelig fart og højst tolv ved høj fart. En separat visuel klokke
fryser ved pause og driver ikke benene frem under hop.
De sidste to afsætstrin, hop, fald, glidning og skade prioriteres særskilt.
Pudens 75 ms kontaktfase er bevaret. Jordløb, manuelle returhop og den
solide front ved returpuden er efterfølgende tilføjelser til fysikken.

Animationens tilstand følger fysikken: afsæt, hastighed op/ned, kontakt med
puden, sammenpresning og glidning. Et frit løbende billedloop må ikke få figuren
til at se ud, som om den løber hen over puder, den faktisk hopper på.

Bonusreaktionen må ikke stoppe et hop, give ekstra svævetid eller ændre
kollisionsfelt og score. Den tilpasses den aktuelle bevægelse. Ved samtidig
skade og bonus har skadereaktionen visuel prioritet.

### Superhelteflyvning — integreret

De to nye ark har én stående kalibrering og tre vandrette flyveposer.
Begge figurer vender mod højre og beholder hår, tøj og sko fra de eksisterende
figurer, med kappe og gyldent stjernemærke. Én skala fra neutralens 70
spilenheder bruges i alle fire poser. De brede kapper kræver målte
billedområder frem for fire ens celler; alle kildebilleder er bevaret.
Brystanker bruges ved flyvning, mens kalibreringen har fodanker.
Kappens tre billeder afspilles fra simulationstiden og fryser ved pause;
reduceret bevægelse bruger den første flyvepose. Powerup-billedet er en
gylden stjerne med lilla kappe og vises helt i en ramme på 50 × 50
spilenheder. [Filer, udsnit, ankertabeller og prompts](art/superhelt-saet/README.md).

### Sliskeposen skal have rigtig størrelse

Det tidligere roterede ståbillede er erstattet af siddende/glidende grafik.
Hoved, torso og ben beholder skalaen fra en stående kalibreringspose på
hvert ark. Sædet har et dokumenteret kontaktanker på sliskens synlige flade.
Indgang/glid/udgang følger den fysiske fremdrift. Lavere samlet silhuet kommer
af stillingen; den tilpasses ikke det lave kollisionsfelts højde.
Faktiske roterede billedrammer er kontrolleret mod skærmgrænserne. Fysik og
kollisionsfelter er bevaret. Nye billedudsnit og kontaktankre er dokumenteret
i sliskesættets README.

## 3. Hoppepuder og slisker

### Hoppepuder
- [x] Venstre endestykke med afrundet kant.
- [x] Gentageligt midterstykke med hoppeflade og sømme.
- [x] Højre endestykke med afrundet kant.
- [x] Side/flade under toppen, som kan sammensættes til forskellige pudehøjder.
- [x] Neutral, sammenpresset og tilbagefjedrende overflade som tilstande eller
  lag, der kan animeres. Det kræver ikke tre komplette billeder af hver pude.
- [ ] Et lille udvalg af matchende farvevarianter, så banen får variation.

Modulerne skal kunne danne både korte og lange puder uden at strække sømme,
kanter eller dekorationer. Den synlige top følger præcis fysikkens kontaktflade
og sammenpresning. Puderne skal se bløde og oppustelige ud uden teksten
“HOPPEPUDE” som forklaring.

Første pude bruger udsnit af én master. Midten gentages, høje platforme
bygges i rækker, og små afrundinger tegnes som klippekant. Teksturen skaleres
ens i begge retninger. Kontaktkant og sammenpresning følger fysikken.

### Slisker
- [x] Indgang/overgang fra den øverste pude.
- [x] Stejlt, gentageligt skråstykke med tydelig glidebane.
- [x] Udgang/overgang til den nederste pude.
- [ ] Bageste og forreste sidekant som adskilte lag, hvor det hjælper dybden.
- [x] Oppustelig understøtning og samlinger i samme stil som puderne.

Første sliske har koralfarvet glideflade og turkis kant i ét billedmodul.
Midten gentages uden stræk, og samlet modul roteres til den fysiske hældning.
Understøtningen bruger pudegrafik klippet til en kile. Separate for-/bagkanter
er endnu ikke nødvendige i den valgte sidevisning og forbliver åbne.

Sliskerne skal opleves som rummelige dele af legelandet, og figuren skal have
plads til at sidde med benene frem. Den tegnede hældning skal følge den faktiske
bane. Sidekanter må ikke skjule ansigt, kommende landing eller flyvende farer.
Samlinger må ikke ligne ekstra huller eller skjulte forhindringer.

## 4. Omgivelser og byfeststemning

| Element | Første billedbudget | Brug |
| --- | --- | --- |
| Træer | 3 forskellige silhuetter | Tydelige stammer/grene/kroner; variation uden ens træer på række. |
| Skyer | 3 former | Rolige baggrundslag; bevægelse laves i spillet. |
| Sol | 1 | Tydelig, venlig form, som ikke ligner en genstand, man kan ramme. |
| Flagline | Flag i 3–4 farver samt fælles line/ophæng | Små gentagelige dele, der kan bevæge sig i vinden. |
| Buske | 2–3 varianter | Fylder baggrunden uden at ligne platforme eller farer. |
| Bakker | 2 enkle baggrundslag | Skaber dybde med lavere kontrast end banen. |
| Græs | 1 gentageligt bundlag og få små totter | Baggrundsgræs er pynt; særlige jordstrækninger har en spilbar græstop. |
| Træstolper | Gentaget canvasmotiv | Bærer snoren ved dens høje ophæng; står bag puder og figurer. |
| Fjern hoppeborg/byfest | 1 motiv eller det eksisterende billede | Bevarer byfestens identitet; valgfri opdatering efter kernegrafikken. |

- [x] Træer, skyer og sol.
- [x] Flagline med rolig vindbevægelse.
- [x] Fast placering i verdenskoordinater; høje hop kan passere over linen.
- [x] Træstolpe ved hvert høje ophæng, bag puder og figurer.
- [x] Spilbare jordstrækninger med græstop, muldside og længere løb i canvas.
- [x] Enkelte træer foran figuren på lange, lave puder efter indledningen.
- [x] Forgrundstræerne er 434 spilenheder høje, ligesom flagstolperne.
- [x] Stolper klippes ved nærmeste baneflades top, også ved sammenpresning.
- [x] Det eksisterende hoppeborgmotiv står på en græsplet med skygge.
- [ ] Buske, bakker og græs.
- [x] Vurder, om det eksisterende hoppeborgmotiv passer til den nye stil.

De 11 nye baggrundsmotiver har reel alpha og bruges uden stræk. Træer/skyer
har målte ulige cellegrænser, så de brede former vises hele. Kontrasten er
dæmpet, og baggrunden tegnes bag bane, farer og figur. Et sparsomt forgrundslag
genbruger ét af træerne i banens koordinater og skjuler kort figuren. Det
lægges kun på lange, lave puder efter indledningen. Træernes bund er ved
y=590, og højden 434 svarer til stolpernes fulde højde. Flyvende farer,
superhelte-powerup og AV! tegnes efter træerne, så de forbliver synlige.

Hoppeborgmotivet er bevaret som mindre, dæmpet baggrund. Dets synlige bund
placeres på en græsplet med skygge; transparent margen er skåret fra under
indlæsning, uden at originalbilledet ændres. Bakker og græs er stadig tegnet i canvas;
nye billeder af dem og buske er ikke med i dette sæt.

Flaglinen bygges af dele, så line og flag kan bevæge sig samlet uden at bestille
et stort billedark med alle vindstillinger. Baggrundens bevægelse må ikke gøre
platformenes højde eller figurens retning svær at aflæse.
Linen ligger nu i et særskilt verdenslag bag bane og figur. Faste sektioner
på 1200 spilenheder har ophæng ved y=170 og midterpunkt y=205. Både
vandret og lodret kamera følger samme forhold som banen; vindens små
udslag og flagets variant er knyttet til det samme flag i verden.
Træstolper på worldX=1200 × n bærer begge tilstødende snorender ved y=170.
Stolpernes afrundede kappe starter ved y=156 med en fuld bund ved y=590.
Den synlige stolpe klippes ved den nærmeste baneflades top, inklusive
streg og rund fod; alene at tegne bag den transparente pudemargen skjulte
ikke stolpen. Klippet følger også pudens sammenpresning. Træåre, knast og
binding tegnes i canvas.
De nye jordstrækninger tegnes med kontaktkant ved y=550 og muld til
y=675; baggrundsgræsset er fortsat pynt. Ingen nye AI-billeder er tilføjet
til disse elementer. [Noter og prøver](art/jord-stolper/README.md).

### Sponsorbilleder på pudernes forsider — integreret

- [x] PNG-, JPEG- og WebP-billeder tilføjes via [den lokale editor](sponsorer.html).
- [x] Hele billedet skaleres ens i begge retninger; vandrette bannere omkring
  6:1 passer bedst. Der bestilles ikke en ny generisk sponsorgrafik.
- [x] Bannerkort ligger under pudens landingskant og følger sammenpresningen.
  De tegnes foran træerne på en dækkende baggrund.
- [x] Rækkefølgen kan redigeres og gentages langs banen. Intern betegnelse
  bruges kun i oversigten; der er ingen navnetekst i spillets bannere.
- [x] En tom sponsorliste viser ingen reklamer. Et utilgængeligt konfigureret
  billede får et neutralt billedsymbol og erstattes ikke af et sponsornavn.

Der er endnu ingen faktiske sponsorbilleder i projektets sponsorfil. Editorens
kladde bliver kun i hukommelsen; hent `sponsorer.json`, erstat filen i
spilmappen, og udgiv for at gøre billederne fælles. Den skriver hverken til
server eller profillager. Se [brugsgangen](SPONSORER.md).

## 5. Flyvende farer — første integration færdig
- [x] Pølse med tydelig, genkendelig silhuet og ensartet lys/outline.
- [x] Frisbee med tydelig kant og flyveretning.
- [ ] Eventuelt 2–3 rotations-/vippebilleder pr. fare, hvis det giver mere liv;
  ét godt grundbillede af hver er tilstrækkeligt til første integration.

Farerne skal være lette at genkende i deres faktiske mobilstørrelse. Den synlige
krop skal passe til kollisionsfeltet. Fartstreger og advarselstekst er separate
effekter og skal ikke være malet ind i billedet. De flyvende ting skal tydeligt
adskille sig fra baggrundspynt og eventuelle bonusmarkeringer.

Faresættet bruger ét grundbillede af hver: en orange/rød grillpølse og en
lilla frisbee med tyk kant. Begge masterfiler har reel alpha og er kopieret
uændret fra indbygget imagegen. Hele den synlige krop skaleres ens i begge
retninger inden for de eksisterende visuelle rammer. Kollisionsfelter og
projektilfart er bevaret; der er ikke indført en rotationsanimation.
Den senere spilændring giver flere varslede kast på egnede flader med
mindst 3,2 sekunders mellemrum og otte rolige sekunder fra start. Første
jord har højst én frisbee med ekstra afstand til returpuden. Billederne
er genbrugt uændret under denne justering.
De er kontrolleret på computer og en nedskaleret canvasflade i browseren.
Fysisk telefon og mobilens berøringsbetjening mangler stadig kontrol.
[Billedfiler, prompts og forhåndsvisning](art/farer-saet/README.md).

## 6. Effekter, som laves i spillet

Følgende kræver ikke særskilte figurbilleder for hver variant. Afkrydsning
betyder implementeret lokalt; læsbarheden skal stadig afprøves på fysisk mobil:
- [x] Skyggen under figuren, der ændrer sig med højden.
- [x] “AV!”, “PERFEKT!” og bonus-/pointtekst.
- [x] Blink/omrids under usårlighed. Figuren kan stadig følges; reduceret
  bevægelse får en rolig markering.
- [ ] Eventuel udbygning af landings- og afsætseffekter. Enkle streger ved
  pudens sammenpresning er allerede implementeret.
- [x] Fartstreger ved glidning og visning af opbygget hoppekraft i HUD.
- [ ] En kort bonusreaktion med enkelte stjerner eller konfetti, som ikke
  skjuler næste landing. Små partikelmotiver kan tegnes én gang og genbruges.
- [x] Bevægelse af skyer og flagline.
- [x] Superhelte-powerup, tre kappeposer og nedtælling for den aktive flyvning.
- [x] Tre landingsposer i sidste sekund; fast pose ved reduceret bevægelse.

Vind og skyernes langsomme drift følger simulationens tid og fryser ved
pause. Reduceret bevægelse fjerner flagblafren og skyernes egen drift.

Bonus, perfekt timing og skade skal kunne skelnes hurtigt. Usårlighed og
bonusglæde er visuelle lag oven på bevægelsen, ikke nye fysiske tilstande.

## 7. Fælles leveringskrav
- Reel gennemsigtighed i PNG eller WebP; intet indbygget skakternet mønster.
- Samme hoved-/kropsproportioner, lysretning, streg og farver gennem alle
  billeder af en figur. Bevar figurens forhold mellem bredde og højde.
- Ens referenceramme og dokumenterede kontaktankre. Fodanker bruges ved
  stående/hoppende figurer; sliskeposen får sit eget dokumenterede sæde-/benanker.
- Forskellig transparent margen må ikke få figuren til at ændre størrelse,
  når animationen skifter. Fælles skala styres af kroppen, ikke filens ydermål.
- Billeder tegnes med plads til hænder og fødder, så de ikke beskæres i
  afsæt, landing eller “Juhuu!”.
- Angiv billedrækkefølge, kontaktankre og foreslået varighed i en oversigt.
  Den endelige afspilning tilpasses fysikkens faktiske varighed.
- Brug konsekvente navne, eksempelvis `dreng_afsaet_01.png`,
  `pige_sliske_02.png` og `hoppepude_midt.png`.
- Opdel terrængrafik i passende lag; undgå at deformere ét stort billede for
  at få det til at passe til vilkårlige banelængder og hældninger.

Kendt afvigelse i første pakke: imagegen leverede figurark som RGB med tern,
trods gentagne alpha-bestillinger. Spillets indlæser maskerer baggrunden én
gang og bevarer hvide sko/øjne. Det er visuelt kontrolleret i alle 18 poser.
Masterfilerne er derfor endnu ikke selvstændige transparente PNG-filer;
brug dem gennem spillets indlæser. Hoppepuden har reel alpha. Se pakkens
README for kilder, prompts og den konkrete løsning.

## 8. Produktion og kontrol i rækkefølge
1. Stilprøven med begge figurer, pude, sliske, træ og pølse.
2. Begge figurers grundserie samt én færdig pude og sliske. Integrér tidligt,
   så retning, kropsstørrelse og kontakt med banen kan afprøves.
3. Resten af terrænmodulerne og de to flyvende farer.
4. Træer, skyer, sol, flagline og øvrig baggrund.
5. Effekter, korte løbeanimationer, eventuelle profilportrætter og finpudsning.

Kontrollér begge figurer på samme bane: fødder på synlig overflade, tydelig
opstigning og fald, glidning i korrekt skala, bonus midt i et hop og skade under
andre animationer. Se resultatet på computer og lille mobilskærm. Animationer
må ikke ændre fysik, timingvinduer eller point. De aftalte korte passager bag
forgrundstræer er en særskilt synlighedsudfordring. Optimér filstørrelser
og indlæsning, når billederne fungerer i spillet.

## Eksisterende filer og genbrug

De oprindelige PNG-filer bevares: `hoppeborg.png`, `dreng_idle.png`,
`dreng_jump.png`, `pige_idle.png`, `pige_jump.png`, `coin.png`, `plate.png` og
`sausage.png`. De kan bruges som identitets-/stilreference og i den bevarede
ældre spiludgave. De eksisterende ståbilleder kan genbruges som portrætter midlertidigt.
Møntgrafik og shop-/opgraderingsgrafik indgår ikke i den nye runners grafikbehov.

Første billedserie ligger separat i `art/foerste-saet/`. Originalerne er bevaret.
Sliskesættet ligger i `art/sliske-saet/` og bruger reel alpha i alle masterfiler.
Baggrundssættet ligger i `art/baggrund-saet/` med prompts og kildeoplysninger.
Det aktive, korrigerede løbesæt ligger i `art/loeb-saet-v2/`; det tidligere
`art/loeb-saet/` er bevaret som historik. Begge har ankertabeller og prompts.
Faresættet ligger i `art/farer-saet/`; de gamle `sausage.png` og `plate.png`
er bevaret til den tidligere spiludgave.
Superheltesættet ligger i `art/superhelt-saet/` med tre uændrede RGBA-masters,
prompts og målte billedområder. Ældre sæt-README'er beskriver deres egen
levering og er bevaret som historik.
Synkroniserede filer under `sources/`
er skrivebeskyttet referencemateriale og ændres ikke.

## Rettelse efter løbevideo — 28. oktober 2026

De gamle løbebilleder er bevaret, men runneren bruger nu
[det korrigerede posesæt](art/loeb-saet-v2/README.md). To tydeligere
benpassager og en stabil kontakt erstatter den gentagne brede benstilling
og den dybe sammenkrøbning. Det er stadig et stiliseret løb med beskedent
armsving. Faseorden 1–8, 9/12 billeder pr. sekund og fysik er uændrede.
Både det fulde loop og 8→1 er kontrolleret i browseren.

## Superhelte-landing — 28. oktober 2026

[Landingssættet](art/heltelanding-saet/README.md) tilføjer tre poser til begge
figurer i det sidste sekund: knæ frem, ben frem/ned og fødder klar.
Poserne bruger en fælles neutral skala, målte fodankre og et kort visuelt
offset fra den vandrette flyvepose. Ved kontakt genoptages den almindelige
landing og beskyttelsesblinkning. Alle syv sekunder, Core-fysik, point og
lager er bevaret. Reduceret bevægelse bruger en rolig enkeltpose.
