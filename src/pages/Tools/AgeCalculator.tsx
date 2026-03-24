import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToolNavigation } from '../../hooks/useToolNavigation';
import SEO from '../../components/SEO';
import Footer from '../../components/Footer';
import RelatedTools from '../../components/RelatedTools';

export default function AgeCalculator() {
  const [dob, setDob] = useState(() => localStorage.getItem('age-calculator-dob') || '');
  const [age, setAge] = useState({ years: 0, months: 0, days: 0 });

  // Smart Navigation
  const isToolUsed = dob !== '';
  const resetAll = () => {
    setDob('');
    localStorage.removeItem('age-calculator-dob');
    setAge({ years: 0, months: 0, days: 0 });
  };

  const { handleBackClick } = useToolNavigation({
    toolName: 'Age Calculator',
    isToolUsed,
    onReset: resetAll
  });

  useEffect(() => {
    if (dob) {
      calculateAge(dob);
    }
  }, []);

  const calculateAge = (dateStr) => {
    if (!dateStr) return;
    localStorage.setItem('age-calculator-dob', dateStr);
    const today = new Date();
    const birthDate = new Date(dateStr);
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    setAge({ years, months, days });
  };

  return (
    <div className="min-h-screen bg-[#020202] text-[#E0E0E0] selection:bg-primary/30 font-mono flex flex-col">
      <SEO title="Age Calculator | ShaadDev Studio" description="Calculate your exact age in years, months, and days." url="https://shaaddev.studio/tools/age-calculator" keywords="age calculator, calculate age fast, precise age tool" />

      {/* Header */}
      <nav className="sticky top-0 z-50 bg-[#020202]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={handleBackClick} className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-primary transition-colors" title={isToolUsed ? "(Click to reset)" : undefined}>
            <ChevronLeft className="w-4 h-4" />
            {isToolUsed ? 'Age Calculator' : 'Back to Tools'}
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
  Age Calculator<div className="absolute -bottom-2 left-0 w-1/3 h-1 sm:h-2 bg-primary rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
</h1>
        </div>
        
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 bg-black/40">
           <label className="block mb-3 text-white/70 font-bold uppercase tracking-wider text-sm">Select Date of Birth</label>
           <input type="date" value={dob} onChange={(e) => {
             setDob(e.target.value);
             calculateAge(e.target.value);
           }} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-primary focus:outline-none mb-10 text-lg transition-all hover:bg-white/10" />
           
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-primary/50 transition-colors">
                <div className="text-5xl md:text-6xl font-black text-primary mb-3 drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">{age.years}</div>
                <div className="text-white/50 uppercase tracking-widest text-sm font-bold">Years</div>
              </div>
              <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-primary/50 transition-colors">
                <div className="text-5xl md:text-6xl font-black text-primary mb-3 drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">{age.months}</div>
                <div className="text-white/50 uppercase tracking-widest text-sm font-bold">Months</div>
              </div>
              <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-primary/50 transition-colors">
                <div className="text-5xl md:text-6xl font-black text-primary mb-3 drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">{age.days}</div>
                <div className="text-white/50 uppercase tracking-widest text-sm font-bold">Days</div>
              </div>
           </div>
        </div>
      
        <div className="max-w-4xl mx-auto mt-16 mb-8 px-4">
            <article className="glass-panel p-6 sm:p-8 rounded-2xl bg-black/30 border border-white/5 space-y-6 text-sm sm:text-base text-white/70 leading-relaxed font-sans">
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-mono">Age Calculator & Birthday Tracker</h2>
              <p>Our Advanced Age Calculator is a highly precise tool designed to calculate the exact duration between two dates, particularly your date of birth and the current date. It resolves the common problem of determining exact ages for legal documents, medical forms, and event planning by breaking down the time lived into exact years, months, and days.</p>
              <p>Unlike simple estimates, this calculator intelligently accounts for leap years and varying month lengths (28, 30, or 31 days) to provide mathematical accuracy instantly, entirely within your browser.</p>

              <h3 className="text-lg font-bold text-white mt-8 mb-4 font-mono">How to Use</h3>
              <ol className="list-decimal pl-5 space-y-3">
                <li><strong>Select Date of Birth:</strong> Click or tap the date input field to open the calendar picker.</li>
                <li><strong>Choose Your Date:</strong> Navigate to your birth year, month, and specific day.</li>
                <li><strong>Instant Calculation:</strong> The tool immediately updates the interface, displaying your exact age in years, months, and days in the illuminated panels below.</li>
              </ol>

              <h3 className="text-lg font-bold text-white mt-8 mb-4 font-mono">Frequently Asked Questions (FAQ)</h3>
              <div className="space-y-4">
                
                <div>
                  <strong className="text-white block mb-1">1. Is my date of birth stored on your servers?</strong>
                  <p>No. All age calculations are performed locally in your browser leveraging JavaScript's Date object. No data is sent over the network, ensuring complete privacy.</p>
                </div>
                
                <div>
                  <strong className="text-white block mb-1">2. Does the calculator account for leap years?</strong>
                  <p>Yes, the native date algorithm perfectly adjusts for leap years and the varying lengths of each individual month.</p>
                </div>
                
                <div>
                  <strong className="text-white block mb-1">3. Can I calculate past or future dates besides age?</strong>
                  <p>While this specific tool defaults to the current day for the end date, you can use it to find the exact time elapsed since any historical date.</p>
                </div>
              </div>
            <section className="mt-12 mb-6"><h3 className="text-2xl font-bold text-white font-mono border-b border-white/10 pb-4 mb-6">Best Practices for Usage & SEO</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-4 rounded-lg bg-black/40 p-6 border border-white/10"><h4 className="font-bold text-white mb-2">Use Exact Dates</h4><p className="text-white/70">For the most precise output, include the time of birth if known.</p></div><div className="space-y-4 rounded-lg bg-black/40 p-6 border border-white/10"><h4 className="font-bold text-white mb-2">Timezones Matter</h4><p className="text-white/70">Age in seconds can vary slightly depending on the geographical timezone entered.</p></div></div></section></article>
                    <div className="mt-12 mb-8">
            <RelatedTools currentPath="/tools/age-calculator" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
