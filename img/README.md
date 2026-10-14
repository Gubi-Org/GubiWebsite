# img/

Hier kommen später eigene Screenshots vom GubiCraft-2-Server hinein.

Die Startseite hat einen Platzhalter-Slot (`.screenshot-slot` in `index.html`,
Abschnitt "Server-Infos") mit dem Hinweis "Screenshot folgt". Sobald ein Bild
hier abgelegt wird, kann der Platzhalter-Inhalt durch ein `<img>`-Tag ersetzt
werden, z. B.:

```html
<div class="screenshot-slot panel bevel">
  <img src="img/server-1.jpg" alt="Screenshot vom GubiCraft-2-Server" />
</div>
```

Empfohlen: JPG/WebP, max. ~1600px Breite, um die Ladezeit niedrig zu halten.
