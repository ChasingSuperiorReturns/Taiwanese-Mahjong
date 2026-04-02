import { generateQuizBatch, generateOneQuiz, GeneratedQuiz } from '@/src/engine/random-hand-generator';

describe('Random Hand Generator', () => {
  it('generates a single valid quiz', () => {
    let quiz: GeneratedQuiz | null = null;
    for (let i = 0; i < 20 && !quiz; i++) {
      quiz = generateOneQuiz();
    }
    expect(quiz).not.toBeNull();
    expect(quiz!.breakdown.totalTai).toBeGreaterThanOrEqual(1);
    expect(quiz!.hand.melds.length).toBe(5);
    expect(quiz!.hand.pair.length).toBe(2);
    expect(['easy', 'medium', 'hard']).toContain(quiz!.difficulty);
  });

  it('generates a batch of 50 quizzes', () => {
    const batch = generateQuizBatch(50);
    expect(batch.length).toBeGreaterThanOrEqual(30); // allow some failures
    for (const q of batch) {
      expect(q.breakdown.totalTai).toBeGreaterThanOrEqual(1);
      expect(q.hand.melds.length).toBe(5);
    }
  });

  it('covers all difficulty levels in a large batch', () => {
    const batch = generateQuizBatch(200);
    const diffs = new Set(batch.map((q) => q.difficulty));
    expect(diffs.has('easy')).toBe(true);
    expect(diffs.has('medium')).toBe(true);
    expect(diffs.has('hard')).toBe(true);
  });

  it('respects tile count limits (max 4 per tile)', () => {
    const batch = generateQuizBatch(100);
    for (const q of batch) {
      const counts = new Map<string, number>();
      for (const meld of q.hand.melds) {
        for (const tile of meld.tiles) {
          const key = `${tile.kind === 'suit' ? `${tile.suit}_${tile.value}` : tile.kind === 'wind' ? `wind_${tile.wind}` : `dragon_${tile.dragon}`}`;
          counts.set(key, (counts.get(key) || 0) + 1);
        }
      }
      for (const tile of q.hand.pair) {
        const key = `${tile.kind === 'suit' ? `${tile.suit}_${tile.value}` : tile.kind === 'wind' ? `wind_${tile.wind}` : `dragon_${tile.dragon}`}`;
        counts.set(key, (counts.get(key) || 0) + 1);
      }
      for (const [key, count] of counts) {
        expect(count).toBeLessThanOrEqual(4);
      }
    }
  });
});
