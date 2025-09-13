# 🎨 Guide des Styles SOPK Companion

Ce document répertorie tous les styles personnalisés disponibles dans l'application, basés sur la charte graphique.

## 🌈 Variables CSS Personnalisées

### Couleurs principales
- `--color-primary-lavande`: #A78BFA (apaisant, bien-être féminin)
- `--color-primary-bleu-ciel`: #93C5FD (sérénité, fiabilité)

### Couleurs d'accent
- `--color-accent-corail`: #FB7185 (vitalité douce, énergie positive)
- `--color-accent-vert-sauge`: #6EE7B7 (équilibre, santé, nature)

### Couleurs neutres
- `--color-fond-clair`: #F9FAFB (fond principal)
- `--color-text-principal`: #1F2937 (texte principal)
- `--color-text-secondaire`: #6B7280 (texte secondaire)

## 🔤 Classes de Police

### Polices par usage
- **Titres**: `font-heading` (Poppins, moderne et arrondie)
- **Corps de texte**: Police par défaut (Inter, lisible)
- **Éléments émotionnels**: `font-emotional` (Raleway italique)

### Styles de texte spéciaux
- `.text-emotional`: Texte en Raleway italique, couleur grise douce
- `.text-motivational`: Texte motivationnel en corail avec emphase

## 🎯 Boutons

### Bouton de base
```html
<button class="btn-sopk">Bouton de base</button>
```

### Boutons par couleur
- `.btn-primary`: Bouton principal (lavande)
- `.btn-secondary`: Bouton secondaire (bleu ciel)
- `.btn-accent-corail`: Bouton d'accent (corail)
- `.btn-accent-vert`: Bouton d'accent (vert sauge)

### Exemple d'usage
```html
<button class="btn-primary">Action principale</button>
<button class="btn-accent-corail">Commencer l'activité</button>
<button class="btn-accent-vert">Enregistrer</button>
```

## 🃏 Cartes

### Carte de base
```html
<div class="card-sopk">Contenu de la carte</div>
```

### Cartes par module
- `.card-dashboard`: Fond lavande dégradé pour dashboard
- `.card-nutrition`: Fond vert sauge dégradé pour nutrition
- `.card-stress`: Fond bleu dégradé pour stress/bien-être
- `.card-activite`: Fond corail dégradé pour activité

### Exemple d'usage
```html
<div class="card-nutrition p-6">
  <h3>Suggestion nutritionnelle</h3>
  <p>Contenu du module nutrition</p>
</div>
```

## 🏷️ Badges et Tags

### Badge de base
```html
<span class="badge-sopk">Badge</span>
```

### Badges par couleur
- `.badge-lavande`: Badge lavande
- `.badge-bleu-ciel`: Badge bleu ciel
- `.badge-corail`: Badge corail
- `.badge-vert-sauge`: Badge vert sauge

### Exemple d'usage
```html
<span class="badge-vert-sauge">IG très bas</span>
<span class="badge-corail">Énergie</span>
```

## 📝 Champs de saisie

### Input personnalisé
```html
<input type="text" class="input-sopk" placeholder="Votre saisie...">
```

## 🌸 Recommandations d'usage par module

### Dashboard / Accueil
- Cartes: `.card-dashboard`
- Boutons principaux: `.btn-primary`
- Badges: `.badge-lavande`, `.badge-bleu-ciel`

### Nutrition
- Cartes: `.card-nutrition`
- Boutons d'action: `.btn-accent-vert`
- Badges: `.badge-vert-sauge`

### Stress & Bien-être
- Cartes: `.card-stress`
- Boutons: `.btn-primary`, `.btn-secondary`
- Badges: `.badge-lavande`

### Activité Physique
- Cartes: `.card-activite`
- Boutons d'énergie: `.btn-accent-corail`
- Badges: `.badge-corail`

## ✨ Conseils d'utilisation

1. **Cohérence**: Utilisez les mêmes styles pour les mêmes types d'actions
2. **Hiérarchie**: `.btn-primary` pour l'action principale, autres pour les actions secondaires
3. **Modules**: Respectez les couleurs d'accent par module pour la cohérence visuelle
4. **Accessibilité**: Tous les styles incluent des états hover et focus
5. **Transitions**: Animations douces incluses pour une expérience fluide

## 🎨 Personnalisation

Pour modifier les couleurs, éditez les variables CSS dans `src/index.css`:

```css
:root {
  --color-primary-lavande: #A78BFA; /* Votre nouvelle couleur */
}
```

Les changements se propageront automatiquement à tous les composants utilisant cette variable.