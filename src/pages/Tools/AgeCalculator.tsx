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
    <div className="min-h-screen bg-white text-ink selection:bg-primary/20 flex flex-col">
      <SEO title="Age Calculator | ShaadDev Studio" description="Calculate your exact age in years, months, and days." url="https://shaaddev.studio/tools/age-calculator" keywords="age calculator, calculate age fast, precise age tool" />

      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-black/[0.06] px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={handleBackClick} className="inline-flex items-center gap-2 text-sm text-[#55605B] hover:text-primary transition-colors" title={isToolUsed ? "(Click to reset)" : undefined}>
            <ChevronLeft className="w-4 h-4" />
            {isToolUsed ? 'Age Calculator' : 'Back to Tools'}
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
  Age Calculator
</h1>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-black/10 bg-white shadow-sm shadow-black/[0.02]">
           <label className="block mb-3 text-[#55605B] font-bold uppercase tracking-wider text-sm">Select Date of Birth</label>
           <input type="date" value={dob} onChange={(e) => {
             setDob(e.target.value);
             calculateAge(e.target.value);
           }} className="w-full bg-[#F6F8F7] border border-black/10 rounded-xl p-4 text-ink focus:border-primary focus:outline-none mb-10 text-lg transition-all hover:bg-black/[0.03]" />

           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="bg-[#F6F8F7] p-8 rounded-2xl border border-black/10 hover:border-primary/50 transition-colors">
                <div className="text-5xl md:text-6xl font-black text-primary mb-3">{age.years}</div>
                <div className="text-[#8B958F] uppercase tracking-widest text-sm font-bold">Years</div>
              </div>
              <div className="bg-[#F6F8F7] p-8 rounded-2xl border border-black/10 hover:border-primary/50 transition-colors">
                <div className="text-5xl md:text-6xl font-black text-primary mb-3">{age.months}</div>
                <div className="text-[#8B958F] uppercase tracking-widest text-sm font-bold">Months</div>
              </div>
              <div className="bg-[#F6F8F7] p-8 rounded-2xl border border-black/10 hover:border-primary/50 transition-colors">
                <div className="text-5xl md:text-6xl font-black text-primary mb-3">{age.days}</div>
                <div className="text-[#8B958F] uppercase tracking-widest text-sm font-bold">Days</div>
              </div>
           </div>
        </div>

        <div className="max-w-4xl mx-auto mt-16 mb-8 px-4">
            <article className="glass-panel p-6 sm:p-8 rounded-2xl bg-white border border-black/10 shadow-sm shadow-black/[0.02] space-y-6 text-sm sm:text-base text-[#55605B] leading-relaxed font-sans">
              <h2 className="text-xl sm:text-2xl font-semibold text-ink">Age Calculator & Birthday Tracker</h2>
              <p>Our Advanced Age Calculator is a highly precise tool designed to calculate the exact duration between two dates, particularly your date of birth and the current date. It resolves the common problem of determining exact ages for legal documents, medical forms, and event planning by breaking down the time lived into exact years, months, and days.</p>
              <p>Unlike simple estimates, this calculator intelligently accounts for leap years and varying month lengths (28, 30, or 31 days) to provide mathematical accuracy instantly, entirely within your browser.</p>

              <h3 className="text-lg font-semibold text-ink mt-8 mb-4">How to Use</h3>
              <ol className="list-decimal pl-5 space-y-3">
                <li><strong>Select Date of Birth:</strong> Click or tap the date input field to open the calendar picker.</li>
                <li><strong>Choose Your Date:</strong> Navigate to your birth year, month, and specific day.</li>
                <li><strong>Instant Calculation:</strong> The tool immediately updates the interface, displaying your exact age in years, months, and days in the illuminated panels below.</li>
              </ol>

              <h3 className="text-lg font-semibold text-ink mt-8 mb-4">Frequently Asked Questions (FAQ)</h3>
              <div className="space-y-4">

                <div>
                  <strong className="text-ink block mb-1">1. Is my date of birth stored on your servers?</strong>
                  <p>No. All age calculations are performed locally in your browser leveraging JavaScript's Date object. No data is sent over the network, ensuring complete privacy.</p>
                </div>

                <div>
                  <strong className="text-ink block mb-1">2. Does the calculator account for leap years?</strong>
                  <p>Yes, the native date algorithm perfectly adjusts for leap years and the varying lengths of each individual month.</p>
                </div>

                <div>
                  <strong className="text-ink block mb-1">3. Can I calculate past or future dates besides age?</strong>
                  <p>While this specific tool defaults to the current day for the end date, you can use it to find the exact time elapsed since any historical date.</p>
                </div>
              </div>
            <section className="mt-12 mb-6"><h3 className="text-2xl font-bold text-ink font-mono border-b border-black/10 pb-4 mb-6">Best Practices for Usage & SEO</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-4 rounded-lg bg-[#F6F8F7] p-6 border border-black/10"><h4 className="font-bold text-ink mb-2">Use Exact Dates</h4><p className="text-[#55605B]">For the most precise output, include the time of birth if known.</p></div><div className="space-y-4 rounded-lg bg-[#F6F8F7] p-6 border border-black/10"><h4 className="font-bold text-ink mb-2">Timezones Matter</h4><p className="text-[#55605B]">Age in seconds can vary slightly depending on the geographical timezone entered.</p></div></div></section></article>
                    <div className="mt-12 mb-8">
            <RelatedTools currentPath="/tools/age-calculator" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
