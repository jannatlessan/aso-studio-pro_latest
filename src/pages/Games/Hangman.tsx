import { useCallback, useEffect, useMemo, useState } from 'react';
import GameShell, { GameOverlay } from '../../components/GameShell';
import { useBestScore } from '../../hooks/useBestScore';

const SLUG = 'hangman';
const MAX_WRONG = 6;
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

interface Entry {
  word: string;
  category: string;
}

const WORDS: Entry[] = [
  { word: 'JAVASCRIPT', category: 'Programming' },
  { word: 'COMPONENT', category: 'Programming' },
  { word: 'DATABASE', category: 'Programming' },
  { word: 'ALGORITHM', category: 'Programming' },
  { word: 'KEYBOARD', category: 'Hardware' },
  { word: 'MONITOR', category: 'Hardware' },
  { word: 'PROCESSOR', category: 'Hardware' },
  { word: 'ELEPHANT', category: 'Animals' },
  { word: 'PENGUIN', category: 'Animals' },
  { word: 'DOLPHIN', category: 'Animals' },
  { word: 'LEOPARD', category: 'Animals' },
  { word: 'PORTUGAL', category: 'Countries' },
  { word: 'MOROCCO', category: 'Countries' },
  { word: 'PAKISTAN', category: 'Countries' },
  { word: 'MALAYSIA', category: 'Countries' },
  { word: 'SAXOPHONE', category: 'Music' },
  { word: 'ORCHESTRA', category: 'Music' },
  { word: 'MELODY', category: 'Music' },
  { word: 'VOLCANO', category: 'Nature' },
  { word: 'GLACIER', category: 'Nature' },
  { word: 'MONSOON', category: 'Nature' },
  { word: 'RAINFOREST', category: 'Nature' },
  { word: 'BREAKFAST', category: 'Food' },
  { word: 'CHOCOLATE', category: 'Food' },
  { word: 'CINNAMON', category: 'Food' },
  { word: 'ESPRESSO', category: 'Food' },
  { word: 'TELESCOPE', category: 'Science' },
  { word: 'GRAVITY', category: 'Science' },
  { word: 'MOLECULE', category: 'Science' },
  { word: 'ECLIPSE', category: 'Science' }
];

const pick = () => WORDS[Math.floor(Math.random() * WORDS.length)];

export default function Hangman() {
  const [entry, setEntry] = useState<Entry>(pick);
  const [guessed, setGuessed] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [isRecord, setIsRecord] = useState(false);
  const { best, submit } = useBestScore(SLUG);

  const wrong = useMemo(() => guessed.filter((l) => !entry.word.includes(l)), [guessed, entry.word]);
  const lost = wrong.length >= MAX_WRONG;
  const won = entry.word.split('').every((l) => guessed.includes(l));

  const nextWord = useCallback(() => {
    setEntry(pick());
    setGuessed([]);
    setIsRecord(false);
  }, []);

  const restart = useCallback(() => {
    setStreak(0);
    nextWord();
  }, [nextWord]);

  const guess = useCallback(
    (letter: string) => {
      if (won || lost || guessed.includes(letter)) return;
      setGuessed((current) => [...current, letter]);
    },
    [won, lost, guessed]
  );

  // A win extends the streak; the stored best is the longest streak of words solved in a row.
  useEffect(() => {
    if (!won) return;
    setStreak((current) => {
      const next = current + 1;
      return next;
    });
  }, [won]);

  useEffect(() => {
    if (won) setIsRecord(submit(streak));
  }, [won, streak, submit]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const letter = e.key.toUpperCase();
      if (letter.length === 1 && letter >= 'A' && letter <= 'Z') guess(letter);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [guess]);

  const livesLeft = MAX_WRONG - wrong.length;

  return (
    <GameShell
      slug={SLUG}
      title="Hangman"
      tagline="Guess the hidden word one letter at a time. Six wrong guesses and the round is over."
      keywords="hangman game online, play hangman free, word guessing game, hangman browser game"
      stats={[
        { label: 'Streak', value: streak, accent: true },
        { label: 'Best', value: best ?? 0 },
        { label: 'Lives', value: livesLeft },
        { label: 'Topic', value: <span className="text-xs">{entry.category}</span> }
      ]}
      onRestart={restart}
      restartLabel="Reset streak"
      howTo={[
        'Tap a letter (or type one) to guess it.',
        'Correct letters fill into the word; wrong ones cost a life.',
        'Six wrong guesses ends the round and resets your streak.',
        'Solve words back-to-back to build the longest streak you can.'
      ]}
      about={
        <p>
          Each word comes with its topic, which is usually enough to narrow the vowels. The classic
          opening is to clear E, A, R and T before spending a life on anything rarer.
        </p>
      }
    >
      <div className="relative">
        <div className="space-y-6">
          <div className="flex justify-center">
            <Gallows wrong={wrong.length} />
          </div>

          <div className="flex flex-wrap justify-center gap-1.5">
            {entry.word.split('').map((letter, index) => {
              const revealed = guessed.includes(letter) || lost;
              return (
                <span
                  key={index}
                  className={`w-7 sm:w-8 pb-1 border-b-2 text-center text-xl font-bold ${
                    revealed
                      ? guessed.includes(letter)
                        ? 'border-primary text-ink'
                        : 'border-[#F0A9A9] text-[#B91C1C]'
                      : 'border-black/20 text-transparent'
                  }`}
                >
                  {revealed ? letter : '·'}
                </span>
              );
            })}
          </div>

          <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5 max-w-md mx-auto">
            {LETTERS.map((letter) => {
              const used = guessed.includes(letter);
              const hit = used && entry.word.includes(letter);
              return (
                <button
                  key={letter}
                  onClick={() => guess(letter)}
                  disabled={used || won || lost}
                  className={`h-10 rounded-lg border text-sm font-bold transition-all ${
                    hit
                      ? 'border-primary/40 bg-mint text-primary'
                      : used
                      ? 'border-black/5 bg-[#F0F3F1] text-[#C4CCC7]'
                      : 'border-black/10 bg-white text-ink hover:border-primary/40 hover:text-primary active:scale-95'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>

        <GameOverlay
          show={lost}
          tone="lose"
          title="Out of lives"
          subtitle={`The word was ${entry.word}.`}
          actionLabel="New word"
          onAction={restart}
        />
        <GameOverlay
          show={won}
          tone="win"
          title="Got it!"
          subtitle={`${entry.word} — that is ${streak} in a row.`}
          actionLabel="Next word"
          onAction={nextWord}
          isRecord={isRecord}
        />
      </div>
    </GameShell>
  );
}

/** The classic six-stage figure, drawn as SVG so it stays crisp at any size. */
function Gallows({ wrong }: { wrong: number }) {
  const stroke = '#101312';
  return (
    <svg viewBox="0 0 160 170" className="w-40 h-44" role="img" aria-label={`${wrong} of 6 wrong guesses`}>
      <line x1="20" y1="160" x2="120" y2="160" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
      <line x1="48" y1="160" x2="48" y2="18" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
      <line x1="48" y1="18" x2="112" y2="18" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
      <line x1="112" y1="18" x2="112" y2="36" stroke={stroke} strokeWidth="3" strokeLinecap="round" />

      {wrong > 0 && <circle cx="112" cy="50" r="14" stroke="#0E9D52" strokeWidth="4" fill="none" />}
      {wrong > 1 && <line x1="112" y1="64" x2="112" y2="108" stroke="#0E9D52" strokeWidth="4" strokeLinecap="round" />}
      {wrong > 2 && <line x1="112" y1="76" x2="92" y2="92" stroke="#0E9D52" strokeWidth="4" strokeLinecap="round" />}
      {wrong > 3 && <line x1="112" y1="76" x2="132" y2="92" stroke="#0E9D52" strokeWidth="4" strokeLinecap="round" />}
      {wrong > 4 && <line x1="112" y1="108" x2="96" y2="136" stroke="#B91C1C" strokeWidth="4" strokeLinecap="round" />}
      {wrong > 5 && <line x1="112" y1="108" x2="128" y2="136" stroke="#B91C1C" strokeWidth="4" strokeLinecap="round" />}
    </svg>
  );
}
