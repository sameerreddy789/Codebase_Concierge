import React from 'react';
import { Sparkles, GitBranch, Loader2 } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';

const Navbar = ({ repoUrl, setRepoUrl, ingesting, handleIngest, repoName, setRepoName, availableRepos }) => {
  return (
    <header className="clay-flat p-4 flex items-center justify-between animate-in fade-in slide-in-from-top duration-500">
      <div className="flex items-center gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-2xl shadow-lg">
          <Sparkles className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">Codebase Concierge</h1>
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Repository Intelligence</span>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-1 max-w-2xl justify-end">
        <select 
          aria-label="Select Repository Workspace"
          className="bg-white/70 border border-white/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 transition-all text-sm font-medium clay-inset cursor-pointer min-w-[160px] max-w-[200px] truncate"
          value={repoName}
          onChange={(e) => setRepoName(e.target.value)}
        >
          <option value="">Select Workspace</option>
          {availableRepos.map(repo => (
            <option key={repo} value={repo}>{repo}</option>
          ))}
        </select>

        <div className="relative flex-1 max-w-md group">
          <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
          <Input 
            aria-label="Paste GitHub URL"
            placeholder="Paste public GitHub URL..." 
            className="pl-10"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
        </div>

        <Button 
          variant="clay" 
          onClick={handleIngest} 
          disabled={ingesting || !repoUrl}
          className="min-w-[100px]"
        >
          {ingesting ? <Loader2 className="animate-spin w-5 h-5" /> : 'Analyze'}
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
