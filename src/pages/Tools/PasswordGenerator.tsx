import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToolNavigation } from '../../hooks/useToolNavigation';
import {
  Lock,
  Copy,
  RefreshCw,
  Check,
  ChevronLeft,
  ShieldCheck
} from 'lucide-react';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import RelatedTools from '../../components/RelatedTools';

const DEFAULT_PASSWORD = 'a$B9#kx2@m!';

export default function PasswordGenerator() {
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [copied, setCopied] = useState(false);

  // Smart Navigation
  const isToolUsed = password !== DEFAULT_PASSWORD && password !== 'Select at least one option!';
  const resetAll = () => {
    setPassword(DEFAULT_PASSWORD);
    setLength(16);
    setIncludeUppercase(true);
    setIncludeLowercase(true);
    setIncludeNumbers(true);
    setIncludeSymbols(true);
    setCopied(false);
  };

  const { handleBackClick } = useToolNavigation({
    toolName: 'Password Generator',
    isToolUsed,
    onReset: resetAll
  });

  const generatePassword = () => {
    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    if (charset === '') {
      setPassword('Select at least one option!');
      return;
    }

    let newPassword = '';
    for (let i = 0; i < length; i++) {
        newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(newPassword);
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (password === 'Select at least one option!') return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-ink selection:bg-primary/20 flex flex-col">
      <SEO
        title="Free Online Password Generator | ShaadDev Studio"
        description="Generate strong, secure, and random passwords instantly for your daily data protection needs."
        url="https://shaaddev.studio/tools/password-generator" keywords="password generator, strong safe keys, uncrackable pword" />

      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white shadow-[0_1px_0_rgba(16,19,18,0.06)] px-4 sm:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={handleBackClick} className="flex items-center gap-3 group text-[#55605B] hover:text-primary transition-colors" title={isToolUsed ? "(Click to reset)" : undefined}>
            <ChevronLeft className="w-5 h-5" />
            <span className="font-bold tracking-wider text-sm uppercase hidden sm:inline">{isToolUsed ? 'Password Generator' : 'Back to Tools'}</span>
          </button>
          <div className="flex items-center gap-2 text-primary">
            <Lock className="w-5 h-5" />
            <span className="font-black tracking-widest text-sm uppercase">Password Generator</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-8 flex items-center justify-center">
        <div className="max-w-xl w-full space-y-8">
          <div className="space-y-4 text-center">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-ink">Secure & Random</h1>
            <p className="text-[#8B958F] text-sm max-w-md mx-auto leading-relaxed">
              Generate strong passwords instantly to keep your accounts secure. All generation happens locally in your browser.
            </p>
          </div>

          <div className="glass-panel p-6 sm:p-8 space-y-8 rounded-2xl relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <ShieldCheck className="w-32 h-32" />
            </div>

            {/* Display Area */}
            <div className="relative group">
              <div className="w-full bg-[#F6F8F7] border border-black/10 rounded-xl p-4 sm:p-6 flex items-center justify-between gap-4 font-mono">
                <div className={`text-2xl sm:text-3xl font-bold tracking-wider break-all ${password === 'Select at least one option!' ? 'text-red-600 text-sm' : 'text-primary'}`}>
                  {password}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={copyToClipboard}
                    className="p-3 bg-black/[0.03] hover:bg-mint hover:text-primary border border-black/10 hover:border-primary/30 rounded-lg transition-all"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-5 h-5 text-primary" /> : <Copy className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={generatePassword}
                    className="p-3 bg-primary text-white hover:bg-primary-light rounded-lg transition-all active:scale-95"
                    title="Regenerate"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-6 relative z-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm font-bold uppercase tracking-widest text-[#55605B]">
                  <span>Password Length</span>
                  <span className="text-primary text-lg">{length}</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="64"
                  value={length}
                  onChange={(e) => {
                    setLength(parseInt(e.target.value));
                    setTimeout(generatePassword, 0); // Re-generate after state updates
                  }}
                  className="w-full accent-primary h-2 bg-black/[0.06] rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-black/10">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" checked={includeUppercase} onChange={() => setIncludeUppercase(!includeUppercase)} className="peer sr-only" />
                    <div className="w-6 h-6 border-2 border-black/20 rounded bg-white peer-checked:bg-primary peer-checked:border-primary transition-all"></div>
                    <Check className="w-4 h-4 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm font-medium text-[#55605B] group-hover:text-ink transition-colors">Uppercase (A-Z)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" checked={includeLowercase} onChange={() => setIncludeLowercase(!includeLowercase)} className="peer sr-only" />
                    <div className="w-6 h-6 border-2 border-black/20 rounded bg-white peer-checked:bg-primary peer-checked:border-primary transition-all"></div>
                    <Check className="w-4 h-4 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm font-medium text-[#55605B] group-hover:text-ink transition-colors">Lowercase (a-z)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" checked={includeNumbers} onChange={() => setIncludeNumbers(!includeNumbers)} className="peer sr-only" />
                    <div className="w-6 h-6 border-2 border-black/20 rounded bg-white peer-checked:bg-primary peer-checked:border-primary transition-all"></div>
                    <Check className="w-4 h-4 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm font-medium text-[#55605B] group-hover:text-ink transition-colors">Numbers (0-9)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" checked={includeSymbols} onChange={() => setIncludeSymbols(!includeSymbols)} className="peer sr-only" />
                    <div className="w-6 h-6 border-2 border-black/20 rounded bg-white peer-checked:bg-primary peer-checked:border-primary transition-all"></div>
                    <Check className="w-4 h-4 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm font-medium text-[#55605B] group-hover:text-ink transition-colors">Symbols (@#$%)</span>
                </label>
              </div>
            </div>

            <button
              onClick={generatePassword}
              className="w-full py-4 bg-black/[0.03] hover:bg-mint border border-black/10 hover:border-primary/50 text-ink hover:text-primary rounded-xl font-bold uppercase tracking-widest transition-all active:scale-95"
            >
              Generate New Password
            </button>


          {/* SEO Optimized Content Section */}
          <article className="glass-panel p-6 sm:p-8 rounded-2xl bg-white border border-black/10 shadow-sm shadow-black/[0.02] mt-12 space-y-6 text-sm text-[#55605B] leading-relaxed font-sans">
            <h2 className="text-xl sm:text-2xl font-semibold text-ink">Secure & Random Password Generator</h2>
            <p>
              In today's ever-evolving digital landscape, relying on weak, predictable, or recycled passwords is one of the most critical cybersecurity vulnerabilities. A robust, highly secure password is your first line of defense against malicious actors, unauthorized access, and data breaches. Our <strong>Secure Password Generator</strong> helps you instantly construct mathematically random, highly complex passwords that are practically impossible for brute-force algorithms, dictionary attacks, or automated credential stuffers to crack.
            </p>
            <p>
              Whether you are an IT professional securing a sensitive database, a developer managing environment variables, or an everyday user signing up for a new online banking service, generating cryptographically secure passwords is a non-negotiable best practice. By combining various character sets and maximizing password length, you drastically increase your password's entropy, ensuring your digital identity remains impenetrable.
            </p>

            <h3 className="text-lg font-semibold text-ink mt-8 mb-4">How to Use</h3>
            <ol className="list-decimal pl-5 space-y-3">
              <li><strong>Set the Password Length:</strong> Use the intuitive slider to select your desired character length. We heavily recommend a minimum of 16 characters for critical accounts.</li>
              <li><strong>Toggle Character Types:</strong> Check or uncheck the boxes to include uppercase letters, lowercase letters, numbers (0-9), and special symbols (@#$%). For maximum security, enable all options.</li>
              <li><strong>Generate instantly:</strong> Click the "Generate New Password" button to instantly create a new, secure string based on your specific parameters.</li>
              <li><strong>Copy and Store:</strong> Click the copy icon to copy the generated password directly to your clipboard. We strongly advise pasting it immediately into a reputable, encrypted password manager for safe keeping.</li>
            </ol>

            <h3 className="text-lg font-semibold text-ink mt-8 mb-4">Frequently Asked Questions (FAQ)</h3>
            <div className="space-y-4">
              <div>
                <strong className="text-ink block">1. Are the passwords generated on a server?</strong>
                <p>No, prioritizing your ultimate security, our Random Password Maker operates 100% locally using your device's browser capabilities. No keystrokes, settings, or generated passwords are ever transmitted over the network or stored in any database.</p>
              </div>
              <div>
                <strong className="text-ink block">2. Why should I use a password builder instead of creating my own?</strong>
                <p>Humans are inherently predictable and tend to use recognizable patterns, dictionary words, or personal information (like birthdays), which makes manual passwords vulnerable to social engineering. An algorithmic generator bypasses human bias to create true, unguessable randomness.</p>
              </div>
              <div>
                <strong className="text-ink block">3. How often should I change my passwords?</strong>
                <p>While the traditional advice was to rotate passwords frequently, modern guidance suggests that if your password is very strong, unique to that specific service, and hasn't been part of a known data breach, you do not need to change it regularly—just ensure you never reuse it anywhere else.</p>
              </div>
            </div>
          <section className="mt-12 mb-6"><h3 className="text-2xl font-bold text-ink font-mono border-b border-black/10 pb-4 mb-6">Best Practices for Usage & SEO</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-4 rounded-lg bg-[#F6F8F7] p-6 border border-black/10"><h4 className="font-bold text-ink mb-2">Length Over Complexity</h4><p className="text-[#55605B]">A standard 16+ character password is mathematically harder to break than a short one with excessive symbols.</p></div><div className="space-y-4 rounded-lg bg-[#F6F8F7] p-6 border border-black/10"><h4 className="font-bold text-ink mb-2">Never Reuse</h4><p className="text-[#55605B]">Generate entirely unique passwords for every active service and store them in a secure password manager.</p></div></div></section></article>

          <RelatedTools currentPath="/tools/password-generator" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
