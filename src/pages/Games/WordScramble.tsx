import { useCallback, useEffect, useRef, useState } from 'react';
import { Delete, Lightbulb, SkipForward } from 'lucide-react';
import GameShell, { GameOverlay } from '../../components/GameShell';
import { useBestScore } from '../../hooks/useBestScore';

const SLUG = 'word-scramble';
const ROUND_SECONDS = 90;

interface Entry {
  word: string;
  hint: string;
}

const WORDS: Entry[] = [
  { word: 'BROWSER', hint: 'You are using one right now' },
  { word: 'PIXEL', hint: 'Smallest piece of a screen' },
  { word: 'KEYBOARD', hint: 'Keys under your fingers' },
  { word: 'CANVAS', hint: 'Where these games are drawn' },
  { word: 'ROCKET', hint: 'It goes up, fast' },
  { word: 'GUITAR', hint: 'Six strings' },
  { word: 'ISLAND', hint: 'Land ringed by water' },
  { word: 'MONSOON', hint: 'A season of heavy rain' },
  { word: 'GRAVITY', hint: 'What pulls the apple down' },
  { word: 'DIAMOND', hint: 'Hardest natural gem' },
  { word: 'JUNGLE', hint: 'Dense tropical forest' },
  { word: 'PUZZLE', hint: 'A problem made for fun' },
  { word: 'MAGNET', hint: 'It attracts iron' },
  { word: 'VOLCANO', hint: 'Mountain that erupts' },
  { word: 'HARBOUR', hint: 'Where ships shelter' },
  { word: 'LANTERN', hint: 'A portable light' },
  { word: 'ORBIT', hint: 'A path around a planet' },
  { word: 'CIRCUIT', hint: 'Electricity runs a loop' },
  { word: 'MARBLE', hint: 'Stone, or a small glass ball' },
  { word: 'FURNACE', hint: 'It makes serious heat' },
  { word: 'GALAXY', hint: 'Billions of stars together' },
  { word: 'WHISPER', hint: 'Speak very quietly' },
  { word: 'CARAVAN', hint: 'A travelling group' },
  { word: 'TRIDENT', hint: 'A three-pronged spear' },
  { word: 'ECLIPSE', hint: 'One body hides another' },
  { word: 'MOSAIC', hint: 'Picture made of tiles' },
  { word: 'NOMAD', hint: 'Someone with no fixed home' },
  { word: 'PYRAMID', hint: 'Four triangular faces' },
  { word: 'QUARTZ', hint: 'A very common mineral' },
  { word: 'SAFFRON', hint: 'The priciest spice' },
  { word: 'TEMPEST', hint: 'A violent storm' },
  { word: 'VELVET', hint: 'Soft, dense fabric' },
  { word: 'WALNUT', hint: 'A nut, and a wood' },
  { word: 'ZENITH', hint: 'The highest point' },
  { word: 'ANCHOR', hint: 'It holds a boat still' },
  { word: 'BAMBOO', hint: 'Fast-growing giant grass' },
  { word: 'COMPASS', hint: 'It always finds north' },
  { word: 'DOLPHIN', hint: 'Clever sea mammal' },
  { word: 'EMERALD', hint: 'A green gemstone' },
  { word: 'FOSSIL', hint: 'Ancient life in stone' }
];

const scramble = (word: string) => {
  const letters = word.split('');
  let attempt: string[];
  do {
    attempt = [...letters];
    for (let i = attempt.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [attempt[i], attempt[j]] = [attempt[j], attempt[i]];
    }
  } while (attempt.join('') === word && word.length > 1);
  return attempt;
};

const pickRound = (used: Set<string>) => {
  const pool = WORDS.filter((w) => !used.has(w.word));
  const entry = (pool.length ? pool : WORDS)[Math.floor(Math.random() * (pool.length || WORDS.length))];
  return { entry, letters: scramble(entry.word) };
};

export default function WordScramble() {
  const [used, setUsed] = useState<Set<string>>(new Set());
  const [round, setRound] = useState(() => pickRound(new Set()));
  const [picked, setPicked] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);
  const [feedback, setFeedback] = useState<'none' | 'right' | 'wrong'>('none');
  const [hintShown, setHintShown] = useState(false);
  const [over, setOver] = useState(false);
  const [isRecord, setIsRecord] = useState(false);
  const { best, submit } = useBestScore(SLUG);

  const timers = useRef<number[]>([]);
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => () => clearTimers(), []);

  const attempt = picked.map((i) => round.letters[i]).join('');

  // Choosing the next word depends on which words are already spent, so it reads `used` directly.
  const advance = useCallback((justSolved: string | null) => {
    const nextUsed = new Set(used);
    if (justSolved) nextUsed.add(justSolved);
    setUsed(nextUsed);
    setRound(pickRound(nextUsed));
    setPicked([]);
    setHintShown(false);
  }, [used]);

  const restart = useCallback(() => {
    clearTimers();
    setUsed(new Set());
    setRound(pickRound(new Set()));
    setPicked([]);
    setScore(0);
    setSolved(0);
    setSecondsLeft(ROUND_SECONDS);
    setFeedback('none');
    setHintShown(false);
    setOver(false);
    setIsRecord(false);
  }, []);

  useEffect(() => {
    if (over) return;
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [over]);

  useEffect(() => {
    if (secondsLeft === 0) setOver(true);
  }, [secondsLeft]);

  useEffect(() => {
    if (over) setIsRecord(submit(score));
  }, [over, score, submit]);

  // A full-length guess is checked automatically — no submit button to hunt for.
  useEffect(() => {
    if (over || feedback !== 'none') return;
    if (attempt.length !== round.entry.word.length) return;

    if (attempt === round.entry.word) {
      setFeedback('right');
      setScore((s) => s + round.entry.word.length * 10 + (hintShown ? 0 : 20));
      setSolved((s) => s + 1);
      timers.current.push(window.setTimeout(() => {
        setFeedback('none');
        advance(round.entry.word);
      }, 650));
    } else {
      setFeedback('wrong');
      timers.current.push(window.setTimeout(() => {
        setFeedback('none');
        setPicked([]);
      }, 450));
    }
  }, [attempt, round.entry.word, hintShown, over, feedback, advance]);

  const pickLetter = (index: number) => {
    if (over || feedback !== 'none') return;
    if (picked.includes(index)) return;
    setPicked((current) => [...current, index]);
  };

  const backspace = () => {
    if (feedback !== 'none') return;
    setPicked((current) => current.slice(0, -1));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (over) return;
      if (e.key === 'Backspace') {
        e.preventDefault();
        backspace();
        return;
      }
      const letter = e.key.toUpperCase();
      if (letter.length !== 1 || letter < 'A' || letter > 'Z') return;
      const index = round.letters.findIndex((char, i) => char === letter && !picked.includes(i));
      if (index >= 0) pickLetter(index);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [over, round, picked, feedback]);

  const useHint = () => {
    if (hintShown || over) return;
    setHintShown(true);
    setScore((s) => Math.max(0, s - 15));
  };

  return (
    <GameShell
      slug={SLUG}
      title="Word Scramble"
      tagline="Unscramble the letters against the clock. Hints cost points, so trust your instincts first."
      keywords="word scramble game, anagram solver game, unscramble letters online, free word game"
      stats={[
        { label: 'Score', value: score, accent: true },
        { label: 'Best', value: best ?? 0 },
        { label: 'Solved', value: solved },
        { label: 'Time', value: `${secondsLeft}s` }
      ]}
      onRestart={restart}
      restartLabel="New round"
      howTo={[
        'Tap the scrambled letters to spell the hidden word.',
        'A full-length guess checks itself — a wrong one clears and you try again.',
        'Each word is worth ten points per letter, plus twenty for solving it without a hint.',
        'Stuck? Take the hint for fifteen points, or skip to the next word for free.'
      ]}
      about={
        <p>
          Ninety seconds, forty possible words, and no repeats until the list runs dry. Short words are
          quick points; the seven-letter ones are where a good score comes from.
        </p>
      }
    >
      <div className="relative">
        <div className="space-y-5">
          {/* answer slots */}
          <div className="flex flex-wrap justify-center gap-2">
            {round.entry.word.split('').map((_, slot) => {
              const index = picked[slot];
              const filled = index !== undefined;
              return (
                <div
                  key={slot}
                  className={`w-9 h-11 sm:w-10 sm:h-12 rounded-lg border-2 flex items-center justify-center text-lg font-bold transition-colors ${
                    feedback === 'right'
                      ? 'border-primary bg-mint text-primary'
                      : feedback === 'wrong'
                      ? 'border-[#F0A9A9] bg-[#FDE2E2] text-[#B91C1C]'
                      : filled
                      ? 'border-primary/40 bg-white text-ink'
                      : 'border-dashed border-black/15 bg-[#F6F8F7] text-transparent'
                  }`}
                >
                  {filled ? round.letters[index] : '·'}
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-[#55605B] min-h-[18px]">
            {hintShown ? round.entry.hint : `${round.entry.word.length} letters`}
          </p>

          {/* letter pool */}
          <div className="flex flex-wrap justify-center gap-2">
            {round.letters.map((letter, index) => {
              const taken = picked.includes(index);
              return (
                <button
                  key={index}
                  onClick={() => pickLetter(index)}
                  disabled={taken}
                  className={`w-10 h-11 sm:w-11 sm:h-12 rounded-lg border text-lg font-bold transition-all ${
                    taken
                      ? 'border-black/5 bg-[#F0F3F1] text-[#C4CCC7]'
                      : 'border-black/10 bg-white text-ink hover:border-primary/40 hover:text-primary active:scale-95'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>

          <div className="flex justify-center gap-2">
            <button
              onClick={backspace}
              className="px-3.5 py-2.5 rounded-xl border border-black/10 bg-[#F6F8F7] text-[#55605B] text-xs font-semibold inline-flex items-center gap-1.5 hover:border-primary/30 hover:text-primary transition-all"
            >
              <Delete className="w-3.5 h-3.5" /> Undo
            </button>
            <button
              onClick={useHint}
              disabled={hintShown}
              className="px-3.5 py-2.5 rounded-xl border border-black/10 bg-[#F6F8F7] text-[#55605B] text-xs font-semibold inline-flex items-center gap-1.5 hover:border-primary/30 hover:text-primary transition-all disabled:opacity-40"
            >
              <Lightbulb className="w-3.5 h-3.5" /> Hint (−15)
            </button>
            <button
              onClick={() => advance(null)}
              className="px-3.5 py-2.5 rounded-xl border border-black/10 bg-[#F6F8F7] text-[#55605B] text-xs font-semibold inline-flex items-center gap-1.5 hover:border-primary/30 hover:text-primary transition-all"
            >
              <SkipForward className="w-3.5 h-3.5" /> Skip
            </button>
          </div>
        </div>

        <GameOverlay
          show={over}
          tone="neutral"
          title="Time!"
          subtitle={`${solved} ${solved === 1 ? 'word' : 'words'} for ${score} points.`}
          onAction={restart}
          isRecord={isRecord}
        />
      </div>
    </GameShell>
  );
}
