import React, { useState } from 'react';
import { ArrowRight, Copy, Check, ChevronLeft, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { marked } from 'marked';
import { useToolNavigation } from '../../hooks/useToolNavigation';
import SEO from '../../components/SEO';
import Footer from '../../components/Footer';
import RelatedTools from '../../components/RelatedTools';

const DEFAULT_MD = '# Hello World\n\nType your **markdown** here.\n\n- It converts\n- In real time!';

export default function MarkdownToHtml() {
  const [md, setMd] = useState(DEFAULT_MD);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');

  // Smart Navigation
  const isToolUsed = md !== DEFAULT_MD;
  const resetAll = () => {
    setMd(DEFAULT_MD);
    setCopied(false);
    setViewMode('preview');
  };

  const { handleBackClick } = useToolNavigation({
    toolName: 'Markdown to HTML',
    isToolUsed,
    onReset: resetAll
  });
  const html = marked.parse(md) as string;
  
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Export</title>
</head>
<body>
${html}</body>
</html>`;

  const copyHtml = () => {
    navigator.clipboard.writeText(fullHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadHtml = () => {
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'markdown-export.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#020202] text-[#E0E0E0] selection:bg-primary/30 font-mono flex flex-col">
      <SEO title="Markdown to HTML | ShaadDev Studio" description="Convert MD strings to clean HTML code instantly." url="https://shaaddev.studio/tools/markdown-to-html" keywords="markdown to html, markdown compile, clean html preview" />

      {/* Header */}
      <nav className="sticky top-0 z-50 bg-[#020202]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={handleBackClick} className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-primary transition-colors" title={isToolUsed ? "(Click to reset)" : undefined}>
            <ChevronLeft className="w-4 h-4" />
            {isToolUsed ? 'Markdown to HTML' : 'Back to Tools'}
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-primary/80 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            TRENDING TOOL
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-8 py-12 lg:py-20 w-full space-y-16">
        {/* Title Section */}
        <div className="space-y-4 max-w-3xl">
          <h1 className="font-black text-white uppercase tracking-wider relative inline-block text-4xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-wider relative inline-block">
  Markdown to HTML<div className="absolute -bottom-2 left-0 w-1/3 h-1 sm:h-2 bg-primary rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
</h1>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[600px] mb-12">
           <div className="flex-1 flex flex-col">
              <div className="bg-white/5 border border-white/10 rounded-t-2xl p-4 border-b-0 text-white/50 font-bold uppercase tracking-wider text-sm">Markdown Input</div>
              <textarea 
                value={md} 
                onChange={e=>setMd(e.target.value)} 
                className="flex-1 w-full bg-black/40 border border-white/10 rounded-b-2xl p-6 text-white/90 focus:outline-none focus:border-primary/50 resize-none font-mono text-base leading-relaxed custom-scrollbar"
                placeholder="Enter markdown..."
              />
           </div>
           
           <div className="hidden lg:flex items-center justify-center text-white/20">
              <ArrowRight size={32} />
           </div>
           
           <div className="flex-1 flex flex-col">
              <div className="bg-white/5 border border-white/10 rounded-t-2xl p-4 border-b-0 flex items-center justify-between">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setViewMode('preview')} 
                    className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors ${viewMode === 'preview' ? 'bg-primary text-black' : 'text-white/50 hover:bg-white/10'}`}
                  >
                    Preview
                  </button>
                  <button 
                    onClick={() => setViewMode('code')} 
                    className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors ${viewMode === 'code' ? 'bg-primary text-black' : 'text-white/50 hover:bg-white/10'}`}
                  >
                    HTML
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={copyHtml} className="text-white/50 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider tooltip-trigger relative" title="Copy HTML">
                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />} 
                    <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button onClick={downloadHtml} className="text-white/50 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider" title="Download HTML">
                    <Download size={16} /> 
                    <span className="hidden sm:inline">Save</span>
                  </button>
                </div>
              </div>
              
              {viewMode === 'preview' ? (
                <div 
                  className="flex-1 bg-[#ffffff] text-black border border-white/10 rounded-b-2xl p-8 overflow-auto prose prose-sm sm:prose-base max-w-none custom-scrollbar"
                  dangerouslySetInnerHTML={{__html: html}}
                />
              ) : (
                <pre className="flex-1 bg-black/40 border border-white/10 rounded-b-2xl p-6 overflow-auto custom-scrollbar text-white/90 text-sm whitespace-pre-wrap font-mono">
                  {fullHtml}
                </pre>
              )}
      </div>
      </div>
      
          <div className="max-w-4xl mx-auto mt-16 mb-8 px-4">
            <article className="glass-panel p-6 sm:p-8 rounded-2xl bg-black/30 border border-white/5 space-y-6 text-sm sm:text-base text-white/70 leading-relaxed font-sans">
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-mono">Live Markdown to HTML Parser</h2>
              <p>Markdown has fundamentally streamlined how developers structure documentation, write ReadMe files, and draft blog posts. However, converting that Markdown back into raw, semantic HTML structured for the web requires a compiler.</p>
              <p>This client-side tool acts as an instant compilation bridge. By parsing your Markdown string and rendering it through the standardized 'marked' library, it outputs both a live visual preview and the raw, un-minified HTML markup you can inject into any standard web page.</p>

              <h3 className="text-lg font-bold text-white mt-8 mb-4 font-mono">How to Use</h3>
              <ol className="list-decimal pl-5 space-y-3">
                <li><strong>Input Markdown:</strong> Paste or type your Markdown syntax (e.g., `# Heading`, `**bold**`, `- list`) into the primary text area.</li>
                <li><strong>Live Formatting:</strong> Watch the tool instantly convert your syntax into a fully rendered HTML visual preview below.</li>
                <li><strong>Extract HTML:</strong> Once satisfied, grab the raw `&lt;h1&gt;`, `&lt;strong&gt;`, and `&lt;ul&gt;` HTML nodes generated from the system to drop into your templates.</li>
              </ol>

              <h3 className="text-lg font-bold text-white mt-8 mb-4 font-mono">Frequently Asked Questions (FAQ)</h3>
              <div className="space-y-4">
                
                <div>
                  <strong className="text-white block mb-1">1. Is GitHub Flavored Markdown supported?</strong>
                  <p>Yes, standard Markdown constructs like tables, code blocks, and blockquotes are rendered faithfully conforming to basic parser rules.</p>
                </div>
                
                <div>
                  <strong className="text-white block mb-1">2. Is the HTML sanitized?</strong>
                  <p>The output provides a direct 1:1 structural translation. If integrating this HTML into a live application reacting to user input, ensure you run it through a sanitizer like DOMPurify to prevent XSS attacks.</p>
                </div>
                
                <div>
                  <strong className="text-white block mb-1">3. Does it support nested code blocks?</strong>
                  <p>Yes, triple backticks (```) are converted correctly into `&lt;pre&gt;&lt;code&gt;` structures.</p>
                </div>
              </div>
            <section className="mt-12 mb-6"><h3 className="text-2xl font-bold text-white font-mono border-b border-white/10 pb-4 mb-6">Best Practices for Usage & SEO</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-4 rounded-lg bg-black/40 p-6 border border-white/10"><h4 className="font-bold text-white mb-2">Sequential Structure</h4><p className="text-white/70">Only use one H1 per document. Output structure should flow sequentially (H1 &gt; H2 &gt; H3).</p></div><div className="space-y-4 rounded-lg bg-black/40 p-6 border border-white/10"><h4 className="font-bold text-white mb-2">Sanitize Output</h4><p className="text-white/70">Always use a sanitizer like DOMPurify if you plan on rendering the resulting HTML string directly into the DOM.</p></div></div></section></article>
                    <div className="mt-12 mb-8">
            <RelatedTools currentPath="/tools/markdown-to-html" />
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
