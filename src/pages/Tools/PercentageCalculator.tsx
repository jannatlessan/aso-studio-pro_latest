import React, { useState } from 'react';
import { Percent, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToolNavigation } from '../../hooks/useToolNavigation';
import SEO from '../../components/SEO';
import Footer from '../../components/Footer';
import RelatedTools from '../../components/RelatedTools';

export default function PercentageCalculator() {
  const [valThe, setValThe] = useState('');
  const [valOf, setValOf] = useState('');

  const [part, setPart] = useState('');
  const [whole, setWhole] = useState('');

  // Smart Navigation
  const isToolUsed = valThe !== '' || valOf !== '' || part !== '' || whole !== '';
  const resetAll = () => {
    setValThe('');
    setValOf('');
    setPart('');
    setWhole('');
  };

  const { handleBackClick } = useToolNavigation({
    toolName: 'Percentage Calculator',
    isToolUsed,
    onReset: resetAll
  });

  const v1 = parseFloat(valThe);
  const v2 = parseFloat(valOf);
  const ans1 = (!isNaN(v1) && !isNaN(v2)) ? (v1 / 100) * v2 : 0;

  const p = parseFloat(part);
  const w = parseFloat(whole);
  const ans2 = (!isNaN(p) && !isNaN(w) && w !== 0) ? (p / w) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#020202] text-[#E0E0E0] selection:bg-primary/30 font-mono flex flex-col">
      <SEO title="Percentage Calculator | ShaadDev Studio" description="Instantly calculate percentages and ratios." url="https://shaaddev.studio/tools/percentage-calculator" keywords="percentage calculator, calculate margins, math tool" />

      {/* Header */}
      <nav className="sticky top-0 z-50 bg-[#020202]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={handleBackClick} className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-primary transition-colors" title={isToolUsed ? "(Click to reset)" : undefined}>
            <ChevronLeft className="w-4 h-4" />
            {isToolUsed ? 'Percentage Calculator' : 'Back to Tools'}
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
  Percentage Calc<div className="absolute -bottom-2 left-0 w-1/3 h-1 sm:h-2 bg-primary rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
</h1>
        </div>
        
        
<div className="space-y-8">
            <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 bg-black/40 flex flex-wrap items-center gap-6 text-xl md:text-2xl shadow-xl">
              <span className="font-bold text-white/50">What is</span>
              <input type="number" value={valThe} onChange={e=>setValThe(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-4 w-32 text-center text-white focus:border-primary outline-none font-black" placeholder="25" />
              <span className="font-bold text-white/50">% of</span>
              <input type="number" value={valOf} onChange={e=>setValOf(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-4 w-40 text-center text-white focus:border-primary outline-none font-black" placeholder="500" />
              <span className="font-bold text-white/50">?</span>
              <div className="ml-auto flex items-center bg-primary/20 text-primary px-8 py-4 rounded-2xl font-black border border-primary/30 min-w-[120px] justify-center">
                {ans1}
              </div>
            </div>

            <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 bg-black/40 flex flex-wrap items-center gap-6 text-xl md:text-2xl shadow-xl">
              <input type="number" value={part} onChange={e=>setPart(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-4 w-40 text-center text-white focus:border-primary outline-none font-black" placeholder="25" />
              <span className="font-bold text-white/50">is what % of</span>
              <input type="number" value={whole} onChange={e=>setWhole(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-4 w-40 text-center text-white focus:border-primary outline-none font-black" placeholder="100" />
              <span className="font-bold text-white/50">?</span>
              <div className="ml-auto flex items-center bg-[#00f0ff]/10 text-[#00f0ff] px-8 py-4 rounded-2xl font-black border border-[#00f0ff]/30 min-w-[120px] justify-center gap-2">
                {ans2.toFixed(3).replace(/.?0+$/, '')} <Percent size={20}/>
              </div>
            </div>
        </div>
      
        <div className="max-w-4xl mx-auto mt-16 mb-8 px-4">
            <article className="glass-panel p-6 sm:p-8 rounded-2xl bg-black/30 border border-white/5 space-y-6 text-sm sm:text-base text-white/70 leading-relaxed font-sans">
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-mono">Advanced Percentage Calculator</h2>
              <p>Calculating raw percentages, testing margin thresholds, or analyzing data variations commonly trips up workflows with misplaced decimal mathematics. Our Percentage Calculator abstracts these operations into a sleek, visual utility.</p>
              <p>Perfect for fast financial math, analyzing server uptime dips, calculating layout viewport rules, or simple discount configurations. The interface prevents floating-point errors and gives exact, instantaneous readouts.</p>

              <h3 className="text-lg font-bold text-white mt-8 mb-4 font-mono">How to Use</h3>
              <ol className="list-decimal pl-5 space-y-3">
                <li><strong>Calculation 1 (Value Of):</strong> Want to know what 'X% of Y' is? Enter the percentage rate and the total number to view the extracted slice.</li>
                <li><strong>Calculation 2 (Part To Whole):</strong> Want to know what percentage 'X is out of Y'? Enter your partial value and the total value to discover its exact percentage weight.</li>
                <li><strong>Real-Time Logic:</strong> The answer updates automatically as you adjust numbers. No 'calculate' buttons required.</li>
              </ol>

              <h3 className="text-lg font-bold text-white mt-8 mb-4 font-mono">Frequently Asked Questions (FAQ)</h3>
              <div className="space-y-4">
                
                <div>
                  <strong className="text-white block mb-1">1. How accurate are the decimals?</strong>
                  <p>Since JavaScript natively uses IEEE 754 floating-point architecture, we calculate the exact fractional return. For complex fractions, you'll see a multi-decimal float.</p>
                </div>
                
                <div>
                  <strong className="text-white block mb-1">2. Can I calculate percentage increase or decrease?</strong>
                  <p>A common workaround with this tool is finding the difference between your two numbers and dividing that difference by the original total using the second calculation tool.</p>
                </div>
              </div>
            <section className="mt-12 mb-6"><h3 className="text-2xl font-bold text-white font-mono border-b border-white/10 pb-4 mb-6">Best Practices for Usage & SEO</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-4 rounded-lg bg-black/40 p-6 border border-white/10"><h4 className="font-bold text-white mb-2">Verify Base Value</h4><p className="text-white/70">A common logic error is dividing by the wrong initial or final base number.</p></div><div className="space-y-4 rounded-lg bg-black/40 p-6 border border-white/10"><h4 className="font-bold text-white mb-2">Direction Matters</h4><p className="text-white/70">A 50% increase from 100 is 150. A 50% decrease from 150 back down is 75.</p></div></div></section></article>
                    <div className="mt-12 mb-8">
            <RelatedTools currentPath="/tools/percentage-calculator" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
