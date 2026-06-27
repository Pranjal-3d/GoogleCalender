import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, Loader2, Calendar, Clock, CheckCircle, ChevronRight, User, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isAfter } from 'date-fns';
import { useCalendar } from '../context/CalendarContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  slots?: SuggestedSlot[];
  loading?: boolean;
}

interface SuggestedSlot {
  start: Date;
  end: Date;
  label: string;
  score: number; // 1-10
  reason: string;
}

interface AIAssistantProps {
  onClose: () => void;
  onCreateEvent: (title: string, start: Date, end: Date) => void;
}

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'openai/gpt-4o-mini';

// Parse slots from AI JSON response
const parseSlots = (text: string): SuggestedSlot[] => {
  try {
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (match) {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed.slots)) {
        return parsed.slots.map((s: any) => ({
          start: new Date(s.start),
          end: new Date(s.end),
          label: s.label,
          score: s.score,
          reason: s.reason,
        }));
      }
    }
  } catch {}
  return [];
};

// Strip the JSON block from the message text
const stripJson = (text: string): string =>
  text.replace(/```json[\s\S]*?```/g, '').trim();

const AIAssistant: React.FC<AIAssistantProps> = ({ onClose, onCreateEvent }) => {
  const { events, currentDate } = useCalendar();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hello! I'm your Schedule Helper. I'm here to help you find the best time for your meetings and tasks.\n\nHow can I assist you with your calendar today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey] = useState(import.meta.env.VITE_OPENROUTER_API_KEY || '');
  const [pendingTitle, setPendingTitle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildSystemPrompt = () => {
    const now = new Date();
    // Pass upcoming 14 days of events to the AI
    const upcoming = events
      .filter(e => isAfter(new Date(e.startTime), now))
      .slice(0, 40)
      .map(e => ({
        title: e.title,
        start: e.startTime,
        end: e.endTime,
        isHoliday: e.isHoliday,
      }));

    return `You are an intelligent calendar scheduling assistant. Today is ${format(now, "EEEE, MMMM d yyyy, h:mm a")}.

The user's upcoming events for the next 14 days:
${JSON.stringify(upcoming, null, 2)}

Your job:
1. Understand what the user wants to schedule (title, duration, preferred time/day).
2. Analyze the calendar for conflicts and find the BEST 3 available time slots.
3. Prefer business hours (9 AM–6 PM) unless the user says otherwise.
4. Avoid existing events and holidays.
5. Respond conversationally in 1-2 short sentences, then output a JSON block with the suggested slots.

ALWAYS include a JSON block at the end in this exact format:
\`\`\`json
{
  "slots": [
    {
      "start": "ISO8601 datetime",
      "end": "ISO8601 datetime",
      "label": "Human friendly label",
      "score": 9,
      "reason": "Why this slot is great"
    }
  ]
}
\`\`\`

If the user is just chatting, reply helpfully as a personal assistant.`;
  };

  const send = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input.trim();
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: userText };
    const loadingMsg: Message = { id: 'loading', role: 'assistant', content: '', loading: true };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setIsLoading(true);

    // Build conversation history for context
    const history = messages
      .filter(m => !m.loading)
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch(OPENROUTER_BASE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'Google Calendar Clone',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            ...history,
            { role: 'user', content: userText },
          ],
          temperature: 0.4,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'API error');
      }

      const data = await response.json();
      const raw = data.choices[0]?.message?.content || '';
      const slots = parseSlots(raw);
      const cleanText = stripJson(raw);

      // Try to extract event title from user message
      const titleMatch = userText.match(/(?:schedule|book|add|create|plan|block)\s+(?:a\s+)?(.+?)(?:\s+(?:for|on|at|tomorrow|next|this)|\s*$)/i);
      if (titleMatch) setPendingTitle(titleMatch[1].replace(/^\d+[\s-]*(?:min(?:ute)?s?|hours?)\s+/i, '').trim());

      setMessages(prev =>
        prev
          .filter(m => !m.loading)
          .concat({ id: Date.now().toString(), role: 'assistant', content: cleanText, slots })
      );
    } catch (err: any) {
      setMessages(prev =>
        prev
          .filter(m => !m.loading)
          .concat({
            id: Date.now().toString(),
            role: 'assistant',
            content: `❌ Error: ${err.message}. Please check your OpenRouter API key in the \`.env\` file.`,
          })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 400 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 400 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed right-0 top-0 bottom-0 w-[420px] z-[250] flex flex-col shadow-2xl"
        style={{ background: '#fff', borderLeft: '1px solid #e8eaed' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e8eaed]"
          style={{ background: 'linear-gradient(135deg, #1a73e8 0%, #6366f1 100%)' }}
        >
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 shadow-inner">
            <UserCheck size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-[16px] font-semibold text-white">Schedule Helper</h2>
            <p className="text-[12px] text-white/80">Support for your productivity</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* API Key Warning */}
        {(!apiKey || apiKey === 'your_openrouter_api_key_here') && (
          <div className="mx-4 mt-3 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[12px] flex items-start gap-2">
            <span className="text-lg -mt-0.5">⚠️</span>
            <span>Add your OpenRouter API key to <code className="font-mono bg-amber-100 px-1 rounded">client/.env</code> as <code className="font-mono bg-amber-100 px-1 rounded">VITE_OPENROUTER_API_KEY</code> then restart the dev server.</span>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
               <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center shadow-sm ${
                 msg.role === 'user' 
                   ? 'bg-[#1a73e8]' 
                   : 'bg-[#5f6368]'
               }`}>
                <User size={msg.role === 'user' ? 15 : 14} className="text-white" />
              </div>

              <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {/* Bubble */}
                {msg.loading ? (
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[#f1f3f4]">
                    <div className="flex gap-1 items-center">
                      <span className="w-2 h-2 rounded-full bg-[#5f6368] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-[#5f6368] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-[#5f6368] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                ) : (
                  <div className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed whitespace-pre-wrap
                    ${msg.role === 'user'
                      ? 'bg-[#1a73e8] text-white rounded-tr-sm'
                      : 'bg-[#f1f3f4] text-[#1f1f1f] rounded-tl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                )}

                {/* Suggested Slots */}
                {msg.slots && msg.slots.length > 0 && (
                  <div className="w-full space-y-2 mt-1">
                    <p className="text-[12px] text-[#5f6368] font-medium px-1">Suggested time slots:</p>
                    {msg.slots.map((slot, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white border border-[#e8eaed] rounded-xl p-3 hover:border-[#1a73e8] hover:shadow-md transition-all cursor-default group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Calendar size={13} className="text-[#1a73e8] shrink-0" />
                              <span className="text-[13px] font-semibold text-[#1a73e8]">{slot.label}</span>
                              {/* Score badge */}
                              <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full
                                ${slot.score >= 8 ? 'bg-green-100 text-green-700' : slot.score >= 6 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}
                              `}>
                                {slot.score}/10
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mb-1.5">
                              <Clock size={12} className="text-[#5f6368]" />
                              <span className="text-[12px] text-[#5f6368]">
                                {format(slot.start, 'EEE, MMM d')} · {format(slot.start, 'h:mm a')} – {format(slot.end, 'h:mm a')}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#70757a]">{slot.reason}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => onCreateEvent(pendingTitle || 'New Event', slot.start, slot.end)}
                          className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#e8f0fe] hover:bg-[#1a73e8] text-[#1a73e8] hover:text-white text-[12px] font-medium transition-all"
                        >
                          <CheckCircle size={13} />
                          Book this slot
                          <ChevronRight size={13} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-[#e8eaed] bg-white">
          <div className="flex gap-2 items-end">
            <div className="flex-1 bg-[#f1f3f4] rounded-2xl px-4 py-2.5 flex items-end gap-2 focus-within:bg-white focus-within:shadow-md focus-within:ring-2 focus-within:ring-[#1a73e8]/30 transition-all">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Schedule a 1-hour meeting tomorrow at 2pm..."
                rows={1}
                className="flex-1 bg-transparent text-[14px] text-[#1f1f1f] outline-none resize-none placeholder:text-[#9aa0a6] max-h-[120px]"
                style={{ lineHeight: '1.5' }}
                onInput={e => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = 'auto';
                  t.style.height = Math.min(t.scrollHeight, 120) + 'px';
                }}
              />
            </div>
            <button
              onClick={send}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] flex items-center justify-center text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
          <p className="text-[10px] text-[#9aa0a6] text-center mt-2">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIAssistant;
