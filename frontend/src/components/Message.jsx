import React from 'react';
import { Terminal, Search, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import MermaidDiagram from './MermaidDiagram';
import ReactMarkdown from 'react-markdown';

const MessageContent = ({ content }) => {
  const parts = content.split(/```mermaid([\s\S]*?)```/);
  return (
    <div className="space-y-4">
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          return <MermaidDiagram key={i} chart={part.trim()} />;
        }
        return (
          <div key={i} className="prose prose-sm prose-slate max-w-none prose-pre:bg-slate-800 prose-pre:text-slate-100 prose-pre:rounded-xl">
            <ReactMarkdown>{part}</ReactMarkdown>
          </div>
        );
      })}
    </div>
  );
};

const Message = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full mb-6`}
    >
      <div className={`max-w-[85%] p-5 rounded-[32px] shadow-sm ${
        isUser 
        ? 'bg-indigo-500 text-white rounded-tr-none shadow-indigo-200 shadow-xl' 
        : 'bg-white text-slate-700 border border-white/50 rounded-tl-none clay-flat overflow-x-auto'
      }`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-50">
            <div className="flex -space-x-1.5">
              <div className="bg-indigo-50 p-1 rounded-lg border border-indigo-100 shadow-sm">
                <Terminal className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <div className="bg-purple-50 p-1 rounded-lg border border-purple-100 shadow-sm">
                <Search className="w-3.5 h-3.5 text-purple-500" />
              </div>
              <div className="bg-pink-50 p-1 rounded-lg border border-pink-100 shadow-sm">
                <Info className="w-3.5 h-3.5 text-pink-500" />
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Intelligence Team</span>
          </div>
        )}
        <MessageContent content={message.content} />
      </div>
    </motion.div>
  );
};

export default Message;
