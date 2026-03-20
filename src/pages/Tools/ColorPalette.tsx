import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import Footer from '../../components/Footer';
import RelatedTools from '../../components/RelatedTools';

export default function ColorPalette() {
  const generateHex = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
  const [colors, setColors] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
     setColors(Array(5).fill(0).map(generateHex));
  }, []);

  const refresh = () => setColors(Array(5).fill(0).map(generateHex));
  
  const copy = (c, i) => {
    navigator.clipboard.writeText(c);
    setCopiedIndex(i);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="min-h-screen bg-[#020202] text-[#E0E0E0] p-5 sm:p-8 md:p-12 font-mono selection:bg-primary/30 transform-gpu">
      <SEO title="Color Palette | ShaadDev Studio" description="Beautiful color scheme generator." url="https://shaaddev.studio/tools/color-palette" keywords="color palette generator, random hex codes, ui themes" />
      
<div className="max-w-6xl mx-auto space-y-8">
        <Link to="/tools" className="mt-8 inline-flex items-center gap-2 text-sm text-white/50 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Tools
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
            <h1 className="font-black text-white uppercase tracking-wider relative inline-block text-4xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-wider relative inline-block">
  Color Palette<div className="absolute -bottom-2 left-0 w-1/3 h-1 sm:h-2 bg-primary rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
</h1>
            <button onClick={refresh} className="bg-primary text-black px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-white transition-colors">
              <RefreshCw size={18}/> Generate New
            </button>
        </div>
        
        <div className="flex flex-col md:flex-row h-[70vh] min-h-[500px] rounded-3xl overflow-hidden border border-white/10 mt-8 shadow-2xl">
           {colors.map((c, i) => (
             <div key={i} style={{backgroundColor: c}} className="flex-1 flex items-center md:items-end justify-center py-6 md:pb-12 group relative transition-all duration-500 hover:flex-[1.5] cursor-pointer" onClick={() => copy(c, i)}>
                 <button className="bg-black/40 text-white px-5 py-3 rounded-xl opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all flex items-center gap-3 backdrop-blur-md font-bold text-lg hover:scale-110">
                   {copiedIndex === i ? <Check size={18} className="text-primary"/> : <Copy size={18}/>} 
                   {copiedIndex === i ? 'COPIED!' : c.toUpperCase()}
                 </button>
             </div>
           ))}
        </div>
        <p className="text-center text-white/50 text-sm mt-6">Click on any color block to copy its HEX code instantly.</p>
      
      <div className="mt-24">

      
      
      </div>
      
          <div className="max-w-4xl mx-auto mt-16 mb-8 px-4">
            <article className="glass-panel p-6 sm:p-8 rounded-2xl bg-black/30 border border-white/5 space-y-6 text-sm sm:text-base text-white/70 leading-relaxed font-sans">
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-mono">UI/UX Color Palette Generator</h2>
              <p>Establishing a coherent color scheme is one of the most critical steps in user interface design. A well-constructed color palette dictates emotional resonance, brand identity, and visual hierarchy. Our Color Palette Generator instantly provides harmonious chromatic sets tailored for modern web design.</p>
              <p>By generating interlocking base, primary, accent, and background tones, designers and developers can immediately visualize how different hex scales synergize together without manually color-picking for hours.</p>

              <h3 className="text-lg font-bold text-white mt-8 mb-4 font-mono">How to Use</h3>
              <ol className="list-decimal pl-5 space-y-3">
                <li><strong>Generate Colors:</strong> Click the 'Generate Palette' button to create a new, mathematically harmonious color scheme.</li>
                <li><strong>Review Hues:</strong> Observe how the five selected colors relate to each other visually in the grid.</li>
                <li><strong>Copy Hex Codes:</strong> Click directly on any color's HEX code (e.g., #FF5733) to copy it to your device's clipboard.</li>
                <li><strong>Implement:</strong> Paste these hex strings directly into your CSS, Tailwind config, or Figma files.</li>
              </ol>

              <h3 className="text-lg font-bold text-white mt-8 mb-4 font-mono">Frequently Asked Questions (FAQ)</h3>
              <div className="space-y-4">
                
                <div>
                  <strong className="text-white block mb-1">1. Are the colors completely random?</strong>
                  <p>While random hex generation occurs, professional palettes usually rely on specific rules like complementary or analogous harmony to ensure they look good together.</p>
                </div>
                
                <div>
                  <strong className="text-white block mb-1">2. How can I reuse a color?</strong>
                  <p>Once you generate a palette you like, you must copy the hex codes. If you navigate away without saving them, the specific set is lost.</p>
                </div>
                
                <div>
                  <strong className="text-white block mb-1">3. Why use Hex over RGB?</strong>
                  <p>Hexadecimal (#FFFFFF) is universally understood across graphic design software, HTML, CSS, and mobile frameworks, making it the most versatile web color format.</p>
                </div>
              </div>
            <section className="mt-12 mb-6"><h3 className="text-2xl font-bold text-white font-mono border-b border-white/10 pb-4 mb-6">Best Practices for Usage & SEO</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-4 rounded-lg bg-black/40 p-6 border border-white/10"><h4 className="font-bold text-white mb-2">Check Contrast</h4><p className="text-white/70">Foreground and background colors must comply with WCAG AA accessibility standards.</p></div><div className="space-y-4 rounded-lg bg-black/40 p-6 border border-white/10"><h4 className="font-bold text-white mb-2">Rule of 60-30-10</h4><p className="text-white/70">Use 60% for your dominant color, 30% for your secondary, and 10% for the highlight accent.</p></div></div></section></article>
          <div className="mt-12 mb-8">
            <RelatedTools currentPath="/tools/color-palette" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
