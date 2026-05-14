import React, { useState, useEffect } from 'react';
import { File, FileCode, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FileIcon = ({ name }) => {
  const ext = name.split('.').pop().toLowerCase();
  if (['js', 'jsx', 'ts', 'tsx', 'py', 'go', 'html', 'css', 'json'].includes(ext)) {
    return <FileCode className="w-4 h-4 text-indigo-400" />;
  }
  return <File className="w-4 h-4 text-slate-400" />;
};

const FileTreeItem = ({ item, onFileSelect, selectedFile }) => {
  const isFolder = item.type === 'folder';
  const isSelected = selectedFile === item.path;
  const [isOpen, setIsOpen] = useState(false);

  // Automatically open folder if a child is selected
  useEffect(() => {
    if (selectedFile && selectedFile.startsWith(item.path + '/') && isFolder) {
      setIsOpen(true);
    }
  }, [selectedFile, item.path, isFolder]);

  return (
    <div className="select-none">
      <div 
        className={`flex items-center gap-2 py-1 px-2 rounded-lg cursor-pointer transition-colors group ${
          isSelected ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-indigo-50/50'
        }`}
        onClick={() => isFolder ? setIsOpen(!isOpen) : onFileSelect(item.path)}
      >
        {isFolder ? (
          <>
            {isOpen ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
            <Folder className={`w-4 h-4 ${isOpen || isSelected ? 'text-indigo-500' : 'text-slate-400'}`} />
          </>
        ) : (
          <>
            <div className="w-3" />
            <FileIcon name={item.name} />
          </>
        )}
        <span className={`text-xs font-medium ${
          isFolder ? 'text-slate-600' : isSelected ? 'text-indigo-700' : 'text-slate-500 group-hover:text-indigo-600'
        }`}>
          {item.name}
        </span>
      </div>

      <AnimatePresence>
        {isFolder && isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="ml-4 border-l border-slate-100 overflow-hidden"
          >
            {item.children.map((child, i) => (
              <FileTreeItem key={i} item={child} onFileSelect={onFileSelect} selectedFile={selectedFile} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Sidebar = ({ repoName, onFileSelect, selectedFile, repoTree = [] }) => {
  const [structuredTree, setRepoTree] = useState([]);

  useEffect(() => {
    if (repoTree.length > 0) {
      const root = [];
      repoTree.forEach(path => {
        const parts = path.split('/');
        let currentLevel = root;
        
        parts.forEach((part, index) => {
          const isLast = index === parts.length - 1;
          let existing = currentLevel.find(i => i.name === part);
          
          if (!existing) {
            existing = { 
              name: part, 
              path: parts.slice(0, index + 1).join('/'),
              type: isLast ? 'file' : 'folder',
              children: []
            };
            currentLevel.push(existing);
          }
          currentLevel = existing.children;
        });
      });
      setRepoTree(root);
    } else {
      setRepoTree([]);
    }
  }, [repoTree]);

  return (
    <aside className="w-72 clay-flat p-4 flex flex-col gap-6 animate-in fade-in slide-in-from-left duration-500 overflow-hidden">
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workspace Explorer</span>
          {repoName && <span className="text-[10px] font-bold text-indigo-500 truncate max-w-[120px]">{repoName}</span>}
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {structuredTree.length > 0 ? (
            structuredTree.map((item, i) => (
              <FileTreeItem key={i} item={item} onFileSelect={onFileSelect} selectedFile={selectedFile} />
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2 opacity-50">
              <Folder className="w-8 h-8" />
              <p className="text-[10px] font-bold uppercase tracking-tighter">No Files Loaded</p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <div className="clay-pressed p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Context Depth</span>
            <span className="text-[10px] font-bold text-indigo-500">{repoName ? '84%' : '0%'}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: repoName ? '84%' : '0%' }}
              className="h-full bg-indigo-500"
            />
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            {repoName 
              ? `Gemini is analyzing the structural signatures of ${repoName}` 
              : "Select a workspace to begin."}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
