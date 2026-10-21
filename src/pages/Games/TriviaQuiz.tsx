import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import GameShell, { GameOverlay } from '../../components/GameShell';
import { useBestScore } from '../../hooks/useBestScore';

const SLUG = 'trivia-quiz';
const QUESTION_COUNT = 10;
const SECONDS_PER_QUESTION = 15;

interface Question {
  q: string;
  options: string[];
  /** Index into `options`. */
  answer: number;
  topic: string;
}

const POOL: Question[] = [
  { q: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Transfer Machine Language', 'Hyperlink Text Mode Layout', 'Home Tool Markup Language'], answer: 0, topic: 'Tech' },
  { q: 'Which company developed the Python language?', options: ['Google', 'Nobody — it was one developer', 'Microsoft', 'Sun Microsystems'], answer: 1, topic: 'Tech' },
  { q: 'What does CSS primarily control?', options: ['Page behaviour', 'Server routing', 'Presentation and layout', 'Database schema'], answer: 2, topic: 'Tech' },
  { q: 'How many bits are in a byte?', options: ['4', '8', '16', '32'], answer: 1, topic: 'Tech' },
  { q: 'What does "HTTP 404" mean?', options: ['Server error', 'Unauthorised', 'Not found', 'Redirect'], answer: 2, topic: 'Tech' },
  { q: 'Which of these is a JavaScript runtime?', options: ['Node.js', 'Django', 'Laravel', 'Rails'], answer: 0, topic: 'Tech' },
  { q: 'What is the largest planet in our solar system?', options: ['Saturn', 'Neptune', 'Jupiter', 'Earth'], answer: 2, topic: 'Science' },
  { q: 'What gas do plants mainly absorb for photosynthesis?', options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'], answer: 1, topic: 'Science' },
  { q: 'How many bones are in the adult human body?', options: ['186', '206', '226', '246'], answer: 1, topic: 'Science' },
  { q: 'What is the chemical symbol for gold?', options: ['Go', 'Gd', 'Au', 'Ag'], answer: 2, topic: 'Science' },
  { q: 'What is the speed of light, roughly?', options: ['300,000 km/s', '30,000 km/s', '3,000,000 km/s', '3,000 km/s'], answer: 0, topic: 'Science' },
  { q: 'Which blood type is known as the universal donor?', options: ['AB positive', 'O negative', 'A positive', 'B negative'], answer: 1, topic: 'Science' },
  { q: 'Which country has the most time zones?', options: ['Russia', 'United States', 'France', 'China'], answer: 2, topic: 'Geography' },
  { q: 'What is the longest river in the world?', options: ['Amazon', 'Yangtze', 'Mississippi', 'Nile'], answer: 3, topic: 'Geography' },
  { q: 'Mount Everest sits on the border of Nepal and which country?', options: ['India', 'China', 'Bhutan', 'Pakistan'], answer: 1, topic: 'Geography' },
  { q: 'Which is the largest ocean?', options: ['Atlantic', 'Indian', 'Pacific', 'Arctic'], answer: 2, topic: 'Geography' },
  { q: 'What is the capital of Australia?', options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'], answer: 2, topic: 'Geography' },
  { q: 'Which desert is the largest hot desert on Earth?', options: ['Gobi', 'Sahara', 'Kalahari', 'Mojave'], answer: 1, topic: 'Geography' },
  { q: 'Who painted the Mona Lisa?', options: ['Michelangelo', 'Raphael', 'Leonardo da Vinci', 'Donatello'], answer: 2, topic: 'Culture' },
  { q: 'How many strings does a standard violin have?', options: ['4', '5', '6', '7'], answer: 0, topic: 'Culture' },
  { q: 'Which planet is named after the Roman god of war?', options: ['Venus', 'Mars', 'Mercury', 'Jupiter'], answer: 1, topic: 'Culture' },
  { q: 'In chess, which piece can only move diagonally?', options: ['Rook', 'Knight', 'Bishop', 'Queen'], answer: 2, topic: 'Culture' },
  { q: 'How many players are on a football (soccer) team on the pitch?', options: ['9', '10', '11', '12'], answer: 2, topic: 'Sport' },
  { q: 'Every how many years are the Summer Olympics normally held?', options: ['2', '3', '4', '5'], answer: 2, topic: 'Sport' },
  { q: 'In cricket, how many balls are in a standard over?', options: ['4', '6', '8', '10'], answer: 1, topic: 'Sport' },
  { q: 'What is the maximum break in a single frame of snooker?', options: ['147', '150', '140', '155'], answer: 0, topic: 'Sport' },
  { q: 'Which keyboard shortcut copies on Windows?', options: ['Ctrl + V', 'Ctrl + X', 'Ctrl + C', 'Ctrl + Z'], answer: 2, topic: 'Tech' },
  { q: 'What does "GPU" stand for?', options: ['General Processing Unit', 'Graphics Processing Unit', 'Graphical Pixel Unit', 'Grid Power Unit'], answer: 1, topic: 'Tech' },
  { q: 'Roughly how many hearts does an octopus have?', options: ['1', '2', '3', '4'], answer: 2, topic: 'Science' },
  { q: 'Which metal is liquid at room temperature?', options: ['Mercury', 'Lead', 'Tin', 'Zinc'], answer: 0, topic: 'Science' }
];

const shuffle = <T,>(list: T[]) => {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const pickQuestions = () => shuffle(POOL).slice(0, QUESTION_COUNT);

export default function TriviaQuiz() {
  const [questions, setQuestions] = useState<Question[]>(pickQuestions);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(SECONDS_PER_QUESTION);
  const [done, setDone] = useState(false);
  const [isRecord, setIsRecord] = useState(false);
  const { best, submit } = useBestScore(SLUG);

  const timers = useRef<number[]>([]);
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => () => clearTimers(), []);

  const question = questions[index];
  const locked = chosen !== null;

  const restart = useCallback(() => {
    clearTimers();
    setQuestions(pickQuestions());
    setIndex(0);
    setScore(0);
    setCorrect(0);
    setChosen(null);
    setSecondsLeft(SECONDS_PER_QUESTION);
    setDone(false);
    setIsRecord(false);
  }, []);

  const advance = useCallback(() => {
    setChosen(null);
    setSecondsLeft(SECONDS_PER_QUESTION);
    // The last answer ends the quiz instead of advancing past the final question.
    if (index + 1 >= QUESTION_COUNT) setDone(true);
    else setIndex(index + 1);
  }, [index]);

  const answer = useCallback(
    (option: number | null) => {
      if (locked || done) return;
      setChosen(option ?? -1);
      if (option === question.answer) {
        // Answer fast for a bonus: 100 points plus up to 50 for the time left.
        setScore((s) => s + 100 + Math.round((secondsLeft / SECONDS_PER_QUESTION) * 50));
        setCorrect((c) => c + 1);
      }
      timers.current.push(window.setTimeout(advance, 900));
    },
    [locked, done, question, secondsLeft, advance]
  );

  // Per-question countdown; running out counts as a wrong answer.
  useEffect(() => {
    if (done || locked) return;
    if (secondsLeft === 0) {
      answer(null);
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft, done, locked, answer]);

  useEffect(() => {
    if (done) setIsRecord(submit(score));
  }, [done, score, submit]);

  const progress = useMemo(() => ((index + (locked ? 1 : 0)) / QUESTION_COUNT) * 100, [index, locked]);

  return (
    <GameShell
      slug={SLUG}
      title="Trivia Quiz"
      tagline="Ten quick-fire questions across tech, science, and pop culture. Answer fast for bonus points."
      keywords="trivia quiz online, general knowledge quiz free, quick quiz game, tech trivia questions"
      stats={[
        { label: 'Score', value: score, accent: true },
        { label: 'Best', value: best ?? 0 },
        { label: 'Correct', value: `${correct}/${QUESTION_COUNT}` },
        { label: 'Time', value: `${secondsLeft}s` }
      ]}
      onRestart={restart}
      restartLabel="New quiz"
      howTo={[
        'Read the question and tap one of the four answers.',
        'You have fifteen seconds per question — running out counts as wrong.',
        'A correct answer is worth 100 points, plus up to 50 more for answering quickly.',
        'Ten questions per quiz, drawn at random from a pool of thirty.'
      ]}
      about={
        <p>
          Questions are shuffled from a pool of thirty across tech, science, geography, culture, and
          sport, so no two quizzes look the same. A perfect run answered instantly would be 1,500
          points; anything over 1,000 is a strong round.
        </p>
      }
    >
      <div className="relative">
        <div className="space-y-5">
          <div className="h-1.5 rounded-full bg-[#EDF1EF] overflow-hidden">
            <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} />
          </div>

          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="px-2.5 py-1 rounded-full bg-mint border border-primary/20 text-primary">
              {question.topic}
            </span>
            <span className="text-[#8B958F]">
              Question {Math.min(index + 1, QUESTION_COUNT)} of {QUESTION_COUNT}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-semibold text-ink leading-snug">{question.q}</h2>

          <div className="space-y-2">
            {question.options.map((option, optionIndex) => {
              const isAnswer = optionIndex === question.answer;
              const isChosen = chosen === optionIndex;
              return (
                <button
                  key={optionIndex}
                  onClick={() => answer(optionIndex)}
                  disabled={locked}
                  className={`w-full p-3.5 rounded-xl border text-left text-sm font-medium flex items-center gap-3 transition-all ${
                    locked && isAnswer
                      ? 'border-primary bg-mint text-ink'
                      : locked && isChosen
                      ? 'border-[#F0A9A9] bg-[#FDE2E2] text-[#B91C1C]'
                      : locked
                      ? 'border-black/10 bg-white text-[#8B958F]'
                      : 'border-black/10 bg-white text-ink hover:border-primary/40 hover:bg-mint/40 active:scale-[0.99]'
                  }`}
                >
                  <span className="shrink-0 w-6 h-6 rounded-md border border-black/10 inline-flex items-center justify-center text-[11px] font-bold">
                    {locked && isAnswer ? (
                      <Check className="w-3.5 h-3.5 text-primary" />
                    ) : locked && isChosen ? (
                      <X className="w-3.5 h-3.5 text-[#B91C1C]" />
                    ) : (
                      String.fromCharCode(65 + optionIndex)
                    )}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <GameOverlay
          show={done}
          tone={correct >= 7 ? 'win' : 'neutral'}
          title={`${correct} out of ${QUESTION_COUNT}`}
          subtitle={`${score} points. ${
            correct === QUESTION_COUNT
              ? 'A perfect round.'
              : correct >= 7
              ? 'Strong general knowledge.'
              : 'Another go will push that up.'
          }`}
          actionLabel="New quiz"
          onAction={restart}
          isRecord={isRecord}
        />
      </div>
    </GameShell>
  );
}
