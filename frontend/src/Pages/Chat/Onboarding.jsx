import { useState, useEffect } from "react";
import "./Onboarding.css";

export default function Onboarding() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(crypto.randomUUID());
  
  const handleRoleName = (role) => {
    switch (role) {
      case "user":
        return "Tú";
      default:
        return "Tales";
    }
       
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionId, message: userMessage.content })
      });

      const data = await res.json();

      const assistantMessage = {
          role: "assistant",
          content: data.reply
      };

      setMessages(prev => [...prev, assistantMessage]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
      let cancelled = false;

      async function initChat() {
          setLoading(true);
          try {
          const res = await fetch("http://localhost:3000/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId: sessionId })
          });

          const data = await res.json();

          if (!cancelled) {
              setMessages([{ role: "assistant", content: data.reply }]);
          }
          } catch (err) {
              console.error(err);
          } finally {
              if (!cancelled) setLoading(false);
          }
      }

      initChat();

      return () => {
          cancelled = true;
      };
    }, []);


  return (
    <div className="onboarding">
      <div className="onboarding__message-container">
        {messages.map((m, i) => (
          <p className="onboarding__message" key={i}>
            <strong>{handleRoleName(m.role)}:</strong> {m.content}
          </p>
        ))}
      </div>

      <form onSubmit={sendMessage}>
        <input
          className="onboarding__input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe tu respuesta"
        />
        <button type="submit" disabled={loading}>
          Send
        </button>
      </form>
    </div>
  );
}
