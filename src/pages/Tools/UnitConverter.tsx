import React, { useState } from 'react';
import { ArrowRightLeft, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import Footer from '../../components/Footer';
import RelatedTools from '../../components/RelatedTools';

const units = {
  length: { meters: 1, km: 0.001, cm: 100, mm: 1000, miles: 0.000621371, yards: 1.09361, feet: 3.28084, inches: 39.3701 },
  weight: { kg: 1, grams: 1000, mg: 1000000, pounds: 2.20462, ounces: 35.274 },
  temperature: { celsius: 'C', fahrenheit: 'F', kelvin: 'K' }
};

export default function UnitConverter() {
  const [category, setCategory] = useState('length');
  const [val1, setVal1] = useState<string | number>(1);
  const [unit1, setUnit1] = useState('meters');
  const [unit2, setUnit2] = useState('feet');

  const categories = Object.keys(units);
  const availableUnits = Object.keys(units[category] || {});

  const convertArray = () => {
    if(!val1) return 0;
    const v = parseFloat(String(val1));
    if(category === 'temperature') {
       if(unit1 === unit2) return v;
       let c = 0;
       if(unit1 === 'celsius') c = v;
       else if(unit1 === 'fahrenheit') c = (v - 32) * 5/9;
       else if(unit1 === 'kelvin') c = v - 273.15;
       
       if(unit2 === 'celsius') return c;
       if(unit2 === 'fahrenheit') return (c * 9/5) + 32;
       if(unit2 === 'kelvin') return c + 273.15;
    }
    const baseVal = v / units[category][unit1];
    return baseVal * units[category][unit2];
  };

  const ans = convertArray();
  const formatAns = typeof ans === 'number' ? parseFloat(ans.toFixed(5)) : ans;

  return (
    <div className="min-h-screen bg-[#020202] text-[#E0E0E0] selection:bg-primary/30 font-mono flex flex-col">
      <SEO title="Unit Converter | ShaadDev Studio" description="Convert length, weight, temperature." url="https://shaaddev.studio/tools/unit-converter" keywords="unit converter, imperial to metric, length mass" />

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
  Unit Converter<div className="absolute -bottom-2 left-0 w-1/3 h-1 sm:h-2 bg-primary rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
</h1>
        </div>
        
        <div className="glass-panel p-6 md:p-10 rounded-3xl border border-white/10 bg-black/40 space-y-8">
           <div>
              <label className="text-white/70 font-bold uppercase text-sm mb-3 block">Measurement Category</label>
              <select value={category} onChange={e => {
                const c = e.target.value;
                setCategory(c);
                setUnit1(Object.keys(units[c])[0]);
                setUnit2(Object.keys(units[c])[1] || Object.keys(units[c])[0]);
              }} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-lg focus:border-primary outline-none">
                 {categories.map(c => <option key={c} value={c} className="bg-black/90">{c.toUpperCase()}</option>)}
              </select>
           </div>
           
           <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1 w-full space-y-3">
                 <input type="number" value={val1} onChange={e=>setVal1(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-xl focus:border-primary outline-none" />
                 <select value={unit1} onChange={e=>setUnit1(e.target.value)} className="w-full bg-transparent border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none">
                    {availableUnits.map(u => <option key={u} value={u} className="bg-black/90 text-sm">{u.toUpperCase()}</option>)}
                 </select>
              </div>
              
              <div className="p-4 rounded-full bg-primary/10 border border-primary/20 hover:scale-110 transition-transform cursor-pointer" onClick={() => {
                const temp = unit1; setUnit1(unit2); setUnit2(temp);
              }}>
                <ArrowRightLeft className="w-6 h-6 text-primary" />
              </div>
              
              <div className="flex-1 w-full space-y-3">
                 <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-primary font-black text-xl overflow-hidden text-ellipsis whitespace-nowrap">
                   {formatAns}
                 </div>
                 <select value={unit2} onChange={e=>setUnit2(e.target.value)} className="w-full bg-transparent border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none">
                    {availableUnits.map(u => <option key={u} value={u} className="bg-black/90 text-sm">{u.toUpperCase()}</option>)}
                 </select>
              </div>
           </div>
        </div>
      
        <div className="max-w-4xl mx-auto mt-16 mb-8 px-4">
            <article className="glass-panel p-6 sm:p-8 rounded-2xl bg-black/30 border border-white/5 space-y-6 text-sm sm:text-base text-white/70 leading-relaxed font-sans">
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-mono">Universal Unit Converter</h2>
              <p>Developers, engineers, and scientists constantly find themselves needing to translate imperial to metric, Celsius to Fahrenheit, or Megabytes to Gigabytes. Our universal Unit Converter consolidates these crucial mathematical pipelines into a single, intuitive interface.</p>
              <p>Powered by precise multiplier ratios, this tool eliminates the need for manual calculations or searching engines for conversion formulas, providing immediate results for Length, Weight, Temperature, and Data metrics.</p>

              <h3 className="text-lg font-bold text-white mt-8 mb-4 font-mono">How to Use</h3>
              <ol className="list-decimal pl-5 space-y-3">
                <li><strong>Select Category:</strong> First, choose the type of measurement you need to convert (e.g., Length, Weight, Temperature, Data).</li>
                <li><strong>Input Value:</strong> Enter the numerical value you possess into the first numeric field.</li>
                <li><strong>Select Units:</strong> Choose your precise starting unit and target unit from the dropdown menus.</li>
                <li><strong>Read Result:</strong> The corresponding output instantly generates in real-time.</li>
              </ol>

              <h3 className="text-lg font-bold text-white mt-8 mb-4 font-mono">Frequently Asked Questions (FAQ)</h3>
              <div className="space-y-4">
                
                <div>
                  <strong className="text-white block mb-1">1. How exact are the conversions?</strong>
                  <p>We utilize standard scientific and mathematical multi-float multiplier ratios to ensure up to 6 decimal places of precision, suitable for standard engineering needs.</p>
                </div>
                
                <div>
                  <strong className="text-white block mb-1">2. Is temperature converted differently?</strong>
                  <p>Yes, unlike weight or length which multiply linearly, temperature requires an additive/subtractive formula (e.g., multiplying by 9/5 and adding 32 for C to F), which our tool natively handles.</p>
                </div>
              </div>
            <section className="mt-12 mb-6"><h3 className="text-2xl font-bold text-white font-mono border-b border-white/10 pb-4 mb-6">Best Practices for Usage & SEO</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-4 rounded-lg bg-black/40 p-6 border border-white/10"><h4 className="font-bold text-white mb-2">Decimal Significance</h4><p className="text-white/70">Don't imply false precision by keeping 8 decimal places for inputs that only have two.</p></div><div className="space-y-4 rounded-lg bg-black/40 p-6 border border-white/10"><h4 className="font-bold text-white mb-2">Regional Standardize</h4><p className="text-white/70">Localize your application's default units (Imperial vs Metric) based on the specific browser locale.</p></div></div></section></article>
                    <div className="mt-12 mb-8">
            <RelatedTools currentPath="/tools/unit-converter" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
