# Jordstrækninger og træstolper

Integreret 27. oktober 2026. Dette sæt bruger canvasgrafik og eksisterende
figurbilleder. Der er ikke fremstillet nye AI-billeder eller ændret masters.

## Jordløb og returhop

Banen har en tidlig jordstrækning i introen og flere i den faste gentagelse.
Hver jordstrækning er 1500 spilenheder lang med kontaktkant ved y=550.
Græstop, små totter og muldside til y=675 tegnes i verdenskoordinater.
Begge figurer bruger de eksisterende højrevendte løbetrin med samme kropsskala
og skoankre som hidtil. Der er ingen automatisk fjedring på jord.

HOP starter et manuelt spring op på næste pude ved y=435. Hjælpen bliver
aktuel ved afstand højst figurens halve bredde plus fart × 0,4 sekunder;
HOP-knappen forklarer, at der skal hoppes op. Denne hjælp ændrer ingen
fysik og er ikke automatisk styring.

Perfektserie, hoppekraft og optjente bonuspoint bevares på jord og under
hop fra jord. Første pudelanding igen bedømmes normalt. Ved et manglende
eller for lavt returhop møder kroppen pudens lodrette front: AV!, ét livstab
og den kendte sikre fremadredning. Ved en jord→pad-landing kan den
plantede fod lande, så snart figurens bredde overlapper padtoppen; samme
regel bruges af timingforudsigelsen. Det holder langsom venstrestyring
spilbar uden at ændre gamle pad→pad-landinger. Jordstrækningens længde giver også en
spiller med maksimal fremadfart og fuldt rebound plads til et nyt spring.

## Træstolper

Hver høj snortop på worldX=1200 × n har en træstolpe. Snoren hænger ved
y=170; stolpens afrundede kappe begynder ved y=156, bredden er 24, højden er 434 og bunden
er y=590, så stolpen ikke stikker under pudernes bund. Åretegning, knast, højlys og binding giver stolpen træstruktur.

Stolpen tegnes i samme verdenslag som linen, før terræn, figur og
sponsorbannere. Puder og jord kan derfor skjule stolpens bund. Kameraløft
flytter stolpe, snor og bane sammen. Den lille flagvind er bevaret, og
stolperne tilføjer hverken kollisioner eller point.

## Billedprøver og kontrol

- [Jordløb og stolper](forhaandsvisning.png).
- [Hop tilbage på puden](hop-op-pude.png).

Jordscenen og et manuelt returhop med den faktiske Core er kontrolleret
ved 1280 × 720. Combo 4, charge 3 og bonus 200 er bevaret gennem hoppet,
og figuren lander med tre liv. Prøverne er kontrollerede scener, ikke
en spiltest med mennesker. [Den aktuelle testrapport](../../TESTRESULTATER-RUNNER.md)
beskriver resultaterne og browsercachens rettelse. Automatiske tests dækker Core-returhop,
bevarede serier/bonuspoint, frontskade, jordrendering, hjælpetekst og stolpelag.
Kontrollerede simuleringer og en mulig reference-rute erstatter ikke
spiltest med børn eller afprøvning på fysiske telefoner.

Den lokale prototype beholder regellabel 4 og eksisterende profiler/rekorder,
men Core og bane er ændret. Gravitation, afsætshastigheder og pad-timing er
bevaret. En kommende officiel konkurrence får en låst bane og regelversion.
