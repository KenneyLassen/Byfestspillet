# Testresultater — Hop og Rul-prototype
Dato: 16. september 2026.

## Automatiske tests

54 af 54 tests består: 18 for runnerens spilregler, 8 for browseradapteren
og 28 for den tidligere hoppeborg.

Testkommando fra projektroden: node --test game/tests/*.test.cjs

Spilreglerne testes direkte i runner-core.js. Browseradapteren i runner.js
afvikles med efterligninger af DOM, canvas, lyd og lagring; der indsættes
kun testadgang i testprocessens hukommelse, ikke i produktionsfilerne.

Kontrollerne omfatter:

- Samme input giver samme fysik og score ved 30, 60, 120 og 144 billeder/sek.
- Korte/lange hop, tryk lige før landing og kort efter en platformkant.
- Et holdt tryk giver ikke gentagne automatiske hop eller rul.
- Fødderne følger flader og sammenhængende slisker; landing på hoppepude giver afsæt.
- Rul undgår frisbees i hovedhøjde; lave pølser kræver hop.
- Tre liv, AV!, nulstilling af combo/hoppekraft, straks nedadgående bevægelse.
- Samtidige træffere koster ét liv; beskyttelsesperioden forhindrer dobbeltskade.
- Missede platforme giver sikker redning; ingen point under redning.
- Figuren bliver i spilområdet, inklusive det sidste fald.
- En kontrolspiller med præcis viden om banen gennemfører 220 simulerede
  sekunder uden skade og når fartloftet på 400. Det viser en mulig rute;
  det dokumenterer ikke, at børn oplever banen som nem eller sjov.
- Korte tastatur-/pointertryk mellem to skærmbilleder registreres.
- Fokus, pause, genstart og lange frame-afbrydelser giver hverken hængende
  knapper eller gratis overlevelsestid.
- Rotation kræver bevidst genoptagelse.
- Gamle navne/figurer importeres uden gamle upgrades eller point.
- Gamle lagringsnøgler forbliver uændrede.
- Kun bedste runner-resultat pr. profil gemmes; dobbelt afslutning ignoreres.
- De oprindelige 28 regressionstests består fortsat mod hoppeborg.html.

## Afprøvet i en rigtig browser

Afprøvet i Codex-browseren via http://127.0.0.1:8765/:

- Menuside og grafik ved almindelig desktopvisning omkring 1280 × 720.
- Eksisterende Testspiller/Testpige-profiler blev vist med nye runner-rekorder på nul.
- Start med Testpige, tastaturhop med mellemrum og pause med Escape.
- Liggende mobilvisning 844 × 390: HUD, HOP-knap og spilbane visuelt kontrolleret.
- Højformat 390 × 844: automatisk pause og besked om at vende telefonen.
- Tilbage til bredformat: turen venter på Spil videre.
- En tur sluttede efter tre tabte liv med 12,3 sekunders score; resultatet
  blev vist og fandtes stadig på den lokale rangliste efter genindlæsning.
- Lille liggende skærm 667 × 375: RUL-knappen aktiverede synlig rullepose;
  bane, tre liv, tid og knapper passede i skærmen.
- Browserens fejllog viste ingen JavaScript-fejl ved disse kontroller.

## Mangler før offentlig konkurrence

- Afprøvning med børn fra både den yngre og ældre del af gruppen 6–12 år.
- Fysiske iPhones/Android-telefoner, Safari/Chrome, browserbjælker,
  skærmudskæringer og ægte samtidig flerfingerbetjening.
- Lydens oplevede kvalitet; browserlyd er ikke lyttet igennem på en fysisk enhed.
- Egentlige løbe-, rulle- og glidebilleder. Prototypen bruger de eksisterende
  figurer uden at strække dem; rul tegnes ved rotation.
- Flere banemønstre og afprøvning af den oplevede sværhedsgrad.
- Fælles rangliste, konkurrencekoder, servervalidering og regler for onlinepauser.
- Render, SQLite, backup/gendannelse og belastningstest er ikke implementeret.

Spillets rekorder er lokale og kan ændres i browseren. Denne udgave er derfor
beregnet til afprøvning, ikke til uddeling af præmier endnu.
