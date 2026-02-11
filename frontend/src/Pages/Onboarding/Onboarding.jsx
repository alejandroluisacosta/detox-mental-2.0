import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import "./Onboarding.css";

const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || "http://localhost:3000/chat";

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
  const [hasReachedExitButtons, setHasReachedExitButtons] = useState(false);
  const messagesEndRef = useRef(null);
  const exitButtonsRef = useRef(null);
  const navigate = useNavigate();
  
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
      const res = await fetch(CHAT_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input, sessionState: sessionState })
      });

      if (!res.ok) {
        throw new Error("Chat request failed");
      }
      const data = await res.json();

      setSessionState({ state: data.state, data: data.data });
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
          const res = await fetch(CHAT_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "", sessionState: null })
          });

          const data = await res.json();

          if (!cancelled) {
              setSessionState({ state: data.state, data: data.data });
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

  useEffect(() => {
    if (sessionState?.state !== "EXIT") return;
    const el = exitButtonsRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        setHasReachedExitButtons(true);
        observer.disconnect();
      },
      { threshold: 0.5, rootMargin: "0px 0px 0px 0px" }
    );

    // Defer observing so the initial hidden state (opacity: 0) is painted first.
    // Otherwise the observer can fire in the same tick and the fade-in never appears.
    let cancelled = false;
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled || !exitButtonsRef.current) return;
        observer.observe(exitButtonsRef.current);
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [sessionState?.state]);

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

      {sessionState?.state === "EXIT" ? (
        <div
          ref={exitButtonsRef}
          className={`onboarding__exit-buttons-wrapper${hasReachedExitButtons ? " onboarding__exit-buttons-wrapper--visible" : ""}`}
        >
          <div className="onboarding__exit-buttons">
            <div
              className="onboarding__exit-button"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/")}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate("/"); } }}
            >
              <img
                src="/icons/article.png"
                alt="Artículo"
                className="onboarding__exit-button__icon onboarding__exit-button__icon--article"
              />
              <span className="onboarding__exit-button__label">ARTÍCULO</span>
            </div>
            <div
              className="onboarding__exit-button"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/course")}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate("/course"); } }}
            >
              <img
                src="/icons/course.png"
                alt="Curso"
                className="onboarding__exit-button__icon"
              />
              <span className="onboarding__exit-button__label">CURSO</span>
            </div>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
}
