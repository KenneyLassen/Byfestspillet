# Sponsorbilleder til Hop og Rul

Åbn [sponsoreditoren](sponsorer.html) via den samme webserver som spillet,
eksempelvis http://127.0.0.1:8765/sponsorer.html. Den indlæser den nuværende
`sponsorer.json`, før du kan begynde at redigere.

1. Vælg et færdigt sponsor-/bannerbillede i PNG, JPEG eller WebP. Vandrette
   bannere omkring 6:1 passer bedst. Hele billedet vises uden at blive strakt;
   billede og eventuel tekst skal derfor være samlet i den valgte fil.
2. Kontrollér **Betegnelse (kun i oversigten)**. Den udfyldes fra filnavnet og
   kan ændres. Betegnelsen er intern og vises ikke på spillets bannere.
3. Klik **Tilføj sponsor**. Brug **Rediger**, **Op**, **Ned** og **Fjern** til
   at justere listen. Rækkefølgen gentages langs banen. Klik **Gem sponsor**
   efter redigering; hvert element skal have et billede.
4. Klik **Hent sponsorfil**. Den hentede fil hedder `sponsorer.json` og
   indeholder billederne. Du kan senere åbne den med **Åbn en sponsorfil**;
   det erstatter listen i editoren.
5. Erstat `sponsorer.json` i `game`-mappen med den hentede fil, og udgiv
   spillet igen. Først derefter ser andre de samme sponsorbilleder. Genindlæs
   spillet for at se den nye liste.

Der er plads til højst 24 sponsorer, 3 MB pr. billede og 8 MB i hele
sponsorfilen. Billeddata fylder lidt mere i sponsorfilen end i en separat
billedfil. Brug mindre billeder, hvis den samlede grænse nås. Betegnelser
kan være op til 60 tegn. SVG og billeder fra eksterne webadresser accepteres
ikke.

Kladder bliver kun på den åbne side og forsvinder ved genindlæsning, hvis du
ikke henter filen. Editorens knapper skriver ikke til serveren, publicerer
ikke noget og bruger ikke spillernes profil- eller rekordlager.

Den medfølgende liste er tom og viser ingen sponsorbannere. For at fjerne
alle reklamer skal du fjerne alle elementer i editoren, hente den tomme
liste og erstatte/udgive filen på samme måde. Sponsorernes billeder tegnes
foran træerne på pudernes forsider; den synlige hoppeflade er fri.
