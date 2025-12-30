import re


class ModelNamer:
    def __init__(self, model_catalog):
        self.model_catalog = model_catalog

    def find_next_model_name(self, variant="base", major=0, metadata=None):
        """
        Generate the next available model name with optional metadata.

        metadata: dict, e.g., {"rooms": "all", "imagesPerClass": 100}
        """
        scope = "neuroom"
        prefix = f"{scope}-{variant}-v{major}"
        max_minor = -1

        # Pattern pour retrouver toutes les versions existantes
        pattern = re.compile(rf"^{re.escape(prefix)}(?:\.(\d+))?")

        models = self.model_catalog.find_all()

        for model in models:
            name = getattr(model, "name", None)
            if not name:
                continue
            if name.endswith(".pth"):
                name = name[:-4]
            match = pattern.match(name)
            if match:
                minor_str = match.group(1)
                minor = int(minor_str) if minor_str else 0
                max_minor = max(max_minor, minor)

        next_minor = max_minor + 1
        base_name = f"{prefix}.{next_minor}"

        # Ajouter les métadonnées si présentes
        if metadata:
            meta_parts = [f"{k}-{v}" for k, v in metadata.items()]
            meta_str = "__".join(meta_parts)
            full_name = f"{base_name}__{meta_str}"
        else:
            full_name = base_name

        return full_name
