# ⚙️ Project Configuration

Follow these steps to set up and run the project.

---

## 🧩 Project Structure

- **`front/`** – Contains the **Expo (React Native)** frontend project.  
- **`back/`** – Contains the **FastAPI** backend project.

---

## 🧰 Environment Setup

1. Copy the `.env.template` file and rename it to `.env`.  
2. Fill in the environment variables with your personal configuration and credentials.  

---

## 🧱 Build & Run with Make

This project uses **Make** for automation.

### 🔧 Initial Setup

```bash
make setup
```
This command installs all required dependencies for both the frontend and backend.

### 🚀 Running the Project

You can start the project in different modes using:

```bash
make run-dev
make run-test
make run-prod
```

These commands launch the corresponding Docker containers.

You can also start only one part of the project:
```bash
make start-expo     # Start only the frontend container
make start-fastapi  # Start only the backend container
```

> ⚠️ Note: The `dev` container does not include live reloading.
> If you need live reload for local development, use the previous commands to start the frontend and backend separately.

To stop all running containers:
```bash
make down ENV=<dev|test|prod>
```

## 🧪 Testing Your Code

Run all tests with:
```bash
make test
```

This command runs tests, lint, and build for both the frontend and backend.

You can also run them independently:

```bash
make test-front    # Test the frontend
make test-back     # Test the backend
```

---

Run linting checks with:
```bash
make lint
```
