#!/usr/bin/env python3
"""
Script de migration pour redimensionner toutes les images existantes à 384x384.

Usage:
    python migrate_resize_images.py [--uploads-dir UPLOADS_DIR] [--dry-run]

Options:
    --uploads-dir: Chemin vers le dossier uploads (défaut: ./uploads)
    --dry-run: Afficher ce qui serait fait sans modifier les fichiers
"""

import argparse
import io
import sys
from pathlib import Path
from PIL import Image
from typing import List, Tuple


def resize_image(image_path: Path, target_size: Tuple[int, int] = (384, 384), quality: int = 100) -> bool:
    """
    Redimensionne une image à la taille cible exacte (crop).

    Args:
        image_path: Chemin vers l'image
        target_size: Taille cible (largeur, hauteur)
        quality: Qualité JPEG (1-100)

    Returns:
        True si l'image a été redimensionnée, False sinon
    """
    try:
        # Ouvrir l'image
        with Image.open(image_path) as img:
            original_size = img.size

            # Vérifier si l'image est déjà à la bonne taille exacte
            if img.size == target_size:
                print(f"✓ {image_path.name}: Déjà à la bonne taille {img.size}")
                return False

            # Convertir en RGB et redimensionner (crop) à la taille exacte
            img = img.convert("RGB")
            img = img.resize(target_size)

            # Sauvegarder l'image redimensionnée
            buffer = io.BytesIO()
            img.save(buffer, format="JPEG", quality=quality, optimize=True)

            # Remplacer le fichier original
            image_path.write_bytes(buffer.getvalue())

            print(f"✓ {image_path.name}: {original_size} → {img.size}")
            return True

    except Exception as e:
        print(f"✗ Erreur lors du traitement de {image_path.name}: {e}", file=sys.stderr)
        return False


def find_images(uploads_dir: Path) -> List[Path]:
    """
    Trouve toutes les images dans le dossier uploads.

    Args:
        uploads_dir: Chemin vers le dossier uploads

    Returns:
        Liste des chemins d'images
    """
    extensions = {".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"}
    images = []

    for ext in extensions:
        images.extend(uploads_dir.glob(f"*{ext}"))

    return sorted(images)


def main():
    parser = argparse.ArgumentParser(
        description="Redimensionne toutes les images existantes à 384x384"
    )
    parser.add_argument(
        "--uploads-dir",
        type=Path,
        default=Path("uploads"),
        help="Chemin vers le dossier uploads (défaut: ./uploads)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Afficher ce qui serait fait sans modifier les fichiers"
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=100,
        help="Qualité JPEG (1-100, défaut: 100)"
    )

    args = parser.parse_args()

    uploads_dir = args.uploads_dir

    # Vérifier que le dossier existe
    if not uploads_dir.exists():
        print(f"✗ Le dossier {uploads_dir} n'existe pas", file=sys.stderr)
        sys.exit(1)

    if not uploads_dir.is_dir():
        print(f"✗ {uploads_dir} n'est pas un dossier", file=sys.stderr)
        sys.exit(1)

    # Trouver toutes les images
    images = find_images(uploads_dir)

    if not images:
        print(f"Aucune image trouvée dans {uploads_dir}")
        sys.exit(0)

    print(f"Trouvé {len(images)} image(s) dans {uploads_dir}")
    print(f"Taille cible: 384x384")
    print(f"Qualité: {args.quality}")

    if args.dry_run:
        print("\n⚠️  MODE DRY-RUN: Aucun fichier ne sera modifié\n")
    else:
        print("\n⚠️  Les images vont être redimensionnées et remplacées")
        response = input("Continuer? (o/N): ")
        if response.lower() not in ("o", "oui", "y", "yes"):
            print("Opération annulée")
            sys.exit(0)

    print()

    # Traiter les images
    resized_count = 0
    skipped_count = 0
    error_count = 0

    for image_path in images:
        if args.dry_run:
            try:
                with Image.open(image_path) as img:
                    if img.size == (384, 384):
                        print(f"✓ {image_path.name}: Déjà à la bonne taille {img.size}")
                        skipped_count += 1
                    else:
                        print(f"→ {image_path.name}: {img.size} → serait redimensionné à 384x384")
                        resized_count += 1
            except Exception as e:
                print(f"✗ Erreur lors de la lecture de {image_path.name}: {e}", file=sys.stderr)
                error_count += 1
        else:
            result = resize_image(image_path, target_size=(384, 384), quality=args.quality)
            if result:
                resized_count += 1
            else:
                skipped_count += 1

    # Résumé
    print()
    print("="*50)
    print("Résumé:")
    print(f"  Images traitées: {len(images)}")
    print(f"  Images redimensionnées: {resized_count}")
    print(f"  Images déjà à la bonne taille: {skipped_count}")

    if error_count > 0:
        print(f"  Erreurs: {error_count}")

    if args.dry_run:
        print("\n⚠️  MODE DRY-RUN: Aucun fichier n'a été modifié")

    print("="*50)


if __name__ == "__main__":
    main()
