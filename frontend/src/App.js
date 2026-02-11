import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import { FaMicrophone, FaCamera, FaImage, FaPaperPlane } from 'react-icons/fa';
import './App.css';

// Base64 -> Blob 변환 함수
const dataURLtoBlob = (dataurl) => {
  const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

function App() {
  const [file, setFile] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [mode, setMode] = useState("one-pass");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  // --- Live Mode States ---
  const [isLive, setIsLive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef(null);
  const webcamRef = useRef(null);
  const recognitionRef = useRef(null);

  // 스크롤 자동 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- 핵심: 전송 함수 (텍스트 직접 받기 가능) ---
  const handleSubmit = async (e, overrideText = null) => {
    if (e) e.preventDefault();
    
    // 1. 텍스트 결정 (음성인식 결과가 있으면 그걸 우선 사용)
    const userQuestion = overrideText !== null ? overrideText : input;

    // 질문이 없으면 중단 (단, 라이브 모드에선 사진만 보낼 수도 있으니 유연하게)
    if (!userQuestion || !userQuestion.trim()) return;

    // 2. 이미지 소스 결정
    let imageToSend = file;
    
    if (isLive && webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        imageToSend = dataURLtoBlob(imageSrc);
      }
    }

    if (!imageToSend) {
      alert("Please upload an image or enable Live Camera.");
      return;
    }

    // UI 업데이트 (채팅창에 즉시 표시)
    setInput(""); 
    setMessages(prev => [...prev, { 
      sender: 'user', 
      text: userQuestion, 
      image: isLive ? URL.createObjectURL(imageToSend) : null 
    }]);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", imageToSend, "capture.jpg");
    formData.append("question", userQuestion);
    formData.append("mode", mode);
    formData.append("language", language);

    try {
      const res = await axios.post("http://localhost:8000/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      const aiAnswer = res.data.answer;
      setMessages(prev => [...prev, { sender: 'bot', text: aiAnswer }]);
      handleTTS(aiAnswer);

    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, { sender: 'bot', text: "Error occurred. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  // --- 음성 인식 설정 (useEffect) ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // 한 문장 끝나면 자동 종료
      recognition.interimResults = false; // 중간 결과 무시 (완성된 문장만)
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);

      // ★ 핵심: 음성 인식 결과가 나오자마자 제출 함수 호출
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript); // UI에도 표시
        handleSubmit(null, transcript); // 기다리지 않고 바로 전송!
      };

      recognitionRef.current = recognition;
    }
  }, [isLive, file, mode, language]); // 의존성 추가해서 상태값 최신 유지

  // 언어 변경 시 적용
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === "Korean" ? "ko-KR" : "en-US";
    }
  }, [language]);


  // --- 스페이스바 핸들러 ---
  const handleKeyDown = useCallback((e) => {
    if (e.code === 'Space' && !e.repeat && isLive && !loading) {
      if (document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        recognitionRef.current?.start();
      }
    }
  }, [isLive, loading]);

  const handleKeyUp = useCallback((e) => {
    if (e.code === 'Space' && isLive && !loading) {
      if (document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        recognitionRef.current?.stop();
        // 여기서는 stop()만 호출합니다. 
        // 실제 전송은 위쪽 recognition.onresult 에서 처리됩니다.
      }
    }
  }, [isLive, loading]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);


  // --- 기타 핸들러 ---
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
      setMessages([]);
      setMessages([{ sender: 'bot', text: language === "Korean" ? '이미지가 업로드되었습니다.' : 'Image uploaded. Ready to ask.' }]);
      setIsLive(false);
    }
  };

  const toggleLiveMode = () => {
    setIsLive(!isLive);
    setFile(null);
    setImagePreview(null);
    setMessages([]);
    if (!isLive) {
       setMessages([{ sender: 'bot', text: language === "Korean" ? '라이브 모드입니다. 스페이스바를 누르고 말씀하세요.' : 'Live Mode active. Hold Spacebar to speak.' }]);
    }
  };

  const handleTTS = (text) => {
    const cleanText = text.replace(/[*#]/g, ''); 
    const speech = new SpeechSynthesisUtterance(cleanText);
    speech.lang = language === "Korean" ? 'ko-KR' : 'en-US'; 
    window.speechSynthesis.cancel(); 
    window.speechSynthesis.speak(speech);
  };

  return (
    <div className="App" style={{ maxWidth: "600px", margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column", fontFamily: "sans-serif" }}>
      
      {/* Header */}
      <div style={{ padding: "15px", borderBottom: "1px solid #ddd", background: "#f8f9fa" }} role="banner">
        <h2 style={{ margin: "0 0 10px 0", fontSize: "1.2rem", display: 'flex', alignItems: 'center', gap: '10px' }}>
            🔍 VQA Ambiguity Resolver 
            {isLive && <span style={{fontSize: '0.8rem', color: 'red', animation: 'pulse 1.5s infinite'}}>● LIVE</span>}
        </h2>
        
        <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
            <div style={{display: 'flex', gap: '5px'}}>
                <button 
                    onClick={toggleLiveMode}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '8px 12px', borderRadius: '20px', border: 'none',
                        background: isLive ? '#dc3545' : '#28a745', color: 'white', cursor: 'pointer'
                    }}
                >
                    {isLive ? <><FaImage /> Upload Mode</> : <><FaCamera /> Live Camera</>}
                </button>

                {!isLive && (
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize: "0.8rem", maxWidth: "180px" }} aria-label="Upload Image" />
                )}
            </div>
          
            <div style={{ display: "flex", gap: "5px" }}>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ padding: "5px", borderRadius: "5px" }}>
                <option value="English">English</option>
                <option value="Korean">한국어</option>
                </select>

                <select value={mode} onChange={(e) => setMode(e.target.value)} style={{ padding: "5px", borderRadius: "5px" }}>
                <option value="one-pass">One Pass</option>
                <option value="clarify">Clarify</option>
                </select>
            </div>
        </div>
      </div>

      {/* Visual Area */}
      <div style={{ background: "#000", position: 'relative', minHeight: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {isLive ? (
            <>
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: "environment" }}
                    style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
                />
                {isListening && (
                    <div style={{
                        position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                        background: 'rgba(255, 0, 0, 0.7)', color: 'white', padding: '10px 20px', borderRadius: '30px',
                        display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold'
                    }}>
                        <FaMicrophone className="icon-pulse" /> Listening...
                    </div>
                )}
            </>
        ) : (
            imagePreview ? (
                <img src={imagePreview} alt="Preview" style={{ maxHeight: "300px", maxWidth: "100%" }} />
            ) : (
                <div style={{color: '#666'}}>No Image Selected</div>
            )
        )}
      </div>

      {/* Chat Log */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", background: "#fff" }} role="log" aria-live="polite">
        {messages.map((msg, idx) => (
          <div key={idx} style={{ 
            display: "flex", 
            flexDirection: 'column',
            alignItems: msg.sender === 'user' ? "flex-end" : "flex-start",
            marginBottom: "10px" 
          }}>
            {msg.image && (
                <img src={msg.image} alt="snapshot" style={{width: '100px', borderRadius: '10px', marginBottom: '5px', border: '2px solid #007bff'}}/>
            )}
            <div style={{ 
              maxWidth: "70%", 
              padding: "10px 15px", 
              borderRadius: "15px", 
              background: msg.sender === 'user' ? "#007bff" : "#e9ecef",
              color: msg.sender === 'user' ? "#fff" : "#333",
              lineHeight: "1.5",
              whiteSpace: "pre-wrap"
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && <div style={{ textAlign: "center", color: "#999" }}>AI is thinking...</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} style={{ padding: "15px", borderTop: "1px solid #ddd", display: "flex", gap: "10px" }}>
        <input
          type="text"
          placeholder={isLive ? (language === "Korean" ? "스페이스바를 누르고 말하세요..." : "Hold Space to speak...") : "Type a question..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          style={{ flex: 1, padding: "10px", borderRadius: "20px", border: "1px solid #ccc" }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: "10px 20px", borderRadius: "20px", border: "none", background: "#007bff", color: "#fff", fontWeight: "bold", cursor: "pointer" }}
        >
          <FaPaperPlane />
        </button>
      </form>
      
      <style>{`
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        .icon-pulse {
            animation: pulse 1s infinite;
        }
      `}</style>
    </div>
  );
}

export default App;