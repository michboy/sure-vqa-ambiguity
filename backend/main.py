import uvicorn
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import os
from dotenv import load_dotenv
import google.generativeai as genai

# 1. 환경 변수 로드
load_dotenv()

# 2. API 키 설정
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    # 혹시 .env가 안 읽히면 직접 키를 넣어서 테스트하세요
    print("Warning: API Key not found in .env")

genai.configure(api_key=api_key)

# 3. 모델 설정 (가장 가볍고 무료 쿼터가 널널한 모델)
model = genai.GenerativeModel('gemini-flash-lite-latest')

# 4. FastAPI 앱 초기화 (이게 @app.post보다 먼저 와야 합니다!)
app = FastAPI()

# 5. CORS 설정 (프론트엔드와 통신 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 6. API 엔드포인트
@app.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...), 
    question: str = Form(...),
    mode: str = Form(...),
    language: str = Form(...)  # 언어 파라미터 추가
):
    try:
        # 이미지 읽기
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        # 언어 설정에 따른 지시사항
        lang_instruction = f"IMPORTANT: Please answer in {language}."

        base_instruction = f"""
        You are a helpful visual assistant for a blind or low-vision user.
        Your goal is to answer the user's question about the image accurately.
        
        {lang_instruction}
        
        CRITICAL: First, determine if the user's question is "ambiguous".
        Ambiguity happens when the user asks about an object (e.g., "Where is the cup?"), 
        but there are multiple instances of that object in the image (e.g., two different cups), 
        and it's unclear which one they mean.
        """

        if mode == "clarify":
                    # Clarify Mode
                    system_prompt = base_instruction + """
                    STRICT INSTRUCTION FOR 'CLARIFY' MODE:
                    1. Look at the image. Does the user's question apply to MORE THAN ONE object?
                    2. If YES (Ambiguous):
                       - DO NOT answer the question directly.
                       - Instead, ask a question to clarify which object the user means.
                    - List distinguishing features (color, location) briefly.
                       - Example (English): "I see two cups. One is red and one is blue. Which one?"
                    3. If NO (Not Ambiguous - User clarified or specific question):
                       - Answer directly and CONCISELY.
                       - DO NOT explain why it is not ambiguous.
                       - DO NOT mention "The user's previous question" or "Since there is only one...".
                       - Just describe the object's location or attribute.
                       - Example (English): "The red cup is on the left."
                    """
        else:
            # One Pass Mode
            system_prompt = base_instruction + """
            If the question is ambiguous (multiple matching objects):
            Provide a detailed answer that describes ALL matching objects. 
            Do NOT ask questions.
            Example (English): "There are two cups. The red one is on the left, the blue one is on the right."
            """

        prompt = [system_prompt, "\nUser Question: " + question, image]
        
        # AI 응답 생성
        response = model.generate_content(prompt)
        
        return {"answer": response.text}
        
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)