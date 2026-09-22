import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Coffee, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToolNavigation } from '../../hooks/useToolNavigation';
import SEO from '../../components/SEO';
import Footer from '../../components/Footer';
import RelatedTools from '../../components/RelatedTools';

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus');

  // Smart Navigation
  const initialTime = mode === 'focus' ? 25 * 60 : 5 * 60;
  const isToolUsed = isActive || timeLeft !== initialTime;
  const resetAll = () => {
    setTimeLeft(25 * 60);
    setIsActive(false);
    setMode('focus');
  };

  const { handleBackClick } = useToolNavigation({
    toolName: 'Pomodoro Timer',
    isToolUsed,
    onReset: resetAll
  });

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      alert(mode === 'focus' ? 'Time for a break!' : 'Break over, back to work!');
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggle = () => setIsActive(!isActive);
  const setTimer = (mins, m) => { setIsActive(false); setTimeLeft(mins * 60); setMode(m); };

  const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');
  const progress = ((mode === 'focus' ? 25*60 : 5*60) - timeLeft) / (mode === 'focus' ? 25*60 : 5*60) * 100;

  return (
    <div className="min-h-screen bg-white text-ink p-5 sm:p-8 md:p-12 selection:bg-primary/20 transform-gpu">
      <SEO title="Pomodoro Timer | ShaadDev Studio" description="Sleek customizable Pomodoro timer for productivity." url="https://shaaddev.studio/tools/pomodoro-timer" keywords="pomodoro timer, 25 5 timer, productivity clock" />

<div className="max-w-4xl mx-auto space-y-8">
        <button onClick={handleBackClick} className="mt-8 inline-flex items-center gap-2 text-sm text-[#55605B] hover:text-primary transition-colors" title={isToolUsed ? "(Click to reset)" : undefined}>
          <ArrowLeft className="w-4 h-4" /> {isToolUsed ? 'Pomodoro Timer' : 'Back to Tools'}
        </button>
        <div className="text-center mt-12 mb-8">
          <div className="inline-flex bg-[#F6F8F7] border border-black/10 p-2 rounded-2xl gap-2">
            <button onClick={() => setTimer(25, 'focus')} className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${mode === 'focus' ? 'bg-primary text-white shadow-lg scale-105' : 'text-[#55605B] hover:bg-black/[0.04]'}`}>
              <Briefcase size={18}/> Focus Loop
            </button>
            <button onClick={() => setTimer(5, 'break')} className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${mode === 'break' ? 'bg-primary-light text-white shadow-lg scale-105' : 'text-[#55605B] hover:bg-black/[0.04]'}`}>
              <Coffee size={18}/> Short Break
            </button>
          </div>
        </div>

        <div className="glass-panel p-10 md:p-20 rounded-[3rem] border border-black/10 bg-white text-center relative overflow-hidden group shadow-2xl shadow-black/[0.04]">
          <div className="absolute bottom-0 left-0 h-2 bg-gradient-to-r from-primary to-primary-light transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }}></div>

          <div className="text-[140px] md:text-[220px] font-black leading-none tracking-tighter tabular-nums bg-clip-text text-transparent bg-gradient-to-b from-ink to-[#55605B] mb-12">
            {m}:{s}
          </div>

          <div className="flex justify-center gap-6">
            <button onClick={toggle} className="bg-primary text-white px-12 py-5 rounded-2xl font-black flex items-center gap-3 hover:bg-primary-dark transition-all hover:scale-105 text-2xl shadow-xl shadow-primary/20">
              {isActive ? <Pause size={28}/> : <Play size={28}/>} {isActive ? 'PAUSE' : 'START'}
            </button>
            <button onClick={() => setTimer(mode === 'focus' ? 25 : 5, mode)} className="bg-black/[0.04] border border-black/10 text-ink px-8 py-5 rounded-2xl font-bold flex items-center gap-2 hover:bg-black/[0.08] transition-all hover:scale-105 text-xl">
              <RotateCcw size={24}/>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-16 mb-8 px-4">
            <article className="glass-panel p-6 sm:p-8 rounded-2xl bg-white border border-black/10 shadow-sm shadow-black/[0.02] space-y-6 text-sm sm:text-base text-[#55605B] leading-relaxed font-sans">
              <h2 className="text-xl sm:text-2xl font-semibold text-ink">Focus-Enhancing Pomodoro Timer</h2>
              <p>The Pomodoro Technique is a scientifically proven time management method that uses a timer to break down work into intervals, traditionally 25 minutes in length, separated by short breaks. Our web-based Pomodoro Timer is an immersive, distraction-free environment to force focus and increase productivity.</p>
              <p>By tracking focused 'work' periods followed by restorative 'rests', you prevent mental burnout while maintaining peak cognitive performance during coding sessions, studying, or writing tasks.</p>

              <h3 className="text-lg font-semibold text-ink mt-8 mb-4">How to Use</h3>
              <ol className="list-decimal pl-5 space-y-3">
                <li><strong>Start the Clock:</strong> Click 'Start' to begin the primary 25-minute focus session.</li>
                <li><strong>Work Uninterrupted:</strong> Focus exclusively on your current task while the timer counts down.</li>
                <li><strong>Take a Break:</strong> When the time expires, step away from your workstation for 5 minutes.</li>
                <li><strong>Repeat the Cycle:</strong> Every four Pomodoro cycles, take a longer 15-30 minute break to reset mentally.</li>
              </ol>

              <h3 className="text-lg font-semibold text-ink mt-8 mb-4">Frequently Asked Questions (FAQ)</h3>
              <div className="space-y-4">

                <div>
                  <strong className="text-ink block mb-1">1. What if I finish a task before the timer rings?</strong>
                  <p>The method encourages you to use the remaining time to review your work, refactor code, or plan the immediate next steps. Do not stop the timer prematurely.</p>
                </div>

                <div>
                  <strong className="text-ink block mb-1">2. Will the timer run in the background?</strong>
                  <p>Modern browsers sometimes throttle background tabs to save battery. For best results, keep the timer visible on a secondary monitor, or check it periodically.</p>
                </div>

                <div>
                  <strong className="text-ink block mb-1">3. Can I pause it?</strong>
                  <p>Yes, you can pause or reset the timer at any point, although strict Pomodoro followers recommend avoiding pauses to build focus endurance.</p>
                </div>
              </div>
            <section className="mt-12 mb-6"><h3 className="text-2xl font-bold text-ink font-mono border-b border-black/10 pb-4 mb-6">Best Practices for Usage & SEO</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-4 rounded-lg bg-[#F6F8F7] p-6 border border-black/10"><h4 className="font-bold text-ink mb-2">Remove Distractions</h4><p className="text-[#55605B]">Put your phone out of reach and close non-essential tabs when the 25-minute timer begins.</p></div><div className="space-y-4 rounded-lg bg-[#F6F8F7] p-6 border border-black/10"><h4 className="font-bold text-ink mb-2">Respect the Break</h4><p className="text-[#55605B]">Physically stand up and stretch during the 5-minute cooldown break to prevent fatigue.</p></div></div></section></article>
          <div className="mt-12 mb-8">
            <RelatedTools currentPath="/tools/pomodoro-timer" />
          </div>
        </div>
      <Footer />
    </div>
  );
}
