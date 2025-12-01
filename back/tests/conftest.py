import os
import sys
import pytest

# Ensure the `back` package is importable when running pytest from the `back/tests` folder.
# This keeps test configuration local to the `back` package and avoids a top-level conftest.
BACK_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACK_DIR not in sys.path:
    sys.path.insert(0, BACK_DIR)

from app.model.domain.entity.model import Model


class FakeModelCatalog:
    """Simple test double for ModelCatalog used in unit tests.

    - Keeps an in-memory list of `existing` models (to simulate DB content)
    - Records saved models to `saved` for assertions
    """

    def __init__(self, existing=None):
        self.saved = []
        # existing should be a list of Model instances
        self.existing = list(existing) if existing else []

    def find_all(self):
        # return a shallow copy to protect internal list from test mutation
        return list(self.existing)

    def save(self, model: Model):
        # emulate assigning an id or other DB-side behaviour if needed
        self.saved.append(model)


@pytest.fixture
def model_catalog():
    """Factory fixture returning a fresh FakeModelCatalog for each test."""
    return FakeModelCatalog()
