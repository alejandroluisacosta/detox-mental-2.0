import { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import "./Onboarding.css";

const ROLE_LABLES = {
  user: "Tú",
  assistant: "Tales",
};

const getRoleLabel = (role) => ROLE_LABLES[role] ?? "Tales";

export default function Onboarding() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(crypto.randomUUID());
  
  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [
      ...prev,
      { role: "user", content: input },
    ]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionId, message: input })
      });

      if (!res.ok) {
        throw new Error("Chat request failed");
      }
      const data = await res.json();

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);


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
          <div className={"onboarding__message" + (m.role === "user" ? " user-message" : "")} key={i}>
            <strong className="onboarding__message__role">{getRoleLabel(m.role)}:</strong>
            <div className={"onboarding__message__content"}>
              {m.role === "assistant" ? (
                <ReactMarkdown>{m.content}</ReactMarkdown>
              ) : (
                <span>{m.content}</span>
              )}
            </div>
          </div>
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
