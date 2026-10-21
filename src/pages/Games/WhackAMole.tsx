import { useCallback, useEffect, useRef, useState } from 'react';
import { Bomb } from 'lucide-react';
import GameShell, { GameOverlay } from '../../components/GameShell';
import { useBestScore } from '../../hooks/useBestScore';

const SLUG = 'whack-a-mole';
const HOLES = 9;
const ROUND_SECONDS = 30;

type Occupant = 'mole' | 'bomb';

interface Pop {
  hole: number;
  kind: Occupant;
  /** Monotonic id so a re-pop in the same hole counts as a brand new target. */
  id: number;
}

export default function WhackAMole() {
  const [pops, setPops] = useState<Pop[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const [isRecord, setIsRecord] = useState(false);
  const [flash, setFlash] = useState<{ hole: number; good: boolean } | null>(null);
  const { best, submit } = useBestScore(SLUG);

  // Spawning is timer-driven and random, so the authoritative copies live in refs; state is only
  // what React renders. (StrictMode runs state updaters twice in development.)
  const livePops = useRef<Pop[]>([]);
  const liveStreak = useRef(0);
  const clockRef = useRef(ROUND_SECONDS);
  const nextId = useRef(1);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const writePops = (next: Pop[]) => {
    livePops.current = next;
    setPops(next);
  };

  const restart = useCallback(() => {
    clearTimers();
    livePops.current = [];
    liveStreak.current = 0;
    clockRef.current = ROUND_SECONDS;
    setPops([]);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setSecondsLeft(ROUND_SECONDS);
    setOver(false);
    setIsRecord(false);
    setRunning(true);
  }, []);

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    clockRef.current = secondsLeft;
  }, [secondsLeft]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (secondsLeft === 0 && running) {
      setRunning(false);
      setOver(true);
      clearTimers();
      writePops([]);
    }
  }, [secondsLeft, running]);

  useEffect(() => {
    if (over) setIsRecord(submit(score));
  }, [over, score, submit]);

  /**
   * Spawner. Moles appear faster and stay up for less time as the clock runs down, and roughly one
   * in six targets is a bomb.
   */
  useEffect(() => {
    if (!running) return;
    let cancelled = false;

    const spawn = () => {
      if (cancelled) return;
      const progress = Math.min(1, (ROUND_SECONDS - clockRef.current) / ROUND_SECONDS);
      const upTime = 1100 - progress * 500; // 1100ms → 600ms
      const gap = 650 - progress * 350; // 650ms → 300ms

      const taken = new Set(livePops.current.map((p) => p.hole));
      const free = [...Array(HOLES).keys()].filter((h) => !taken.has(h));
      if (free.length) {
        const pop: Pop = {
          hole: free[Math.floor(Math.random() * free.length)],
          kind: Math.random() < 0.17 ? 'bomb' : 'mole',
          id: nextId.current++
        };
        writePops([...livePops.current, pop]);
        timers.current.push(
          window.setTimeout(() => {
            if (cancelled) return;
            writePops(livePops.current.filter((p) => p.id !== pop.id));
          }, upTime)
        );
      }

      timers.current.push(window.setTimeout(spawn, gap));
    };

    timers.current.push(window.setTimeout(spawn, 400));
    return () => {
      cancelled = true;
    };
  }, [running]);

  const flashHole = (hole: number, good: boolean) => {
    setFlash({ hole, good });
    timers.current.push(window.setTimeout(() => setFlash(null), 200));
  };

  const whack = (hole: number) => {
    if (!running) return;
    const target = livePops.current.find((p) => p.hole === hole);

    if (!target) {
      // A swing at an empty hole costs no points, but it does break the streak.
      liveStreak.current = 0;
      setStreak(0);
      flashHole(hole, false);
      return;
    }

    writePops(livePops.current.filter((p) => p.id !== target.id));
    flashHole(hole, target.kind === 'mole');

    if (target.kind === 'bomb') {
      setScore((s) => Math.max(0, s - 15));
      liveStreak.current = 0;
      setStreak(0);
      return;
    }

    const next = liveStreak.current + 1;
    liveStreak.current = next;
    setStreak(next);
    setBestStreak((b) => Math.max(b, next));
    // Every fifth mole in a row pays a bonus, which is what makes a streak worth protecting.
    setScore((points) => points + 10 + (next % 5 === 0 ? 25 : 0));
  };

  return (
    <GameShell
      slug={SLUG}
      title="Whack-a-Mole"
      tagline="Thirty seconds, one hammer, endless moles. Tap fast and build a streak without hitting a bomb."
      keywords="whack a mole game, online whack a mole, reflex tapping game, free arcade game"
      stats={[
        { label: 'Score', value: score, accent: true },
        { label: 'Best', value: best ?? 0 },
        { label: 'Time', value: `${secondsLeft}s` },
        { label: 'Streak', value: streak }
      ]}
      onRestart={restart}
      restartLabel="New round"
      howTo={[
        'Tap Start, then tap every mole that pops out of a hole.',
        'Each mole is worth 10 points, and every fifth in a row adds a 25 point bonus.',
        'Bombs cost you 15 points and reset your streak — leave them alone.',
        'Moles get faster and disappear sooner as the 30 seconds run down.'
      ]}
      about={
        <p>
          The spawn rate and how long each mole stays up both scale with the clock, so the last ten
          seconds are roughly twice as frantic as the first ten. Missing an empty hole does not cost
          points, but it resets your streak, so wild tapping is its own punishment.
        </p>
      }
    >
      <div className="relative">
        <div className="mx-auto w-full max-w-sm grid grid-cols-3 gap-3 select-none touch-manipulation">
          {[...Array(HOLES).keys()].map((hole) => {
            const occupant = pops.find((p) => p.hole === hole);
            const hit = flash?.hole === hole;
            return (
              <button
                key={hole}
                onClick={() => whack(hole)}
                className={`relative aspect-square rounded-2xl border overflow-hidden transition-colors ${
                  hit
                    ? flash?.good
                      ? 'bg-mint border-primary/40'
                      : 'bg-[#FDE2E2] border-[#F0A9A9]'
                    : 'bg-[#EDF1EF] border-black/10'
                }`}
              >
                <span className="absolute inset-x-3 bottom-3 h-3 rounded-full bg-black/10" />
                {occupant && (
                  <span
                    className={`absolute inset-x-[18%] bottom-[14%] h-[62%] rounded-t-full flex items-start justify-center animate-[popUp_130ms_ease-out] ${
                      occupant.kind === 'mole' ? 'bg-[#8B5E3C]' : 'bg-ink'
                    }`}
                  >
                    {occupant.kind === 'mole' ? (
                      <span className="flex gap-1.5 mt-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      </span>
                    ) : (
                      <Bomb className="w-5 h-5 text-white mt-2.5" />
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {!running && !over && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/85 backdrop-blur-sm rounded-xl">
            <button
              onClick={restart}
              className="px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark active:scale-95 transition-all"
            >
              Start round
            </button>
          </div>
        )}

        <GameOverlay
          show={over}
          tone="neutral"
          title="Time!"
          subtitle={`${score} points, best streak of ${bestStreak}.`}
          onAction={restart}
          isRecord={isRecord}
        />
      </div>
    </GameShell>
  );
}
