# Migration des images vers 384x384

## Contexte

Les images étaient précédemment enregistrées en taille complète. Elles sont maintenant automatiquement redimensionnées à 384x384 lors de l'upload.

## Modifications apportées

### 1. Code backend (`picture_router.py`)

La fonction `import_picture` a été modifiée pour redimensionner automatiquement toutes les nouvelles images à 384x384 avant de les sauvegarder.

**Changements:**
- Redimensionnement à 384x384 avec conservation du ratio (thumbnail)
- Conversion en RGB si nécessaire
- Qualité JPEG: 90
- Optimisation activée

### 2. Script de migration (`migrate_resize_images.py`)

Un script a été créé pour redimensionner toutes les images existantes.

## Utilisation du script de migration

### Prérequis

Le script nécessite Python 3 et Pillow (PIL). Si vous utilisez Docker, exécutez le script dans le conteneur:

```bash
docker exec -it <container_name> python /app/migrate_resize_images.py
```

### Options

```bash
# Voir ce qui serait fait sans modifier les fichiers (recommandé en premier)
python migrate_resize_images.py --dry-run

# Redimensionner toutes les images (mode interactif)
python migrate_resize_images.py

# Spécifier un dossier uploads différent
python migrate_resize_images.py --uploads-dir /chemin/vers/uploads

# Modifier la qualité JPEG (défaut: 90)
python migrate_resize_images.py --quality 85
```

### Exemple d'utilisation

```bash
# 1. D'abord, tester en mode dry-run
python migrate_resize_images.py --dry-run

# 2. Si tout est OK, lancer la migration
python migrate_resize_images.py

# Le script vous demandera confirmation avant de procéder
# Continuer? (o/N): o
```

## Résultat attendu

- Les images de plus de 384x384 seront redimensionnées
- Les images déjà à la bonne taille seront ignorées
- Le ratio d'aspect sera préservé
- Les fichiers originaux seront remplacés (pensez à faire une sauvegarde!)

## Notes importantes

⚠️ **IMPORTANT**: Le script remplace les fichiers originaux. Faites une sauvegarde du dossier `uploads` avant de lancer la migration!

```bash
# Exemple de sauvegarde
cp -r uploads uploads_backup_$(date +%Y%m%d_%H%M%S)
```

## Support

Pour toute question ou problème, consultez les logs du script ou contactez l'équipe de développement.
