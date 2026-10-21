import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Coins, MousePointerClick, TrendingUp } from 'lucide-react';
import GameShell, { GameOverlay } from '../../components/GameShell';
import { useBestScore } from '../../hooks/useBestScore';

const SLUG = 'click-empire';
const GOAL = 25000;
const TICK_MS = 100;

interface Upgrade {
  key: string;
  name: string;
  blurb: string;
  baseCost: number;
  growth: number;
  /** Coins per second added per level. */
  income?: number;
  /** Coins per tap added per level. */
  tap?: number;
}

const UPGRADES: Upgrade[] = [
  { key: 'tap', name: 'Stronger Taps', blurb: '+1 coin per tap', baseCost: 20, growth: 1.5, tap: 1 },
  { key: 'intern', name: 'Intern', blurb: '+0.5 coins / sec', baseCost: 45, growth: 1.5, income: 0.5 },
  { key: 'stall', name: 'Market Stall', blurb: '+3 coins / sec', baseCost: 320, growth: 1.55, income: 3 },
  { key: 'workshop', name: 'Workshop', blurb: '+14 coins / sec', baseCost: 1800, growth: 1.6, income: 14 },
  { key: 'factory', name: 'Factory', blurb: '+60 coins / sec', baseCost: 9000, growth: 1.65, income: 60 }
];

const costOf = (upgrade: Upgrade, level: number) =>
  Math.floor(upgrade.baseCost * Math.pow(upgrade.growth, level));

const format = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 10_000) return `${(value / 1000).toFixed(1)}k`;
  return Math.floor(value).toLocaleString();
};

type Levels = Record<string, number>;

const emptyLevels = (): Levels => Object.fromEntries(UPGRADES.map((u) => [u.key, 0]));

export default function ClickEmpire() {
  const [coins, setCoins] = useState(0);
  const [earned, setEarned] = useState(0);
  const [levels, setLevels] = useState<Levels>(emptyLevels);
  const [taps, setTaps] = useState(0);
  const [won, setWon] = useState(false);
  const [winDismissed, setWinDismissed] = useState(false);
  const [isRecord, setIsRecord] = useState(false);
  const [pops, setPops] = useState<{ id: number; x: number; y: number; amount: number }[]>([]);
  const { best, submit } = useBestScore(SLUG);

  const popId = useRef(1);

  const tapPower = 1 + (levels.tap ?? 0) * (UPGRADES[0].tap ?? 0);
  const perSecond = UPGRADES.reduce(
    (total, upgrade) => total + (upgrade.income ?? 0) * (levels[upgrade.key] ?? 0),
    0
  );

  const restart = useCallback(() => {
    setCoins(0);
    setEarned(0);
    setLevels(emptyLevels());
    setTaps(0);
    setWon(false);
    setWinDismissed(false);
    setIsRecord(false);
    setPops([]);
  }, []);

  // Passive income ticks ten times a second so the counter feels alive rather than steppy.
  useEffect(() => {
    if (perSecond <= 0) return;
    const id = setInterval(() => {
      const amount = (perSecond * TICK_MS) / 1000;
      setCoins((c) => c + amount);
      setEarned((e) => e + amount);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [perSecond]);

  useEffect(() => {
    if (earned >= GOAL && !won) setWon(true);
  }, [earned, won]);

  // The total earned climbs ten times a second, so the record is only written on a slow cadence
  // rather than on every tick.
  const earnedRef = useRef(0);
  useEffect(() => {
    earnedRef.current = earned;
  }, [earned]);

  useEffect(() => {
    const id = setInterval(() => setIsRecord(submit(Math.floor(earnedRef.current))), 2000);
    return () => {
      clearInterval(id);
      submit(Math.floor(earnedRef.current));
    };
  }, [submit]);

  const tap = (e: ReactPointerEvent<HTMLButtonElement>) => {
    setCoins((c) => c + tapPower);
    setEarned((value) => value + tapPower);
    setTaps((t) => t + 1);

    const rect = e.currentTarget.getBoundingClientRect();
    const pop = {
      id: popId.current++,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      amount: tapPower
    };
    setPops((current) => [...current.slice(-7), pop]);
    window.setTimeout(() => setPops((current) => current.filter((p) => p.id !== pop.id)), 620);
  };

  const buy = (upgrade: Upgrade) => {
    const level = levels[upgrade.key] ?? 0;
    const cost = costOf(upgrade, level);
    if (coins < cost) return;
    setCoins((c) => c - cost);
    setLevels((current) => ({ ...current, [upgrade.key]: (current[upgrade.key] ?? 0) + 1 }));
  };

  return (
    <GameShell
      slug={SLUG}
      title="Click Empire"
      tagline="Tap to earn, buy upgrades, let the generators run themselves. A tiny idle empire in one minute."
      keywords="clicker game, idle game online, incremental game free, cookie clicker style game"
      stats={[
        { label: 'Coins', value: format(coins), accent: true },
        { label: 'Per sec', value: perSecond.toFixed(1) },
        { label: 'Per tap', value: tapPower },
        { label: 'Best', value: best !== null ? format(best) : 0 }
      ]}
      onRestart={restart}
      restartLabel="Start over"
      howTo={[
        'Tap the big coin to earn coins by hand.',
        'Spend coins on Stronger Taps to make each tap worth more.',
        'Buy interns, stalls, workshops, and factories for income that keeps coming without you.',
        `Earn ${GOAL.toLocaleString()} coins in total to complete your empire.`
      ]}
      about={
        <p>
          Every upgrade costs about 50 to 65 percent more than the last, so progress comes from
          reinvesting early rather than hoarding. The fastest runs usually buy two or three tap upgrades
          first, then switch to passive income and stop tapping altogether.
        </p>
      }
    >
      <div className="relative space-y-5">
        <div className="relative">
          <button
            onPointerDown={tap}
            className="relative w-full h-40 sm:h-48 rounded-2xl bg-mint border border-primary/20 flex flex-col items-center justify-center gap-2 active:scale-[0.99] transition-transform overflow-hidden touch-manipulation"
          >
            <Coins className="w-12 h-12 text-primary" />
            <span className="text-sm font-semibold text-primary">Tap to earn +{tapPower}</span>
            {pops.map((pop) => (
              <span
                key={pop.id}
                className="absolute text-sm font-bold text-primary-dark pointer-events-none animate-[floatUp_600ms_ease-out_forwards]"
                style={{ left: pop.x - 10, top: pop.y - 10 }}
              >
                +{pop.amount}
              </span>
            ))}
          </button>

          <div className="mt-3 h-2 rounded-full bg-[#EDF1EF] overflow-hidden">
            <div
              className="h-full bg-primary transition-[width] duration-200"
              style={{ width: `${Math.min(100, (earned / GOAL) * 100)}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-[#8B958F] font-medium">
            <span>{format(earned)} earned</span>
            <span>{GOAL.toLocaleString()} goal</span>
          </div>
        </div>

        <div className="space-y-2">
          {UPGRADES.map((upgrade) => {
            const level = levels[upgrade.key] ?? 0;
            const cost = costOf(upgrade, level);
            const affordable = coins >= cost;
            return (
              <button
                key={upgrade.key}
                onClick={() => buy(upgrade)}
                disabled={!affordable}
                className={`w-full p-3.5 rounded-xl border flex items-center gap-3 text-left transition-all ${
                  affordable
                    ? 'border-primary/30 bg-white hover:border-primary/50 hover:shadow-sm active:scale-[0.99]'
                    : 'border-black/10 bg-[#F6F8F7] opacity-70'
                }`}
              >
                <span
                  className={`w-9 h-9 shrink-0 rounded-lg border inline-flex items-center justify-center ${
                    affordable ? 'border-primary/20 bg-mint text-primary' : 'border-black/10 bg-white text-[#8B958F]'
                  }`}
                >
                  {upgrade.tap ? <MousePointerClick className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-ink">
                    {upgrade.name}
                    {level > 0 && <span className="text-[#8B958F] font-medium"> · lvl {level}</span>}
                  </span>
                  <span className="block text-xs text-[#55605B]">{upgrade.blurb}</span>
                </span>
                <span
                  className={`shrink-0 text-xs font-bold tabular-nums ${
                    affordable ? 'text-primary' : 'text-[#8B958F]'
                  }`}
                >
                  {format(cost)}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-center text-[11px] text-[#8B958F]">{taps.toLocaleString()} taps this run</p>

        <GameOverlay
          show={won && !winDismissed}
          tone="win"
          title="Empire complete!"
          subtitle={`${GOAL.toLocaleString()} coins earned in ${taps.toLocaleString()} taps. Keep going for a bigger total.`}
          actionLabel="Keep playing"
          onAction={() => setWinDismissed(true)}
          isRecord={isRecord}
        />
      </div>
    </GameShell>
  );
}
