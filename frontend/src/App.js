import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]); 
  const [mode, setMode] = useState("one-pass");
  const [language, setLanguage] = useState("English"); // 기본 언어 설정 (English 추천)
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
      setMessages([]); 
      setMessages([{ sender: 'bot', text: language === "Korean" ? '이미지가 업로드되었습니다.' : 'Image uploaded. Ready to ask.' }]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload an image first.");
      return;
    }
    if (!input.trim()) return;

    const userQuestion = input;
    setInput(""); 

    setMessages(prev => [...prev, { sender: 'user', text: userQuestion }]);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("question", userQuestion);
    formData.append("mode", mode);
    formData.append("language", language); // <--- 언어 정보 전송!

    try {
      const res = await axios.post("http://localhost:8000/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      const aiAnswer = res.data.answer;
      setMessages(prev => [...prev, { sender: 'bot', text: aiAnswer }]);

      // TTS (특수문자 제거 + 언어 자동 설정)
      const cleanText = aiAnswer.replace(/[*#]/g, ''); 
      const speech = new SpeechSynthesisUtterance(cleanText);
      
      // 언어에 따라 발음 설정 변경
      speech.lang = language === "Korean" ? 'ko-KR' : 'en-US'; 
      
      window.speechSynthesis.cancel(); 
      window.speechSynthesis.speak(speech);

    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, { sender: 'bot', text: "Error occurred. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App" style={{ maxWidth: "600px", margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column", fontFamily: "sans-serif" }}>
      
      <div style={{ padding: "15px", borderBottom: "1px solid #ddd", background: "#f8f9fa" }} role="banner">
        <h2 style={{ margin: "0 0 10px 0", fontSize: "1.2rem" }}>🔍 VQA Ambiguity Resolver</h2>
        
        <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize: "0.8rem", maxWidth: "180px" }} aria-label="Upload Image" />
          
          <div style={{ display: "flex", gap: "5px" }}>
            {/* 언어 선택 드롭다운 */}
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              style={{ padding: "5px", borderRadius: "5px" }}
              aria-label="Select Language"
            >
              <option value="English">English</option>
              <option value="Korean">한국어</option>
            </select>

            {/* 모드 선택 드롭다운 */}
            <select 
              value={mode} 
              onChange={(e) => setMode(e.target.value)}
              style={{ padding: "5px", borderRadius: "5px" }}
              aria-label="Select Mode"
            >
              <option value="one-pass">One Pass</option>
              <option value="clarify">Clarify</option>
            </select>
          </div>
        </div>
      </div>

      {imagePreview && (
        <div style={{ padding: "10px", textAlign: "center", background: "#000" }}>
          <img src={imagePreview} alt="Uploaded Preview" style={{ maxHeight: "150px", maxWidth: "100%" }} />
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: "20px", background: "#fff" }} role="log" aria-live="polite">
        {messages.map((msg, idx) => (
          <div key={idx} style={{ 
            display: "flex", 
            justifyContent: msg.sender === 'user' ? "flex-end" : "flex-start",
            marginBottom: "10px" 
          }}>
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

      <form onSubmit={handleSubmit} style={{ padding: "15px", borderTop: "1px solid #ddd", display: "flex", gap: "10px" }}>
        <input
          type="text"
          placeholder={language === "Korean" ? "질문을 입력하세요..." : "Ask a question..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          style={{ flex: 1, padding: "10px", borderRadius: "20px", border: "1px solid #ccc" }}
          aria-label="Input question"
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: "10px 20px", borderRadius: "20px", border: "none", background: "#007bff", color: "#fff", fontWeight: "bold", cursor: "pointer" }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default App;