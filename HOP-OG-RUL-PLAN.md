# Aulum Byfest: Hop og Rul — projektplan og status

Opdateret 30. oktober 2026 efter GitHub-klargøring og gennemgang af de
seneste aftaler. Målet er en bykonkurrence for børn på 6–12 år, på telefon
i bredformat og på computer, med op mod 50 samtidige spillere.

**Den lokale spilbare udgave er på plads. Fælles konkurrence og udgivelse
mangler stadig.** Implementeret, testet og udgivet er forskellige statusser
i denne plan. [Landingsrapporten fra 28. oktober](TESTRESULTATER-RUNNER.md)
dokumenterer animationerne og den tidligere kontrol. Ved overførslen til
GitHub den 30. oktober er alle 146 automatiske tests genkørt i den nye
projektkopi med Node v22.20.0: 146 bestået, 0 fejlede og 0 oversprungne.

## Statusoversigt

| Område | Status nu | Hvad der mangler |
| --- | --- | --- |
| Spil og fysik | Implementeret lokalt: sidekontrol, pudehop, jordløb, slisker, momentum og perfektbonus. | Afprøvning med børn og endelig justering af sværhedsgrad. |
| Liv og farer | Tre liv, AV!, tab af serie/hoppekraft, straksfald, blink og tættere varslede pølser/frisbees. | Vurdering af læsbarhed og rimelig sværhedsgrad på rigtige telefoner. |
| Superhelt | Syv sekunders beskyttet flyvning, sikker retur og tre nye landingsposer til begge figurer. | Afprøvning i almindelige fulde spilrunder på mobil. |
| Figurer og omgivelser | Højrevendte figurer i fælles skala, korrigeret løb, glideposer, puder, slisker, træer, skyer, sol og flagline på stolper. | Bonus-/skadegrafik og øvrig grafisk finpudsning; se grafiklisten. |
| Sponsorer | Lokal billedupload, rækkefølge og eksport; bannere tegnes foran træerne. | De faktiske sponsorbilleder skal tilføjes. Den nuværende liste er tom. |
| Profiler og rekorder | Gemmes lokalt i samme browser. Ældre profiler og det tidligere spil med shop er bevaret. | Fælles deltagerprofiler, adgang fra flere enheder og officiel rangliste. |
| Resultatkontrol | Fælles, deterministisk spilmotor kan allerede indlæses i browser og Node. | Serverudstedte forsøg, inputindsendelse og kontrol af hele forsøget. |
| Hosting og database | Arkitekturen er drøftet; seneste anbefaling er Render med administreret Postgres. | Endeligt valg, opsætning, database, backupprøve og belastningsprøve. |
| Udgivelse | Den aktuelle udgave leveres på `main` i [Byfestspillet](https://github.com/KenneyLassen/Byfestspillet) med bevaret historik. | Prøveudgivelse på hosting og åbning af konkurrencen. |

## Det vi har styr på

- [x] Bygget videre på det eksisterende spil; den tidligere Hoppeborg Challenge
  findes fortsat i [hoppeborg.html](hoppeborg.html), inklusive shop og gamle rekorder.
- [x] Ens egenskaber for alle i runneren; ingen shop, upgrades eller RUL/duk.
- [x] Automatisk fremdrift med venstre/højre og HOP på tastatur og touch.
- [x] Hoppepuder med højdeforskelle, stejle slisker og jordstrækninger med
  manuelle hop op på næste pude. Jordløb bevarer perfektserie og hoppekraft.
- [x] Fem perfekte hop giver 100 bonuspoint. Skade fjerner serie og
  opsparet hoppekraft, men ikke allerede optjente bonuspoint.
- [x] Farer, skadebeskyttelse, redning før figuren forsvinder og sjælden
  superhelteflyvning med sikker tilbagekomst.
- [x] Den godkendte grafikstil er integreret i hovedparten af spillet.
  Figurerne vender mod højre og bevarer kropsskalaen under hop, løb og glidning.
- [x] Flaglinen er fast i spilverdenen; høje hop kan passere over den.
  Stolper står bag banen og klippes ved pudernes top. Store forgrundstræer
  skjuler kort figuren, mens farer, powerup, AV! og sponsorer forbliver synlige.
- [x] Sponsorredigering med billeder frem for navne og eksport af sponsorfilen.

De lokale fysikudgaver og de grundlæggende kontroller er afprøvet af
arrangøren. Det er ikke en afsluttet afprøvning med målgruppen eller en
kapacitetsmåling af en onlinetjeneste.

## Grafik: færdigt og resterende

Den samlede liste med billedsæt og prøver findes i
[GRAFIKOPGAVER.md](GRAFIKOPGAVER.md). Hop, almindelig landing, siddende glid,
løb og superhelteflyvning er integreret til begge figurer. Senest er
[løbecyklussen rettet efter video](art/loeb-saet-v2/README.md), og
[superheltens landing](art/heltelanding-saet/README.md) fører knæ og fødder
frem og ned i det sidste sekund. Løbet følger aktiv kontakttid med ni
billeder i sekundet ved normal fart og et loft på tolv.

Tilbage står særskilte “Juhuu!”- og skadeposer samt eventuel forbedring af
buske, bakker og græs. AV!, PERFEKT!, bonustekst, skygge, beskyttelsesblink,
sliskefartstreger og visning af hoppekraft findes allerede; de skal ikke
registreres som manglende funktioner. Flere pudefarver, rotation af farer,
en særskilt toppose og ekstra sliskelagsgrafik er valgfrie forbedringer.

Billederne skal også gøres lettere at hente og klargøre. De 26 billeder,
som runneren nu indlæser fra start, fylder samlet 31.166.055 bytes, cirka
31,2 MB i projektet, før eventuelle sponsorbilleder. Det er en optælling af
filerne, ikke en måling af downloadtid eller faktisk netværkstrafik.
Optimering skal bevare originalerne, figurernes skala, fodankre og alpha.

## Spiloplevelse

En automatisk sideruller gennem et farverigt, oppusteligt legeland. Banen
bevæger sig automatisk, mens spilleren styrer til venstre/højre inden for
skærmen og timer hop. Der kan også styres i luften. Der er ingen nedtælling: runden slutter, når
spilleren har brugt sine liv. Alle begynder med samme egenskaber.

Den lokale udgave og dens acceptmål:

- Mobil: venstre/højre-knapper ved venstre hånd, HOP ved højre hånd.
  Tastatur: venstre/højre pil eller A/D; mellemrum/pil op til HOP.
- Hoppepuder giver automatiske afsæt; jordstrækninger giver almindeligt
  løb og manuelt HOP op på næste pude. Jordløb, jordafsæt og jordlanding
  bevarer perfektserie, hoppekraft og optjente bonuspoint. Første pudelanding
  efter jord bedømmes igen normalt: perfekt timing bygger hoppekraft, mens
  misset timing bryder serien og sænker styrken. Skade nulstiller begge dele.
- Jordstrækninger ved y=550 er 1500 spilenheder lange og ender ved brede
  returpuder ved y=435. Første forløb kommer tidligt i introen. Efter otte
  rolige sekunder kan det have én frisbee, varslet og med ekstra afstand
  til returpuden, så undvigelse og returhop kan adskilles.
  Et manglende eller for lavt hop møder pudens lodrette front med AV!, ét
  livstab og kendt sikker fremadredning; figuren løber ikke gennem væggen.
- Hver serie på fem perfekte hop giver 100 bonuspoint. Holdte knapper eller
  mange tryk ved samme landing må ikke udløse flere perfekte hop.
- RUL/duk-funktionen og knappen er fjernet. Figuren glider stadig automatisk
  ned ad slisker. Puder fjedrer uden en duk-handling, der kan udsætte afsættet.
- Banen er hovedudfordringen: hop mellem oppustelige platforme i forskellige
  højder, land på hoppepuder og glid automatisk ned ad slisker. Puder giver et
  fjedrende afsæt ved hver landing. Slisker accelererer figuren nedad, og
  fartoverskuddet følger med ud af slisken.
- Flyvende frisbees og pølser supplerer banen. Tydelig varsling og højde gør
  det muligt at undvige med placering og hop. De må ikke kræve et umuligt retningsskift
  midt i et spring eller ramme uundgåeligt ved slutningen af en sliske.
- Første otte aktive sekunder er uden projektiler. Senere kan flere egnede
  puder give kast med mindst 3,2 sekunders mellemrum og tilstrækkelig
  restbane ved spillerens mulige fart. Slisker og direkte returpuder er
  friholdt. Farten stiger gradvist til et loft. Hvert mønster skal kunne
  aflæses og gennemføres uden at tage skade.
- En sjælden powerup giver syv aktive sekunders automatisk superhelteflyvning
  med fart 1050 spilenheder i sekundet. Første mulighed er efter 30 aktive
  sekunder, senere mindst 55 aktive sekunder efter forrige fremkomst på en
  egnet bred pude eller jord. Samme bane og input giver samme fremkomst.
  Flyvning beskytter mod skader, bevarer serie, hoppekraft og optjent bonus
  og giver kun almindelige tidspoint. HOP er ikke nødvendigt imens.
  Den sidste del fører blødt ned på en bred sikker flade uden baglæns
  spring, uden timingbedømmelse af den automatiske landing og med kort
  beskyttelse samt fri afstand til næste projektil. Pause fryser effekten.
- Samme synlige banestrækning på alle skærme, så bred desktopvisning ikke
  giver længere varsling end mobil. Bredformat er grundlayoutet på telefon
  og computer. Menusiden virker også i højformat og beder om at vende
  telefonen før spilstart. Layoutet følger almindelig skærmrotation uden
  krav om browserunderstøttelse af tvungen orienteringslås.
- Store touchknapper i hver side, uden at dække kommende landingssteder,
  samt tastaturstyring på computer. Skærmudskæringer og browserbjælker skal
  medregnes. Pause/rotation må ikke give ubegrænset tænketid i officielle
  forsøg; reglerne og en rimelig overgangsfrist fastlægges før udgivelse.
- Tre liv. Et træf giver AV!, tab af ét liv og midlertidig usårlighed;
  tredje mistede liv afslutter runden. Den lokale beskyttelse varer 1,5
  sekunder; varigheden kan justeres efter afprøvning før konkurrencestart.
  Flere samtidige kollisioner koster kun ét liv.
  Blink med et vedvarende omrids viser beskyttelsen; reduceret bevægelse
  bruger en rolig markering.
- Skade nulstiller eventuel combo og opsparet hoppekraft og bryder et
  igangværende spring med et kontrolleret fald. Landingssted og restitution
  skal forhindre et uundgåeligt ekstra livstab.
- Ved et misset spring mister spilleren ét liv og bliver genplaceret sikkert
  længere fremme, hvis der er liv tilbage. Redningen giver ingen score,
  går aldrig baglæns og må ikke føre til et nyt uundgåeligt træf. Kameraets
  grænser og redning aktiveres, før figuren forsvinder ud af billedet.
- Personlig pointrekord i menu/resultat og ét tryk på Prøv igen. Fart og
  forhindringer skal testes med børn, før en konkurrence låses.

Målet for afprøvningen er spændende runder på omkring 45–120 sekunder for
nye spillere, med mulighed for længere ture ved øvelse. Det er et designmål,
ikke en fast tidsgrænse eller en målt effekt endnu.

## Konkurrenceregler — lokalt grundlag og planlagt onlineudgave

Pointberegning og ens egenskaber er allerede implementeret lokalt.
Regler om officielle forsøg, deltagere, præmier og konkurrenceperiode
nedenfor er planlagt arbejde. De åbne arrangørvalg er samlet til sidst;
forslag om koder eller finale er ikke besluttet alene ved at stå i planen.

- Samlede point afgør placeringen: 10 point pr. aktivt sekund plus 100
  bonuspoint for hver serie på fem perfekte hop. Tid vises også. Pause og
  redning giver ingen point. Ved lige point deles placeringen; præmiereglen
  for lighed aftales før åbning. Fysik, point og timing er ens for alle.
- Upgrades og shop er fjernet fra runneren. Gamle køb må ikke påvirke fart,
  hop, liv, beskyttelse, timing eller score. Eventuelle fremtidige belønninger
  må kun ændre udseende.
- Én officiel bane/banegenerator og regelversion pr. konkurrenceperiode.
  Alle møder samme rækkefølge. En ny bane får en ny konkurrence/rangliste.
- Banen bygges af afprøvede mønstre med tilstrækkelig afstand; tilfældighed
  må ikke skabe umulige kombinationer.
- Én ranglistepost pr. deltager: bedste godkendte forsøg. Øveforsøg kan
  spilles lokalt; kun verificerede onlineforsøg tæller til præmien.
- Deltagerne vises med kaldenavn, og samme deltager kan have flere forsøg.
  Et internt deltager-id og en privat returkode giver adgang til samme profil
  på flere enheder. Kaldenavnet eller en browsercookie beviser ikke identitet.
- Anbefalet enkel start: åben oprettelse og højeste resultat pr. deltager-id;
  én præmie pr. barn med kontrol ved udlevering. Nye profiler giver ingen
  spilfordele eller ekstra forsøg, fordi forsøg i forvejen er ubegrænsede.
  Flere profiler kan dog optage flere pladser på listen.
- Hvis én officiel profil pr. barn skal håndhæves, udsteder arrangøren én
  privat konkurrencekode pr. barn. Det kræver en organisatorisk kontrol;
  selvoprettede koder forhindrer ikke dubletter. Øvespil kan være uden kode.
  Brug ikke IP-adresse som identitet: familier og skoler deler netværk.
  Der er ikke brug for børnenes telefonnummer eller e-mail til selve spillet.
- Åbnings-/sluttidspunkt og regelversion styres centralt. Regler ændres
  ikke midt i konkurrencen. Gamle Hoppeborg Challenge-point blandes ikke ind.

## Det eksisterende arbejde

Runneren genbruger canvas, menuer, figurvalg/profiler, billedindlæsning,
forholdsmæssig skalering, tastatur/touch, lyd, AV!-feedback og relevante tests.

Den oprindelige faste hoppeflade, lodrette bounce og frie sidebevægelse,
60-sekunders nedtælling, tilfældige spawns og fysik afhængig af upgrades
er erstattet af runnerens fælles fysik og styrede bane.

Begge figurer har nye billedserier til hop, løb, glidning og superhelt.
Den oprindelige hoppeborg bruges i baggrunden med synlig kontakt til græsset.
Gentagelige puder og slisker er integreret sammen med træer, skyer, sol,
flagline samt pølser og frisbees. Buske, bakker og græs kan stadig få en
grafisk opdatering; enkle bakker og græs tegnes allerede i canvas.

Profiler genbruges, og den lokale øveprototype beholder sin eksisterende
v4-nøgle og rekordtabel under denne baneændring. Tidligere spiludgaver
bliver i deres gamle nøgler og slettes ikke. Før en officiel konkurrence
låses én bane og regelversion; nye konkurrencebaner får egne ranglister.

## Hosting og fælles highscore — endnu ikke implementeret

Arrangøren har en betalt Render-konto og vægter enkel drift højere end
mindre prisforskelle. Seneste anbefaling fra drøftelsen den 28. oktober er:

1. **Render Static Site** til spil, billeder og sponsorfil via CDN.
2. **En betalt Node-webservice i Frankfurt** til deltagere, forsøg,
   resultatkontrol og rangliste. Start med én instans; størrelse vælges
   efter måling af arbejdet med genafspilning.
3. **Administreret Render Postgres i samme region** til fælles data,
   med databaseforbindelse fra serveren og afprøvet gendannelse.

Dette er en anbefaling, ikke en bestilt eller færdig opsætning. Det
erstatter planens tidligere SQLite-anbefaling. SQLite på disk kan stadig
fungere med én appserver, men medfører egen databasebackup og et
diskbetinget stop ved udgivelse. Med de seneste prioriteringer anbefales
administreret Postgres for at gøre drift og gendannelse enklere.

Cloudflare Workers med D1 er et muligt alternativ. Der er ikke målt en
hastigheds- eller driftsgevinst ved et skift for denne lokale konkurrence.
Begge løsninger kan levere spilfiler via CDN, og selve spillet kører i
barnets browser. Serveren styrer ikke hver animationsframe. Render med
Postgres giver derfor det anbefalede udgangspunkt uden et leverandørskift;
kapacitet til 50 samtidige spillere er fortsat noget, der skal afprøves.

Appserveren behøver ikke en vedvarende disk, når konkurrencedata ligger i
Postgres, og sponsorbilleder udgives med de statiske filer. Render kan da
bruge sin almindelige udgivelse uden diskbetinget stop. Det er ikke i sig
selv en garanti mod driftsafbrydelser. Databasebackup, gendannelse,
fejlalarmer og eventuelt datatab skal afprøves og aftales før åbning.

Et link eller en afprøvet indlejring fra byfestens hjemmeside kan føre til
spillet. Der er ikke behov for multiplayer eller forbindelse for hver frame.
Den aktuelle version ligger nu i [Byfestspillet](https://github.com/KenneyLassen/Byfestspillet)
med spillet i repositoryets rod og `main` som udgivelsesgrundlag. Den gamle
forside er erstattet af Hop og Rul; tidligere commits er bevaret.
Der er ingen oprettet konkurrenceserver eller database.

### Planlagt resultatforløb

Den eksisterende `runner-core.js` er grundlaget for fælles simulation,
men nedenstående serverforløb findes endnu ikke:

1. Serveren udsteder et unikt forsøg bundet til deltager, bane-seed,
   regelversion, starttid og udløb. Højst ét aktivt officielt forsøg pr. profil.
2. Browseren registrerer venstre/højre/hop ved faste simulationstrin.
   Tegning til skærmen må ske med en anden opdateringsfrekvens.
3. Input sendes løbende i nummererede portioner, også når der ikke trykkes,
   med en afsluttende portion.
   Serveren låser allerede modtagne trin og registrerer sin egen modtagelsestid;
   klientens tidsstempler og pointtal er ikke facit. Genforsøg på netværket
   må sende en identisk portion igen, men må ikke ændre tidligere input.
4. Serveren kontrollerer rækkefølge, tilladte input og rimelig fremdrift
   i forhold til sin egen tid. Der skal være tolerance for almindelig
   netværksforsinkelse, men ikke ubegrænset tid til at spille langsomt.
5. Serveren genafspiller den fælles simulation, inklusive platforme,
   slisker, jordløb, sidekontrol, timing, hoppekraft, bonusser, projektiler,
   superhelte-powerup og flyvning, liv og beskyttelse, og beregner resultatet.
6. Kun gyldige, afsluttede forsøg kan forbedre deltagerens rekord. Et forsøg
   færdigregistreres atomisk én gang; gentagne svar må ikke skabe nye scorer.

Der skal også være grænser for anmodninger, inputmængde og arbejde med
genafspilning, samt regler for pause/afbrudt forbindelse og gennemgang af
topresultater. Langt netudfald skal kunne lade barnet fortsætte som øvespil,
mens grunden til, at forsøget ikke tæller officielt, vises tydeligt.

Input pr. sekund er et signal om overdreven aktivitet, ikke et bevis på
en bot: en bot kan sende få præcise input, og et menneskes enhed kan sende
tastaturgentagelser eller dobbelte hændelser. Normaliser til reelle tryk/slip,
ignorer gentaget samme tilstand, og håndhæv samme handlingsregler for alle.
Et højt eller usædvanligt regelmæssigt antal må ikke alene diskvalificere.

Genafspilning beskytter mod selvvalgte scores og ændrede spilregler.
Løbende indsendelse begrænser manipulation af hele loggen bagefter, men
ingen af delene beviser, at et menneske spillede. En fælles kendt bane kan
også indøves af en bot. Gem grundlag for gennemgang af topforsøg og fastlæg
eventuelt en kort, overvåget finale for præmieplaceringer inden åbning.
Falske positiver må ikke afgøre en børnekonkurrence automatisk.

Der er endnu ikke oprettet eller ændret tjenester på Render eller Cloudflare.

Tekniske kilder fra hostinggennemgangen den 28. oktober 2026:

- [Render Static Sites](https://render.com/docs/static-sites).
- [Render Web Services](https://render.com/docs/web-services).
- [Render-udgivelser](https://render.com/docs/deploys) og
  [begrænsninger ved disk](https://render.com/docs/disks).
- [Render Postgres](https://render.com/docs/postgresql-creating-connecting) og
  [backup/gendannelse](https://render.com/docs/postgresql-backups).
- [Cloudflare-placering af serverarbejde](https://developers.cloudflare.com/workers/configuration/placement/)
  og [Workers-begrænsninger](https://developers.cloudflare.com/workers/platform/limits/).

## Rækkefølge og acceptprøver

### 1. Lokal spiloplevelse — implementeret

Fysik, styring, bane, farer, superhelt, profiler og lokale pointrekorder
findes. Seneste dokumenterede kontrol er 146/146 automatiske tests,
inklusive sammenligning ved 30/60/120/144 billeder i sekundet, input,
skade, billedplacering og lagring. Begge figurers nye landing er desuden
kontrolleret visuelt i browseren. Detaljer og begrænsninger står i
[testrapporten](TESTRESULTATER-RUNNER.md).

### 2. Fælles konkurrence — næste større udviklingsmilepæl

- [ ] Fastlæg de åbne konkurrenceregler nedenfor og lås den officielle
  bane, pointberegning og regelversion.
- [ ] Tilføj server, Postgres-datamodel og migrationer til deltagere,
  konkurrence, forsøg, input og bedste godkendte resultat.
- [ ] Lav deltageroprettelse og privat adgang/returkode, så samme profil
  kan bruges fra flere enheder. Lokale øverekorder bliver adskilt fra
  officielle servergodkendte resultater.
- [ ] Implementér hele forsøgsforløbet ovenfor, inklusive genafspilning,
  grænser for input og serverarbejde samt sikker gentagelse ved netfejl.
- [ ] Vis officiel rangliste med ét bedste godkendt resultat pr. deltager
  og tydelig forskel mellem øvespil og officielle forsøg.
- [ ] Tilføj arrangøradgang til konkurrenceperiode og gennemgang af topforsøg.

Accept: browser og server giver samme resultat for de samme input,
inklusive jordløb og superhelteflyvning. Manipulerede eller genbrugte
forsøg giver ingen ekstra score; en gentaget indsendelse afsluttes kun
én gang. Profil og rekord kan genfindes fra en anden enhed. Netudfald og
afviste officielle forsøg forklares tydeligt, mens øvespil stadig er muligt.

### 3. Mobil, indlæsning og sidste grafik — mangler, kan gå parallelt med 2

- [ ] Optimér de cirka 31,2 MB startbilleder og unødig indlæsning; behold
  originaler og kontrollér alle udsnit, skalaer og gennemsigtighed bagefter.
- [ ] Test på fysiske iPhone- og Android-telefoner samt computer:
  flerfingerstyring, bredformat/rotation, pause, browserbjælker,
  skærmudskæringer, ydelse og første indlæsning på langsommere net.
- [ ] Afprøv spillet med børn fra både den yngre og ældre del af 6–12 år;
  vurder spilglæde, varslingsafstand, perfektbonus og superheltens retur.
- [ ] Prioritér de resterende billeder og effekter i grafiklisten.
  Grafisk finpudsning skal bevare fysik, timing og scoring.
- [ ] Indsæt de faktiske sponsorbilleder via den færdige lokale editor.

Accept: læseligt og responsivt på de afprøvede enheder, samme synlige
banestrækning/varsling for alle og ingen sponsorskjulning fra træer.
Registrér faktisk indlæsningstid og billedfrekvens; der er ikke målt en
mobilgrænse endnu. Målet om 45–120 sekunders runder vurderes med børnene.

### 4. Hosting og driftsprøve — ikke startet

- [x] Saml den aktuelle kode, billeder, tests og dokumentation i GitHub-repositoriet Byfestspillet.
- [ ] Bekræft hostingvalget og forbind hosting med repositoryets `main`.
- [ ] Opret den valgte opsætning, separat prøvedata, databaseforbindelse,
  adgangsoplysninger og sundhedskontrol. Ingen af delene er oprettet nu.
- [ ] Belastningsprøv omkring 50 samtidige spillere og gerne 100 som
  margin, især når flere forsøg afsluttes og kontrolleres samtidigt.
  Mål svartid, fejl, hukommelse og arbejde med lange inputforløb.
- [ ] Afprøv afbrudt forbindelse, servergenstart, opdatering og varig lagring.
- [ ] Afprøv databasebackup og gendannelse med isolerede data; aftal
  acceptabelt datatab og fremgangsmåde ved driftsfejl.
- [ ] Tilknyt den valgte spiladresse til byfestens hjemmeside og afprøv
  hele forløbet med HTTPS fra en fysisk telefon uden for lokalnettet.

Accept: den forventede belastning fungerer med den valgte serverstørrelse,
resultater bevares ved genstart, og gendannelse er faktisk demonstreret.
Op mod 50 samtidige spillere er et mål, ikke en kapacitet der allerede er testet.

### 5. Prøvekonkurrence og åbning — ikke startet

- [ ] Kør en afgrænset prøvekonkurrence med rigtige enheder og deltagere.
- [ ] Ret fund, afslut regler/præmiebetingelser og lås konkurrenceversionen.
- [ ] Hold prøveresultater adskilt fra den officielle konkurrence, offentliggør
  åbning/slutning og gør arrangørens kontrol af præmieplaceringer klar.
- [ ] Åbn først den officielle rangliste, når de foregående acceptprøver er opfyldt.

## Åbne valg før officiel konkurrence

Disse spørgsmål er ikke afklaret ved at implementere den lokale prototype:

- **Deltageradgang:** åben oprettelse med kontrol ved præmieudlevering eller
  en arrangørudstedt kode pr. barn. Returkoder alene forhindrer ikke dubletter.
- **Periode og præmier:** start/sluttidspunkt, lige placeringer og reglen
  om én præmie pr. barn.
- **Pause og netudfald:** tilladt pause/overgangsfrist i et officielt forsøg,
  hvor længe indsendelse må forsinkes, og hvornår et forsøg bliver øvespil.
- **Topresultater:** arrangørens gennemgang og eventuelt overvåget finale.
  Inputrate eller usædvanlig præcision er ikke alene bevis på snyd.
- **Drift:** endeligt hostingvalg og serverstørrelse efter prøverne samt
  acceptable afbrydelser og datatab. Anbefalingen er Render med Postgres;
  der er endnu ikke bestilt ressourcer eller låst en leverandør.

Ændringer i officiel bane eller regler efter åbning kræver en ny version
og en tydeligt adskilt konkurrence/rangliste. De nuværende lokale profiler
og rekorder bevares under deres eksisterende lagringsnøgle.

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
