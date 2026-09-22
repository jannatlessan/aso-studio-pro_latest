import React, { useState } from 'react';
import { Copy, Check, RefreshCw, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToolNavigation } from '../../hooks/useToolNavigation';
import SEO from '../../components/SEO';
import Footer from '../../components/Footer';
import RelatedTools from '../../components/RelatedTools';

export default function LoremIpsum() {
  const [paras, setParas] = useState(3);
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const [hasModified, setHasModified] = useState(false);

  // Smart Navigation
  const isToolUsed = paras !== 3 || hasModified;
  const resetAll = () => {
    setParas(3);
    setText('');
    setCopied(false);
    setHasModified(false);
    generate();
  };

  const { handleBackClick } = useToolNavigation({
    toolName: 'Lorem Ipsum',
    isToolUsed,
    onReset: resetAll
  });

  const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat'];

  const generate = () => {
    let result = '';
    for(let i=0; i<paras; i++) {
        let p = [];
        for(let j=0; j<35; j++) p.push(words[Math.floor(Math.random()*words.length)]);
        result += p.join(' ') + '.\n\n';
    }
    setText(result.trim());
    setHasModified(true);
  };

  React.useEffect(() => { generate(); }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-ink selection:bg-primary/20 flex flex-col">
      <SEO title="Lorem Ipsum | ShaadDev Studio" description="Instantly generate placeholder text for your mockups." url="https://shaaddev.studio/tools/lorem-ipsum" keywords="lorem ipsum, placeholder text, auto generate copy" />

      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white shadow-[0_1px_0_rgba(16,19,18,0.06)] px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={handleBackClick} className="inline-flex items-center gap-2 text-sm text-[#55605B] hover:text-primary transition-colors" title={isToolUsed ? "(Click to reset)" : undefined}>
            <ChevronLeft className="w-4 h-4" />
            {isToolUsed ? 'Lorem Ipsum' : 'Back to Tools'}
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-primary bg-mint px-3 py-1.5 rounded-full border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            TRENDING TOOL
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-8 py-12 lg:py-20 w-full space-y-16">
        {/* Title Section */}
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink">
  Lorem Generator
</h1>
        </div>

        <div className="glass-panel p-8 sm:p-12 rounded-[2rem] border border-black/10 bg-white shadow-lg shadow-black/[0.03] space-y-8">
            <div className="flex flex-col sm:flex-row gap-6 items-center bg-[#F6F8F7] p-4 rounded-3xl border border-black/10">
                <div className="flex-1 flex gap-4 items-center pl-4">
                    <span className="font-bold text-[#8B958F] whitespace-nowrap">Paragraphs:</span>
                    <input type="number" min="1" max="50" value={paras} onChange={(e) => {setParas(Number(e.target.value)); generate()}} className="bg-transparent border-b border-black/20 text-ink w-20 text-center text-xl font-bold py-1 focus:border-primary outline-none" />
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                    <button onClick={generate} className="flex-1 sm:flex-none border border-black/10 text-ink hover:bg-black/[0.04] px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"><RefreshCw size={20}/> Regen</button>
                    <button onClick={handleCopy} className="flex-1 sm:flex-none bg-primary text-white px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all hover:bg-primary-dark active:scale-95 shadow-lg shadow-primary/20">
                        {copied ? <Check size={20}/> : <Copy size={20}/>} {copied ? 'Copied' : 'Copy Text'}
                    </button>
                </div>
            </div>

            <div className="bg-[#F6F8F7] border border-black/10 rounded-3xl p-8 max-h-[50vh] overflow-y-auto custom-scrollbar relative group">
                {text.split('\n\n').map((p, i) => (
                    <p key={i} className="mb-6 last:mb-0 text-[#55605B] leading-relaxed text-lg tracking-wide first-letter:text-4xl first-letter:font-black first-letter:text-ink first-line:uppercase first-line:tracking-widest">{p}</p>
                ))}
            </div>
        </div>

        <div className="max-w-4xl mx-auto mt-24 mb-8 px-4">
            <article className="glass-panel p-6 sm:p-8 rounded-2xl bg-white border border-black/10 shadow-sm shadow-black/[0.02] space-y-6 text-sm sm:text-base text-[#55605B] leading-relaxed font-sans">
              <h2 className="text-xl sm:text-2xl font-semibold text-ink">Dynamic Lorem Ipsum Generator</h2>
              <p>When scaffolding prototypes, developing layouts, or designing typography hierarchies, standardizing dummy text helps teams focus on structure rather than raw content. Lorem Ipsum has been the industry standard placeholder text since the 1500s.</p>
              <p>Our generator removes the need to copy-paste clunky text blocks from search engines. You can instantly generate precise volumes of Latin filler text based on your immediate UI constraints, keeping your wireframing momentum unbroken.</p>

              <h3 className="text-lg font-semibold text-ink mt-8 mb-4">How to Use</h3>
              <ol className="list-decimal pl-5 space-y-3">
                <li><strong>Define Paragraph Count:</strong> Enter the exact number of paragraphs you need for your container in the numerical input.</li>
                <li><strong>Generate Content:</strong> The text block instantly populates with standard, pseudo-Latin sentences formatting into natural paragraph lengths.</li>
                <li><strong>Copy Output:</strong> Click the 'Copy to Clipboard' button to transfer the entire block to your mockup or code editor safely.</li>
              </ol>

              <h3 className="text-lg font-semibold text-ink mt-8 mb-4">Frequently Asked Questions (FAQ)</h3>
              <div className="space-y-4">

                <div>
                  <strong className="text-ink block mb-1">1. Does the generator create true random text?</strong>
                  <p>It utilizes a fixed dictionary of classical Latin vocabulary combined with sentence structure algorithms to create text that visually emulates English character distribution perfectly.</p>
                </div>

                <div>
                  <strong className="text-ink block mb-1">2. Why not just use real English?</strong>
                  <p>Real text distracts stakeholders who might start reading and critiquing the placeholder copy rather than reviewing the overarching design layout and typography styles.</p>
                </div>
              </div>
            <section className="mt-12 mb-6"><h3 className="text-2xl font-bold text-ink font-mono border-b border-black/10 pb-4 mb-6">Best Practices for Usage & SEO</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-4 rounded-lg bg-[#F6F8F7] p-6 border border-black/10"><h4 className="font-bold text-ink mb-2">Match Final Bounds</h4><p className="text-[#55605B]">Generate paragraph word counts that realistically match your final copy limits.</p></div><div className="space-y-4 rounded-lg bg-[#F6F8F7] p-6 border border-black/10"><h4 className="font-bold text-ink mb-2">Organic Text Wrap</h4><p className="text-[#55605B]">Avoid pasting the exact same block repeatedly to maintain a realistic and organic text wrap look.</p></div></div></section></article>
                    <div className="mt-12 mb-8">
            <RelatedTools currentPath="/tools/lorem-ipsum" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
