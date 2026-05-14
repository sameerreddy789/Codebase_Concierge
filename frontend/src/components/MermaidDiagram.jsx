import React, { useEffect, useRef, memo } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: true,
  securityLevel: 'loose', // Required for interactive clicks
  theme: 'base',
  themeVariables: {
    primaryColor: '#6366f1',
    primaryTextColor: '#fff',
    primaryBorderColor: '#4338ca',
    lineColor: '#6366f1',
    secondaryColor: '#f5f3ff',
    tertiaryColor: '#fff',
  }
});

const MermaidDiagram = memo(({ chart }) => {
  const ref = useRef(null);
  const [error, setError] = React.useState(false);

  useEffect(() => {
    if (ref.current && chart && chart.length > 10) {
      try {
        setError(false);
        // Clear previous content to avoid duplicate rendering and reset state
        ref.current.removeAttribute('data-processed');
        ref.current.innerHTML = chart;
        
        // Re-render
        mermaid.contentLoaded();
      } catch (e) {
        console.error("Mermaid render error", e);
        setError(true);
      }
    }
  }, [chart]);

  if (error) {
    return (
      <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs flex flex-col items-center gap-2 my-4">
        <span>Diagram rendering failed. Raw syntax:</span>
        <pre className="bg-white p-2 rounded border border-slate-100 w-full overflow-x-auto">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div className="mermaid bg-white p-4 rounded-2xl border border-slate-100 shadow-inner flex justify-center my-4 overflow-x-auto min-h-[100px]" ref={ref}>
      {chart}
    </div>
  );
});

export default MermaidDiagram;
