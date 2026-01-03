import { useState } from "react";

export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

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
        body: JSON.stringify({ message: userMessage.content })
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

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <div>
        {messages.map((m, i) => (
          <p key={i}>
            <strong>{m.role}:</strong> {m.content}
          </p>
        ))}
      </div>

      <form onSubmit={sendMessage}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message"
        />
        <button type="submit" disabled={loading}>
          Send
        </button>
      </form>
    </div>
  );
}
