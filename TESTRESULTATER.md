# Testresultater — 16. september 2026

## Automatiske kontroller

`node --test tests/gameplay.test.cjs`: 28 tests bestået.

Testene kører den faktiske kode fra index.html i et isoleret Node-miljø med
simuleret DOM, lyd og localStorage. Testadgangen til spillets interne tilstand
indsættes kun i hukommelsen; spilfilen indeholder ingen testbagdør.

Kontrolleret:

- Bevægelse, point og fulde 60-sekunders runder ved 30, 60 og 144 fps.
- Perfekte/gode hop før landing, for tidligt tryk, holdt tast og gentagelse.
- Fokus, flere taster til samme retning, Shift+A/D og tekstfelter.
- Samtidig touch-bevægelse/hop og afbrudt pointer-input.
- AV!, nulstilling, straks-fald og beskyttelsestid for pølse, tallerken,
  pommes og ballon; skjold bevarer combo og kraft.
- Grænser ved ekstreme hastigheder, høje opgraderinger og positioner udenfor.
- Mønter, magnet, skjold, shopkøb samt bevarelse af eksisterende v2-data.
- Afrundet slutresultat, mønter og highscore gemmes én gang ved rundens slutning.
- Canvas-kald bevarer billedernes proportioner og placerer figurernes synlige
  nederkant ved gulvet. Disse tests simulerer billedindlæsningen.

JavaScript-syntaks er kontrolleret med Node.

## Browserafprøvning

Spillet er kørt via lokal HTTP-server i Codex' indbyggede browser.

- Oprettelse af drengeprofil og pigeprofil gennem den rigtige brugerflade.
- Visuel kontrol af hoppeborg, små figurer og grafik med baggrundsmaskering.
- En fuld 60-sekunders runde afsluttede med resultat 859 og 6 mønter i denne
  tilfældige prøverunde. Shop viste 6 mønter. Highscore 859 var bevaret efter
  genindlæsning, og spillerlisten bevarede både mønter og rekord.
- Desktopvisning 1280 × 720 og mobilbredde 390 × 844 blev visuelt kontrolleret.
  Banen bevarer proportioner; mobilknapper og panel passer i bredden.
- Den grønne HOP-knap blev afprøvet i mobilvisningen og gav Perfekt hop!
  og combo 1 i det kørende spil.
- Browserens registrerede JavaScript-fejllog var tom under prøverunden.

## Ikke testet / udestår

- Ægte iPhone/Android, fysisk multitouch, Safari og Firefox.
- Lydens oplevede kvalitet og lydstyrke. Koden spiller en tone ved skade;
  AV! vises i en taleboble og popup, ikke som indtalt tale.
- Integration på jeres faktiske hjemmeside, indlejring og hostingopsætning.
- Online rangliste og konkurrence fra flere enheder er ikke implementeret.
- Den separate logofil mangler og kan derfor ikke visuelt verificeres.
- Timing og sværhedsgrad bør afprøves af børn fra målgruppen. Automatiske
  tests bekræfter logikken, ikke om spillet opleves sjovt eller passende svært.

Browserprofilerne Testspiller og Testpige er kun lokale testdata på
127.0.0.1:8765. Brugernes eksisterende browserdata er ikke ændret.
