"""
Deprecated repository-level pytest configuration.

Path injection for tests has been moved to `back/tests/conftest.py` so that
test setup is local to the `back` package. Keeping this file to avoid
surprising removals for collaborators; it intentionally does nothing.

You can safely remove this file if you prefer, but it is harmless to keep it.
"""
