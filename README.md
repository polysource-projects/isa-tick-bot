# Isa Tick Bot 

Le script détecte automatiquement les cours "cochés", ainsi que les nouvelles notes dans ISA et envoie un message d'avertissment sur telegram. Rafraîchissment toutes les 20 secondes.

## Utilisation

1. Ajoutez un fichier `.env` dans le dossier et y insérer le token de votre bot telegram sous le nom `TELEGRAM_TOKEN`. Vous pouvez aussi choisir un port spécifique avec `PORT`.
2. Modifiez le `chat_id` dans `script-isa.js` pour y mettre le lien de votre conversation telegram. 
3. Modifiez également à la ligne 106 le selecteur pour le semestre recherché.
4. Lancez le serveur dans le terminal `node server.js`
5. Installez Tampermonkey sur Google Chrome et collez y le script
6. Ouvrez la page `Examens` sur ISA, et laissez votre PC tourner :)

## ⚠️ Note

Le script est à usage personnel. Il ne fonctionne pas si ISA le déconnecte.

