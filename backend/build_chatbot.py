import os
with open('/Users/deepaks/Desktop/MED/medilens-frontend/components/ui/chatbot.tsx', 'w') as f:
    f.write("""'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Stethoscope, ChevronRight, Loader2 } from 'lucide-react';
import { clinicalProtocols, ProtocolNode, ProtocolOption } from '@/lib/clinical-protocols';
import { searchMedicines } from '@/lib/api';
import type { SearchResult } from '@/types';
import Link from 'next/link';

type Message = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  options?: ProtocolOption[];
  isSearching?: boolean;
  results?: SearchResult[];
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'bot',
      text: clinicalProtocols.root.message,
      options: clinicalProtocols.root.options,
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleOptionClick = async (option: ProtocolOption) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: option.label,
    };
    
    setMessages(prev => {
      const newMessages = [...prev];
      const lastBotMsg = newMessages[newMessages.length - 1];
      if (lastBotMsg && lastBotMsg.sender === 'bot') {
        lastBotMsg.options = undefined;
      }
      return [...newMessages, userMsg];
    });

    const nextNode = clinicalProtocols[option.nextId];
    if (!nextNode) return;

    setTimeout(async () => {
      const botMsgId = (Date.now() + 1).toString();
      const botMsg: Message = {
        id: botMsgId,
        sender: 'bot',
        text: nextNode.message,
        options: nextNode.options,
        isSearching: !!nextNode.searchQuery,
      };
      
      setMessages(prev => [...prev, botMsg]);

      if (nextNode.searchQuery) {
        try {
          const res = await searchMedicines(nextNode.searchQuery, 1, 3);
          setMessages(prev => prev.map(msg => 
            msg.id === botMsgId 
              ? { ...msg, isSearching: false, results: res.results }
              : msg
          ));
        } catch (error) {
          setMessages(prev => prev.map(msg => 
            msg.id === botMsgId 
              ? { ...msg, isSearching: false, text: msg.text + ' (Failed to load clinical data).' }
              : msg
          ));
        }
      }
    }, 600);
  };

  const resetChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'bot',
        text: clinicalProtocols.root.message,
        options: clinicalProtocols.root.options,
      }
    ]);
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-on-primary shadow-lg flex items-center justify-center ${isOpen ? 'hidden' : 'flex'}`}
        aria-label="Open Clinical Assistant"
      >
        <Stethoscope size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-32px)] h-[600px] max-h-[calc(100vh-32px)] bg-surface-container-lowest rounded-2xl shadow-2xl border border-card-border flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-card-border bg-surface-container-lowest">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Stethoscope size={18} />
                </div>
                <div>
                  <h3 className="text-label-lg font-bold text-on-surface">Clinical Assistant</h3>
                  <p className="text-[11px] text-on-surface-variant uppercase tracking-wider">Automated Protocol</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={resetChat}
                  className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-full transition-colors text-xs font-medium"
                >
                  Reset
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-surface-container-lowest/50">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div 
                    className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                      msg.sender === 'user' 
                        ? 'bg-primary text-on-primary rounded-tr-sm' 
                        : 'bg-surface-container-low text-on-surface rounded-tl-sm'
                    }`}
                  >
                    <p className="text-body-sm leading-relaxed">{msg.text}</p>
                  </div>

                  {msg.options && (
                    <div className="mt-3 flex flex-col gap-2 w-full max-w-[85%]">
                      {msg.options.map((opt, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          onClick={() => handleOptionClick(opt)}
                          className="text-left w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest hover:border-primary hover:bg-primary/5 text-body-sm font-medium transition-all text-primary flex items-center justify-between group shadow-sm"
                        >
                          {opt.label}
                          <ChevronRight size={16} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {msg.isSearching && (
                    <div className="mt-3 p-3 rounded-xl bg-surface-container-low/50 flex items-center gap-3 w-[85%]">
                      <Loader2 size={16} className="animate-spin text-primary" />
                      <span className="text-xs text-on-surface-variant font-medium">Querying clinical database...</span>
                    </div>
                  )}

                  {msg.results && msg.results.length > 0 && (
                    <div className="mt-3 flex flex-col gap-2 w-full max-w-[90%]">
                      {msg.results.map((res) => (
                        <Link href={`/medicine/${res.medicine_id}`} key={res.medicine_id}>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-3 rounded-xl border border-card-border bg-surface-container-lowest hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
                          >
                            <h4 className="text-label-lg font-bold text-primary group-hover:underline">{res.product_name}</h4>
                            <p className="text-[11px] text-on-surface-variant mt-1 line-clamp-1">{res.composition}</p>
                          </motion.div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
""")
