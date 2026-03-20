import React, { useState } from 'react';
import { Copy, Check, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import Footer from '../../components/Footer';
import RelatedTools from '../../components/RelatedTools';

export default function CSSGradient() {
  const [color1, setColor1] = useState('#8a2be2');
  const [color2, setColor2] = useState('#4a00e0');
  const [angle, setAngle] = useState(135);
  const [copied, setCopied] = useState(false);

  const gradient = `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)`;
  const cssCode = `background: ${color1};
background: ${gradient};`;

  const handleCopy = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#020202] text-[#E0E0E0] selection:bg-primary/30 font-mono flex flex-col">
      <SEO title="CSS Gradient | ShaadDev Studio" description="Visually create CSS gradients." url="https://shaaddev.studio/tools/css-gradient" keywords="css gradient, hex code linear, simple gradient export" />

      {/* Header */}
      <nav className="sticky top-0 z-50 bg-[#020202]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link 
            to="/tools" 
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Tools
          </Link>
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
  CSS Gradient Generator<div className="absolute -bottom-2 left-0 w-1/3 h-1 sm:h-2 bg-primary rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           <div className="glass-panel p-8 rounded-3xl border border-white/10 bg-black/40 space-y-8 flex flex-col justify-center">
              <div>
                 <label className="text-sm text-white/70 font-bold uppercase mb-3 block">Color 1 (Start)</label>
                 <div className="flex gap-4">
                    <input type="color" value={color1} onChange={e=>setColor1(e.target.value)} className="w-16 h-16 rounded-xl cursor-pointer bg-white/5 border border-white/10 p-1" />
                    <input type="text" value={color1.toUpperCase()} onChange={e=>setColor1(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-white text-lg focus:border-primary outline-none uppercase font-bold" />
                 </div>
              </div>
              <div>
                 <label className="text-sm text-white/70 font-bold uppercase mb-3 block">Color 2 (End)</label>
                 <div className="flex gap-4">
                    <input type="color" value={color2} onChange={e=>setColor2(e.target.value)} className="w-16 h-16 rounded-xl cursor-pointer bg-white/5 border border-white/10 p-1" />
                    <input type="text" value={color2.toUpperCase()} onChange={e=>setColor2(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-white text-lg focus:border-primary outline-none uppercase font-bold" />
                 </div>
              </div>
              <div>
                 <label className="text-sm text-white/70 font-bold uppercase flex justify-between mb-4"><span>Direction Angle</span> <span className="text-primary">{angle}°</span></label>
                 <input type="range" min="0" max="360" value={angle} onChange={e=>setAngle(Number(e.target.value))} className="w-full accent-primary bg-white/10 rounded-lg h-2" />
              </div>
           </div>
           
           
<div className="space-y-6 flex flex-col">
              <div className="w-full flex-1 min-h-[300px] rounded-3xl border border-white/10 shadow-2xl transition-all duration-300" style={{background: gradient}}></div>
              
              <div className="relative group">
                 <pre className="p-6 bg-black/60 border border-white/10 rounded-2xl text-sm md:text-base text-white/80 overflow-x-auto leading-relaxed h-[120px] flex items-center">
                    {cssCode}
                 </pre>
                 <button onClick={handleCopy} className="absolute top-1/2 -translate-y-1/2 right-4 px-4 py-3 bg-white/10 hover:bg-primary hover:text-black font-bold rounded-xl transition-all flex items-center gap-2">
                    {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? 'COPIED' : 'COPY'}
                 </button>
              </div>
           </div>
        </div>
      
        <div className="max-w-4xl mx-auto mt-16 mb-8 px-4">
            <article className="glass-panel p-6 sm:p-8 rounded-2xl bg-black/30 border border-white/5 space-y-6 text-sm sm:text-base text-white/70 leading-relaxed font-sans">
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-mono">CSS Linear Gradient Generator</h2>
              <p>Integrating beautiful, fluid gradients into modern web application backgrounds or text masks has become a staple of premium UI design. However, writing the raw CSS syntax for complex angles and color stops manually is tedious and prone to syntax errors.</p>
              <p>Our CSS Gradient Generator provides a visual sandbox where you can construct dual-toned linear transitions. It simultaneously previews the visual output and generates the exact cross-browser compatible CSS code for immediate implementation.</p>

              <h3 className="text-lg font-bold text-white mt-8 mb-4 font-mono">How to Use</h3>
              <ol className="list-decimal pl-5 space-y-3">
                <li><strong>Select Color Stops:</strong> Use the native color pickers to select 'Color 1' (the starting hue) and 'Color 2' (the ending hue).</li>
                <li><strong>Adjust the Angle:</strong> Use the angle slider to twist the gradient anywhere from 0° (bottom to top) to 360°, giving you complete directional control.</li>
                <li><strong>Preview Result:</strong> Watch the live container dynamically shift to reflect your precise color choices.</li>
                <li><strong>Export Code:</strong> Copy the generated `background</li>
              </ol>

              <h3 className="text-lg font-bold text-white mt-8 mb-4 font-mono">Frequently Asked Questions (FAQ)</h3>
              <div className="space-y-4">
                
                <div>
                  <strong className="text-white block mb-1">1. Will this CSS work in every browser?</strong>
                  <p>The standard `linear-gradient` property generated by our tool is fully supported by all modern browsers including Chrome, Safari, Firefox, and Edge.</p>
                </div>
                
                <div>
                  <strong className="text-white block mb-1">2. Can I add more than two colors?</strong>
                  <p>This foundational tool utilizes two primary color stops to guarantee clean, smooth transitions without visual muddying, which is current best practice for modern minimalism.</p>
                </div>
                
                <div>
                  <strong className="text-white block mb-1">3. Can I use this for text gradients?</strong>
                  <p>Yes! You can apply the generated background rule to text by combining it with `-webkit-background-clip: text;` and `-webkit-text-fill-color: transparent;` in your CSS.</p>
                </div>
              </div>
            <section className="mt-12 mb-6"><h3 className="text-2xl font-bold text-white font-mono border-b border-white/10 pb-4 mb-6">Best Practices for Usage & SEO</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-4 rounded-lg bg-black/40 p-6 border border-white/10"><h4 className="font-bold text-white mb-2">Subtle Transitions</h4><p className="text-white/70">Use closely related analogous colors for smooth backgrounds.</p></div><div className="space-y-4 rounded-lg bg-black/40 p-6 border border-white/10"><h4 className="font-bold text-white mb-2">Color Fallbacks</h4><p className="text-white/70">Keep solid color fallbacks in case older browsers fail to render the gradient mesh.</p></div></div></section></article>
                    <div className="mt-12 mb-8">
            <RelatedTools currentPath="/tools/css-gradient" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
