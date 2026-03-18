import { useState } from 'react';
import { Link } from 'react-router-dom';
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

export default function PasswordGenerator() {
  const [password, setPassword] = useState('a$B9#kx2@m!');
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [copied, setCopied] = useState(false);

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
    <div className="min-h-screen bg-[#020202] text-[#E0E0E0] selection:bg-primary/30 font-mono flex flex-col">
      <SEO 
        title="Free Online Password Generator | ShaadDev Studio" 
        description="Generate strong, secure, and random passwords instantly for your daily data protection needs." 
        url="https://shaaddev.studio/tools/password-generator" 
      />
      
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-[#020202]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/tools" className="flex items-center gap-3 group text-white/70 hover:text-primary transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="font-bold tracking-wider text-sm uppercase hidden sm:inline">Back to Tools</span>
          </Link>
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
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Secure & Random</h1>
            <p className="text-white/60 text-sm max-w-md mx-auto leading-relaxed">
              Generate strong passwords instantly to keep your accounts secure. All generation happens locally in your browser.
            </p>
          </div>

          <div className="glass-panel p-6 sm:p-8 space-y-8 rounded-2xl relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <ShieldCheck className="w-32 h-32" />
            </div>

            {/* Display Area */}
            <div className="relative group">
              <div className="w-full bg-black/40 border border-white/10 rounded-xl p-4 sm:p-6 flex items-center justify-between gap-4 font-mono">
                <div className={`text-2xl sm:text-3xl font-bold tracking-wider break-all ${password === 'Select at least one option!' ? 'text-red-400 text-sm' : 'text-primary'}`}>
                  {password}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={copyToClipboard}
                    className="p-3 bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/10 hover:border-primary/30 rounded-lg transition-all"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={generatePassword}
                    className="p-3 bg-primary text-black hover:bg-primary-light rounded-lg transition-all active:scale-95"
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
                <div className="flex items-center justify-between text-sm font-bold uppercase tracking-widest text-white/80">
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
                  className="w-full accent-primary h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" checked={includeUppercase} onChange={() => setIncludeUppercase(!includeUppercase)} className="peer sr-only" />
                    <div className="w-6 h-6 border-2 border-white/20 rounded bg-black/30 peer-checked:bg-primary peer-checked:border-primary transition-all"></div>
                    <Check className="w-4 h-4 text-black absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">Uppercase (A-Z)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" checked={includeLowercase} onChange={() => setIncludeLowercase(!includeLowercase)} className="peer sr-only" />
                    <div className="w-6 h-6 border-2 border-white/20 rounded bg-black/30 peer-checked:bg-primary peer-checked:border-primary transition-all"></div>
                    <Check className="w-4 h-4 text-black absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">Lowercase (a-z)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" checked={includeNumbers} onChange={() => setIncludeNumbers(!includeNumbers)} className="peer sr-only" />
                    <div className="w-6 h-6 border-2 border-white/20 rounded bg-black/30 peer-checked:bg-primary peer-checked:border-primary transition-all"></div>
                    <Check className="w-4 h-4 text-black absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">Numbers (0-9)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" checked={includeSymbols} onChange={() => setIncludeSymbols(!includeSymbols)} className="peer sr-only" />
                    <div className="w-6 h-6 border-2 border-white/20 rounded bg-black/30 peer-checked:bg-primary peer-checked:border-primary transition-all"></div>
                    <Check className="w-4 h-4 text-black absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">Symbols (@#$%)</span>
                </label>
              </div>
            </div>
            
            <button 
              onClick={generatePassword}
              className="w-full py-4 bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/50 text-white hover:text-primary rounded-xl font-bold uppercase tracking-widest transition-all active:scale-95"
            >
              Generate New Password
            </button>


          {/* SEO Optimized Content Section */}
          <article className="glass-panel p-6 sm:p-8 rounded-2xl bg-black/30 border border-white/5 mt-12 space-y-6 text-sm text-white/70 leading-relaxed">
            <h2 className="text-xl font-black text-white uppercase tracking-wider">Why Use a Secure Password Generator?</h2>
            
            <p>
              In today's digital landscape, using weak or recycled passwords is one of the biggest cybersecurity risks. A <strong>Secure Password Generator</strong> helps you automatically construct highly randomized, complex passwords that are extremely difficult for brute-force attacks or automated credential stuffers to crack.
            </p>
            
            <h3 className="text-lg font-bold text-white mt-8 mb-4">Best Practices for Password Security</h3>
            <ul className="list-disc pl-5 space-y-3">
              <li><strong>Length is key:</strong> Aim for at least 16 characters. A longer password takes exponentially more computing power to crack.</li>
              <li><strong>Enable all character types:</strong> Combining uppercase letters, lowercase letters, numbers, and symbols maximizes your password entropy.</li>
              <li><strong>Never reuse passwords:</strong> Use a completely unique generated password for every single service or account you own.</li>
              <li><strong>Use a password manager:</strong> Since secure passwords are too complex to memorize, rely on reputable password managers (like 1Password, Bitwarden, or your browser's built-in vaults) to store the output of this generator safely.</li>
            </ul>

            <h3 className="text-lg font-bold text-white mt-8 mb-4">Are these generated passwords saved?</h3>
            <p>
              No. Our <strong>Random Password Maker</strong> operates 100% locally in your web browser. No data, keystrokes, or generated passwords are ever transmitted to a server, logged, or saved in any database guaranteeing absolute privacy.
            </p>
          </article>
          
          <RelatedTools currentPath="/tools/password-generator" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}