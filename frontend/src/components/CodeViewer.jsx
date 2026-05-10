import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';

const CodeViewer = ({ isOpen, onClose, content, filePath, repoName }) => {
  const extension = filePath?.split('.').pop() || 'javascript';
  const language = extension === 'jsx' ? 'jsx' : extension === 'py' ? 'python' : 'javascript';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-6 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 100 }}
            className="w-full max-w-3xl h-full clay-flat overflow-hidden flex flex-col pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{repoName}</span>
                <span className="text-sm font-semibold text-slate-700">{filePath}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={onClose} className="p-2 h-10 w-10">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden bg-[#1e1e1e]">
              <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '24px',
                  height: '100%',
                  fontSize: '13px',
                  lineHeight: '1.6',
                }}
                showLineNumbers
              >
                {content || '// No content available'}
              </SyntaxHighlighter>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CodeViewer;
