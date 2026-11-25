import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Eraser, Lightbulb, Undo2 } from 'lucide-react';
import GameShell from '../../components/GameShell';
import { DailyDone, ModeSwitch, SolvedPanel, ToolButton } from '../../components/PuzzleBits';
import { audio } from '../../lib/gameAudio';
import {
  OP_GLYPH,
  canonCross,
  checkEquation,
  effectiveLevel,
  generateCross,
  type CrossPuzzle,
  type Op
} from '../../lib/reverseMath';
import type { PuzzleHistory } from '../../lib/puzzleHistory';
import { starsFor, usePuzzleRun } from '../../lib/usePuzzleRun';

const SLUG = 'math-crossword';

const makeLevel = (h: PuzzleHistory, level: number) =>
  h.next(`L${level}`, (seed, a) => generateCross(seed, effectiveLevel(level, a, seed)), canonCross);
const makeDaily = (h: PuzzleHistory, date: string) =>
  h.next(`daily-${date}`, (seed) => generateCross(seed, 30), canonCross, true);

/** blank key -> tray index */
type Fill = Record<string, number | undefined>;

function Board({ puzzle, onSolved }: { puzzle: CrossPuzzle; onSolved: (slips: number) => void }) {
  const [fill, setFill] = useState<Fill>({});
  const [past, setPast] = useState<Fill[]>([]);
  const [sel, setSel] = useState<string>(puzzle.blanks[0]);
  const [locked, setLocked] = useState<Set<string>>(() => new Set());
  const [slips, setSlips] = useState(0);
  const [done, setDone] = useState(false);
  const typed = useRef({ text: '', at: 0 });
  const wrongSeen = useRef(new Set<string>());

  const usedTray = new Set(Object.values(fill).filter((v): v is number => v !== undefined));
  const valueAt = useCallback(
    (k: string): number | null => {
      const c = puzzle.cells[k];
      if (c.kind !== 'num') return null;
      if (!c.blank) return c.value;
      const t = fill[k];
      return t === undefined ? null : puzzle.tray[t];
    },
    [puzzle, fill]
  );

  // Status per equation: true (correct), false (complete but wrong), null (not complete).
  const status = useMemo(
    () => puzzle.equations.map((e) => checkEquation([0, 2, 4].map((i) => valueAt(e.cells[i])), (puzzle.cells[e.cells[1]] as { op: Op }).op)),
    [puzzle, valueAt]
  );
  const cellState = useMemo(() => {
    const m: Record<string, 'ok' | 'bad' | undefined> = {};
    puzzle.equations.forEach((e, i) => {
      for (const k of e.cells) {
        if (status[i] === false) m[k] = 'bad';
        else if (status[i] === true && m[k] !== 'bad') m[k] = 'ok';
      }
    });
    return m;
  }, [puzzle, status]);

  useEffect(() => {
    if (done) return;
    // A wrong, complete equation costs a star once (per distinct wrong fill), like a checked answer.
    puzzle.equations.forEach((e, i) => {
      if (status[i] !== false) return;
      const sig = `${i}:${e.cells.map((k) => valueAt(k)).join(',')}`;
      if (!wrongSeen.current.has(sig)) {
        wrongSeen.current.add(sig);
        setSlips((s) => s + 1);
        audio.play('crash');
      }
    });
    if (status.every((s) => s === true)) {
      setDone(true);
      audio.play('win');
      onSolved(slips);
    }
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const commit = (next: Fill) => {
    setPast((p) => [...p, fill]);
    setFill(next);
  };

  const nextBlank = (from: string, next: Fill) => {
    const i = puzzle.blanks.indexOf(from);
    const order = [...puzzle.blanks.slice(i + 1), ...puzzle.blanks.slice(0, i)];
    return order.find((k) => next[k] === undefined) ?? from;
  };

  const placeTile = (t: number) => {
    if (done || usedTray.has(t)) return;
    let k = sel;
    if (locked.has(k) || fill[k] !== undefined) k = puzzle.blanks.find((b) => fill[b] === undefined) ?? k;
    if (locked.has(k) || fill[k] !== undefined) return;
    const next = { ...fill, [k]: t };
    commit(next);
    audio.play('move');
    setSel(nextBlank(k, next));
  };

  const tapCell = (k: string) => {
    if (done) return;
    if (!puzzle.blanks.includes(k)) return;
    if (sel === k && fill[k] !== undefined && !locked.has(k)) {
      const next = { ...fill };
      delete next[k];
      commit(next);
      audio.play('ui');
      return;
    }
    setSel(k);
    audio.play('ui');
  };

  const clearSel = () => {
    if (done || fill[sel] === undefined || locked.has(sel)) return;
    const next = { ...fill };
    delete next[sel];
    commit(next);
  };

  const undo = () => {
    if (done || past.length === 0) return;
    const prev = { ...past[past.length - 1] };
    for (const k of locked) prev[k] = fill[k];
    setPast((p) => p.slice(0, -1));
    setFill(prev);
    audio.play('ui');
  };

  const hint = () => {
    if (done) return;
    // Fix the selected blank if it is empty or wrong, otherwise the first wrong or empty one.
    const isRight = (k: string) => valueAt(k) === (puzzle.cells[k] as { value: number }).value;
    const k = !locked.has(sel) && !isRight(sel) ? sel : puzzle.blanks.find((b) => !locked.has(b) && !isRight(b));
    if (!k) return;
    const want = (puzzle.cells[k] as { value: number }).value;
    const next = { ...fill };
    delete next[k];
    // Take a free tile with the right value, or pull it from another unlocked blank.
    let t = puzzle.tray.findIndex((v, i) => v === want && !Object.values(next).includes(i));
    if (t < 0) {
      const holder = puzzle.blanks.find((b) => !locked.has(b) && next[b] !== undefined && puzzle.tray[next[b]!] === want);
      if (!holder) return;
      t = next[holder]!;
      delete next[holder];
    }
    next[k] = t;
    setLocked(new Set([...locked, k]));
    setSlips((s) => s + 1);
    commit(next);
    audio.play('bonus');
    setSel(nextBlank(k, next));
  };

  const moveSel = (dr: number, dc: number) => {
    const [r, c] = sel.split(',').map(Number);
    let best: string | null = null;
    let bestD = Infinity;
    for (const b of puzzle.blanks) {
      const [br, bc] = b.split(',').map(Number);
      const along = dr ? (br - r) * dr : (bc - c) * dc;
      if (along <= 0) continue;
      const d = along * 10 + Math.abs(dr ? bc - c : br - r) * 7;
      if (d < bestD) {
        bestD = d;
        best = b;
      }
    }
    if (best) setSel(best);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^[0-9]$/.test(e.key)) {
        const now = Date.now();
        const text = now - typed.current.at < 700 ? typed.current.text + e.key : e.key;
        typed.current = { text, at: now };
        const free = (v: number) => puzzle.tray.findIndex((x, i) => x === v && !usedTray.has(i));
        const exact = free(Number(text));
        const longer = puzzle.tray.some((x, i) => !usedTray.has(i) && String(x).startsWith(text) && String(x) !== text);
        if (exact >= 0 && !longer) {
          typed.current.text = '';
          placeTile(exact);
        } else if (exact >= 0) {
          const snap = text;
          setTimeout(() => {
            if (typed.current.text === snap) {
              typed.current.text = '';
              placeTile(exact);
            }
          }, 700);
        }
        e.preventDefault();
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        if (fill[sel] !== undefined && !locked.has(sel)) clearSel();
        else undo();
        e.preventDefault();
      } else if (e.key === 'ArrowUp') { moveSel(-1, 0); e.preventDefault(); }
      else if (e.key === 'ArrowDown') { moveSel(1, 0); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { moveSel(0, -1); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { moveSel(0, 1); e.preventDefault(); }
      else if (e.key.toLowerCase() === 'h') hint();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const selEqs = new Set(puzzle.equations.filter((e) => e.cells.includes(sel)).flatMap((e) => e.cells));

  return (
    <div className="relative select-none">
      {/* Graph-paper board. */}
      <div
        className="mx-auto grid gap-[3px] p-2 rounded-xl"
        style={{
          gridTemplateColumns: `repeat(${puzzle.cols}, minmax(0, 1fr))`,
          maxWidth: `${puzzle.cols * 3.25}rem`,
          backgroundImage:
            'linear-gradient(rgba(14,157,82,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(14,157,82,0.07) 1px, transparent 1px)',
          backgroundSize: '12px 12px'
        }}
      >
        {Array.from({ length: puzzle.rows * puzzle.cols }, (_, i) => {
          const k = `${Math.floor(i / puzzle.cols)},${i % puzzle.cols}`;
          const cell = puzzle.cells[k];
          if (!cell) return <div key={k} className="aspect-square" />;
          const st = cellState[k];
          const hl = !done && selEqs.has(k);
          const base = 'aspect-square rounded-md flex items-center justify-center font-bold tabular-nums leading-none';
          const size = puzzle.cols >= 9 ? 'text-[13px] sm:text-lg' : 'text-base sm:text-xl';
          const mono = 'font-mono';
          if (cell.kind === 'op' || cell.kind === 'eq') {
            return (
              <div key={k} className={`${base} ${size} font-sans ${hl ? 'text-ink' : 'text-[#8B958F]'}`}>
                {cell.kind === 'op' ? OP_GLYPH[cell.op] : '='}
              </div>
            );
          }
          if (!cell.blank) {
            return (
              <div
                key={k}
                className={`${base} ${size} ${mono} border ${st === 'ok' ? 'bg-mint border-primary/30 text-primary' : st === 'bad' ? 'bg-[#FDE2E2] border-[#F3B4B4] text-[#B91C1C]' : hl ? 'bg-[#EEF2F0] border-black/10 text-ink' : 'bg-[#F6F8F7] border-black/[0.08] text-ink'}`}
              >
                {cell.value}
              </div>
            );
          }
          const v = valueAt(k);
          const isSel = !done && sel === k;
          return (
            <button
              key={k}
              onClick={() => tapCell(k)}
              aria-label={v === null ? `Blank at row ${k.split(',')[0]}` : `Placed ${v}${locked.has(k) ? ' (hint)' : ''}`}
              className={`${base} ${size} ${mono} transition-colors
                ${isSel ? 'ring-2 ring-primary ring-offset-1' : ''}
                ${v === null ? `border-2 border-dashed ${isSel ? 'border-primary bg-mint' : 'border-primary/35 bg-white'}` : locked.has(k) ? 'border-2 border-[#E0A12A] bg-[#FFF6E0] text-[#8A5A00]' : st === 'bad' ? 'border-2 border-[#E46A6A] bg-[#FDE2E2] text-[#B91C1C]' : st === 'ok' ? 'border-2 border-primary bg-primary text-white' : 'border-2 border-ink/70 bg-white text-ink'}`}
            >
              {v ?? ''}
            </button>
          );
        })}
      </div>

      {/* Tray. */}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {puzzle.tray.map((v, i) => {
          const used = usedTray.has(i);
          return (
            <button
              key={i}
              onClick={() => placeTile(i)}
              disabled={used || done}
              aria-label={`Tile ${v}`}
              className={`min-w-11 h-11 px-2 rounded-xl font-mono text-lg font-bold tabular-nums transition-all
                ${used ? 'bg-[#F1F4F2] text-black/20 translate-y-[2px]' : 'bg-white text-ink border border-black/15 shadow-[0_2px_0_0_rgba(16,19,18,0.25)] hover:text-primary hover:border-primary/50 active:translate-y-[2px] active:shadow-none'}`}
            >
              {v}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <ToolButton onClick={undo} disabled={past.length === 0 || done} label="Undo" icon={<Undo2 className="w-4 h-4" />} />
        <ToolButton onClick={clearSel} disabled={done || fill[sel] === undefined || locked.has(sel)} label="Clear" kbd="Backspace" icon={<Eraser className="w-4 h-4" />} />
        <ToolButton onClick={hint} disabled={done} label="Hint" kbd="H" icon={<Lightbulb className="w-4 h-4" />} />
      </div>
    </div>
  );
}

export default function MathCrossword() {
  const run = usePuzzleRun<CrossPuzzle>(SLUG, makeLevel, makeDaily);
  const [result, setResult] = useState<{ stars: number } | null>(null);
  const [boardKey, setBoardKey] = useState(run.boardKey);
  if (boardKey !== run.boardKey) {
    setBoardKey(run.boardKey);
    setResult(null);
  }
  const onSolved = useCallback(
    (slips: number) => {
      const stars = starsFor(slips);
      run.complete(stars);
      setResult({ stars });
    },
    [run]
  );

  return (
    <GameShell
      slug={SLUG}
      title="Math Crossword"
      tagline="A crossword made of sums. Fill the blanks from the number tray so every equation, across and down, is true."
      keywords="math crossword, cross math puzzle, crossmath online, number crossword, math puzzle game free, daily math crossword"
      sound
      stats={[
        { label: 'Level', value: run.level, accent: true },
        { label: 'Stars', value: run.totalStars },
        { label: 'Streak', value: run.streak }
      ]}
      onRestart={run.restart}
      restartLabel="Clear"
      howTo={[
        'Each line of the grid, across or down, is an equation like 6 × 4 = 24. Some numbers are missing.',
        'Tap a dashed blank, then tap a number from the tray to drop it in. Tap a filled blank twice to take it back.',
        'An equation turns green when it is right and red when it is complete but wrong. Numbers shared by two lines must fit both.',
        'Every tray number is used exactly once. A hint fills one blank. Keyboard: arrows to move, type a number, Backspace, H.'
      ]}
      about={
        <>
          <p>
            Math Crossword turns arithmetic into a crossword: the crossings are the trick, because a number has to make
            two equations true at once. Easy grids have three short sums with plus and minus; harder grids interlock up
            to seven equations with all four operations and most numbers blanked out.
          </p>
          <p>
            Each grid is built from real equations in your browser and a solver checks that the tray can fill it before
            you see it. Any arrangement that makes every equation true is accepted. Your device keeps a record of the
            grids it has dealt you, so no grid repeats.
          </p>
        </>
      }
    >
      <div className="relative">
        <ModeSwitch mode={run.mode} onMode={run.setMode} level={run.level} tier={run.puzzle.tier} dailyDone={run.dailyDone} />
        <div className="mt-4">
          {run.mode === 'daily' && run.dailyDone && !result ? (
            <DailyDone streak={run.streak} onLevels={() => run.setMode('levels')} />
          ) : (
            <Board key={run.boardKey} puzzle={run.puzzle} onSolved={onSolved} />
          )}
        </div>
        <SolvedPanel
          show={!!result}
          title={run.mode === 'daily' ? 'Daily grid solved' : `Level ${run.level} solved`}
          stars={result?.stars}
          detail={run.mode === 'daily' ? `Streak: ${run.streak} day${run.streak === 1 ? '' : 's'}.` : 'The next grid has more crossings.'}
          primaryLabel={run.mode === 'daily' ? 'Play levels' : 'Next level'}
          onPrimary={() => {
            setResult(null);
            if (run.mode === 'daily') run.setMode('levels');
            else run.nextLevel();
          }}
        />
      </div>
    </GameShell>
  );
}
