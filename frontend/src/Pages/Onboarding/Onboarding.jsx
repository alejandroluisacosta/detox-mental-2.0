import { useState, useEffect, useRef } from "react";
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
  const [sessionState, setSessionState] = useState(null);
  const messagesEndRef = useRef(null);
  
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
      const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input, sessionState: sessionState })
      });

      if (!res.ok) {
        throw new Error("Chat request failed");
      }
      const data = await res.json();

      setSessionState(data.sessionState);
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
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "", sessionState: undefined })
          });

          const data = await res.json();

          if (!cancelled) {
              setSessionState(data.sessionState);
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

  useEffect(() => {
    if (loading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [loading]);

  return (
    <div className="onboarding">
      <div className="onboarding__message-container">
        {messages.map((m, i) => (
          <div className={"onboarding__message-wrapper" + (m.role === "user" ? " user-message-wrapper" : "")} key={i}>
            {m.role === "assistant" && (
              <img 
                src="/images/thales.webp" 
                alt="Thales" 
                className="onboarding__message__avatar"
              />
            )}
            <div className={"onboarding__message" + (m.role === "user" ? " user-message" : "")}>
              <strong className="onboarding__message__role">{getRoleLabel(m.role)}:</strong>
              <div className={"onboarding__message__content"}>
                {m.role === "assistant" ? (
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                ) : (
                  <span>{m.content}</span>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="onboarding__message-wrapper">
            <img 
              src="/images/thales.webp" 
              alt="Thales" 
              className="onboarding__message__avatar"
            />
            <div className="onboarding__message onboarding__message--loading">
              <strong className="onboarding__message__role">{getRoleLabel("assistant")}:</strong>
              <div className="onboarding__message__content">
                <div className="onboarding__loading-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage}>
        <input
          className="onboarding__input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe tu respuesta"
          disabled={loading}
        />
        <button className="onboarding__button" type="submit" disabled={loading}>
          ENVIAR
        </button>
      </form>
    </div>
  );
}
