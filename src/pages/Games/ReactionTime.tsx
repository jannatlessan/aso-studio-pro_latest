import { useCallback, useEffect, useRef, useState } from 'react';
import { Zap } from 'lucide-react';
import GameShell, { GameOverlay } from '../../components/GameShell';
import { useBestScore } from '../../hooks/useBestScore';

const SLUG = 'reaction-time';
const ROUNDS = 5;

type Phase = 'idle' | 'waiting' | 'go' | 'result' | 'tooSoon' | 'done';

const rating = (ms: number) => {
  if (ms < 180) return 'Elite — faster than most pro gamers.';
  if (ms < 230) return 'Sharp. Well above average.';
  if (ms < 290) return 'Solid, right around the human average.';
  if (ms < 400) return 'A touch slow — try again when you are warmed up.';
  return 'Take a breath and go again.';
};

export default function ReactionTime() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [times, setTimes] = useState<number[]>([]);
  const [last, setLast] = useState<number | null>(null);
  const [isRecord, setIsRecord] = useState(false);
  const { best, submit } = useBestScore(SLUG, 'min');

  const goAt = useRef(0);
  const timer = useRef<number | null>(null);

  const clearPending = () => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const armNextRound = useCallback(() => {
    clearPending();
    setPhase('waiting');
    // Randomised 1.2–3.4s hold, so the green cannot be anticipated by counting.
    timer.current = window.setTimeout(() => {
      goAt.current = performance.now();
      setPhase('go');
    }, 1200 + Math.random() * 2200);
  }, []);

  const restart = useCallback(() => {
    clearPending();
    setTimes([]);
    setLast(null);
    setIsRecord(false);
    setPhase('idle');
  }, []);

  useEffect(() => () => clearPending(), []);

  const average = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null;

  // The stored record is the average of a completed five-round set, not a single lucky tap.
  useEffect(() => {
    if (phase === 'done' && average !== null) setIsRecord(submit(average));
  }, [phase, average, submit]);

  const handlePress = () => {
    if (phase === 'idle' || phase === 'tooSoon') {
      armNextRound();
      return;
    }

    if (phase === 'waiting') {
      clearPending();
      setPhase('tooSoon');
      return;
    }

    if (phase === 'go') {
      const elapsed = Math.round(performance.now() - goAt.current);
      const nextTimes = [...times, elapsed];
      setLast(elapsed);
      setTimes(nextTimes);
      setPhase(nextTimes.length >= ROUNDS ? 'done' : 'result');
      return;
    }

    if (phase === 'result') armNextRound();
  };

  const panel = {
    idle: {
      className: 'bg-[#F6F8F7] border-black/10 text-ink',
      title: 'Tap to begin',
      body: `Five rounds. Wait for green, then tap as fast as you can.`
    },
    waiting: {
      className: 'bg-[#FDF3E2] border-[#E9CF9A] text-[#8A5A00]',
      title: 'Wait for green…',
      body: 'Do not tap yet.'
    },
    go: {
      className: 'bg-primary border-primary text-white',
      title: 'TAP NOW',
      body: ''
    },
    result: {
      className: 'bg-mint border-primary/30 text-ink',
      title: `${last} ms`,
      body: `Round ${times.length} of ${ROUNDS} — tap for the next one.`
    },
    tooSoon: {
      className: 'bg-[#FDE2E2] border-[#F0A9A9] text-[#B91C1C]',
      title: 'Too soon!',
      body: 'That one does not count. Tap to try the round again.'
    },
    done: {
      className: 'bg-mint border-primary/30 text-ink',
      title: `${average} ms average`,
      body: rating(average ?? 999)
    }
  }[phase];

  return (
    <GameShell
      slug={SLUG}
      title="Reaction Time Test"
      tagline="Wait for green, then tap. Five rounds, averaged, to find out how fast your reflexes really are."
      keywords="reaction time test, reflex test online, human benchmark reaction, ms reaction speed game"
      stats={[
        { label: 'Last', value: last !== null ? `${last}ms` : '—', accent: true },
        { label: 'Average', value: average !== null ? `${average}ms` : '—' },
        { label: 'Best avg', value: best !== null ? `${best}ms` : '—' },
        { label: 'Round', value: `${Math.min(times.length + (phase === 'done' ? 0 : 1), ROUNDS)}/${ROUNDS}` }
      ]}
      onRestart={restart}
      restartLabel="Reset"
      howTo={[
        'Tap the panel to arm a round — the delay before green is random every time.',
        'The moment the panel turns green, tap it as fast as you can.',
        'Tapping while it is still amber counts as a false start and the round replays.',
        'Your score is the average across five clean rounds.'
      ]}
      about={
        <>
          <p>
            Typical human reaction to a visual cue lands around 250 ms. Under 200 ms is genuinely quick,
            and anything under 150 ms usually means you guessed rather than reacted.
          </p>
          <p>
            Timing uses the browser's high-resolution clock, measured from the frame where the panel turns
            green to the moment your tap registers, so it includes your display's own latency.
          </p>
        </>
      }
    >
      <div className="relative">
        <button
          onClick={handlePress}
          className={`w-full rounded-2xl border-2 transition-colors duration-75 select-none touch-manipulation h-64 sm:h-80 flex flex-col items-center justify-center gap-3 px-6 text-center ${panel.className}`}
        >
          {phase === 'go' && <Zap className="w-10 h-10" />}
          <span className="text-3xl sm:text-4xl font-bold tracking-tight tabular-nums">{panel.title}</span>
          {panel.body && <span className="text-sm opacity-80 max-w-xs leading-relaxed">{panel.body}</span>}
        </button>

        {times.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {times.map((t, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-lg border border-black/10 bg-[#F6F8F7] text-xs font-semibold tabular-nums text-[#55605B]"
              >
                #{i + 1} · {t}ms
              </span>
            ))}
          </div>
        )}

        <GameOverlay
          show={phase === 'done'}
          tone="win"
          title={`${average} ms average`}
          subtitle={rating(average ?? 999)}
          actionLabel="Go again"
          onAction={restart}
          isRecord={isRecord}
        />
      </div>
    </GameShell>
  );
}
