import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import GameShell, { GameOverlay } from '../../components/GameShell';
import { useBestScore } from '../../hooks/useBestScore';

const SLUG = 'solitaire';

const SUITS = ['♠', '♥', '♦', '♣'] as const;
const RANKS = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

interface Card {
  id: string;
  rank: number; // 1 = ace … 13 = king
  suit: number; // index into SUITS
  faceUp: boolean;
}

const isRed = (suit: number) => suit === 1 || suit === 2;

type Selection =
  | { zone: 'waste' }
  | { zone: 'tableau'; pile: number; index: number }
  | null;

interface Game {
  stock: Card[];
  waste: Card[];
  foundations: Card[][];
  tableau: Card[][];
}

function freshDeal(): Game {
  const deck: Card[] = [];
  for (let suit = 0; suit < 4; suit++) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({ id: `${suit}-${rank}`, rank, suit, faceUp: false });
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  const tableau: Card[][] = [[], [], [], [], [], [], []];
  for (let pile = 0; pile < 7; pile++) {
    for (let depth = 0; depth <= pile; depth++) {
      const card = deck.pop() as Card;
      tableau[pile].push({ ...card, faceUp: depth === pile });
    }
  }

  return { stock: deck, waste: [], foundations: [[], [], [], []], tableau };
}

const clone = (game: Game): Game => ({
  stock: [...game.stock],
  waste: [...game.waste],
  foundations: game.foundations.map((pile) => [...pile]),
  tableau: game.tableau.map((pile) => pile.map((card) => ({ ...card })))
});

const canStack = (card: Card, onto: Card | undefined) =>
  onto ? isRed(card.suit) !== isRed(onto.suit) && card.rank === onto.rank - 1 : card.rank === 13;

const canPromote = (card: Card, foundation: Card[]) =>
  foundation.length === 0 ? card.rank === 1 : foundation[foundation.length - 1].rank === card.rank - 1;

export default function Solitaire() {
  const [game, setGame] = useState<Game>(freshDeal);
  const [selection, setSelection] = useState<Selection>(null);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isRecord, setIsRecord] = useState(false);
  const { best, submit } = useBestScore(SLUG, 'min');

  const foundationCount = game.foundations.reduce((total, pile) => total + pile.length, 0);
  const won = foundationCount === 52;

  const restart = useCallback(() => {
    setGame(freshDeal());
    setSelection(null);
    setMoves(0);
    setSeconds(0);
    setIsRecord(false);
  }, []);

  useEffect(() => {
    if (won) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [won]);

  useEffect(() => {
    if (won) setIsRecord(submit(moves));
  }, [won, moves, submit]);

  /** The cards a selection refers to: a single waste card, or a run from a tableau pile. */
  const selectedCards = useMemo((): Card[] => {
    if (!selection) return [];
    if (selection.zone === 'waste') {
      const top = game.waste[game.waste.length - 1];
      return top ? [top] : [];
    }
    return game.tableau[selection.pile].slice(selection.index);
  }, [selection, game]);

  /** Removes the current selection from wherever it came from, flipping a newly exposed card. */
  const withSelectionRemoved = (next: Game) => {
    if (!selection) return;
    if (selection.zone === 'waste') {
      next.waste.pop();
      return;
    }
    const pile = next.tableau[selection.pile];
    pile.splice(selection.index);
    const exposed = pile[pile.length - 1];
    if (exposed && !exposed.faceUp) exposed.faceUp = true;
  };

  const drawFromStock = () => {
    setSelection(null);
    setGame((current) => {
      const next = clone(current);
      if (next.stock.length === 0) {
        if (next.waste.length === 0) return current;
        // Recycle the waste back under the stock, face-down.
        next.stock = next.waste.reverse().map((card) => ({ ...card, faceUp: false }));
        next.waste = [];
      } else {
        const card = next.stock.pop() as Card;
        next.waste.push({ ...card, faceUp: true });
      }
      return next;
    });
    setMoves((m) => m + 1);
  };

  const sendToFoundation = (cards: Card[]) => {
    if (cards.length !== 1) return false;
    const card = cards[0];
    const target = game.foundations.findIndex((pile) => canPromote(card, pile));
    if (target === -1) return false;

    const next = clone(game);
    withSelectionRemoved(next);
    next.foundations[target].push({ ...card, faceUp: true });
    setGame(next);
    setSelection(null);
    setMoves((m) => m + 1);
    return true;
  };

  const tapFoundation = (index: number) => {
    if (selectedCards.length !== 1) return;
    const card = selectedCards[0];
    if (!canPromote(card, game.foundations[index])) return;
    const next = clone(game);
    withSelectionRemoved(next);
    next.foundations[index].push({ ...card, faceUp: true });
    setGame(next);
    setSelection(null);
    setMoves((m) => m + 1);
  };

  const tapTableau = (pile: number, cardIndex: number | null) => {
    const destination = game.tableau[pile];
    const topCard = destination[destination.length - 1];

    // Nothing held yet: pick up a face-up card and everything stacked on it.
    if (!selection) {
      if (cardIndex === null) return;
      if (!destination[cardIndex]?.faceUp) return;
      setSelection({ zone: 'tableau', pile, index: cardIndex });
      return;
    }

    // Tapping the held card again tries the foundations, then drops the selection.
    const tappingSelf =
      selection.zone === 'tableau' && selection.pile === pile && selection.index === cardIndex;
    if (tappingSelf) {
      if (!sendToFoundation(selectedCards)) setSelection(null);
      return;
    }

    const moving = selectedCards;
    if (moving.length && canStack(moving[0], topCard)) {
      const next = clone(game);
      withSelectionRemoved(next);
      next.tableau[pile].push(...moving.map((card) => ({ ...card, faceUp: true })));
      setGame(next);
      setSelection(null);
      setMoves((m) => m + 1);
      return;
    }

    // Not a legal landing spot — treat the tap as picking up from this pile instead.
    if (cardIndex !== null && destination[cardIndex]?.faceUp) {
      setSelection({ zone: 'tableau', pile, index: cardIndex });
    } else {
      setSelection(null);
    }
  };

  const tapWaste = () => {
    if (!game.waste.length) return;
    if (selection?.zone === 'waste') {
      if (!sendToFoundation(selectedCards)) setSelection(null);
      return;
    }
    setSelection({ zone: 'waste' });
  };

  const isSelected = (pile: number, index: number) =>
    selection?.zone === 'tableau' && selection.pile === pile && index >= selection.index;

  return (
    <GameShell
      slug={SLUG}
      title="Solitaire"
      tagline="Klondike solitaire with tap-to-move controls built for a phone. Clear all four foundations to win."
      keywords="solitaire online, klondike solitaire free, play solitaire browser, mobile solitaire game"
      stats={[
        { label: 'Moves', value: moves, accent: true },
        { label: 'Best', value: best ?? '—' },
        { label: 'Home', value: `${foundationCount}/52` },
        { label: 'Time', value: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` }
      ]}
      onRestart={restart}
      restartLabel="New deal"
      howTo={[
        'Tap the deck to turn a card. When it is empty, tap it again to recycle the pile.',
        'Tap a card to pick it up — everything stacked on top comes with it.',
        'Tap where you want it: a column with the next card down in the other colour, or an empty column for a King.',
        'Tap a held card a second time to send it straight home to its suit pile.'
      ]}
      about={
        <>
          <p>
            This is standard Klondike, turning one card at a time with unlimited passes through the deck.
            Controls are tap-to-move rather than drag, which is far more reliable on a touch screen and
            works identically with a mouse.
          </p>
          <p>
            Build the four suit piles from ace to king to win. Aces go up as soon as you find them;
            holding a low card back to keep a column open is usually the better play.
          </p>
        </>
      }
    >
      <div className="relative select-none">
        {/* top row: stock, waste, foundations */}
        <div className="flex gap-1.5 sm:gap-2 mb-4">
          <button
            onClick={drawFromStock}
            className="w-[13%] aspect-[2/3] rounded-lg border border-black/10 bg-[#F6F8F7] flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Deck"
          >
            {game.stock.length ? (
              <span className="w-full h-full rounded-lg bg-primary/90 border-2 border-white/40 flex items-center justify-center text-white text-[10px] font-bold">
                {game.stock.length}
              </span>
            ) : (
              <RefreshCw className="w-4 h-4 text-[#8B958F]" />
            )}
          </button>

          <button
            onClick={tapWaste}
            className={`w-[13%] aspect-[2/3] rounded-lg border flex items-center justify-center transition-all ${
              selection?.zone === 'waste'
                ? 'border-primary ring-2 ring-primary/30 bg-white'
                : 'border-black/10 bg-[#F6F8F7]'
            }`}
            aria-label="Turned card"
          >
            {game.waste.length ? <CardFace card={game.waste[game.waste.length - 1]} /> : null}
          </button>

          <span className="flex-1" />

          {game.foundations.map((pile, index) => (
            <button
              key={index}
              onClick={() => tapFoundation(index)}
              className="w-[13%] aspect-[2/3] rounded-lg border border-black/10 bg-mint/60 flex items-center justify-center"
              aria-label={`${SUITS[index]} foundation`}
            >
              {pile.length ? (
                <CardFace card={pile[pile.length - 1]} />
              ) : (
                <span className={`text-lg ${isRed(index) ? 'text-[#D06A6A]' : 'text-[#9AA5A0]'}`}>
                  {SUITS[index]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* tableau */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {game.tableau.map((pile, pileIndex) => (
            <div
              key={pileIndex}
              onClick={() => {
                if (pile.length === 0) tapTableau(pileIndex, null);
              }}
              className="relative"
              style={{ minHeight: `${Math.max(90, 56 + pile.length * 17)}px` }}
            >
              {pile.length === 0 && (
                <div className="absolute inset-x-0 top-0 aspect-[2/3] rounded-lg border border-dashed border-black/15 bg-[#F6F8F7]" />
              )}
              {pile.map((card, cardIndex) => (
                <button
                  key={card.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    tapTableau(pileIndex, cardIndex);
                  }}
                  className={`absolute inset-x-0 aspect-[2/3] rounded-lg border transition-all ${
                    card.faceUp
                      ? isSelected(pileIndex, cardIndex)
                        ? 'border-primary ring-2 ring-primary/30 bg-white z-10'
                        : 'border-black/10 bg-white'
                      : 'border-white/40 bg-primary/90'
                  }`}
                  style={{ top: `${cardIndex * 17}px` }}
                >
                  {card.faceUp && <CardFace card={card} />}
                </button>
              ))}
            </div>
          ))}
        </div>

        <GameOverlay
          show={won}
          tone="win"
          title="Game won!"
          subtitle={`All 52 cards home in ${moves} moves.`}
          actionLabel="New deal"
          onAction={restart}
          isRecord={isRecord}
        />
      </div>
    </GameShell>
  );
}

function CardFace({ card }: { card: Card }) {
  return (
    <span
      className={`flex flex-col items-center justify-center leading-none w-full h-full ${
        isRed(card.suit) ? 'text-[#B91C1C]' : 'text-ink'
      }`}
    >
      <span className="text-[11px] sm:text-sm font-bold">{RANKS[card.rank]}</span>
      <span className="text-[11px] sm:text-sm">{SUITS[card.suit]}</span>
    </span>
  );
}
