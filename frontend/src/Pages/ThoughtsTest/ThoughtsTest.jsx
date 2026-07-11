import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, Navigate, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { thoughtsTests } from "../../data";
import { saveThoughtsTestAnswer } from "../../utils/thoughtsTestStorage";
import Navigation from "../../Components/Navigation/Navigation";
import TestLoadingScreen from "./TestLoadingScreen";
import { getRandomJournalAcknowledgment } from "./loadingQuotes";
import "./ThoughtsTest.css";

const ROLE_LABELS = {
  user: "Tú",
  assistant: "Tales",
};

const getRoleLabel = (role) => ROLE_LABELS[role] ?? "Tales";

const markdownComponents = {
  a: ({ href, children, ...props }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  ),
};

// Simulated "typing" delay before each Tales message, mirroring the onboarding feel.
const INTRO_DELAY_MS = 900;
const TYPING_DELAY_MS = 700;

// Suggested journaling duration, shown as a countdown above the text area.
const JOURNAL_DURATION_SECONDS = 5 * 60;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const formatCountdown = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

// Counts down from 05:00 to 00:00. It resets on remount, which happens every
// time the user re-enters the writing state (the write box is unmounted on
// CANCELAR and mounted again on ESCRIBIR).
const JournalTimer = () => {
  const [secondsLeft, setSecondsLeft] = useState(JOURNAL_DURATION_SECONDS);

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="thoughts-test__journal-timer" role="timer" aria-label="Tiempo de escritura restante">
      {formatCountdown(secondsLeft)}
    </div>
  );
};

function ChatMessage({ role, content }) {
  const isUser = role === "user";
  return (
    <div className={"test-chat__message-wrapper" + (isUser ? " test-chat__message-wrapper--user" : "")}>
      {!isUser && (
        <img src="/images/thales.webp" alt="Tales" className="test-chat__message__avatar" />
      )}
      <div className={"test-chat__message" + (isUser ? " test-chat__message--user" : "")}>
        <strong className="test-chat__message__role">{getRoleLabel(role)}:</strong>
        <div className="test-chat__message__content">
          {isUser ? (
            <span>{content}</span>
          ) : (
            <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="test-chat__message-wrapper">
      <img src="/images/thales.webp" alt="Tales" className="test-chat__message__avatar" />
      <div className="test-chat__message test-chat__message--loading">
        <strong className="test-chat__message__role">{getRoleLabel("assistant")}:</strong>
        <div className="test-chat__message__content">
          <div className="test-chat__loading-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Remount the flow on testId change so all state resets atomically when
// navigating between tests (e.g. via a recommendation button). The key also
// re-triggers the simulated loading screen on every test.
export default function ThoughtsTest() {
  const { testId } = useParams();
  return <ThoughtsTestFlow key={testId} />;
}

function ThoughtsTestFlow() {
  const { testId } = useParams();
  const [loading, setLoading] = useState(true);

  // Unknown tests are redirected by the chat; skip the loader for them.
  if (!thoughtsTests[testId]) {
    return <ThoughtsTestChat />;
  }

  if (loading) {
    return <TestLoadingScreen onDone={() => setLoading(false)} />;
  }

  return <ThoughtsTestChat />;
}

function ThoughtsTestChat() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const test = thoughtsTests[testId];

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  // Flow phases: intro -> questions -> journal -> done
  const [phase, setPhase] = useState("intro");
  const [input, setInput] = useState("");
  const [recommendedTestId, setRecommendedTestId] = useState(null);
  // Journal writing sub-flow: idle -> writing (toggable via ESCRIBIR / CANCELAR).
  const [writeState, setWriteState] = useState("idle");
  const [journalText, setJournalText] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const mountedRef = useRef(true);
  // Tracks the answer to the recommendation's key question synchronously,
  // avoiding stale state when the end-of-flow runs in the same handler.
  const keyOptionRef = useRef(null);

  const appendMessage = useCallback((role, content) => {
    setMessages((prev) => [...prev, { role, content }]);
  }, []);

  const talesSay = useCallback(
    async (content, ms = TYPING_DELAY_MS) => {
      setLoading(true);
      await delay(ms);
      if (!mountedRef.current) return;
      appendMessage("assistant", content);
      setLoading(false);
    },
    [appendMessage]
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Deliver the intro and the first question. Re-runs when the test changes
  // (e.g. navigating from a recommendation), resetting the conversation first.
  useEffect(() => {
    if (!test || test.questions.length === 0) return;
    let cancelled = false;

    setMessages([]);
    setStepIndex(0);
    setPhase("intro");
    setInput("");
    setRecommendedTestId(null);
    setWriteState("idle");
    setJournalText("");
    keyOptionRef.current = null;
    window.scrollTo(0, 0);

    (async () => {
      if (test.intro) {
        setLoading(true);
        await delay(INTRO_DELAY_MS);
        if (cancelled) return;
        appendMessage("assistant", test.intro);
      }
      setLoading(true);
      await delay(TYPING_DELAY_MS);
      if (cancelled) return;
      appendMessage("assistant", test.questions[0].prompt);
      setLoading(false);
      setStepIndex(0);
      setPhase("questions");
    })();

    return () => {
      cancelled = true;
    };
  }, [test, appendMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, loading, phase]);

  // Focus the text input when the free-text question becomes active (desktop only).
  useEffect(() => {
    if (phase !== "questions" || loading) return;
    if (test?.questions[stepIndex]?.type !== "text") return;
    if (!window.matchMedia("(min-width: 1000px)").matches) return;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [phase, loading, stepIndex, test]);

  if (!test) {
    return <Navigate to="/" replace />;
  }

  const currentQuestion = test.questions[stepIndex];

  async function advanceAfterAnswer(answeredIndex) {
    const nextIndex = answeredIndex + 1;
    if (nextIndex < test.questions.length) {
      await talesSay(test.questions[nextIndex].prompt);
      if (!mountedRef.current) return;
      setStepIndex(nextIndex);
    } else {
      // All questions answered: add Tales' journaling prompt to the message
      // thread, then switch to the journal phase for the writing controls.
      await talesSay(test.journalingPrompt);
      if (!mountedRef.current) return;
      setPhase("journal");
    }
  }

  // Advances past the journaling prompt (whether the user wrote or skipped) and
  // reveals the closing recommendation, or the course promo when none applies.
  async function handleContinue() {
    if (loading || phase !== "journal") return;
    // Capture before any state reset so the acknowledgment check is accurate.
    const didWrite = writeState === "writing";
    // Save any in-progress journal text before advancing.
    if (didWrite && journalText.trim()) {
      saveThoughtsTestAnswer(testId, {
        questionId: "journal-entry",
        prompt: test.journalingPrompt,
        type: "text",
        value: journalText.trim(),
      });
    }
    // Hide the writing UI and acknowledge completion when the user actually wrote.
    if (didWrite) {
      setWriteState("idle");
      setJournalText("");
      await talesSay(getRandomJournalAcknowledgment());
      if (!mountedRef.current) return;
    }
    const recId = test.recommendation?.byOption[keyOptionRef.current] ?? null;
    const recTest = recId ? thoughtsTests[recId] : null;
    if (recTest) {
      setLoading(true);
      await delay(TYPING_DELAY_MS);
      if (!mountedRef.current) return;
      setLoading(false);
      setRecommendedTestId(recId);
    }
    setPhase("done");
  }

  async function handleChipSelect(question, option) {
    if (loading) return;
    if (question.id === test.recommendation?.keyQuestionId) {
      keyOptionRef.current = option.id;
    }
    appendMessage("user", option.label);
    saveThoughtsTestAnswer(testId, {
      questionId: question.id,
      prompt: question.prompt,
      type: "chips",
      value: option.label,
    });
    await advanceAfterAnswer(stepIndex);
  }

  async function handleTextSubmit(e) {
    e.preventDefault();
    if (loading || !input.trim()) return;
    const value = input.trim();
    setInput("");
    appendMessage("user", value);
    saveThoughtsTestAnswer(testId, {
      questionId: currentQuestion.id,
      prompt: currentQuestion.prompt,
      type: "text",
      value,
    });
    await advanceAfterAnswer(stepIndex);
  }

  function handleJournalChange(e) {
    setJournalText(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  const showQuestionTyping = loading && (phase === "intro" || phase === "questions");
  const showChips =
    phase === "questions" && !loading && currentQuestion?.type === "chips";
  const showTextForm =
    phase === "questions" && !loading && currentQuestion?.type === "text";
  const showJournal = phase === "journal" || phase === "done";
  const recommendedTest = recommendedTestId ? thoughtsTests[recommendedTestId] : null;
  const showRecommendation = phase === "done" && recommendedTest;
  // The course promo is a fallback shown only when the test has no further
  // recommendation, substituting the recommendation prompt below the journal.
  const showPromo = phase === "done" && !recommendedTest;

  return (
    <div className="test-chat thoughts-test">
      <h1 className="thoughts-test__title">Test: {test.title}</h1>
      <div className="test-chat__message-container">
        {messages.map((m, i) => (
          <ChatMessage key={i} role={m.role} content={m.content} />
        ))}
        {showQuestionTyping && <TypingBubble />}
        <div ref={messagesEndRef} />
      </div>

      {showChips && (
        <div className="test-chat__chips" aria-label="Opciones de respuesta">
          {currentQuestion.options.map((option) => (
            <button
              key={option.id}
              type="button"
              className="test-chat__chip"
              disabled={loading}
              onClick={() => handleChipSelect(currentQuestion, option)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {showTextForm && (
        <div className="test-chat__cta-box">
          <form onSubmit={handleTextSubmit}>
            <input
              ref={inputRef}
              className="test-chat__input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu respuesta"
              disabled={loading}
            />
            <button className="test-chat__button" type="submit" disabled={loading}>
              ENVIAR
            </button>
          </form>
        </div>
      )}

      {showJournal && (
        <div className="thoughts-test__journal">

          {phase === "journal" && !loading && writeState === "idle" && (
            <div className="thoughts-test__write-intro">
              <button
                type="button"
                className="test-chat__button thoughts-test__promo-button"
                onClick={() => setWriteState("writing")}
              >
                ESCRIBIR
              </button>
              <p className="thoughts-test__write-disclaimer">
                Lo que escribas en esta aplicación es privado y no será visto por
                nadie más.
              </p>
            </div>
          )}

          {writeState === "writing" && (
            <div className="thoughts-test__write-box">
              <JournalTimer />
              <textarea
                className="thoughts-test__journal-textarea"
                value={journalText}
                onChange={handleJournalChange}
                placeholder="Escribe aquí..."
              />
              <button
                type="button"
                className="test-chat__button thoughts-test__promo-button thoughts-test__journal-finish-button"
                onClick={handleContinue}
              >
                TERMINAR
              </button>
              <button
                type="button"
                className="test-chat__button thoughts-test__promo-button thoughts-test__journal-cancel-button"
                onClick={() => {
                  setWriteState("idle");
                  setJournalText("");
                }}
              >
                CANCELAR
              </button>
            </div>
          )}

          {phase === "journal" && !loading && writeState !== "writing" && (
            <>
              <button
                type="button"
                className="test-chat__button thoughts-test__promo-button thoughts-test__continue-button"
                onClick={handleContinue}
              >
                CONTINUAR
              </button>
              <Link to="/tests" className="thoughts-test__home-link">
                Ver más tests
              </Link>
            </>
          )}
        </div>
      )}

      {phase === "journal" && loading && (
        <div className="thoughts-test__journal-typing">
          <TypingBubble />
        </div>
      )}

      {showRecommendation && (
        <div className="thoughts-test__recommendation">
          <ChatMessage role="assistant" content={test.recommendation.message} />
          <button
            type="button"
            className="test-chat__button thoughts-test__promo-button"
            onClick={() => navigate(`/test/${recommendedTestId}`)}
          >
            {recommendedTest.title}
          </button>
        </div>
      )}

      {showPromo && (
        <div className="test-chat__cta-box thoughts-test__promo">
          <h3 className="test-chat__cta-box__title">{test.coursePromo.title}</h3>
          <p className="test-chat__cta-box__paragraph">{test.coursePromo.paragraph}</p>
          <button
            type="button"
            className="test-chat__button thoughts-test__promo-button"
            onClick={() => navigate("/course")}
          >
            {test.coursePromo.buttonLabel}
          </button>
        </div>
      )}

      {(showRecommendation || showPromo) && (
        <Link to="/tests" className="thoughts-test__home-link">
          Ver más tests
        </Link>
      )}

      <Navigation />
    </div>
  );
}
