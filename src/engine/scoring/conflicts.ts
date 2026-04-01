// ─── Conflict Resolution ───
// Removes lower-tier tai that are superseded by higher ones.
// Uses the `excludes` field from TAI_CATALOG as the canonical source.

import { TaiRuleId, TAI_CATALOG_MAP } from '../../data/tai-catalog';
import { TaiResult } from './tai-rules';

/**
 * Given a flat list of matched tai results, removes any results that are
 * excluded by another matched result.
 *
 * Example: ConcealedSelfDraw excludes Concealed + SelfDraw individually.
 */
export function resolveConflicts(results: TaiResult[]): TaiResult[] {
  // Collect the set of all matched rule IDs
  const matchedIds = new Set(results.map((r) => r.ruleId));

  // Build the full set of IDs that should be excluded
  const excludedIds = new Set<TaiRuleId>();
  for (const id of matchedIds) {
    const def = TAI_CATALOG_MAP[id];
    if (def) {
      for (const excl of def.excludes) {
        if (matchedIds.has(excl)) {
          excludedIds.add(excl);
        }
      }
    }
  }

  // Filter out excluded results
  return results.filter((r) => !excludedIds.has(r.ruleId));
}
