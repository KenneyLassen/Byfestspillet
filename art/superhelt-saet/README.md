# Superhelte og powerup

Produceret 27. oktober 2026 med indbygget imagegen i tre separate kald.
De tre masterfiler er kopieret uændret fra værktøjets output. Der er ikke
beskåret, omfarvet eller omskaleret i PNG-filerne. Den godkendte
[stilprøve](../stilproeve/stilproeve-01.png) og de eksisterende figurark
er reference for stil, genkendelighed og kropsproportioner.
[De fulde prompts og kildefilnavne](PROMPTS.md) er bevaret.

## Filer

| Master | Mål | Format | Bytes | Indhold |
| --- | --- | --- | ---: | --- |
| [dreng-superhelt.png](dreng-superhelt.png) | 1254 × 1254 | RGBA | 1.024.459 | Neutral kalibrering og tre højrevendte flyveposer. |
| [pige-superhelt.png](pige-superhelt.png) | 1254 × 1254 | RGBA | 1.174.073 | Samme serie til pigen. |
| [powerup.png](powerup.png) | 1536 × 1024 | RGBA | 1.355.354 | Gylden stjerne med lilla kappe. |

Begge figurark har alphaværdier 0–255. Powerup har 0–254. Alle har reel
gennemsigtighed, uden indtegnet tern eller maskering ved indlæsning.
Samlet filstørrelse er 3.553.886 bytes; optimering til langsomme
mobilforbindelser er endnu ikke udført.

SHA-256:

```text
2726f4ed4195a98282425a86ecdd792136ae4fbc697f8fa9cd96a4ca1f18eb70  dreng-superhelt.png
62d942153d65f47d579f2c40562b40be3a40aac832d65538a43454a20ff09d73  pige-superhelt.png
eb94a7b4f1aece0eedce4c4ded4df783a10981c269b42c6366a56a50b9117b4e  powerup.png
```

Kilderne er henholdsvis `exec-2111647c-f727-437e-9646-a1a51292fb44.png`,
`exec-61f415e3-7219-415f-9e01-24680276f746.png` og
`exec-89a2d17f-5e97-4d37-b259-f7e3e6a03c81.png`.
Begge leverede figurer har lilla kappe med gylden kant og beholder deres
oprindelige tøjfarver og har et gyldent stjernemærke.

## Rækkefølge, udsnit og ankermål

Pose 0 er stående kalibrering. Poser 1–3 er vandret flyvning mod højre,
med armen frem og kappen bagud. De brede kapper passer ikke til fire
ens kvadranter. `HERO_SHEETS` i runner.js bruger derfor nedenstående
målte kildeområder, så en kappe ikke afskæres eller kommer med i en nabopose.
Højre og nederste områdegrænse er eksklusiv.

| Figur / pose | Område (venstre, top, højre, bund) | Anker (x, y i hele masteren) | Ankertype |
| --- | --- | --- | --- |
| Dreng 0 | 0, 0, 500, 680 | 320, 611 | Fødder |
| Dreng 1 | 520, 0, 1254, 680 | 1000, 430 | Bryst |
| Dreng 2 | 0, 700, 627, 1254 | 400, 1020 | Bryst |
| Dreng 3 | 627, 700, 1254, 1254 | 1030, 1030 | Bryst |
| Pige 0 | 0, 0, 540, 680 | 320, 630 | Fødder |
| Pige 1 | 570, 0, 1254, 680 | 970, 450 | Bryst |
| Pige 2 | 0, 700, 627, 1254 | 400, 1010 | Bryst |
| Pige 3 | 627, 700, 1254, 1254 | 1040, 1040 | Bryst |

Indlæseren finder den synlige alpha inden for hvert område og bruger én
fælles skala fra kalibreringens højde: dreng 70/518 og pige 70/549.
Skalaen anvendes ens i begge retninger og i alle fire poser. De vandrette
poser tilpasses ikke hver for sig til en 70-enheders høj ramme. Brystankeret
følger figurens midte 35 spilenheder over fysikkens fodkoordinat.

De tre flyveposer skifter hver 18. simulationstrin, svarende til 0,15
aktive sekunder pr. billede. Pause fryser dem. Reduceret bevægelse bruger
første flyvepose uden kappeloop. Ved manglende billedindlæsning findes en
enkel canvasreserve, så effekten stadig kan vises.

Powerup-billedets synlige område er (84, 99)–(1449, 892), eksklusiv
højre/bund. Det vises helt med bevaret billedforhold inden for 50 × 50
spilenheder; den fysiske opsamling bruger 42 × 42. Ikon og SUPERHELT-tekst
tegnes efter forgrundstræerne og kan derfor aflæses før opsamlingen.

## Virkning i spillet

Første mulighed for fremkomst er efter 30 aktive sekunder. Senere er der
mindst 55 aktive sekunder mellem fremkomster. Der ventes på en egnet bred
pude eller jord uden projektilmærkning, 750 spilenheder foran figuren.
Der kan kun være én uopsamlet powerup; passerede ikoner fjernes.
Fremkomsten er deterministisk i den fælles Core-simulation.

Opsamling starter 840 aktive simulationstrin, præcis syv sekunder.
Figuren flyver med fart 1050, løftes blødt og er beskyttet mod skade.
HOP er slået fra og forklares som automatisk flyvning; skærmen viser
resterende tid. Perfektserie, hoppekraft og optjent bonus bevares.
Flyvningen giver almindelige tidspoint, ingen ekstra pointbonus.

Det sidste sekund bruges til blød nedflyvning på en bred sikker flade.
Banegenereringen udvides ved behov for at finde en reel landingsflade,
og figuren flyttes aldrig baglæns. Den automatiske pudelanding bedømmes
ikke som et perfekt eller misset hop. Der gives mindst 1,2 sekunders
beskyttelse og tre sekunders afstand til næste nye projektil.

## Kontrolstatus

Den automatiske kontrol omfatter indlæsning af de målte områder,
fælles skalering, pause, HUD og opsamling samt Core-forløbet fra start til
sikker landing. Den aktuelle samlede status står i
[testrapporten](../../TESTRESULTATER-RUNNER.md).
Begge figurer er visuelt kontrolleret i browseren ved 1280 × 720, sammen
med powerup, nedtælling og genaktivering af HOP efter syv sekunder.
[Flyvning i spillet](flyvning.png) og [samlet grafikprøve](forhaandsvisning.png)
er gemte browserbilleder; prøverne bruger isolerede data.
Fysiske telefoner og afprøvning med børn mangler fortsat.
