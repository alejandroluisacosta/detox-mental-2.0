import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import "./Onboarding.css";

const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || "http://localhost:3000/chat";

const ROLE_LABLES = {
  user: "Tú",
  assistant: "Tales",
};

const getRoleLabel = (role) => ROLE_LABLES[role] ?? "Tales";

const onboardingMarkdownComponents = {
  a: ({ href, children, ...props }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  ),
};

export default function Onboarding() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionState, setSessionState] = useState(null);
  const [faqChips, setFaqChips] = useState([]);
  const [challengeChip, setChallengeChip] = useState(null);
  const [challengePromptLabel, setChallengePromptLabel] = useState(null);
  const [hasReachedExitButtons, setHasReachedExitButtons] = useState(false);
  const [ctaPrompt, setCtaPrompt] = useState(null);
  const [lastReplyFull, setLastReplyFull] = useState(null);
  const messagesEndRef = useRef(null);
  const exitButtonsRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const isFaqHub = sessionState?.state === "FAQ_HUB";

  const applyChatPayload = useCallback((data) => {
    setSessionState({ state: data.state, data: data.data });
    if (data.state === "FAQ_HUB") {
      setFaqChips(Array.isArray(data.faqChips) ? data.faqChips : []);
      setChallengeChip(
        data.challengeChip?.id && data.challengeChip?.label ? data.challengeChip : null
      );
      setChallengePromptLabel(
        typeof data.challengePromptLabel === "string" ? data.challengePromptLabel : null
      );
    } else {
      setFaqChips([]);
      setChallengeChip(null);
      setChallengePromptLabel(null);
    }
  }, []);

  async function sendChip(chip) {
    if (loading || !chip?.id) return;

    const userLabel = chip.label ?? chip.id;
    setMessages((prev) => [...prev, { role: "user", content: userLabel }]);
    setLoading(true);

    try {
      const res = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "", sessionState, chipId: chip.id }),
      });

      if (!res.ok) {
        throw new Error("Chat request failed");
      }
      const data = await res.json();

      applyChatPayload(data);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);

      if (data.ctaPrompt != null) {
        setCtaPrompt(data.ctaPrompt);
        setLastReplyFull(data.replyFull ?? null);
      } else {
        setCtaPrompt(null);
        setLastReplyFull(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const userContent = input;
    setInput("");

    if (ctaPrompt && lastReplyFull) {
      setMessages((prev) => {
        const next = [...prev];
        if (next.length > 0 && next[next.length - 1].role === "assistant") {
          next[next.length - 1] = { ...next[next.length - 1], content: lastReplyFull };
        }
        return [...next, { role: "user", content: userContent }];
      });
      setCtaPrompt(null);
      setLastReplyFull(null);
    } else {
      setMessages((prev) => [...prev, { role: "user", content: userContent }]);
    }
    setLoading(true);

    try {
      const res = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userContent, sessionState }),
      });

      if (!res.ok) {
        throw new Error("Chat request failed");
      }
      const data = await res.json();

      applyChatPayload(data);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);

      if (data.ctaPrompt != null) {
        setCtaPrompt(data.ctaPrompt);
        setLastReplyFull(data.replyFull ?? null);
      } else {
        setCtaPrompt(null);
        setLastReplyFull(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function initChat() {
      setLoading(true);
      try {
        const res = await fetch(CHAT_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: "", sessionState: null }),
        });

        if (!res.ok) {
          throw new Error("Chat request failed");
        }

        const data = await res.json();

        if (!cancelled) {
          applyChatPayload(data);
          setMessages([{ role: "assistant", content: data.reply }]);
          if (data.ctaPrompt != null) {
            setCtaPrompt(data.ctaPrompt);
            setLastReplyFull(data.replyFull ?? null);
          }
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
  }, [applyChatPayload]);

  useEffect(() => {
    if (loading && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [loading, messages.length]);

  useEffect(() => {
    if (sessionState?.state === "EXIT") return;
    if (isFaqHub) return;
    if (loading) return;
    if (!window.matchMedia("(min-width: 1000px)").matches) return;
    const id = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [loading, sessionState?.state, isFaqHub]);

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

  const faqHubActions =
    isFaqHub && challengeChip ? (
      <div className="onboarding__faq-hub-actions">
        {faqChips.length > 0 ? (
          <div className="onboarding__chips onboarding__chips--faq" aria-label="Preguntas frecuentes">
            {faqChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                className="onboarding__chip"
                disabled={loading}
                onClick={() => sendChip(chip)}
              >
                {chip.label}
              </button>
            ))}
          </div>
        ) : null}
        {challengePromptLabel ? (
          <p className="onboarding__challenge-prompt">{challengePromptLabel}</p>
        ) : null}
        <div className="onboarding__challenge-chip-wrap" aria-label="Ir al desafío">
          <button
            type="button"
            className="onboarding__chip onboarding__chip--challenge"
            disabled={loading}
            onClick={() => sendChip(challengeChip)}
          >
            {challengeChip.label}
          </button>
        </div>
      </div>
    ) : null;

  return (
    <div className="onboarding">
      <div className="onboarding__message-container">
        {messages.map((m, i) => (
          <div className={"onboarding__message-wrapper" + (m.role === "user" ? " user-message-wrapper" : "")} key={i}>
            {m.role === "assistant" && (
              <img src="/images/thales.webp" alt="Tales" className="onboarding__message__avatar" />
            )}
            <div className={"onboarding__message" + (m.role === "user" ? " user-message" : "")}>
              <strong className="onboarding__message__role">{getRoleLabel(m.role)}:</strong>
              <div className={"onboarding__message__content"}>
                {m.role === "assistant" ? (
                  <ReactMarkdown components={onboardingMarkdownComponents}>{m.content}</ReactMarkdown>
                ) : (
                  <span>{m.content}</span>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="onboarding__message-wrapper">
            <img src="/images/thales.webp" alt="Tales" className="onboarding__message__avatar" />
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

      {faqHubActions}

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
              onClick={() => navigate("/theory")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate("/theory");
                }
              }}
            >
              <img
                src="/icons/article.webp"
                alt="Teoría"
                className="onboarding__exit-button__icon onboarding__exit-button__icon--article"
              />
              <span className="onboarding__exit-button__label">TEORÍA</span>
            </div>
            <div
              className="onboarding__exit-button"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/test/stressing-thoughts-1")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate("/test/stressing-thoughts-1");
                }
              }}
            >
              <img src="/icons/course.webp" alt="Test" className="onboarding__exit-button__icon" />
              <span className="onboarding__exit-button__label">TEST</span>
            </div>
          </div>
        </div>
      ) : isFaqHub ? null : ctaPrompt ? (
        <div className="onboarding__cta-box">
          <form onSubmit={sendMessage}>
            <h3 className="onboarding__cta-box__title">{ctaPrompt.title}</h3>
            <p className="onboarding__cta-box__paragraph">{ctaPrompt.paragraph}</p>
            <input
              ref={inputRef}
              className="onboarding__input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu respuesta"
              disabled={loading}
            />
            <button className="onboarding__button" type="submit" disabled={loading}>
              Enviar
            </button>
          </form>
        </div>
      ) : (
        <form onSubmit={sendMessage}>
          <input
            ref={inputRef}
            className="onboarding__input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
