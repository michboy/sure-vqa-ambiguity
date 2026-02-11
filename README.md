# Project #11: VQA Ambiguity Resolver for Accessibility

This project is a submission for the **SURE Program (Human-AI Lab)**. It is a Visual Question Answering (VQA) system designed to help blind and low-vision users resolve ambiguity in visual content through two distinct interaction modes.

## 🎥 Demo Video
https://drive.google.com/file/d/1_WQ-SGOUoJOaWFaepDNY1Awvs_zZ_3pu/view?usp=drive_link

## ✨ Key Features
1. **Two Interaction Modes:**
    * **Respond in One Pass:** Delivers a comprehensive description of all ambiguous objects at once.
    * **Clarify Iteratively:** Engages in a multi-turn dialogue to clarify user intent before answering.
2. **Ambiguity Detection:** Automatically detects if a user's question applies to multiple objects (e.g., "Where is the cup?" when two cups exist).
3. **Accessibility First:**
    * **Text-to-Speech (TTS):** Real-time voice feedback using Web Speech API.
    * **Screen Reader Support:** Semantic HTML and ARIA live regions.
    * **Keyboard Navigation:** Full support for non-mouse interaction.
4. **Multi-Language Support:** Supports both English and Korean.

## 🛠️ Tech Stack
* **Frontend:** React.js, Axios, Web Speech API
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

## ♿ Accessibility Verification
* Tested with keyboard-only navigation (Tab/Enter).
* Verified dynamic content announcements using ARIA live regions.
* Integrated high-contrast UI elements.
