// ─── Quiz Scenario Verification ───
// Ensures every quiz scenario's expectedTai matches the scoring engine output.

import { QUIZ_SCENARIOS } from '../../../src/data/quiz-hands';
import { calculateScore } from '../../../src/engine/scoring/index';

describe('Quiz scenario expected tai values', () => {
  for (const scenario of QUIZ_SCENARIOS) {
    test(`${scenario.id}: ${scenario.hintEn} = ${scenario.expectedTai} tai`, () => {
      const score = calculateScore(scenario.hand, scenario.context);
      const breakdown = score.results.map(r => `${r.ruleId}(${r.tai})`).join(' + ');
      expect({ total: score.totalTai, breakdown }).toEqual({
        total: scenario.expectedTai,
        breakdown: expect.any(String),
      });
    });
  }
});
