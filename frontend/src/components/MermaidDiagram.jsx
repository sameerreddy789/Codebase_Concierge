import React, { useEffect, useRef, memo } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: true,
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

  useEffect(() => {
    if (ref.current && chart && chart.length > 10) {
      try {
        ref.current.removeAttribute('data-processed');
        mermaid.contentLoaded();
      } catch (e) {
        console.error("Mermaid render error", e);
      }
    }
  }, [chart]);

  return (
    <div className="mermaid bg-white p-4 rounded-2xl border border-slate-100 shadow-inner flex justify-center my-4 overflow-x-auto min-h-[100px]" ref={ref}>
      {chart}
    </div>
  );
});

export default MermaidDiagram;
