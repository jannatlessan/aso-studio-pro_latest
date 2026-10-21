import { useCallback, useEffect, useRef, useState } from 'react';
import GameShell, { GameOverlay } from '../../components/GameShell';
import { useBestScore } from '../../hooks/useBestScore';

const SLUG = 'memory-match';
const PAIRS = 8;

const FACES = ['🌱', '🚀', '🎧', '🔑', '🧩', '⚡', '🎲', '🌙', '🔥', '💎', '🎯', '🍀'];

interface Card {
  id: number;
  face: string;
  matched: boolean;
}

const shuffle = <T,>(list: T[]) => {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

function buildDeck(): Card[] {
  const faces = shuffle(FACES).slice(0, PAIRS);
  const deck = shuffle([...faces, ...faces]);
  return deck.map((face, id) => ({ id, face, matched: false }));
}

export default function MemoryMatch() {
  const [deck, setDeck] = useState<Card[]>(buildDeck);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isRecord, setIsRecord] = useState(false);
  const { best, submit } = useBestScore(SLUG, 'min');

  const timer = useRef<number | null>(null);
  // Two taps can arrive in the same frame, before React re-renders, so the pair being compared is
  // tracked in a ref rather than read from state.
  const liveFlipped = useRef<number[]>([]);
  const liveDeck = useRef<Card[]>(deck);
  const matchedCount = deck.filter((card) => card.matched).length;
  const won = matchedCount === PAIRS * 2;

  const restart = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    const fresh = buildDeck();
    liveDeck.current = fresh;
    liveFlipped.current = [];
    setDeck(fresh);
    setFlipped([]);
    setMoves(0);
    setSeconds(0);
    setIsRecord(false);
  }, []);

  useEffect(() => () => {
    if (timer.current !== null) clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    if (won) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [won]);

  useEffect(() => {
    if (won) setIsRecord(submit(moves));
  }, [won, moves, submit]);

  const flip = (index: number) => {
    const cards = liveDeck.current;
    if (cards[index].matched || liveFlipped.current.includes(index)) return;
    if (liveFlipped.current.length >= 2) return;

    const next = [...liveFlipped.current, index];
    liveFlipped.current = next;
    setFlipped(next);
    if (next.length < 2) return;

    setMoves((m) => m + 1);
    const [a, b] = next;

    if (cards[a].face === cards[b].face) {
      const matched = cards.map((card, i) => (i === a || i === b ? { ...card, matched: true } : card));
      liveDeck.current = matched;
      liveFlipped.current = [];
      setDeck(matched);
      setFlipped([]);
    } else {
      // Hold the mismatched pair face-up long enough to actually read it.
      timer.current = window.setTimeout(() => {
        liveFlipped.current = [];
        setFlipped([]);
      }, 760);
    }
  };

  return (
    <GameShell
      slug={SLUG}
      title="Memory Match"
      tagline="Flip the cards two at a time and pair them all up. Fewer moves means a better score."
      keywords="memory match game, concentration card game online, pairs game free, memory card game"
      stats={[
        { label: 'Moves', value: moves, accent: true },
        { label: 'Best', value: best ?? '—' },
        { label: 'Pairs', value: `${matchedCount / 2}/${PAIRS}` },
        { label: 'Time', value: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` }
      ]}
      onRestart={restart}
      restartLabel="New deal"
      howTo={[
        'Tap a card to turn it face-up.',
        'Turn over a second card — if the two match they stay up.',
        'A mismatched pair flips back after a moment, so remember where things were.',
        'Clear all eight pairs. Your best is the fewest moves you have ever needed.'
      ]}
      about={
        <p>
          Sixteen cards, eight pairs, and a perfect game is sixteen moves. Anything under twenty-four is
          strong — most first attempts land somewhere near thirty.
        </p>
      }
    >
      <div className="relative">
        <div className="mx-auto w-full max-w-sm grid grid-cols-4 gap-2 sm:gap-3">
          {deck.map((card, index) => {
            const faceUp = card.matched || flipped.includes(index);
            return (
              <button
                key={card.id}
                onClick={() => flip(index)}
                className="relative aspect-[3/4] [perspective:600px] touch-manipulation"
                aria-label={faceUp ? `Card showing ${card.face}` : 'Face-down card'}
              >
                <span
                  className="absolute inset-0 transition-transform duration-300 [transform-style:preserve-3d]"
                  style={{ transform: faceUp ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                >
                  {/* back */}
                  <span className="absolute inset-0 rounded-xl border border-black/10 bg-[#F6F8F7] [backface-visibility:hidden] flex items-center justify-center">
                    <span className="w-6 h-6 rounded-md border-2 border-primary/25" />
                  </span>
                  {/* face */}
                  <span
                    className={`absolute inset-0 rounded-xl border flex items-center justify-center text-2xl sm:text-3xl [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                      card.matched ? 'border-primary/40 bg-mint' : 'border-black/10 bg-white'
                    }`}
                  >
                    {card.face}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <GameOverlay
          show={won}
          tone="win"
          title="All pairs found!"
          subtitle={`${moves} moves in ${Math.floor(seconds / 60)}m ${seconds % 60}s.`}
          actionLabel="Deal again"
          onAction={restart}
          isRecord={isRecord}
        />
      </div>
    </GameShell>
  );
}
