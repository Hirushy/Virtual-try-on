# Fitora — AI Virtual Try-On System

Fitora is a state-of-the-art AI Virtual Try-On application designed to revolutionize the online shopping experience. By combining high-fidelity 3D rendering with AI-driven fit analysis, Fitora allows users to visualize how clothing will look and fit on their unique body shape before making a purchase.

##  Key Features

- **Interactive 3D Hero** — A dynamic landing page featuring a high-quality animated walking avatar (`walk.glb`).
- **Digital Twin Generation** — Photo-based or measurement-based 3D avatar creation.
- **Virtual Wardrobe** — Browse, assemble, and customize clothing outfits.
- **AI Fit Analysis** — Real-time fit heatmaps and brand-specific size recommendations.
- **Secure Authentication** — Firebase authentication with additional PIN-based security.

##  Project Preview

### 1. Cinematic Landing Page
The entry point of Fitora, featuring a premium glassmorphic UI and an interactive 3D walking avatar.
![Landing Page](react-r/public/screenshots/home.png)

### 2. Digital Twin Generation
Users can upload photos to generate a highly accurate 3D representation of their body.
![Digital Twin](react-r/public/screenshots/upload.png)

### 3. Calibrated 3D Avatar
The system processes the input and generates a calibrated avatar ready for try-on.
![Generated Avatar](react-r/public/screenshots/generated.png)

### 4. Virtual Wardrobe & Outfit Builder
A seamless interface to browse through collections and build custom outfits in real-time.
![Virtual Wardrobe](react-r/public/screenshots/wardrobe.png)

### 5. Visual AI Search & Fit Check
Upload your own clothes for AI analysis and receive instant fit recommendations based on brand sizing.
![Visual Search](react-r/public/screenshots/search.png)

##  Technology Stack

### Frontend
- **React 18**
- **Vite**
- **Three.js**
- **React Three Fiber**
- **Framer Motion**

### Backend
- **Python**
- **FastAPI**
- **MediaPipe**
- **OpenCV**
- **PyTorch**

### Database
- **Firebase Authentication**
- **MongoDB** (Optional User Data Integration)

### AI Integration
- **Claude Vision (Anthropic)** for visual clothing analysis and recommendations

## Project Structure

```text
finals2/
├── react-r/      # Frontend (React + Vite)
└── server/       # Backend (FastAPI + AI Pipeline)
```

## Getting Started

### 1. Frontend Setup (react-r)

1. **Navigate to the frontend directory**:
   ```bash
   cd react-r
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create a `.env` file**:
   ```env
   VITE_API_BASE=http://127.0.0.1:8001
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   ```

4. **Run the frontend server**:
   ```bash
   npm run dev
   ```

### 2. Backend Setup (server)

1. **Navigate to the backend directory**:
   ```bash
   cd server
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python -m venv venv
   ```

3. **Activate the environment**:
   - **Windows**: `venv\Scripts\activate`
   - **Linux / macOS**: `source venv/bin/activate`

4. **Install required dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure the `.env` file**:
   ```env
   ANTHROPIC_API_KEY=your_api_key
   ```

6. **Run the backend server**:
   ```bash
   uvicorn main:app --reload --port 8001
   ```

## 3D Assets
- **avatar.glb** — Main avatar model used for body fitting and measurements.
- **walk.glb** — Animation-optimized avatar used in the homepage hero section.

## Security Features
- Firebase Authentication
- Secure Session Management
- Secondary PIN Verification
- Protected API Access

## License
This project was developed for the final-year research project:
**AI Virtual Try-On System**

## Author
Developed by the **Hirushi Perera**.

---
*Fitora — Your Perfect Fit, Virtually.*
