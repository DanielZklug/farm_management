# Documentation de prise en main du projet Farm Management (React)

Bienvenue sur le projet **Farm Management**. Ce projet propose deux modes de fonctionnement :  
- **Mode démo autonome** (sans serveur Laravel)
- **Mode connecté à Laravel** (API réelle)

---

## 1. Mode démo autonome (utilisation du dossier `src-Copy`)

Ce mode permet de tester l’interface sans avoir besoin d’un backend Laravel.  
**Idéal pour la découverte rapide ou la démonstration.**

### Étapes à suivre

1. **Renommer le dossier**
   - Renommez le dossier `src-Copy` en `src` (remplacez l’ancien dossier `src` si besoin).

2. **Installer les dépendances**
   - Ouvrez un terminal dans le dossier `react` :
     ```bash
     npm install
     ```

3. **Lancer l’application**
   - Toujours dans le dossier `react` :
     ```bash
     npm run dev
     ```
   - L’application sera accessible sur [http://localhost:3000](http://localhost:3000).

---

## 2. Mode connecté à Laravel (utilisation du dossier `src`)

Ce mode nécessite un serveur Laravel fonctionnel pour accéder à toutes les fonctionnalités réelles (authentification, gestion des données, etc.).

### ⚠️ Pour utiliser ce mode, veuillez me contacter afin d’obtenir la configuration et les accès nécessaires au backend Laravel.

---

## 3. Structure du dossier [react](http://_vscodecontentref_/0)

- `src/` : Version connectée à Laravel (API réelle)
- `src-Copy/` : Version démo autonome (mock data, pas de backend requis)
- [public](http://_vscodecontentref_/1) : Fichiers statiques
- [package.json](http://_vscodecontentref_/2) : Dépendances et scripts npm
- [vite.config.js](http://_vscodecontentref_/3), [tailwind.config.js](http://_vscodecontentref_/4) : Configuration du projet

---

## 4. Scripts utiles

- `npm run dev` : Démarre le serveur de développement (Vite)
- `npm run build` : Génère la version de production
- `npm run lint` : Vérifie la qualité du code

---

## 5. Besoin d’aide ?

Pour toute question ou pour utiliser la version connectée à Laravel, **contactez le développeur