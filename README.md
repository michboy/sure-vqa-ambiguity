# Project #11: VQA Ambiguity Resolver for Accessibility

This project is a submission for the **SURE Program (Human-AI Lab)**. It is a Visual Question Answering (VQA) system designed to help blind and low-vision users resolve ambiguity in visual content through two distinct interaction modes.

## 🎥 Demo Video
https://drive.google.com/file/d/1_WQ-SGOUoJOaWFaepDNY1Awvs_zZ_3pu/view?usp=drive_link

## ✨ Key Features
1. **Live Video & Voice Interaction (New):**
    * **Real-time VQA:** Supports live webcam input to analyze objects in real-time.
    * **Push-to-Talk:** Implemented a Spacebar-controlled voice interface, allowing users to speak questions hands-free while holding objects.
2. **Two Interaction Modes:**
    * **Respond in One Pass:** Delivers a comprehensive description of all ambiguous objects at once.
    * **Clarify Iteratively:** Engages in a multi-turn dialogue to clarify user intent before answering.
3. **Ambiguity Detection:** Automatically detects if a user's question applies to multiple objects (e.g., "Where is the cup?" when two cups exist).
4. **Accessibility First:**
    * **Text-to-Speech (TTS):** Real-time voice feedback using Web Speech API.
    * **Screen Reader Support:** Semantic HTML and ARIA live regions.
    * **Keyboard Navigation:** Full support for non-mouse interaction.
5. **Multi-Language Support:** Supports both English and Korean.

## 🛠️ Tech Stack
* **Frontend:** React.js, Axios, react-webcam, Web Speech API
* **Backend:** FastAPI, Python 3.10+
* **AI Model:** Google Gemini 1.5 Flash (via Google Gen AI SDK)

## 🚀 How to Run

### 1. Backend Setup
Navigate to the `backend` directory and install dependencies.

```bash
cd backend
python -m venv venv

source venv/bin/activate

# On Windows use: venv\Scripts\activate
pip install -r requirements.txt
```
Important: Create a .env file in the backend folder and add your Gemini API Key:
```env
GEMINI_API_KEY=your_api_key_here
```
Start the server:
```env
uvicorn main:app --reload
```


### 2. Frontend Setup

Open a new terminal, navigate to the frontend directory.
```bash
cd frontend
npm install
npm start
```
Open http://localhost:3000 to view it in your browser.

**Note:** When you start the app, please allow **Camera and Microphone permissions** in your browser to use the Live Mode features.

## ♿ Accessibility Verification
* Tested with keyboard-only navigation (Tab/Enter).
* Verified dynamic content announcements using ARIA live regions.
* Integrated high-contrast UI elements.
* Push-to-Talk Test: Verified that holding/releasing the Spacebar correctly triggers the microphone and captures the image without delay.
