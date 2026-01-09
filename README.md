# SAE5 - IUT Room Recognition

AI-powered mobile application for recognizing IUT rooms using machine learning and real-time camera inference.

## 🎯 About

This application uses artificial intelligence to identify and classify IUT rooms through your smartphone camera. Simply point your device at a room, and the ML model will recognize it in real-time.

**Key Features:**
- 📸 Real-time room recognition via camera (1 frame/second)
- 🖼️ Image upload and batch analysis
- 🤖 ML model management and training
- 📊 Inference history tracking
- 👥 User authentication with role-based access
- 📱 Cross-platform (Android, Web)

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Make

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sae5
   ```

2. **Configure environment**

   ```bash
   cp .env.template .env
   # Edit .env with your configuration
   ```

 

3. **Setup and run**

   ```bash
   make setup
   make run-dev
   ```

The application will be available at:
- Frontend: `http://localhost:8081`
- Backend API: `http://localhost:8000`


## 📁 Project Structure
 
```
sae5/
├── front/          # Expo/React Native mobile app
├── back/           # FastAPI backend & ML models
├── doc/            # Documentation
└── Makefile        # Automation commands
```

## 👥 Contributors

- Alexandre Kesseler
- Diego Trivino
- FRIES Mathias
- Joshua Brochot

