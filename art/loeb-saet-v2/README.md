# Korrigeret løbeserie

28. oktober 2026. Rettelse efter arrangørens 4,435 sekunders skærmoptagelse.
Den gamle serie gentog brede skridt med næsten samme ben foran og satte en
markant sammenkrøbet pose ind midt i løbet. En omrokering kunne ikke skabe
de manglende mellemstillinger. De gamle masterfiler er bevaret uændret i
[det første løbesæt](../loeb-saet/README.md).

## Valgte billeder

Begge masters er fremstillet med indbygget imagegen fra en konkret
[poseguide](poseguide.png) og den godkendte stilprøve. De er kopieret
uændret fra værktøjets output; reel RGBA-alpha 0–255, intet maskeret tern.
[Præcise prompts og kildefilnavne](PROMPTS.md).

| Fil | Mål | Bytes | Neutralens synlige højde |
| --- | --- | ---: | ---: |
| [dreng-loeb.png](dreng-loeb.png) | 1254 × 1254 | 1.038.064 | 386 |
| [pige-loeb.png](pige-loeb.png) | 1254 × 1254 | 1.177.504 | 379 |

SHA-256:

```text
0d5db2c7485761a21a4935827e13f6d7644e94c6d0b21f9dad162c7a4fda30f8  dreng-loeb.png
90e9f7d59686ba17f7c1e39bef75e2e98ed8cbd27aece64928278d677d8f1f37  pige-loeb.png
```

Poseguiden er et teknisk diagram til billedværktøjet og indlæses ikke af
spillet. Tidligere genereringsforsøg gentog samme benstilling; de blev
fravalgt, ligesom en efterfølgende armvariant. De er ikke lagt i projektet.

## Faser, skala og fodkontakt

Begge ark bruger standardkolonner/-rækker 0/418/836/1254. Neutral er celle 0.
Celler 1–8 afspilles i rækkefølge og gentages fra 8 til 1. Serien har to
passagefaser 3/7 frem for den gamle dybe sammenkrøbning. Det er et stiliseret
løb: armsvinget er beskedent, 2/6 har beslægtet silhuet, og 4/8 er lange
udstrakte skridt. Det er ikke en anatomisk perfekt animation.

Alle celler har fri margen; ingen sko eller hår krydser cellegrænsen.
Én fælles skala fra neutralen bruges gennem hvert ark: 70/386 og 70/379.
Der er ingen individuel tilpasning af posernes højde eller billedforhold.
Den målte hofteplacering er vandret anker; den synlige alpha-bund er
fodankret. Alpha-bounds måles ved alpha≥64 som i den eksisterende indlæser.

| Celle | Dreng (x,y lokalt) | Pige (x,y lokalt) |
| ---: | --- | --- |
| 0 | 230,412 | 221,403 |
| 1 | 222,411 | 217,399 |
| 2 | 221,412 | 216,402 |
| 3 | 224,408 | 229,405 |
| 4 | 210,396 | 214,403 |
| 5 | 221,411 | 215,405 |
| 6 | 210,398 | 219,395 |
| 7 | 216,398 | 224,395 |
| 8 | 223,392 | 223,394 |

Takt og afspilningslogik er uændrede: ni billeder/sekund ved normal fart,
højst tolv ved høj fart, kun under aktiv kontakt. Pause og lufttid flytter
ikke fasen frem. Hop, afsæt, skade, slisker og superhelt prioriterer fortsat
hver deres grafik. Fysik, point, profiler og lagringsnøgler er uændrede.

## Kontrol

[143 automatiske tests består](../../TESTRESULTATER-RUNNER.md), inklusive
ny regression af de præcise nye billedstier og et helt loop med wrap for
begge figurer gennem den faktiske browseradapter. Eksisterende kontroller
af takt, pause, lufttid og kontaktankre består. Syntetiske testbilleder kan
fastholde afspilningskontrakten, men kan ikke bevise naturlig anatomi.

Alle otte billeder og 8→1 er visuelt gennemgået i browseren ved 1280 × 720 med
begge figurer i faktisk spilstørrelse. Det aktuelle renderingsprogram blev
brugt med syntetiske profildata og et inaktivt prøvelager. Kontrol af en
afsluttet prøverunde gav nul lagerskrivninger og uændrede virkelige data.
Den midlertidige prøveside er fjernet efter kontrol.

- [Browserbillede](browserproeve.png).
- [Alle før/efter-trin](sekvenskontrol.png).
- [Animeret før/efter-prøve](loeb-foer-efter.gif), sammensat af browserbilleder
  med 110 ms pr. billede, cirka normal løbetakt. Venstre er før, højre er nu.

Prøven viser kun figurer på jorden og er ikke en fuld spiltest. Fysiske
telefoner, berøringsinput og vurdering af bevægelsen med børn mangler.
