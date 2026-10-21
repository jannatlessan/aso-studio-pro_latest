import { useCallback, useEffect, useRef, useState } from 'react';
import GameShell, { GameOverlay } from '../../components/GameShell';
import { useBestScore } from '../../hooks/useBestScore';

const SLUG = 'simon-says';

const PADS = [
  { idle: 'bg-[#0A7D40]', lit: 'bg-[#4FCB89]', tone: 329.63, label: 'green' },
  { idle: 'bg-[#0F766E]', lit: 'bg-[#2DD4BF]', tone: 261.63, label: 'teal' },
  { idle: 'bg-[#B45309]', lit: 'bg-[#FBBF24]', tone: 392.0, label: 'amber' },
  { idle: 'bg-[#6D28D9]', lit: 'bg-[#A78BFA]', tone: 440.0, label: 'violet' }
];

type Phase = 'idle' | 'showing' | 'input' | 'wrong';

export default function SimonSays() {
  const [sequence, setSequence] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [lit, setLit] = useState<number | null>(null);
  const [step, setStep] = useState(0);
  const [isRecord, setIsRecord] = useState(false);
  const { best, submit } = useBestScore(SLUG);

  const timers = useRef<number[]>([]);
  const audioCtx = useRef<AudioContext | null>(null);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => () => clearTimers(), []);

  /** A short sine blip per pad. Created lazily, since audio needs a user gesture to start. */
  const beep = useCallback((frequency: number, duration = 0.22) => {
    try {
      if (!audioCtx.current) {
        const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return;
        audioCtx.current = new Ctor();
      }
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration + 0.02);
    } catch {
      /* audio is a nicety — the game is fully playable silently */
    }
  }, []);

  /** Plays the whole sequence back, then hands control to the player. */
  const playback = useCallback(
    (list: number[]) => {
      clearTimers();
      setPhase('showing');
      setStep(0);
      const pace = Math.max(260, 620 - list.length * 22);

      list.forEach((pad, i) => {
        timers.current.push(
          window.setTimeout(() => {
            setLit(pad);
            beep(PADS[pad].tone);
            timers.current.push(window.setTimeout(() => setLit(null), pace * 0.55));
          }, i * pace)
        );
      });

      timers.current.push(
        window.setTimeout(() => {
          setPhase('input');
        }, list.length * pace + 180)
      );
    },
    [beep]
  );

  const nextRound = useCallback(
    (current: number[]) => {
      const next = [...current, Math.floor(Math.random() * 4)];
      setSequence(next);
      timers.current.push(window.setTimeout(() => playback(next), 420));
    },
    [playback]
  );

  const restart = useCallback(() => {
    clearTimers();
    setSequence([]);
    setStep(0);
    setLit(null);
    setIsRecord(false);
    setPhase('idle');
  }, []);

  const start = useCallback(() => {
    clearTimers();
    setSequence([]);
    setStep(0);
    setIsRecord(false);
    nextRound([]);
  }, [nextRound]);

  const tapPad = (pad: number) => {
    if (phase !== 'input') return;

    setLit(pad);
    beep(PADS[pad].tone, 0.18);
    timers.current.push(window.setTimeout(() => setLit(null), 150));

    if (sequence[step] !== pad) {
      setPhase('wrong');
      setIsRecord(submit(sequence.length - 1));
      beep(110, 0.5);
      return;
    }

    const nextStep = step + 1;
    if (nextStep === sequence.length) {
      setStep(0);
      nextRound(sequence);
    } else {
      setStep(nextStep);
    }
  };

  const level = sequence.length;

  return (
    <GameShell
      slug={SLUG}
      title="Simon Says"
      tagline="Watch the colour sequence, then repeat it back. It grows by one every single round."
      keywords="simon says game, memory sequence game online, colour memory game free, simon electronic game"
      stats={[
        { label: 'Round', value: level, accent: true },
        { label: 'Best', value: best ?? 0 },
        { label: 'Step', value: phase === 'input' ? `${step + 1}/${level}` : '—' }
      ]}
      onRestart={restart}
      restartLabel="Reset"
      howTo={[
        'Press Start and watch which pads light up, in order.',
        'Repeat the sequence back by tapping the pads yourself.',
        'Get it right and the sequence grows by one pad — and speeds up slightly.',
        'One wrong pad ends the run. Your best is the longest sequence you repeated.'
      ]}
      about={
        <p>
          Each pad has its own tone, so the sequence is as much a tune as a pattern — most people get
          noticeably further once they start humming along rather than memorising positions. Playback
          accelerates from about 620 ms per pad down to a floor of 260 ms.
        </p>
      }
    >
      <div className="relative">
        <div className="mx-auto w-full max-w-xs grid grid-cols-2 gap-3">
          {PADS.map((pad, index) => (
            <button
              key={pad.label}
              onClick={() => tapPad(index)}
              aria-label={`${pad.label} pad`}
              disabled={phase !== 'input'}
              className={`aspect-square rounded-2xl transition-all duration-100 touch-manipulation ${
                lit === index ? `${pad.lit} scale-[0.97] shadow-lg` : pad.idle
              } ${phase === 'input' ? 'cursor-pointer hover:brightness-110 active:scale-95' : 'opacity-85'}`}
            />
          ))}
        </div>

        <p className="mt-4 text-center text-xs font-medium text-[#55605B] min-h-[18px]">
          {phase === 'showing'
            ? 'Watch the sequence…'
            : phase === 'input'
            ? 'Your turn — repeat it'
            : phase === 'wrong'
            ? 'Wrong pad'
            : 'Press Start to begin'}
        </p>

        {phase === 'idle' && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/85 backdrop-blur-sm rounded-xl">
            <button
              onClick={start}
              className="px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark active:scale-95 transition-all"
            >
              Start
            </button>
          </div>
        )}

        <GameOverlay
          show={phase === 'wrong'}
          tone="lose"
          title={`Round ${Math.max(0, level - 1)}`}
          subtitle={`You repeated a sequence of ${Math.max(0, level - 1)} before slipping.`}
          actionLabel="Play again"
          onAction={start}
          isRecord={isRecord}
        />
      </div>
    </GameShell>
  );
}
