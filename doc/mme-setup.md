# 📦 Modular Model Engine (MME) --- Documentation & Setup

## 📖 Introduction

The **Modular Model Engine (MME)** is a system designed to flexibly and
modularly manage the recognition models used by the application.

Its objective is to make model management:

-   **simple**
-   **independent from backend code**
-   **adaptable to multiple model types**
-   **controllable from the admin panel**

### 🧩 A Fully Modular Engine

The MME acts as a **plug‑and‑play model engine**:

-   Adding a new model requires **no modifications to the backend**.
-   Each model is treated as an **independent module**, with its own
    files, metadata, and configuration.
-   The MME supports any model type (ONNX, Torch, TensorFlow, etc.).
-   The application simply selects the active model without depending on
    its internal structure.

This modular architecture enables the system to evolve by adding or
updating models in a dedicated directory.

------------------------------------------------------------------------

## ⚙️ Installation & Setup

### 1. 📥 Re-clone the Repository

The MME should be installed in a directory separate from the main
application:

``` bash
git clone https://github.com/invader237/sae5.git mme
cd mme
```

### 2. 🔀 Switch to the `model` Branch

``` bash
git checkout model
```

The `model` branch contains all files related to model management.

### 3. 🧩 Configure the `.env` File

Define the path to the directory containing the models:

``` bash
MODEL_DIR=/path/to/model/directory
```

This folder will be used by the MME as the official source of available
models.

------------------------------------------------------------------------

## 🧠 How the MME Works

The MME follows a simple and controlled workflow:

-   Models are placed in the directory defined by `MODEL_DIR`.
-   A **manual action** (command or endpoint) triggers the
    synchronization.
-   ⚠️ Updates are **not automatic**.
-   The MME scans the folder and updates the database with the detected
    models.
-   From the admin panel, an active model can be selected.
-   The backend immediately uses this model for inference.
