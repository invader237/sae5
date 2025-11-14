from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


async def validation_exception_handler(
        request: Request,
        exc: RequestValidationError):
    errors = exc.errors()

    if not errors:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": "Requête invalide."},
        )

    first = errors[0]
    loc = first.get("loc", [])
    raw_msg = first.get("msg", "Requête invalide.")

    # ex: loc = ['body', 'email'] → on récupère 'email'
    field = None
    for part in loc:
        if isinstance(part, str) and part != "body":
            field = part
            break

    if "value is not a valid email address" in raw_msg:
        human_msg = "Veuillez entrer une adresse email valide."
    elif raw_msg == "field required":
        if field:
            human_msg = f"Le champ « {field} » est obligatoire."
        else:
            human_msg = "Un champ obligatoire est manquant."
    elif raw_msg.startswith("ensure this value has at least"):
        human_msg = "La valeur saisie est trop courte."
    elif raw_msg.startswith("ensure this value has at most"):
        human_msg = "La valeur saisie est trop longue."
    else:
        # fallback : on garde le message brut (utile en dev)
        human_msg = raw_msg

    # le champ impliqué
    if field and "email" not in human_msg.lower():
        text = f"{field} : {human_msg}"
    else:
        text = human_msg

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": text},
    )
