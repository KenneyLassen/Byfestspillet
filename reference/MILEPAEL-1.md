# Aulum Byfest: Hoppeborg Challenge — milepæl 1

Denne udgave videreudvikler den eksisterende `index.html` fra
https://github.com/KenneyLassen/Byfestspillet (hentet 16. september 2026).
Den hentede original er bevaret uændret i `reference/index.original.html`.
Synkroniserede filer under projektets `sources/` er ikke ændret.

## Kilder og kort plan

Projektmappen var uden kode, billeder og separat brief. GitHub indeholdt
`index.html` og `README.md`, men ingen billedfiler. Krav og otte originale
billeder blev fundet i den delte samtale:
https://chatgpt.com/share/6aaa914f-aeb4-83eb-a502-702a855f456f

Planen var at bevare spillets struktur og gemte data, integrere originalgrafik
med fælles mål for tegning og landinger, rette input/timing/skade og teste
spilforløb samt lagring. Der er ikke skiftet framework eller skrevet et nyt spil.

## Start spillet

Åbn `index.html` i en moderne browser, eller servér denne mappe med en lokal
webserver. Eksempel fra mappen: `python3 -m http.server 8765`.
Åbn derefter http://localhost:8765.

Venstre/højre eller A/D flytter figuren. Pil op, mellemrum eller HOP-knappen
giver timing-hop. HOP-knappen bliver grøn før landing. Slip mellem hvert tryk.
Knapperne understøtter samtidig bevægelse og hop med flere fingre.

## Ændringer

- De otte billeder fra samtalen ligger ved siden af HTML-filen.
- Alle billeder skaleres ens i begge retninger. Ingen stræk/squash.
- Originalernes baggrund maskeres i browserens tegnebuffer, hvor det er
  nødvendigt; de originale PNG-filer er bevaret. Lyse, indelukkede detaljer
  som øjne og sko bevares. Hoppeborgens åbning har et særskilt maskepunkt.
- Synlige spritekanter findes ved indlæsning. Figurernes maksimale tegnefelt
  er 52 × 72; den synlige nederkant forankres i kollisionspunktet ved fødderne.
- Hoppefladen er målt til y=760 i den originale hoppeborg på 1536 × 1024.
  Tegning, gulv og vandrette grænser anvender den samme skalering.
- Bevægelse og pointoptjening er uafhængige af billedhastighed. Små fysiktrin
  og inputbuffer giver timing før landing med højst én belønning pr. hop.
- Maksimal hoppehøjde og grænser tager højde for hele figuren og rystelser.
- Alle fire forhindringstyper viser AV!, spiller en skadeslyd, nulstiller
  combo/hoppekraft og sender spilleren nedad. Kontakten forbruges, og en kort
  skadespause forhindrer gentagne træffere fra samme sammenstød.
- Skjold bevarer combo og hoppekraft. Profiler, figurvalg, alle fem
  opgraderinger, shop, mønter og lokale highscores er bevaret.
- Tastetryk slippes ved fokustab; tekstfelter påvirkes ikke af spilstyring.
  Skjult browserfane pauser rundens simulation.
- Navne vises som tekst, og manglende billeder eller blokeret lagring får en
  fallback/besked i stedet for at stoppe spillet.

## Lagring og udgivelse

Spillet bruger fortsat `aulumByfestData_v2`. Hvis kun v1-data findes, læses de
og gemmes i v2 ved næste gemning. Den gamle nøgle slettes ikke.
Browserdata følger webstedets adresse (origin): eksisterende profiler kan
bevares, når denne udgave erstatter spillet på den samme adresse. De flyttes
ikke automatisk mellem lokal test, forskellige domæner eller enheder.

HTML og billeder kan ligge på jeres hjemmeside eller en anden statisk vært.
Der er ikke publiceret eller ændret noget på GitHub eller jeres hjemmeside.
En fælles konkurrence på tværs af børnenes enheder kræver næste milepæl:
online rangliste med serverlagring og kontrol af indsendte resultater.

## Kendt mangel

`AulumByfestLogo.png` findes hverken i GitHub-projektet eller som en
tilgængelig originalfil i delingen. Koden er klar til filen og bevarer dens
proportioner, når den tilføjes. Indtil da bruges titlen som reservevisning;
hoppeborgsbilledet indeholder allerede teksten AULUM BYFEST.

Se `TESTRESULTATER.md` for præcis testafgrænsning.
