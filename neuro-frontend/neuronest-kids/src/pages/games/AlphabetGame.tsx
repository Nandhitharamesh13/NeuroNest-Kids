import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mascot } from '@/components/Mascot';
import { GameFinishScreen } from '@/components/GameFinishScreen';
import { ArrowLeft, Star, Clock, Trophy, Brain, Zap, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameStats } from '@/hooks/useGameStats';
import { useAdaptiveAI } from '@/hooks/useAdaptiveAI';
import { AdaptiveAIFeedback } from '@/components/AdaptiveAIFeedback';
import { useAdaptiveDifficulty } from '@/hooks/useAdaptiveDifficulty';
import { useParentAlertsContext } from '@/contexts/ParentAlertsContext';
import { useRewardSystem } from '@/hooks/useRewardSystem';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useSoundEffects } from '@/hooks/useSoundEffects';

const TOTAL_ROUNDS = 10;

// ── Expanded Alphabet Word Bank (130+ entries, 5+ per letter) ─────────────────
const ALPHABET_BANK: { letter: string; word: string; emoji: string }[] = [
  { letter: 'A', word: 'Apple', emoji: '🍎' },
  { letter: 'A', word: 'Ant', emoji: '🐜' },
  { letter: 'A', word: 'Arrow', emoji: '🏹' },
  { letter: 'A', word: 'Axe', emoji: '🪓' },
  { letter: 'A', word: 'Alligator', emoji: '🐊' },
  { letter: 'A', word: 'Anchor', emoji: '⚓' },
  { letter: 'B', word: 'Ball', emoji: '⚽' },
  { letter: 'B', word: 'Bear', emoji: '🐻' },
  { letter: 'B', word: 'Boat', emoji: '⛵' },
  { letter: 'B', word: 'Butterfly', emoji: '🦋' },
  { letter: 'B', word: 'Banana', emoji: '🍌' },
  { letter: 'B', word: 'Bell', emoji: '🔔' },
  { letter: 'C', word: 'Cat', emoji: '🐱' },
  { letter: 'C', word: 'Car', emoji: '🚗' },
  { letter: 'C', word: 'Cloud', emoji: '☁️' },
  { letter: 'C', word: 'Crown', emoji: '👑' },
  { letter: 'C', word: 'Crab', emoji: '🦀' },
  { letter: 'C', word: 'Castle', emoji: '🏰' },
  { letter: 'D', word: 'Dog', emoji: '🐶' },
  { letter: 'D', word: 'Duck', emoji: '🦆' },
  { letter: 'D', word: 'Drum', emoji: '🥁' },
  { letter: 'D', word: 'Diamond', emoji: '💎' },
  { letter: 'D', word: 'Dragon', emoji: '🐉' },
  { letter: 'D', word: 'Dolphin', emoji: '🐬' },
  { letter: 'E', word: 'Elephant', emoji: '🐘' },
  { letter: 'E', word: 'Egg', emoji: '🥚' },
  { letter: 'E', word: 'Eagle', emoji: '🦅' },
  { letter: 'E', word: 'Earth', emoji: '🌍' },
  { letter: 'E', word: 'Eye', emoji: '👁️' },
  { letter: 'F', word: 'Fish', emoji: '🐟' },
  { letter: 'F', word: 'Frog', emoji: '🐸' },
  { letter: 'F', word: 'Fire', emoji: '🔥' },
  { letter: 'F', word: 'Flower', emoji: '🌸' },
  { letter: 'F', word: 'Fox', emoji: '🦊' },
  { letter: 'F', word: 'Flag', emoji: '🚩' },
  { letter: 'G', word: 'Grapes', emoji: '🍇' },
  { letter: 'G', word: 'Goat', emoji: '🐐' },
  { letter: 'G', word: 'Ghost', emoji: '👻' },
  { letter: 'G', word: 'Guitar', emoji: '🎸' },
  { letter: 'G', word: 'Gorilla', emoji: '🦍' },
  { letter: 'G', word: 'Gift', emoji: '🎁' },
  { letter: 'H', word: 'House', emoji: '🏠' },
  { letter: 'H', word: 'Hat', emoji: '🎩' },
  { letter: 'H', word: 'Heart', emoji: '❤️' },
  { letter: 'H', word: 'Horse', emoji: '🐴' },
  { letter: 'H', word: 'Hammer', emoji: '🔨' },
  { letter: 'H', word: 'Hippo', emoji: '🦛' },
  { letter: 'I', word: 'Ice cream', emoji: '🍦' },
  { letter: 'I', word: 'Island', emoji: '🏝️' },
  { letter: 'I', word: 'Igloo', emoji: '🏔️' },
  { letter: 'I', word: 'Ink', emoji: '🖊️' },
  { letter: 'J', word: 'Juice', emoji: '🧃' },
  { letter: 'J', word: 'Jellyfish', emoji: '🪼' },
  { letter: 'J', word: 'Jar', emoji: '🫙' },
  { letter: 'J', word: 'Jelly', emoji: '🍮' },
  { letter: 'J', word: 'Jet', emoji: '✈️' },
  { letter: 'K', word: 'Kite', emoji: '🪁' },
  { letter: 'K', word: 'King', emoji: '🤴' },
  { letter: 'K', word: 'Kangaroo', emoji: '🦘' },
  { letter: 'K', word: 'Key', emoji: '🔑' },
  { letter: 'K', word: 'Kettle', emoji: '🫖' },
  { letter: 'L', word: 'Lion', emoji: '🦁' },
  { letter: 'L', word: 'Leaf', emoji: '🍃' },
  { letter: 'L', word: 'Lamp', emoji: '💡' },
  { letter: 'L', word: 'Lemon', emoji: '🍋' },
  { letter: 'L', word: 'Ladybug', emoji: '🐞' },
  { letter: 'L', word: 'Lock', emoji: '🔒' },
  { letter: 'M', word: 'Moon', emoji: '🌙' },
  { letter: 'M', word: 'Monkey', emoji: '🐒' },
  { letter: 'M', word: 'Mouse', emoji: '🐭' },
  { letter: 'M', word: 'Mountain', emoji: '⛰️' },
  { letter: 'M', word: 'Mushroom', emoji: '🍄' },
  { letter: 'M', word: 'Magnet', emoji: '🧲' },
  { letter: 'N', word: 'Nest', emoji: '🪺' },
  { letter: 'N', word: 'Nose', emoji: '👃' },
  { letter: 'N', word: 'Night', emoji: '🌃' },
  { letter: 'N', word: 'Net', emoji: '🥅' },
  { letter: 'N', word: 'Nurse', emoji: '👩‍⚕️' },
  { letter: 'O', word: 'Orange', emoji: '🍊' },
  { letter: 'O', word: 'Owl', emoji: '🦉' },
  { letter: 'O', word: 'Ocean', emoji: '🌊' },
  { letter: 'O', word: 'Onion', emoji: '🧅' },
  { letter: 'O', word: 'Octopus', emoji: '🐙' },
  { letter: 'P', word: 'Penguin', emoji: '🐧' },
  { letter: 'P', word: 'Pizza', emoji: '🍕' },
  { letter: 'P', word: 'Panda', emoji: '🐼' },
  { letter: 'P', word: 'Parrot', emoji: '🦜' },
  { letter: 'P', word: 'Planet', emoji: '🌍' },
  { letter: 'P', word: 'Pineapple', emoji: '🍍' },
  { letter: 'Q', word: 'Queen', emoji: '👸' },
  { letter: 'Q', word: 'Question', emoji: '❓' },
  { letter: 'Q', word: 'Quail', emoji: '🐦' },
  { letter: 'Q', word: 'Quill', emoji: '✒️' },
  { letter: 'R', word: 'Rainbow', emoji: '🌈' },
  { letter: 'R', word: 'Rabbit', emoji: '🐰' },
  { letter: 'R', word: 'Robot', emoji: '🤖' },
  { letter: 'R', word: 'Rocket', emoji: '🚀' },
  { letter: 'R', word: 'Ring', emoji: '💍' },
  { letter: 'R', word: 'Rose', emoji: '🌹' },
  { letter: 'S', word: 'Sun', emoji: '☀️' },
  { letter: 'S', word: 'Star', emoji: '⭐' },
  { letter: 'S', word: 'Snake', emoji: '🐍' },
  { letter: 'S', word: 'Shark', emoji: '🦈' },
  { letter: 'S', word: 'Spider', emoji: '🕷️' },
  { letter: 'S', word: 'Strawberry', emoji: '🍓' },
  { letter: 'T', word: 'Tree', emoji: '🌳' },
  { letter: 'T', word: 'Tiger', emoji: '🐯' },
  { letter: 'T', word: 'Train', emoji: '🚂' },
  { letter: 'T', word: 'Turtle', emoji: '🐢' },
  { letter: 'T', word: 'Trophy', emoji: '🏆' },
  { letter: 'T', word: 'Tomato', emoji: '🍅' },
  { letter: 'U', word: 'Umbrella', emoji: '☂️' },
  { letter: 'U', word: 'UFO', emoji: '🛸' },
  { letter: 'U', word: 'Unicorn', emoji: '🦄' },
  { letter: 'U', word: 'Uniform', emoji: '👕' },
  { letter: 'V', word: 'Violin', emoji: '🎻' },
  { letter: 'V', word: 'Volcano', emoji: '🌋' },
  { letter: 'V', word: 'Van', emoji: '🚐' },
  { letter: 'V', word: 'Vest', emoji: '🦺' },
  { letter: 'V', word: 'Vine', emoji: '🌿' },
  { letter: 'W', word: 'Whale', emoji: '🐋' },
  { letter: 'W', word: 'Wolf', emoji: '🐺' },
  { letter: 'W', word: 'Worm', emoji: '🪱' },
  { letter: 'W', word: 'Watermelon', emoji: '🍉' },
  { letter: 'W', word: 'Wizard', emoji: '🧙' },
  { letter: 'W', word: 'Watch', emoji: '⌚' },
  { letter: 'X', word: 'Xylophone', emoji: '🎹' },
  { letter: 'X', word: 'X-ray', emoji: '🩻' },
  { letter: 'Y', word: 'Yacht', emoji: '⛵' },
  { letter: 'Y', word: 'Yak', emoji: '🐂' },
  { letter: 'Y', word: 'Yo-yo', emoji: '🪀' },
  { letter: 'Y', word: 'Yellow', emoji: '💛' },
  { letter: 'Z', word: 'Zebra', emoji: '🦓' },
  { letter: 'Z', word: 'Zip', emoji: '🤐' },
  { letter: 'Z', word: 'Zero', emoji: '0️⃣' },
  { letter: 'Z', word: 'Zoo', emoji: '🦁' },
];

// ── Question Strategies ────────────────────────────────────────────────────────
export type Strategy =
  | 'start-with'      // "Which letter does 🍎 Apple start with?" → pick letter
  | 'pick-word'       // "Which word starts with B?" → pick from 4 words
  | 'odd-one-out'     // "Which does NOT start with C?" → 3 correct + 1 wrong letter word
  | 'emoji-only'      // emoji only, no text (expert mode) → pick letter
  | 'reverse';        // "Which picture starts with 🔤 T?" → show letter, pick emoji

// ── Confusing letter groups (for hard distractors) ────────────────────────────
const CONFUSING_GROUPS: string[][] = [
  ['B', 'D', 'P', 'Q'],
  ['M', 'N', 'W'],
  ['U', 'V', 'W'],
  ['C', 'G', 'O'],
  ['I', 'J', 'L'],
  ['S', 'Z'],
  ['A', 'E', 'F', 'H'],
  ['K', 'R', 'X', 'Y'],
  ['T', 'Y', 'I'],
];
const FAR_APART_LETTERS = ['A', 'G', 'M', 'S', 'Z', 'D', 'J', 'P', 'V', 'B', 'H', 'N', 'T'];

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getDistractorLetters(target: string, difficulty: 'easy' | 'hard', count: number): string[] {
  const all = [...new Set(ALPHABET_BANK.map(e => e.letter))];
  let pool: string[];
  if (difficulty === 'hard') {
    const group = CONFUSING_GROUPS.find(g => g.includes(target));
    pool = group ? group.filter(l => l !== target) : all.filter(l => l !== target);
    if (pool.length < count) pool = [...pool, ...all.filter(l => l !== target && !pool.includes(l))];
  } else {
    pool = FAR_APART_LETTERS.filter(l => l !== target);
    if (pool.length < count) pool = [...pool, ...all.filter(l => l !== target && !pool.includes(l))];
  }
  return shuffle(pool).slice(0, count);
}

// ── Question Interface ────────────────────────────────────────────────────────
interface Question {
  strategy: Strategy;
  targetLetter: string;
  targetWord: string;
  targetEmoji: string;
  // For letter-pick strategies: 4 letter options
  letterOptions?: string[];
  // For word-pick / odd-one-out strategies: 4 word options {word, emoji, letter}
  wordOptions?: { word: string; emoji: string; letter: string }[];
  correctAnswer: string; // the letter or word that is correct
}

// ── Build a question based on strategy ───────────────────────────────────────
function buildQuestion(
  entry: { letter: string; word: string; emoji: string },
  strategy: Strategy,
  difficulty: 'easy' | 'hard',
): Question {
  const { letter, word, emoji } = entry;

  if (strategy === 'start-with' || strategy === 'emoji-only') {
    const distractors = getDistractorLetters(letter, difficulty, 3);
    const letterOptions = shuffle([letter, ...distractors]);
    return { strategy, targetLetter: letter, targetWord: word, targetEmoji: emoji, letterOptions, correctAnswer: letter };
  }

  if (strategy === 'pick-word') {
    // Correct word + 3 words starting with different letters
    const diffLetters = getDistractorLetters(letter, difficulty, 3);
    const wrongWords = diffLetters.map(l => {
      const opts = ALPHABET_BANK.filter(e => e.letter === l);
      return opts.length ? randomFrom(opts) : { letter: l, word: l + '...', emoji: '❓' };
    });
    const wordOptions = shuffle([
      { word, emoji, letter },
      ...wrongWords,
    ]);
    return { strategy, targetLetter: letter, targetWord: word, targetEmoji: emoji, wordOptions, correctAnswer: word };
  }

  if (strategy === 'odd-one-out') {
    // 3 words starting with the SAME letter, 1 odd one out
    const sameLetterWords = ALPHABET_BANK.filter(e => e.letter === letter && e.word !== word);
    const correct1 = randomFrom(sameLetterWords.length ? sameLetterWords : [entry]);
    const correct2 = randomFrom(ALPHABET_BANK.filter(e => e.letter === letter && e.word !== correct1.word));
    const oddLetter = randomFrom(getDistractorLetters(letter, difficulty, 1));
    const oddOptions = ALPHABET_BANK.filter(e => e.letter === oddLetter);
    const oddEntry = randomFrom(oddOptions.length ? oddOptions : [{ letter: oddLetter, word: oddLetter + '!', emoji: '❓' }]);
    const wordOptions = shuffle([
      { word: entry.word, emoji: entry.emoji, letter },
      { word: correct1.word, emoji: correct1.emoji, letter },
      { word: correct2.word, emoji: correct2.emoji, letter },
      { word: oddEntry.word, emoji: oddEntry.emoji, letter: oddLetter },
    ]);
    return { strategy, targetLetter: letter, targetWord: word, targetEmoji: emoji, wordOptions, correctAnswer: oddEntry.word };
  }

  if (strategy === 'reverse') {
    // Show the letter, pick the matching emoji/word
    const distractors = getDistractorLetters(letter, difficulty, 3).map(l => {
      const opts = ALPHABET_BANK.filter(e => e.letter === l);
      return opts.length ? randomFrom(opts) : { letter: l, word: l + '?', emoji: '❓' };
    });
    const wordOptions = shuffle([{ word, emoji, letter }, ...distractors]);
    return { strategy, targetLetter: letter, targetWord: word, targetEmoji: emoji, wordOptions, correctAnswer: word };
  }

  // fallback
  return buildQuestion(entry, 'start-with', difficulty);
}

// ── Weighted strategy picker ──────────────────────────────────────────────────
// Easy: mostly start-with (safe)
// Hard/Expert: mix in tricky strategies
function pickStrategy(difficulty: 'easy' | 'hard', round: number): Strategy {
  if (difficulty === 'easy') {
    const pool: Strategy[] = ['start-with', 'start-with', 'start-with', 'pick-word', 'reverse'];
    return randomFrom(pool);
  }
  const pool: Strategy[] = ['start-with', 'odd-one-out', 'pick-word', 'emoji-only', 'reverse', 'odd-one-out'];
  // Every 3rd round in hard mode, force odd-one-out as a trick question
  if (round % 3 === 0) return 'odd-one-out';
  return randomFrom(pool);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AlphabetGame() {
  const navigate = useNavigate();
  const { childId } = useParams();
  const { saveGameSession } = useGameStats();
  const { checkForMilestones } = useParentAlertsContext();
  const { updateProgress } = useRewardSystem(childId);
  const { speak } = useTextToSpeech();
  const { playCorrect, playWrong, playComplete, playClick } = useSoundEffects();
  const startTimeRef = useRef(Date.now());

  const {
    encouragement, hint, isLoading: aiLoading,
    trackCorrect: aiTrackCorrect, trackWrong: aiTrackWrong,
    updateStats, clearMessages,
  } = useAdaptiveAI(childId);

  const adaptiveDifficulty = useAdaptiveDifficulty();

  // ── State ─────────────────────────────────────────────────────────────────
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [mistakes, setMistakes] = useState<Array<{ question: string; correctAnswer: string; userAnswer: string; category: string }>>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [isChallenge, setIsChallenge] = useState(false);
  const [childName, setChildName] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  // Session pool — shuffled once per game, consumed round by round
  const sessionPoolRef = useRef<{ letter: string; word: string; emoji: string }[]>([]);
  const sessionIndexRef = useRef(0);

  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // ── Init session pool ──────────────────────────────────────────────────────
  const initPool = useCallback(() => {
    sessionPoolRef.current = shuffle(ALPHABET_BANK);
    sessionIndexRef.current = 0;
  }, []);

  // ── Pick next entry from pool ──────────────────────────────────────────────
  const nextEntry = useCallback(() => {
    if (sessionIndexRef.current >= sessionPoolRef.current.length) {
      // Re-shuffle when pool exhausted (shouldn't normally happen in 10 rounds)
      sessionPoolRef.current = shuffle(ALPHABET_BANK);
      sessionIndexRef.current = 0;
    }
    return sessionPoolRef.current[sessionIndexRef.current++];
  }, []);

  // ── Generate a round ───────────────────────────────────────────────────────
  const generateRound = useCallback(() => {
    const difficulty = adaptiveDifficulty.getQuestionDifficulty();
    const roundNum = sessionIndexRef.current;
    const strategy = pickStrategy(difficulty, roundNum);
    const entry = nextEntry();
    const q = buildQuestion(entry, strategy, difficulty);

    setQuestion(q);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setIsChallenge(difficulty === 'hard');

    // Announce the question via TTS
    setTimeout(() => {
      if (strategy === 'start-with') {
        speak(`${q.targetWord}. Which letter does ${q.targetWord} start with?`);
      } else if (strategy === 'pick-word') {
        speak(`Which word starts with the letter ${q.targetLetter}?`);
      } else if (strategy === 'odd-one-out') {
        speak(`Which one does NOT start with ${q.targetLetter}?`);
      } else if (strategy === 'emoji-only') {
        speak('Which letter does this start with?');
      } else if (strategy === 'reverse') {
        speak(`Which picture starts with the letter ${q.targetLetter}?`);
      }
    }, 300);
  }, [adaptiveDifficulty, nextEntry, speak]);

  // ── Fetch child name ───────────────────────────────────────────────────────
  useEffect(() => {
    if (childId) {
      fetch(`http://localhost:5000/api/children/name/${childId}`)
        .then(r => r.json())
        .then(data => { if (data?.name) setChildName(data.name); })
        .catch(() => { });
    }
  }, [childId]);

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameComplete) return;
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [gameComplete]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // ── First round ───────────────────────────────────────────────────────────
  useEffect(() => {
    initPool();
    generateRound();
    startTimeRef.current = Date.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handle answer selection ───────────────────────────────────────────────
  const handleSelect = (answer: string) => {
    if (selectedAnswer || !question) return;
    playClick();
    setSelectedAnswer(answer);

    const correct = answer === question.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      playCorrect();
      setTimeout(() => speak('Great job!'), 100);
      const bonus = isChallenge ? 5 : 0;
      const points = (streak >= 3 ? 20 : 10) + bonus;
      setScore(prev => prev + points);
      setStreak(prev => { const n = prev + 1; setMaxStreak(ms => Math.max(ms, n)); return n; });
      setCorrectAnswers(prev => prev + 1);
      setShowCelebration(true);
      aiTrackCorrect();
      adaptiveDifficulty.recordCorrect();
      setTimeout(() => setShowCelebration(false), 700);
    } else {
      playWrong();
      setTimeout(() => speak(`The correct answer is ${question.correctAnswer}`), 100);
      setStreak(0);
      setWrongAnswers(prev => prev + 1);
      adaptiveDifficulty.recordWrong();
      setMistakes(prev => [...prev, {
        question: strategyLabel(question),
        correctAnswer: question.correctAnswer,
        userAnswer: answer,
        category: 'Alphabet',
      }]);
      aiTrackWrong({ gameType: 'alphabet', score, correctAnswers, wrongAnswers: wrongAnswers + 1, totalQuestions: round });
    }

    setTimeout(() => {
      if (round < TOTAL_ROUNDS) {
        setRound(prev => prev + 1);
        generateRound();
      } else {
        playComplete();
        setGameComplete(true);
      }
    }, 1200);
  };

  function strategyLabel(q: Question): string {
    if (q.strategy === 'start-with' || q.strategy === 'emoji-only') return `${q.targetWord} starts with?`;
    if (q.strategy === 'pick-word') return `Word starting with ${q.targetLetter}?`;
    if (q.strategy === 'odd-one-out') return `Odd one out for ${q.targetLetter}?`;
    if (q.strategy === 'reverse') return `Picture for letter ${q.targetLetter}?`;
    return 'Alphabet question';
  }

  // ── Save session on game complete ─────────────────────────────────────────
  useEffect(() => {
    if (gameComplete && childId) {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      saveGameSession({ childId, gameType: 'alphabet', score, totalQuestions: TOTAL_ROUNDS, correctAnswers, wrongAnswers, mistakes, maxStreak, durationSeconds: duration });
      updateStats(correctAnswers, TOTAL_ROUNDS, 'alphabet');
      updateProgress(childId);
      if (childName) {
        const accuracy = Math.round((correctAnswers / TOTAL_ROUNDS) * 100);
        checkForMilestones(childId, childName, 'Alphabet', score, score, accuracy, maxStreak);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameComplete]);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const resetGame = () => {
    setScore(0); setRound(1); setStreak(0); setMaxStreak(0);
    setCorrectAnswers(0); setWrongAnswers(0); setMistakes([]);
    setGameComplete(false);
    adaptiveDifficulty.reset();
    startTimeRef.current = Date.now();
    initPool();
    generateRound();
  };

  const accuracy = Math.round((correctAnswers / TOTAL_ROUNDS) * 100);
  const totalTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
  const earnedStars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;

  // ── UI helpers ─────────────────────────────────────────────────────────────
  function renderQuestionPrompt() {
    if (!question) return null;
    switch (question.strategy) {
      case 'start-with':
        return (
          <div className="text-center mb-8 slide-up">
            <div className={cn('text-8xl mb-4 inline-block select-none transition-transform', showCelebration && 'scale-125 drop-shadow-2xl')}>
              {question.targetEmoji}
            </div>
            <p className="font-display text-2xl font-bold text-foreground mb-1">"{question.targetWord}"</p>
            <p className="text-lg text-muted-foreground mb-3">Which letter does this start with?</p>
            <HearAgainButton question={question} speak={speak} />
          </div>
        );
      case 'emoji-only':
        return (
          <div className="text-center mb-8 slide-up">
            <div className={cn('text-8xl mb-4 inline-block select-none transition-transform', showCelebration && 'scale-125 drop-shadow-2xl')}>
              {question.targetEmoji}
            </div>
            <p className="text-lg text-muted-foreground mb-3">🧠 Expert mode — which letter does this start with?</p>
            <HearAgainButton question={question} speak={speak} />
          </div>
        );
      case 'pick-word':
        return (
          <div className="text-center mb-8 slide-up">
            <div className="text-7xl mb-3 font-black text-foreground animate-pulse-once">{question.targetLetter}</div>
            <p className="text-lg text-muted-foreground mb-3">Which word starts with <strong className="text-foreground">{question.targetLetter}</strong>?</p>
            <HearAgainButton question={question} speak={speak} />
          </div>
        );
      case 'odd-one-out':
        return (
          <div className="text-center mb-8 slide-up">
            <div className="text-6xl mb-3">🔍</div>
            <p className="text-lg text-muted-foreground mb-1">Which one does <strong className="text-duo-red">NOT</strong> start with</p>
            <p className="text-5xl font-black text-foreground mb-3">{question.targetLetter}</p>
            <HearAgainButton question={question} speak={speak} />
          </div>
        );
      case 'reverse':
        return (
          <div className="text-center mb-8 slide-up">
            <div className="text-7xl font-black text-foreground mb-3">{question.targetLetter}</div>
            <p className="text-lg text-muted-foreground mb-3">Which picture starts with <strong className="text-foreground">{question.targetLetter}</strong>?</p>
            <HearAgainButton question={question} speak={speak} />
          </div>
        );
    }
  }

  function renderAnswerButtons() {
    if (!question) return null;

    // Letter-choice strategies
    if (question.strategy === 'start-with' || question.strategy === 'emoji-only') {
      return (
        <div className="grid grid-cols-2 gap-4 stagger-children">
          {question.letterOptions!.map(letter => (
            <button
              key={letter}
              onClick={() => handleSelect(letter)}
              disabled={!!selectedAnswer}
              className={cn(
                'h-24 rounded-3xl option-card text-5xl font-black transition-all duration-200 select-none',
                selectedAnswer === letter && isCorrect && 'ring-4 ring-duo-green correct-flash bg-duo-green/20',
                selectedAnswer === letter && !isCorrect && 'ring-4 ring-duo-red wrong-shake opacity-60',
                selectedAnswer && letter === question.correctAnswer && selectedAnswer !== letter && 'ring-4 ring-duo-green bg-duo-green/10',
              )}
            >{letter}</button>
          ))}
        </div>
      );
    }

    // Word/emoji-choice strategies
    return (
      <div className="grid grid-cols-2 gap-3 stagger-children">
        {question.wordOptions!.map(opt => (
          <button
            key={opt.word}
            onClick={() => handleSelect(opt.word)}
            disabled={!!selectedAnswer}
            className={cn(
              'h-20 rounded-3xl option-card flex flex-col items-center justify-center gap-1 transition-all duration-200 select-none px-2',
              selectedAnswer === opt.word && isCorrect && 'ring-4 ring-duo-green correct-flash bg-duo-green/20',
              selectedAnswer === opt.word && !isCorrect && 'ring-4 ring-duo-red wrong-shake opacity-60',
              selectedAnswer && opt.word === question.correctAnswer && selectedAnswer !== opt.word && 'ring-4 ring-duo-green bg-duo-green/10',
            )}
          >
            <span className="text-3xl">{opt.emoji}</span>
            <span className="text-xs font-bold text-foreground leading-tight text-center">{opt.word}</span>
          </button>
        ))}
      </div>
    );
  }

  // ── Game complete screen ───────────────────────────────────────────────────
  if (gameComplete) {
    return (
      <GameFinishScreen
        childId={childId || ''}
        score={score}
        accuracy={accuracy}
        totalTime={totalTime}
        maxStreak={maxStreak}
        mistakes={wrongAnswers}
        gameTitle="Alphabet Game"
        gameEmoji="🔤"
        onPlayAgain={resetGame}
        gradientFrom="from-pastel-lavender/30"
        gradientTo="to-pastel-mint/30"
      />
    );
  }

  // ── Active game screen ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-pastel-lavender/30 via-background to-pastel-mint/30 page-enter">

      {/* ── Header ── */}
      <header className="p-4 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(`/child-dashboard/${childId}`)} className="gap-2">
          <ArrowLeft className="w-5 h-5" /> Back
        </Button>

        {/* Right side: clock · challenge badge · streak · stars · score */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" /> {formatTime(elapsedTime)}
          </div>

          {isChallenge && (
            <div className="flex items-center gap-1 bg-duo-purple/20 px-2 py-1 rounded-full">
              <Zap className="w-3 h-3 text-duo-purple" />
              <span className="text-xs font-bold text-duo-purple">Challenge</span>
            </div>
          )}

          {streak >= 3 && (
            <div className="flex items-center gap-1 text-duo-orange font-bold pulse-scale">
              🔥 {streak}
            </div>
          )}

          {/* Stars — fixed alongside score, NOT in a separate fixed overlay */}
          <div className="flex gap-0.5">
            {[1, 2, 3].map(i => (
              <Star
                key={i}
                className={cn('w-4 h-4', i <= earnedStars ? 'text-duo-yellow fill-duo-yellow' : 'text-muted')}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 bg-duo-yellow/20 px-4 py-2 rounded-full">
            <Trophy className="w-5 h-5 text-duo-yellow" />
            <span className="font-bold text-foreground">{score}</span>
          </div>
        </div>
      </header>

      {/* ── Progress bar ── */}
      <div className="px-4 mb-6">
        <div className="max-w-md mx-auto">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }} />
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">Round {round} of {TOTAL_ROUNDS}</p>
        </div>
      </div>

      {/* ── AI recommendation strip ── */}
      {adaptiveDifficulty.aiRecommendation && (
        <div className="px-4 mb-2 max-w-lg mx-auto">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Brain className="w-3 h-3" />
            <span>{adaptiveDifficulty.aiRecommendation.message}</span>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="max-w-lg mx-auto px-4 pb-8">
        {/* Question prompt */}
        {renderQuestionPrompt()}

        {/* Answer buttons */}
        {renderAnswerButtons()}

        {/* Mascot + feedback */}
        <div className="mt-8 flex justify-center slide-up" style={{ animationDelay: '0.2s' }}>
          <div className={cn(
            'flex items-center gap-3 bg-card rounded-full px-6 py-3 shadow-soft',
            isCorrect === true && 'bg-duo-green/10',
            isCorrect === false && 'bg-duo-red/10',
          )}>
            <Mascot size="sm" happy={isCorrect === true} animated={false} />
            <p className="font-medium text-foreground">
              {isCorrect === null && (isChallenge
                ? '🔥 Challenge! Tricky letters!'
                : question?.strategy === 'odd-one-out'
                  ? '🤔 Find the odd one out!'
                  : question?.strategy === 'reverse'
                    ? '🔄 Match the letter to the picture!'
                    : 'Listen and pick the right answer!')}
              {isCorrect === true && (streak >= 3
                ? '🔥 On fire! Amazing!'
                : `✅ ${question?.strategy === 'odd-one-out'
                  ? `${question.correctAnswer} is the odd one out!`
                  : `${question?.targetWord} starts with ${question?.targetLetter}!`}`)}
              {isCorrect === false && `❌ Correct: ${question?.correctAnswer}`}
            </p>
          </div>
        </div>
      </main>

      {/* ── Celebration overlay ── */}
      {showCelebration && question && (
        <div className="fixed inset-0 pointer-events-none z-50 flex flex-col items-center justify-start pt-[8vh]">
          <div
            className="text-[110px] leading-none select-none"
            style={{ animation: 'bounce-in 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
          >
            {question.targetLetter}
          </div>
          <div className="flex gap-3 mt-4">
            {['🌟', '✨', '🎉', '✨', '🌟'].map((e, i) => (
              <span
                key={i}
                className="text-2xl"
                style={{ animation: `confetti 0.8s ${i * 0.1}s cubic-bezier(0.22,1,0.36,1) forwards` }}
              >{e}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Cloud AI feedback ── */}
      <AdaptiveAIFeedback
        encouragement={encouragement}
        hint={hint}
        isLoading={aiLoading}
        onDismiss={clearMessages}
      />
    </div>
  );
}

// ── Hear Again button ─────────────────────────────────────────────────────────
function HearAgainButton({ question, speak }: { question: Question; speak: (t: string) => void }) {
  const text =
    question.strategy === 'start-with' ? `${question.targetWord}. ${question.targetWord} starts with which letter?`
      : question.strategy === 'pick-word' ? `Which word starts with ${question.targetLetter}?`
        : question.strategy === 'odd-one-out' ? `Which one does not start with ${question.targetLetter}?`
          : question.strategy === 'reverse' ? `Which picture starts with the letter ${question.targetLetter}?`
            : 'Which letter does this start with?';

  return (
    <button
      onClick={() => speak(text)}
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <Volume2 className="w-4 h-4" /> Hear it again
    </button>
  );
}
