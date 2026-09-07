'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Bot, X, Send, Loader2 } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function detectCaseId(pathname: string): string | undefined {
  const match = pathname.match(/^\/cases\/([^/]+)/);
  return match ? match[1] : undefined;
}

export default function AIChatWidget() {
  const pathname = usePathname();
  const caseId = detectCaseId(pathname);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages, caseId }),
      });

      if (res.status === 503) {
        setError('AI assistant not configured.');
        return;
      }
      if (!res.ok) {
        setError('AI assistant request failed. Try again.');
        return;
      }

      const text = await res.text();
      setMessages([...nextMessages, { role: 'assistant', content: text }]);
    } catch {
      setError('AI assistant request failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 w-80 h-96 bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-900 text-white">
            <span className="text-xs font-bold tracking-wide">Caseline AI</span>
            <button onClick={() => setOpen(false)} className="text-slate-300 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 && (
              <p className="text-[11px] text-slate-400">
                Ask about cases, criminals, officers, evidence, or investigations
                {caseId ? ' — currently viewing this case.' : '.'}
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-xs rounded-lg px-2.5 py-1.5 max-w-[85%] whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-slate-900 text-white ml-auto'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {m.content}
              </div>
            ))}
            {error && <p className="text-[11px] text-red-500">{error}</p>}
          </div>

          <div className="border-t border-slate-100 p-2 flex items-center space-x-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask the AI assistant..."
              className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-slate-400"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="p-1.5 rounded-lg bg-slate-900 text-white disabled:opacity-40"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-12 h-12 rounded-full bg-slate-900 text-white shadow-lg flex items-center justify-center hover:bg-slate-800 transition-colors"
      >
        <Bot className="w-5 h-5" />
      </button>
    </div>
  );
}
