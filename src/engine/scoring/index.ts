// ─── Scoring Orchestrator ───
// Runs all tai rules, resolves conflicts, computes total.

import { Hand } from '../hand';
import { GameContext, defaultContext } from './context';
import { ALL_TAI_RULES, TaiResult } from './tai-rules';
import { resolveConflicts } from './conflicts';

export interface ScoreBreakdown {
  /** Individual tai awards after conflict resolution */
  results: TaiResult[];
  /** Total tai (sum of all results) */
  totalTai: number;
  /** Base points per tai — configurable, default 1 */
  basePoints: number;
  /** Total points = basePoints × 2^totalTai (common formula) or basePoints × totalTai */
  totalPoints: number;
}

export interface ScoringOptions {
  /** Base stake per tai, default 1 */
  basePoints?: number;
  /** Minimum tai required to win (commonly 1-5 depending on house rules), default 1 */
  minimumTai?: number;
}

/**
 * Calculate the score for a winning hand.
 * 1. Evaluate all tai rule functions against the hand + context.
 * 2. Resolve conflicts (remove superseded rules).
 * 3. Sum up. Apply minimumTai filter.
 */
export function calculateScore(
  hand: Hand,
  ctx?: Partial<GameContext>,
  options?: ScoringOptions,
): ScoreBreakdown {
  const context = defaultContext(ctx);
  const basePoints = options?.basePoints ?? 1;
  const minimumTai = options?.minimumTai ?? 1;

  // Step 1: Evaluate all rules
  const rawResults: TaiResult[] = [];
  for (const ruleFn of ALL_TAI_RULES) {
    const res = ruleFn(hand, context);
    if (res) {
      rawResults.push(...res);
    }
  }

  // Step 2: Resolve conflicts
  const resolved = resolveConflicts(rawResults);

  // Step 3: Sum tai
  const totalTai = resolved.reduce((sum, r) => sum + r.tai, 0);

  // If below minimum, return 0
  if (totalTai < minimumTai) {
    return { results: [], totalTai: 0, basePoints, totalPoints: 0 };
  }

  // Step 4: Calculate points.
  // Common Taiwanese Mahjong formula: base × totalTai
  // (Some tables use base × 2^tai — configurable by changing this.)
  const totalPoints = basePoints * totalTai;

  return { results: resolved, totalTai, basePoints, totalPoints };
}
