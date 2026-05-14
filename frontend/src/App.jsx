import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Message from './components/Message';
import Button from './components/ui/Button';
import CodeViewer from './components/CodeViewer';

const API_BASE = 'http://localhost:8000';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [ingesting, setIngesting] = useState(false);
  const [repoName, setRepoName] = useState('');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [agentStatus, setAgentStatus] = useState('');
  const [availableRepos, setAvailableRepos] = useState([]);
  
  useEffect(() => {
    if (loading) {
      const statuses = [
        'Analyst is scanning file tree...',
        'Retriever is searching for relevant chunks...',
        'Explainer is generating architectural summary...',
        'Gemini is synthesizing insights...'
      ];
      setAgentStatus(statuses[0]);
      let i = 1;
      const interval = setInterval(() => {
        setAgentStatus(statuses[i % statuses.length]);
        i++;
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [loading]);
  
  const [repoTree, setRepoTree] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    // Expose nodeClick to global window for Mermaid interactive clicks
    window.nodeClick = (path) => {
      console.log("Diagram node clicked, opening:", path);
      handleFileSelect(path);
    };

    return () => {
      delete window.nodeClick;
    };
  }, [repoName]); // Re-bind if repoName changes, though path is usually absolute relative to repo

  const fetchRepoData = async (name) => {
    if (!name) return;
    try {
      const res = await axios.get(`${API_BASE}/repos/${name}/summary`);
      setRepoTree(res.data.tree || []);
    } catch (err) {
      console.error("Failed to fetch repo summary", err);
    }
  };

  useEffect(() => {
    if (repoName) {
      fetchRepoData(repoName);
    } else {
      setRepoTree([]);
    }
  }, [repoName]);

  const handleFileSelect = async (path) => {
    setSelectedFile(path);
    setIsViewerOpen(true);
    try {
      const res = await axios.get(`${API_BASE}/repos/${repoName}/files/${path}`);
      setFileContent(res.data.content);
    } catch (err) {
      console.error("Failed to fetch file content", err);
      setFileContent('// Error: Could not load file content.');
    }
  };

  const [pollingMessage, setPollingMessage] = useState('');

  const fetchRepos = async () => {
    try {
      const res = await axios.get(`${API_BASE}/repos`);
      setAvailableRepos(res.data.repos);
    } catch (err) {
      console.error("Failed to fetch repos", err);
    }
  };

  const pollStatus = async (url) => {
    setPollingMessage('Cloning repository...');
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE}/status?url=${url}`);
        if (res.data.status === 'completed') {
          clearInterval(interval);
          setIngesting(false);
          setPollingMessage('');
          const name = url.split("/").pop().replace(".git", "");
          setRepoName(name);
          fetchRepos();
        } else if (res.data.status === 'failed') {
          clearInterval(interval);
          setIngesting(false);
          setPollingMessage('');
          alert(`Ingestion failed: ${res.data.message}`);
        } else if (res.data.status === 'indexing') {
          setPollingMessage('Indexing architectural chunks...');
        }
      } catch (err) {
        console.error(err);
      }
    }, 2000);
  };

  const handleIngest = async () => {
    if (!repoUrl) return;
    setIngesting(true);
    try {
      await axios.post(`${API_BASE}/ingest`, { url: repoUrl });
      pollStatus(repoUrl);
    } catch (err) {
      console.error(err);
      alert('Failed to start ingestion.');
      setIngesting(false);
    }
  };

  const handleSend = async (overrideQuery = null) => {
    const q = overrideQuery || query;
    if (!q || !repoName) return;
    
    const userMsg = { role: 'user', content: q };
    const assistantMsg = { role: 'assistant', content: '' };
    
    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setQuery('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_name: repoName, query: q })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              fullContent += data.text;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = fullContent;
                return newMessages;
              });
            } catch (e) {
              console.error("Error parsing stream chunk", e);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = 'Error: Could not get response.';
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex flex-col h-screen p-6 gap-6 max-w-[1600px] mx-auto">
      <Navbar 
        repoUrl={repoUrl} 
        setRepoUrl={setRepoUrl} 
        ingesting={ingesting} 
        handleIngest={handleIngest} 
        repoName={repoName} 
        setRepoName={setRepoName} 
        availableRepos={availableRepos} 
      />

      <div className="flex flex-1 gap-6 overflow-hidden">
        <Sidebar 
          repoName={repoName} 
          repoTree={repoTree} 
          onFileSelect={handleFileSelect} 
          selectedFile={selectedFile}
        />

        <main className="flex-1 clay-flat flex flex-col p-6 overflow-hidden relative">
          <div className="flex-1 overflow-y-auto pr-4 scroll-smooth">
            {messages.length === 0 && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-6">
                <div className="clay-pressed p-8 rounded-[40px] opacity-40">
                  <Sparkles className="w-16 h-16 text-indigo-400 animate-pulse" />
                </div>
                <div className="text-center opacity-40 mb-4">
                  <h2 className="text-xl font-bold text-slate-600 mb-2">Workspace Ready</h2>
                  <p className="text-sm max-w-[280px]">Select a repository or paste a link to begin the deep architectural analysis.</p>
                </div>
                
                {repoName && (
                  <div className="flex flex-wrap justify-center gap-3 max-w-2xl mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {[
                      "Draw a Mermaid diagram of the overall architecture.",
                      "Where is the main entry point and routing logic?",
                      "Explain the authentication flow.",
                      "Show me the data flow of a core request.",
                      "What are the primary design patterns used?",
                      "List the external dependencies and their purpose."
                    ].map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(prompt)}
                        className="bg-white/60 hover:bg-white border border-indigo-100 hover:border-indigo-300 text-slate-600 text-sm py-2 px-4 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {messages.map((m, i) => (
              <Message key={i} message={m} />
            ))}

            {loading && (
              <div className="flex justify-start mb-6">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-white/50 shadow-sm flex flex-col gap-2 clay-inset">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 animate-pulse">{agentStatus}</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form 
            className="mt-4 relative group"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input 
              type="text" 
              aria-label="Ask about the architecture"
              placeholder={repoName ? "Ask about the architecture, patterns, or logic..." : availableRepos.length ? "Select a workspace to begin..." : "Ingest a repository to begin..."}
              className="w-full pl-6 pr-16 py-5 bg-white border border-white/40 rounded-[28px] shadow-inner focus:outline-none focus:ring-4 focus:ring-indigo-400/10 transition-all clay-inset disabled:opacity-50 text-slate-700 font-medium"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={!repoName || loading}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Button 
                type="submit"
                disabled={!repoName || loading || !query}
                className="w-12 h-12 p-0 rounded-2xl shadow-lg hover:shadow-indigo-200"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
          </form>
        </main>
      </div>

      <CodeViewer 
        isOpen={isViewerOpen} 
        onClose={() => setIsViewerOpen(false)}
        content={fileContent}
        filePath={selectedFile}
        repoName={repoName}
      />
    </div>
  );
}

export default App;
