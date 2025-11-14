from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.authentification.auth_utils import (
    create_access_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.authentification.schemas import TokenOut, UserCreate, UserLogin, UserOut
from app.database import get_session
from app.user.domain.entity.user import User


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_session)):
    """
    Crée un nouvel utilisateur.

    Erreurs possibles :
    - 400 : email déjà utilisé
    - 500 : erreur interne base de données
    """
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cet email est déjà associé à un compte.",
        )

    user = User(
        username=payload.username,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )

    try:
        db.add(user)
        print("📥 REGISTER payload:", payload.dict())
        db.commit()
        db.refresh(user)
        print("✅ UTILISATEUR CRÉÉ:", user.user_id)
    except IntegrityError as exc:
        db.rollback()
        print("❌ ERREUR DB REGISTER:", exc)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Impossible de créer le compte. Vérifiez vos informations.",
        )
    except Exception as exc:  # noqa: BLE001
        db.rollback()
        print("❌ ERREUR INATTENDUE REGISTER:", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur interne est survenue. "
            "Veuillez réessayer plus tard.",
        )

    return user


@router.post("/login", response_model=TokenOut)
def login(payload: UserLogin, db: Session = Depends(get_session)):
    """
    Connecte un utilisateur et renvoie un token JWT.

    Erreurs possibles :
    - 401 : identifiants invalides
    """
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect.",
        )

    token = create_access_token(str(user.user_id))

    return TokenOut(access_token=token)


@router.get("/me", response_model=UserOut)
def me(
    authorization: str = Header(
        ...,
        description="Header Authorization: Bearer <token>",
    ),
    db: Session = Depends(get_session),
):
    """
    Renvoie les infos de l'utilisateur connecté.

    Erreurs possibles :
    - 401 : header manquant / mal formé / token invalide ou expiré
    - 404 : utilisateur introuvable
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "En-tête d'authentification manquant "
                "(header Authorization)."
            ),
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Format de l'en-tête Authorization invalide. "
                "Utilisez 'Bearer <token>'."
            ),
        )

    token = authorization.split(" ", 1)[1].strip()

    payload = decode_token(token)
    sub = payload.get("sub")

    if not sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Le jeton fourni est invalide "
                "(aucun utilisateur associé)."
            ),
        )

    try:
        user_id = UUID(sub)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Le jeton fourni est invalide "
                "(identifiant utilisateur incorrect)."
            ),
        )

    user = db.query(User).filter(User.user_id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur introuvable.",
        )

    return user


@router.get("/debug/users")
def debug_users(db: Session = Depends(get_session)):
    """
    Endpoint de debug (à désactiver en prod).
    """
    users = db.query(User).all()
    print("🧪 DEBUG users in DB:", users)
    return [
        {
            "user_id": str(u.user_id),
            "username": u.username,
            "email": u.email,
            "created_at": u.created_at.isoformat(),
        }
        for u in users
    ]