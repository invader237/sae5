# ============================================
# Project Automation - FastAPI + Expo
# ============================================
.DEFAULT_GOAL := help

SHELL := $(if $(filter Windows_NT,$(OS)),cmd.exe,/bin/bash)
.SHELLFLAGS := $(if $(filter Windows_NT,$(OS)),/C, -c)

# Variables
FRONT_DIR := front
BACK_DIR := back
ENV_FILE := .env
ENV_TEMPLATE := .env.template

DOCKER_COMPOSE := docker compose
NPM := npm
ENV ?= dev # Default environment: dev (can be overridden, e.g. make down ENV=test)

API_SPEC := app/api/api.yml
OUTPUT_DTO := app/dto/generated.py

ifeq ($(OS),Windows_NT)
    PYTHON := $(BACK_DIR)/venv/Scripts/python.exe
    BG_CMD := start /B
else
    PYTHON := $(BACK_DIR)/venv/bin/python
    BG_CMD := 
endif

# ============================================
# Setup
# ============================================

setup:
	@echo "[*] Installing backend dependencies..."
<<<<<<< HEAD
	cd $(BACK_DIR) && python3 -m venv venv && . venv/bin/activate && pip install -r requirements.txt
=======
	cd $(BACK_DIR) && pip install -r requirements.txt
>>>>>>> main
	@echo "[*] Installing frontend dependencies..."
	cd $(FRONT_DIR) && $(NPM) install
	@echo "[OK] Setup complete!"

# ============================================
# Run Commands
# ============================================

run-dev:
	@echo "[*] Starting project in DEV mode..."
	$(DOCKER_COMPOSE) -f docker-compose.dev.yml up --build

run-test:
	@echo "[*] Starting project in TEST mode..."
	$(DOCKER_COMPOSE) -f docker-compose.test.yml up --build

run-prod:
	@echo "[*] Starting project in PRODUCTION mode..."
	$(DOCKER_COMPOSE) -f docker-compose.prod.yml up --build -d

# ============================================
# Start Individual Services
# ============================================

start-expo:
	@echo "[*] Starting frontend (Expo)..."
	$(DOCKER_COMPOSE) -f docker-compose.dev.yml up front

start-fastapi:
	@echo "[*] Starting backend (FastAPI)..."
	$(DOCKER_COMPOSE) -f docker-compose.dev.yml up api

# ============================================
# Stop and Clean
# ============================================

down:
	@echo "[*] Stopping containers for environment: $(ENV)"
	$(DOCKER_COMPOSE) -f docker-compose.$(ENV).yml down

clean:
	@echo "[*] Cleaning build artifacts..."
	cd $(BACK_DIR) && find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || echo ""
	cd $(FRONT_DIR) && rm -rf node_modules 2>/dev/null || true
	@echo "[OK] Clean complete!"

# ============================================
# Tests
# ============================================

test:
	@echo "[*] Running all tests..."
	$(MAKE) test-back
	$(MAKE) test-front

test-back:
	@echo "[*] Running backend tests..."
	cd $(BACK_DIR) && . venv/bin/activate && pytest --maxfail=1 --disable-warnings -q

test-front:
	@echo "[*] Running frontend tests..."
	#cd $(FRONT_DIR) && $(NPM) run test
	@echo "No test on front for the moment"

# ============================================
# Lint & Build
# ============================================

lint:
	$(MAKE) lint-back
	$(MAKE) lint-front

lint-back:
	cd $(BACK_DIR) && . venv/bin/activate && flake8 ./app

lint-front:
	cd $(FRONT_DIR) && $(NPM) run lint

# ============================================
# Generate DTOs
# ==========================================
DATAMODEL_CODEGEN := datamodel_code_generator

dto:
	@echo "Génération des DTO depuis $(API_SPEC)..."
ifeq ($(OS),Windows_NT)
	$(PYTHON) -m $(DATAMODEL_CODEGEN) --input $(API_SPEC) --input-file-type openapi --output $(OUTPUT_DTO)
else
	cd $(BACK_DIR) && $(PYTHON) -m $(DATAMODEL_CODEGEN) --input ../$(API_SPEC) --input-file-type openapi --output ../$(OUTPUT_DTO)
endif
	@echo "DTO générés dans $(OUTPUT_DTO)"

clean-dto:
	@echo "Suppression des DTO dans $(OUTPUT_DTO)..."
ifeq ($(OS),Windows_NT)
	if exist $(OUTPUT_DTO) del /F /Q $(OUTPUT_DTO)
else
	cd $(BACK_DIR) && rm -f ../$(OUTPUT_DTO)
endif
	@echo "DTO supprimés."

# ============================================
# Help (default)
# ============================================

help:
	@echo ""
	@echo "================ Project Commands ================"
	@echo ""
	@echo "  [*] make setup              - Setup project"
	@echo ""
	@echo "  [*] make run-dev            - Run project in DEV mode"
	@echo "  [*] make run-test           - Run project in TEST mode"
	@echo "  [*] make run-prod           - Run project in PRODUCTION mode"
	@echo ""
	@echo "  [*] make start-expo         - Start only the frontend (Expo)"
	@echo "  [*] make start-fastapi      - Start only the backend (FastAPI)"
	@echo ""
	@echo "  [*] make test               - Run all tests"
	@echo "  [*] make test-back          - Run backend tests"
	@echo "  [*] make test-front         - Run frontend tests"
	@echo ""
	@echo "  [*] make down ENV=<env>     - Stop containers for an environment (dev/test/prod)"
	@echo "  [*] make clean              - Clean build artifacts"
	@echo "  [*] make lint               - Run linters"
	@echo ""
	@echo "  [*] make dto                - Generate DTOs from OpenAPI spec (wip)"
	@echo "  [*] make clean-dto          - Clean generated DTOs (wip)"
	@echo ""
	@echo "=================================================="
	@echo " Tip: Run 'make help' or just 'make' to see this list."
	@echo " Example: make down ENV=test"
	@echo ""
