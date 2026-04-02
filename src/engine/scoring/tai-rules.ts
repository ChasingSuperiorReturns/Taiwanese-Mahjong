// ─── Tai Rule Implementations ───
// Each rule is a pure function: (hand, context) => TaiResult[] | null
// Source: https://twmahjong.com/

import {
  PlayTile, MeldType, Wind, Dragon, Suit, SuitValue,
  isDragon, isWind, isSuit, isHonor, isTerminal,
  flowerMatchesWind, FlowerType, tileKey,
} from '../tiles';
import {
  Hand,
  isAllTriplets, isAllSequences,
  countConcealedTriplets, getSuitsInHand, hasHonorTiles,
  getAllTiles, countKongs,
} from '../hand';
import { GameContext } from './context';
import { TaiRuleId } from '../../data/tai-catalog';

export interface TaiResult {
  ruleId: TaiRuleId;
  tai: number;
  /** Descriptive label */
  label?: string;
}

type TaiRuleFn = (hand: Hand, ctx: GameContext) => TaiResult[] | null;

// ─────────────────────────────────────────────────
//  BASIC RULES
// ─────────────────────────────────────────────────

export const checkDealer: TaiRuleFn = (_hand, ctx) => {
  if (ctx.isDealer && ctx.dealerStreak === 0) {
    return [{ ruleId: TaiRuleId.Dealer, tai: 1 }];
  }
  return null;
};

export const checkDealerStreak: TaiRuleFn = (_hand, ctx) => {
  if (ctx.isDealer && ctx.dealerStreak > 0) {
    const tai = 2 * ctx.dealerStreak + 1;
    return [{ ruleId: TaiRuleId.DealerStreak, tai, label: `連${ctx.dealerStreak}拉${ctx.dealerStreak}` }];
  }
  return null;
};

export const checkSelfDraw: TaiRuleFn = (_hand, ctx) => {
  if (ctx.isSelfDraw) {
    return [{ ruleId: TaiRuleId.SelfDraw, tai: 1 }];
  }
  return null;
};

export const checkConcealed: TaiRuleFn = (hand, ctx) => {
  if (hand.isConcealed && !ctx.isSelfDraw) {
    return [{ ruleId: TaiRuleId.Concealed, tai: 3 }];
  }
  return null;
};

export const checkConcealedSelfDraw: TaiRuleFn = (hand, ctx) => {
  if (hand.isConcealed && ctx.isSelfDraw) {
    return [{ ruleId: TaiRuleId.ConcealedSelfDraw, tai: 5 }];
  }
  return null;
};

export const checkSingleWait: TaiRuleFn = (hand, _ctx) => {
  if (hand.isSingleWait) {
    return [{ ruleId: TaiRuleId.SingleWait, tai: 2 }];
  }
  return null;
};

export const checkDoublePongWait: TaiRuleFn = (_hand, ctx) => {
  if (ctx.isDoublePongWait) {
    return [{ ruleId: TaiRuleId.DoublePongWait, tai: 1 }];
  }
  return null;
};

export const checkReady: TaiRuleFn = (_hand, ctx) => {
  if (ctx.isReady) {
    return [{ ruleId: TaiRuleId.Ready, tai: 5 }];
  }
  return null;
};

// ChickenHand is calculated post-hoc by the orchestrator, not here.

export const checkOpenKongBonus: TaiRuleFn = (hand, _ctx) => {
  const results: TaiResult[] = [];
  for (const meld of hand.melds) {
    if (meld.type === MeldType.Kong || meld.type === MeldType.AddedKong) {
      results.push({ ruleId: TaiRuleId.OpenKongBonus, tai: 1, label: '明摃' });
    }
  }
  return results.length > 0 ? results : null;
};

export const checkConcealedKongBonus: TaiRuleFn = (hand, _ctx) => {
  const results: TaiResult[] = [];
  for (const meld of hand.melds) {
    if (meld.type === MeldType.ConcealedKong) {
      results.push({ ruleId: TaiRuleId.ConcealedKongBonus, tai: 2, label: '暗摃' });
    }
  }
  return results.length > 0 ? results : null;
};

export const checkNoHonors: TaiRuleFn = (hand, _ctx) => {
  if (!hasHonorTiles(hand)) {
    return [{ ruleId: TaiRuleId.NoHonors, tai: 1 }];
  }
  return null;
};

export const checkNoHonorsNoFlowers: TaiRuleFn = (hand, ctx) => {
  if (!hasHonorTiles(hand) && ctx.flowers.length === 0) {
    return [{ ruleId: TaiRuleId.NoHonorsNoFlowers, tai: 5 }];
  }
  return null;
};

export const checkGrandPingHu: TaiRuleFn = (hand, ctx) => {
  if (!hasHonorTiles(hand) && ctx.flowers.length === 0 && isAllSequences(hand)) {
    return [{ ruleId: TaiRuleId.GrandPingHu, tai: 10 }];
  }
  return null;
};

export const checkMissingOneSuit: TaiRuleFn = (hand, _ctx) => {
  const suits = getSuitsInHand(hand);
  if (suits.size === 2) {
    return [{ ruleId: TaiRuleId.MissingOneSuit, tai: 5 }];
  }
  return null;
};

export const checkFiveTypes: TaiRuleFn = (hand, _ctx) => {
  const allTiles = getAllTiles(hand);
  const suits = new Set<Suit>();
  let hasWinds = false;
  let hasDragons = false;

  for (const tile of allTiles) {
    if (isSuit(tile)) suits.add(tile.suit);
    else if (isWind(tile)) hasWinds = true;
    else if (isDragon(tile)) hasDragons = true;
  }

  if (suits.size === 3 && hasWinds && hasDragons) {
    return [{ ruleId: TaiRuleId.FiveTypes, tai: 10 }];
  }
  return null;
};

// ─────────────────────────────────────────────────
//  WIND RULES
// ─────────────────────────────────────────────────

function getWindTriplets(hand: Hand): Wind[] {
  const winds: Wind[] = [];
  for (const meld of hand.melds) {
    if (
      (meld.type === MeldType.Pong || meld.type === MeldType.Kong ||
       meld.type === MeldType.ConcealedKong || meld.type === MeldType.AddedKong) &&
      meld.tiles[0].kind === 'wind'
    ) {
      winds.push(meld.tiles[0].wind);
    }
  }
  return winds;
}

export const checkMatchingWindTriplet: TaiRuleFn = (hand, ctx) => {
  const winds = getWindTriplets(hand);
  if (winds.includes(ctx.seatWind)) {
    return [{ ruleId: TaiRuleId.MatchingWindTriplet, tai: 2 }];
  }
  return null;
};

export const checkWindTriplet: TaiRuleFn = (hand, ctx) => {
  const winds = getWindTriplets(hand);
  const results: TaiResult[] = [];
  for (const w of winds) {
    if (w !== ctx.seatWind) {
      const labels: Record<Wind, string> = {
        [Wind.East]: '東', [Wind.South]: '南',
        [Wind.West]: '西', [Wind.North]: '北',
      };
      results.push({ ruleId: TaiRuleId.WindTriplet, tai: 1, label: `風牌 (${labels[w]})` });
    }
  }
  return results.length > 0 ? results : null;
};

export const checkSmallThreeWinds: TaiRuleFn = (hand, _ctx) => {
  const windTriplets = new Set(getWindTriplets(hand));
  const pairWind = hand.pair[0].kind === 'wind' ? hand.pair[0].wind : null;
  if (windTriplets.size === 2 && pairWind !== null && !windTriplets.has(pairWind)) {
    return [{ ruleId: TaiRuleId.SmallThreeWinds, tai: 15 }];
  }
  return null;
};

export const checkBigThreeWinds: TaiRuleFn = (hand, _ctx) => {
  const windTriplets = new Set(getWindTriplets(hand));
  if (windTriplets.size === 3) {
    return [{ ruleId: TaiRuleId.BigThreeWinds, tai: 30 }];
  }
  return null;
};

export const checkSmallFourWinds: TaiRuleFn = (hand, _ctx) => {
  const windTriplets = new Set(getWindTriplets(hand));
  const pairWind = hand.pair[0].kind === 'wind' ? hand.pair[0].wind : null;
  if (windTriplets.size === 3 && pairWind !== null && !windTriplets.has(pairWind)) {
    return [{ ruleId: TaiRuleId.SmallFourWinds, tai: 60 }];
  }
  return null;
};

export const checkBigFourWinds: TaiRuleFn = (hand, _ctx) => {
  const windTriplets = new Set(getWindTriplets(hand));
  if (windTriplets.size === 4) {
    return [{ ruleId: TaiRuleId.BigFourWinds, tai: 80 }];
  }
  return null;
};

// ─────────────────────────────────────────────────
//  DRAGON RULES
// ─────────────────────────────────────────────────

const dragonLabels: Record<Dragon, string> = {
  [Dragon.Red]: '中', [Dragon.Green]: '發', [Dragon.White]: '白',
};

export const checkDragonTriplets: TaiRuleFn = (hand, _ctx) => {
  const results: TaiResult[] = [];
  for (const meld of hand.melds) {
    if (
      (meld.type === MeldType.Pong || meld.type === MeldType.Kong ||
       meld.type === MeldType.ConcealedKong || meld.type === MeldType.AddedKong) &&
      meld.tiles[0].kind === 'dragon'
    ) {
      const dragon = meld.tiles[0].dragon;
      results.push({ ruleId: TaiRuleId.DragonTriplet, tai: 2, label: `中發白 (${dragonLabels[dragon]})` });
    }
  }
  return results.length > 0 ? results : null;
};

export const checkSmallThreeDragons: TaiRuleFn = (hand, _ctx) => {
  const dragonMelds = hand.melds.filter(
    (m) => (m.type === MeldType.Pong || m.type === MeldType.Kong ||
            m.type === MeldType.ConcealedKong || m.type === MeldType.AddedKong) &&
           m.tiles[0].kind === 'dragon',
  );
  const dragonPair = hand.pair[0].kind === 'dragon' && hand.pair[1].kind === 'dragon';
  if (dragonMelds.length === 2 && dragonPair) {
    return [{ ruleId: TaiRuleId.SmallThreeDragons, tai: 20 }];
  }
  return null;
};

export const checkBigThreeDragons: TaiRuleFn = (hand, _ctx) => {
  const dragonMelds = hand.melds.filter(
    (m) => (m.type === MeldType.Pong || m.type === MeldType.Kong ||
            m.type === MeldType.ConcealedKong || m.type === MeldType.AddedKong) &&
           m.tiles[0].kind === 'dragon',
  );
  const dragons = new Set(dragonMelds.map((m) => (m.tiles[0] as { dragon: Dragon }).dragon));
  if (dragons.size === 3) {
    return [{ ruleId: TaiRuleId.BigThreeDragons, tai: 40 }];
  }
  return null;
};

// ─────────────────────────────────────────────────
//  FLOWER RULES
// ─────────────────────────────────────────────────

export const checkMatchingFlowers: TaiRuleFn = (_hand, ctx) => {
  const results: TaiResult[] = [];
  for (const flower of ctx.flowers) {
    if (flowerMatchesWind(flower.flower, ctx.seatWind)) {
      results.push({ ruleId: TaiRuleId.MatchingFlower, tai: 2, label: `正花 (${flower.flower})` });
    }
  }
  return results.length > 0 ? results : null;
};

export const checkNonMatchingFlowers: TaiRuleFn = (_hand, ctx) => {
  const results: TaiResult[] = [];
  for (const flower of ctx.flowers) {
    if (!flowerMatchesWind(flower.flower, ctx.seatWind)) {
      results.push({ ruleId: TaiRuleId.NonMatchingFlower, tai: 1, label: `爛花 (${flower.flower})` });
    }
  }
  return results.length > 0 ? results : null;
};

export const checkNoFlowers: TaiRuleFn = (_hand, ctx) => {
  if (ctx.flowers.length === 0) {
    return [{ ruleId: TaiRuleId.NoFlowers, tai: 1 }];
  }
  return null;
};

export const checkOneFlowerGroup: TaiRuleFn = (_hand, ctx) => {
  const flowers = ctx.flowers.map((f) => f.flower);
  const hasAllSeasons =
    flowers.includes(FlowerType.Spring) && flowers.includes(FlowerType.Summer) &&
    flowers.includes(FlowerType.Autumn) && flowers.includes(FlowerType.Winter);
  const hasAllGentlemen =
    flowers.includes(FlowerType.Plum) && flowers.includes(FlowerType.Orchid) &&
    flowers.includes(FlowerType.Chrysanthemum) && flowers.includes(FlowerType.Bamboo);

  const results: TaiResult[] = [];
  if (hasAllSeasons && hasAllGentlemen) {
    // Both groups = TwoFlowerGroups, handled separately
    return null;
  }
  if (hasAllSeasons) {
    results.push({ ruleId: TaiRuleId.OneFlowerGroup, tai: 10, label: '一台花 (四季)' });
  }
  if (hasAllGentlemen) {
    results.push({ ruleId: TaiRuleId.OneFlowerGroup, tai: 10, label: '一台花 (四君子)' });
  }
  return results.length > 0 ? results : null;
};

export const checkTwoFlowerGroups: TaiRuleFn = (_hand, ctx) => {
  const flowers = ctx.flowers.map((f) => f.flower);
  const hasAllSeasons =
    flowers.includes(FlowerType.Spring) && flowers.includes(FlowerType.Summer) &&
    flowers.includes(FlowerType.Autumn) && flowers.includes(FlowerType.Winter);
  const hasAllGentlemen =
    flowers.includes(FlowerType.Plum) && flowers.includes(FlowerType.Orchid) &&
    flowers.includes(FlowerType.Chrysanthemum) && flowers.includes(FlowerType.Bamboo);

  if (hasAllSeasons && hasAllGentlemen) {
    return [{ ruleId: TaiRuleId.TwoFlowerGroups, tai: 30 }];
  }
  return null;
};

export const checkSevenRobOne: TaiRuleFn = (_hand, ctx) => {
  if (ctx.flowers.length === 7) {
    return [{ ruleId: TaiRuleId.SevenRobOne, tai: 8 }];
  }
  return null;
};

// ─────────────────────────────────────────────────
//  SEQUENCE PATTERN RULES
// ─────────────────────────────────────────────────

/** Get a serializable key for a chi meld: "suit_startValue" */
function chiKey(meld: { tiles: PlayTile[] }): string {
  const t = meld.tiles[0];
  if (t.kind === 'suit') return `${t.suit}_${t.value}`;
  return '';
}

/** Get all chi melds from a hand */
function getChiMelds(hand: Hand) {
  return hand.melds.filter((m) => m.type === MeldType.Chi);
}

/** Get number key for a chi: just the start value */
function chiNumberKey(meld: { tiles: PlayTile[] }): string {
  const t = meld.tiles[0];
  if (t.kind === 'suit') return `${t.value}`;
  return '';
}

export const checkAllSequences: TaiRuleFn = (hand, _ctx) => {
  if (isAllSequences(hand)) {
    return [{ ruleId: TaiRuleId.AllSequences, tai: 3 }];
  }
  return null;
};

export const checkPairOf258: TaiRuleFn = (hand, _ctx) => {
  const p = hand.pair[0];
  if (p.kind === 'suit' && (p.value === 2 || p.value === 5 || p.value === 8)) {
    return [{ ruleId: TaiRuleId.PairOf258, tai: 1 }];
  }
  return null;
};

export const checkOldAndYoung: TaiRuleFn = (hand, _ctx) => {
  // 老少: same suit 123+789 sequences, or 111+999 triplets
  const results: TaiResult[] = [];
  const suits = [Suit.Wan, Suit.Tong, Suit.Tiao];
  const suitLabels: Record<Suit, string> = { wan: '萬', tong: '筒', tiao: '條' };

  for (const suit of suits) {
    // Check sequences: 123 + 789
    const has123 = hand.melds.some(
      (m) => m.type === MeldType.Chi && m.tiles[0].kind === 'suit' &&
             m.tiles[0].suit === suit && m.tiles[0].value === 1,
    );
    const has789 = hand.melds.some(
      (m) => m.type === MeldType.Chi && m.tiles[0].kind === 'suit' &&
             m.tiles[0].suit === suit && m.tiles[0].value === 7,
    );

    // Check triplets: 111 + 999
    const has111 = hand.melds.some(
      (m) => (m.type === MeldType.Pong || m.type === MeldType.Kong ||
              m.type === MeldType.ConcealedKong || m.type === MeldType.AddedKong) &&
             m.tiles[0].kind === 'suit' && m.tiles[0].suit === suit && m.tiles[0].value === 1,
    );
    const has999 = hand.melds.some(
      (m) => (m.type === MeldType.Pong || m.type === MeldType.Kong ||
              m.type === MeldType.ConcealedKong || m.type === MeldType.AddedKong) &&
             m.tiles[0].kind === 'suit' && m.tiles[0].suit === suit && m.tiles[0].value === 9,
    );

    if ((has123 && has789) || (has111 && has999)) {
      results.push({ ruleId: TaiRuleId.OldAndYoung, tai: 2, label: `老少 (${suitLabels[suit]})` });
    }
  }
  return results.length > 0 ? results : null;
};

// ── Identical sequences (一般高 / 三般高 / 四般高) ──

function countIdenticalSequences(hand: Hand): number {
  const chis = getChiMelds(hand);
  if (chis.length < 2) return 0;
  const counts = new Map<string, number>();
  for (const c of chis) {
    const key = chiKey(c);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  let maxGroup = 0;
  for (const count of counts.values()) {
    if (count > maxGroup) maxGroup = count;
  }
  return maxGroup;
}

export const checkSameSequencePair: TaiRuleFn = (hand, _ctx) => {
  if (countIdenticalSequences(hand) === 2) {
    return [{ ruleId: TaiRuleId.SameSequencePair, tai: 3 }];
  }
  return null;
};

export const checkThreeSameSequences: TaiRuleFn = (hand, _ctx) => {
  if (countIdenticalSequences(hand) === 3) {
    return [{ ruleId: TaiRuleId.ThreeSameSequences, tai: 15 }];
  }
  return null;
};

export const checkFourSameSequences: TaiRuleFn = (hand, _ctx) => {
  if (countIdenticalSequences(hand) === 4) {
    return [{ ruleId: TaiRuleId.FourSameSequences, tai: 30 }];
  }
  return null;
};

// ── Mixed sequences (二相逢 / 三相逢) — same numbers, different suits ──

function countMixedSequences(hand: Hand): number {
  // Group chi melds by start value, count distinct suits per group
  const chis = getChiMelds(hand);
  const groups = new Map<number, Set<Suit>>();
  for (const c of chis) {
    const t = c.tiles[0];
    if (t.kind === 'suit') {
      const val = t.value;
      if (!groups.has(val)) groups.set(val, new Set());
      groups.get(val)!.add(t.suit);
    }
  }
  let maxDistinctSuits = 0;
  for (const suits of groups.values()) {
    if (suits.size > maxDistinctSuits) maxDistinctSuits = suits.size;
  }
  return maxDistinctSuits;
}

/** Count total sequences with the same starting number (regardless of suit) */
function countSameNumberSequences(hand: Hand): number {
  const chis = getChiMelds(hand);
  const groups = new Map<number, number>();
  for (const c of chis) {
    const t = c.tiles[0];
    if (t.kind === 'suit') {
      groups.set(t.value, (groups.get(t.value) || 0) + 1);
    }
  }
  let max = 0;
  for (const count of groups.values()) {
    if (count > max) max = count;
  }
  return max;
}

export const checkTwoMixedSequences: TaiRuleFn = (hand, _ctx) => {
  if (countMixedSequences(hand) === 2 && countSameNumberSequences(hand) === 2) {
    return [{ ruleId: TaiRuleId.TwoMixedSequences, tai: 2 }];
  }
  return null;
};

export const checkThreeMixedSequences: TaiRuleFn = (hand, _ctx) => {
  if (countMixedSequences(hand) >= 3 && countSameNumberSequences(hand) >= 3) {
    return [{ ruleId: TaiRuleId.ThreeMixedSequences, tai: 10 }];
  }
  return null;
};

export const checkFourSameNumber: TaiRuleFn = (hand, _ctx) => {
  if (countSameNumberSequences(hand) === 4) {
    return [{ ruleId: TaiRuleId.FourSameNumber, tai: 20 }];
  }
  return null;
};

export const checkFiveSameNumber: TaiRuleFn = (hand, _ctx) => {
  if (countSameNumberSequences(hand) === 5) {
    return [{ ruleId: TaiRuleId.FiveSameNumber, tai: 40 }];
  }
  return null;
};

// ── Straight (龍 / 雜龍) — 1-2-3, 4-5-6, 7-8-9 ──

interface StraightResult { allConcealed: boolean; sameSuit: boolean }

function findStraight(hand: Hand): StraightResult | null {
  const chis = getChiMelds(hand);
  // Need three chi starting at 1, 4, 7
  const starts = new Map<number, { suit: Suit; concealed: boolean }[]>();
  for (const c of chis) {
    const t = c.tiles[0];
    if (t.kind === 'suit' && (t.value === 1 || t.value === 4 || t.value === 7)) {
      if (!starts.has(t.value)) starts.set(t.value, []);
      starts.get(t.value)!.push({ suit: t.suit, concealed: c.isConcealed });
    }
  }

  const s1 = starts.get(1); const s4 = starts.get(4); const s7 = starts.get(7);
  if (!s1 || !s4 || !s7) return null;

  // Try all combinations to find the best straight
  let best: StraightResult | null = null;
  for (const a of s1) {
    for (const b of s4) {
      for (const c of s7) {
        const sameSuit = a.suit === b.suit && b.suit === c.suit;
        const allConcealed = a.concealed && b.concealed && c.concealed;
        // Prefer sameSuit > mixed, concealed > open
        if (!best ||
            (sameSuit && !best.sameSuit) ||
            (sameSuit === best.sameSuit && allConcealed && !best.allConcealed)) {
          best = { sameSuit, allConcealed };
        }
      }
    }
  }
  return best;
}

export const checkConcealedPureStraight: TaiRuleFn = (hand, _ctx) => {
  const result = findStraight(hand);
  if (result && result.sameSuit && result.allConcealed) {
    return [{ ruleId: TaiRuleId.ConcealedPureStraight, tai: 20 }];
  }
  return null;
};

export const checkOpenPureStraight: TaiRuleFn = (hand, _ctx) => {
  const result = findStraight(hand);
  if (result && result.sameSuit && !result.allConcealed) {
    return [{ ruleId: TaiRuleId.OpenPureStraight, tai: 10 }];
  }
  return null;
};

export const checkConcealedMixedStraight: TaiRuleFn = (hand, _ctx) => {
  const result = findStraight(hand);
  if (result && !result.sameSuit && result.allConcealed) {
    return [{ ruleId: TaiRuleId.ConcealedMixedStraight, tai: 15 }];
  }
  return null;
};

export const checkOpenMixedStraight: TaiRuleFn = (hand, _ctx) => {
  const result = findStraight(hand);
  if (result && !result.sameSuit && !result.allConcealed) {
    return [{ ruleId: TaiRuleId.OpenMixedStraight, tai: 8 }];
  }
  return null;
};

// ─────────────────────────────────────────────────
//  TRIPLET PATTERN RULES
// ─────────────────────────────────────────────────

export const checkAllTriplets: TaiRuleFn = (hand, _ctx) => {
  if (isAllTriplets(hand)) {
    return [{ ruleId: TaiRuleId.AllTriplets, tai: 30 }];
  }
  return null;
};

export const checkTwoConcealedTriplets: TaiRuleFn = (hand, _ctx) => {
  const count = countConcealedTriplets(hand);
  if (count === 2) {
    return [{ ruleId: TaiRuleId.TwoConcealedTriplets, tai: 3 }];
  }
  return null;
};

export const checkThreeConcealedTriplets: TaiRuleFn = (hand, _ctx) => {
  const count = countConcealedTriplets(hand);
  if (count === 3) {
    return [{ ruleId: TaiRuleId.ThreeConcealedTriplets, tai: 10 }];
  }
  return null;
};

export const checkFourConcealedTriplets: TaiRuleFn = (hand, _ctx) => {
  const count = countConcealedTriplets(hand);
  if (count === 4) {
    return [{ ruleId: TaiRuleId.FourConcealedTriplets, tai: 30 }];
  }
  return null;
};

export const checkFiveConcealedTriplets: TaiRuleFn = (hand, _ctx) => {
  const count = countConcealedTriplets(hand);
  if (count === 5) {
    return [{ ruleId: TaiRuleId.FiveConcealedTriplets, tai: 80 }];
  }
  return null;
};

// ── Brothers (兄弟) — same number triplets, different suits ──

function getSuitTriplets(hand: Hand): { suit: Suit; value: SuitValue }[] {
  const results: { suit: Suit; value: SuitValue }[] = [];
  for (const meld of hand.melds) {
    if (
      (meld.type === MeldType.Pong || meld.type === MeldType.Kong ||
       meld.type === MeldType.ConcealedKong || meld.type === MeldType.AddedKong) &&
      meld.tiles[0].kind === 'suit'
    ) {
      results.push({ suit: meld.tiles[0].suit, value: meld.tiles[0].value });
    }
  }
  return results;
}

export const checkTwoBrothers: TaiRuleFn = (hand, _ctx) => {
  const triplets = getSuitTriplets(hand);
  // Group by value, count distinct suits
  const byValue = new Map<number, Set<Suit>>();
  for (const t of triplets) {
    if (!byValue.has(t.value)) byValue.set(t.value, new Set());
    byValue.get(t.value)!.add(t.suit);
  }
  for (const suits of byValue.values()) {
    if (suits.size === 2) return [{ ruleId: TaiRuleId.TwoBrothers, tai: 3 }];
  }
  return null;
};

export const checkSmallThreeBrothers: TaiRuleFn = (hand, _ctx) => {
  const triplets = getSuitTriplets(hand);
  const byValue = new Map<number, Set<Suit>>();
  for (const t of triplets) {
    if (!byValue.has(t.value)) byValue.set(t.value, new Set());
    byValue.get(t.value)!.add(t.suit);
  }
  // Need 2 brother triplets + pair of same value
  for (const [val, suits] of byValue) {
    if (suits.size >= 2) {
      const p = hand.pair[0];
      if (p.kind === 'suit' && p.value === val && !suits.has(p.suit)) {
        return [{ ruleId: TaiRuleId.SmallThreeBrothers, tai: 10 }];
      }
    }
  }
  return null;
};

export const checkBigThreeBrothers: TaiRuleFn = (hand, _ctx) => {
  const triplets = getSuitTriplets(hand);
  const byValue = new Map<number, Set<Suit>>();
  for (const t of triplets) {
    if (!byValue.has(t.value)) byValue.set(t.value, new Set());
    byValue.get(t.value)!.add(t.suit);
  }
  for (const suits of byValue.values()) {
    if (suits.size === 3) return [{ ruleId: TaiRuleId.BigThreeBrothers, tai: 15 }];
  }
  return null;
};

// ── Sisters (姊妹) — consecutive same-suit triplets ──

export const checkSmallThreeSisters: TaiRuleFn = (hand, _ctx) => {
  const triplets = getSuitTriplets(hand);
  // Group by suit
  const bySuit = new Map<Suit, SuitValue[]>();
  for (const t of triplets) {
    if (!bySuit.has(t.suit)) bySuit.set(t.suit, []);
    bySuit.get(t.suit)!.push(t.value);
  }
  // Check for 2 consecutive + pair as 3rd consecutive
  for (const [suit, vals] of bySuit) {
    vals.sort((a, b) => a - b);
    for (let i = 0; i < vals.length - 1; i++) {
      if (vals[i + 1] === vals[i] + 1) {
        // Two consecutive triplets found
        const p = hand.pair[0];
        if (p.kind === 'suit' && p.suit === suit) {
          if (p.value === vals[i] - 1 || p.value === vals[i + 1] + 1) {
            return [{ ruleId: TaiRuleId.SmallThreeSisters, tai: 8 }];
          }
        }
      }
    }
  }
  return null;
};

export const checkBigThreeSisters: TaiRuleFn = (hand, _ctx) => {
  const triplets = getSuitTriplets(hand);
  const bySuit = new Map<Suit, SuitValue[]>();
  for (const t of triplets) {
    if (!bySuit.has(t.suit)) bySuit.set(t.suit, []);
    bySuit.get(t.suit)!.push(t.value);
  }
  for (const vals of bySuit.values()) {
    vals.sort((a, b) => a - b);
    for (let i = 0; i < vals.length - 2; i++) {
      if (vals[i + 1] === vals[i] + 1 && vals[i + 2] === vals[i] + 2) {
        return [{ ruleId: TaiRuleId.BigThreeSisters, tai: 15 }];
      }
    }
  }
  return null;
};

// ── Four of a Kind (四歸) ──

function countTileOccurrences(hand: Hand): Map<string, { total: number; inPair: number; inChi: number }> {
  const counts = new Map<string, { total: number; inPair: number; inChi: number }>();

  const ensure = (key: string) => {
    if (!counts.has(key)) counts.set(key, { total: 0, inPair: 0, inChi: 0 });
    return counts.get(key)!;
  };

  for (const meld of hand.melds) {
    for (const tile of meld.tiles) {
      const entry = ensure(tileKey(tile));
      entry.total++;
      if (meld.type === MeldType.Chi) entry.inChi++;
    }
  }
  for (const tile of hand.pair) {
    const entry = ensure(tileKey(tile));
    entry.total++;
    entry.inPair++;
  }

  return counts;
}

export const checkFourToOne: TaiRuleFn = (hand, _ctx) => {
  const counts = countTileOccurrences(hand);
  const results: TaiResult[] = [];
  for (const [key, info] of counts) {
    if (info.total === 4 && info.inPair === 0 && info.inChi < 4) {
      results.push({ ruleId: TaiRuleId.FourToOne, tai: 5, label: `四歸一` });
    }
  }
  return results.length > 0 ? results : null;
};

export const checkFourToTwo: TaiRuleFn = (hand, _ctx) => {
  const counts = countTileOccurrences(hand);
  for (const [key, info] of counts) {
    if (info.total === 4 && info.inPair === 2) {
      return [{ ruleId: TaiRuleId.FourToTwo, tai: 10 }];
    }
  }
  return null;
};

export const checkFourToFour: TaiRuleFn = (hand, _ctx) => {
  const counts = countTileOccurrences(hand);
  for (const [key, info] of counts) {
    if (info.total === 4 && info.inChi === 4) {
      return [{ ruleId: TaiRuleId.FourToFour, tai: 20 }];
    }
  }
  return null;
};

// ─────────────────────────────────────────────────
//  FLUSH RULES
// ─────────────────────────────────────────────────

export const checkHalfFlush: TaiRuleFn = (hand, _ctx) => {
  const suits = getSuitsInHand(hand);
  const hasHonors = hasHonorTiles(hand);
  if (suits.size === 1 && hasHonors) {
    return [{ ruleId: TaiRuleId.HalfFlush, tai: 30 }];
  }
  return null;
};

export const checkFullFlush: TaiRuleFn = (hand, _ctx) => {
  const allTiles = getAllTiles(hand);
  const suitTiles = allTiles.filter(isSuit);
  if (suitTiles.length === allTiles.length && suitTiles.length > 0) {
    const suits = new Set(suitTiles.map((t) => t.suit));
    if (suits.size === 1) {
      return [{ ruleId: TaiRuleId.FullFlush, tai: 80 }];
    }
  }
  return null;
};

// ─────────────────────────────────────────────────
//  TERMINAL RULES
// ─────────────────────────────────────────────────

export const checkAllMiddle: TaiRuleFn = (hand, _ctx) => {
  // 斷么: no terminals (1 or 9) and no honors
  const allTiles = getAllTiles(hand);
  for (const tile of allTiles) {
    if (isHonor(tile)) return null;
    if (isTerminal(tile)) return null;
  }
  return [{ ruleId: TaiRuleId.AllMiddle, tai: 5 }];
};

export const checkMixedTerminalChows: TaiRuleFn = (hand, _ctx) => {
  // 全帶混么: every meld and pair has at least one terminal or honor
  for (const meld of hand.melds) {
    const hasTerminalOrHonor = meld.tiles.some((t) => isHonor(t) || isTerminal(t));
    if (!hasTerminalOrHonor) return null;
  }
  // Pair must also be terminal or honor
  const pairOk = hand.pair.some((t) => isHonor(t) || isTerminal(t));
  if (!pairOk) return null;

  // Must have at least some sequences (otherwise it's 混么)
  const hasSequences = hand.melds.some((m) => m.type === MeldType.Chi);
  if (!hasSequences) return null;

  return [{ ruleId: TaiRuleId.MixedTerminalChows, tai: 10 }];
};

export const checkPureTerminalChows: TaiRuleFn = (hand, _ctx) => {
  // 全帶么: every meld has a terminal, NO honors
  if (hasHonorTiles(hand)) return null;

  for (const meld of hand.melds) {
    const hasTerminal = meld.tiles.some((t) => isTerminal(t));
    if (!hasTerminal) return null;
  }
  const pairOk = hand.pair.some((t) => isTerminal(t));
  if (!pairOk) return null;

  const hasSequences = hand.melds.some((m) => m.type === MeldType.Chi);
  if (!hasSequences) return null;

  return [{ ruleId: TaiRuleId.PureTerminalChows, tai: 15 }];
};

export const checkMixedTerminals: TaiRuleFn = (hand, _ctx) => {
  // 混么: all tiles are terminals or honors
  const allTiles = getAllTiles(hand);
  for (const tile of allTiles) {
    if (!isHonor(tile) && !isTerminal(tile)) return null;
  }
  // Must have both terminals and honors
  const hasTerminals = allTiles.some((t) => isTerminal(t));
  const hasHonors = allTiles.some((t) => isHonor(t));
  if (!hasTerminals || !hasHonors) return null;

  return [{ ruleId: TaiRuleId.MixedTerminals, tai: 30 }];
};

export const checkAllTerminals: TaiRuleFn = (hand, _ctx) => {
  // 清么: all tiles are terminals only
  const allTiles = getAllTiles(hand);
  for (const tile of allTiles) {
    if (!isTerminal(tile)) return null;
  }
  return [{ ruleId: TaiRuleId.AllTerminals, tai: 80 }];
};

// ─────────────────────────────────────────────────
//  OPEN HAND RULES
// ─────────────────────────────────────────────────

export const checkFullyOpen: TaiRuleFn = (hand, ctx) => {
  if (ctx.isSelfDraw) return null;

  const openMelds = hand.melds.filter((m) => !m.isConcealed);
  if (openMelds.length === hand.melds.length && hand.melds.length === 5) {
    return [{ ruleId: TaiRuleId.FullyOpen, tai: 15 }];
  }
  return null;
};

export const checkHalfOpen: TaiRuleFn = (hand, ctx) => {
  if (!ctx.isSelfDraw) return null;

  const openMelds = hand.melds.filter((m) => !m.isConcealed);
  if (openMelds.length === hand.melds.length && hand.melds.length === 5) {
    return [{ ruleId: TaiRuleId.HalfOpen, tai: 8 }];
  }
  return null;
};

// ─────────────────────────────────────────────────
//  SPECIAL RULES
// ─────────────────────────────────────────────────

export const checkLastDiscard: TaiRuleFn = (_hand, ctx) => {
  if (ctx.isLastDiscard) {
    return [{ ruleId: TaiRuleId.LastDiscard, tai: 1 }];
  }
  return null;
};

export const checkLastTileSelfDraw: TaiRuleFn = (_hand, ctx) => {
  if (ctx.isLastTileSelfDraw) {
    return [{ ruleId: TaiRuleId.LastTileSelfDraw, tai: 20 }];
  }
  return null;
};

export const checkWinAfterKong: TaiRuleFn = (_hand, ctx) => {
  if (ctx.isAfterKong) {
    return [{ ruleId: TaiRuleId.WinAfterKong, tai: 1 }];
  }
  return null;
};

export const checkRobbingKong: TaiRuleFn = (_hand, ctx) => {
  if (ctx.isRobbingKong) {
    return [{ ruleId: TaiRuleId.RobbingKong, tai: 1 }];
  }
  return null;
};

export const checkKongOnKong: TaiRuleFn = (_hand, ctx) => {
  if (ctx.isKongOnKong) {
    return [{ ruleId: TaiRuleId.KongOnKong, tai: 30 }];
  }
  return null;
};

export const checkFourKongs: TaiRuleFn = (hand, _ctx) => {
  if (countKongs(hand) === 4) {
    return [{ ruleId: TaiRuleId.FourKongs, tai: 8 }];
  }
  return null;
};

export const checkWinWithin7: TaiRuleFn = (_hand, ctx) => {
  if (ctx.tilesDrawn !== undefined && ctx.tilesDrawn > 0 && ctx.tilesDrawn <= 7) {
    return [{ ruleId: TaiRuleId.WinWithin7, tai: 20 }];
  }
  return null;
};

export const checkWinWithin10: TaiRuleFn = (_hand, ctx) => {
  if (ctx.tilesDrawn !== undefined && ctx.tilesDrawn > 7 && ctx.tilesDrawn <= 10) {
    return [{ ruleId: TaiRuleId.WinWithin10, tai: 10 }];
  }
  return null;
};

export const checkHeavenlyHand: TaiRuleFn = (_hand, ctx) => {
  if (ctx.isHeavenlyHand) {
    return [{ ruleId: TaiRuleId.HeavenlyHand, tai: 100 }];
  }
  return null;
};

export const checkEarthlyHand: TaiRuleFn = (_hand, ctx) => {
  if (ctx.isEarthlyHand) {
    return [{ ruleId: TaiRuleId.EarthlyHand, tai: 80 }];
  }
  return null;
};

export const checkHumanHand: TaiRuleFn = (_hand, ctx) => {
  if (ctx.isHumanHand) {
    return [{ ruleId: TaiRuleId.HumanHand, tai: 80 }];
  }
  return null;
};

export const checkAllConcealedTripletsSD: TaiRuleFn = (hand, ctx) => {
  // 間間胡: concealed + all triplets + self draw
  if (hand.isConcealed && isAllTriplets(hand) && ctx.isSelfDraw) {
    return [{ ruleId: TaiRuleId.AllConcealedTripletsSD, tai: 100 }];
  }
  return null;
};

export const checkThirteenOrphans: TaiRuleFn = (_hand, ctx) => {
  if (ctx.isThirteenOrphans) {
    return [{ ruleId: TaiRuleId.ThirteenOrphans, tai: 80 }];
  }
  return null;
};

export const checkSixteenUnrelated: TaiRuleFn = (_hand, ctx) => {
  if (ctx.isSixteenUnrelated) {
    return [{ ruleId: TaiRuleId.SixteenUnrelated, tai: 40 }];
  }
  return null;
};

export const checkEightPairs: TaiRuleFn = (_hand, ctx) => {
  if (ctx.isEightPairs) {
    return [{ ruleId: TaiRuleId.EightPairs, tai: 40 }];
  }
  return null;
};

// ─────────────────────────────────────────────────
//  ALL RULES REGISTRY
// ─────────────────────────────────────────────────

export const ALL_TAI_RULES: TaiRuleFn[] = [
  // Basic
  checkDealer,
  checkDealerStreak,
  checkSelfDraw,
  checkConcealed,
  checkConcealedSelfDraw,
  checkSingleWait,
  checkDoublePongWait,
  checkReady,
  checkOpenKongBonus,
  checkConcealedKongBonus,
  checkNoHonors,
  checkNoHonorsNoFlowers,
  checkGrandPingHu,
  checkMissingOneSuit,
  checkFiveTypes,

  // Wind
  checkMatchingWindTriplet,
  checkWindTriplet,
  checkSmallThreeWinds,
  checkBigThreeWinds,
  checkSmallFourWinds,
  checkBigFourWinds,

  // Dragon
  checkDragonTriplets,
  checkSmallThreeDragons,
  checkBigThreeDragons,

  // Flower
  checkMatchingFlowers,
  checkNonMatchingFlowers,
  checkNoFlowers,
  checkOneFlowerGroup,
  checkTwoFlowerGroups,
  checkSevenRobOne,

  // Sequence patterns
  checkAllSequences,
  checkPairOf258,
  checkOldAndYoung,
  checkSameSequencePair,
  checkThreeSameSequences,
  checkFourSameSequences,
  checkTwoMixedSequences,
  checkThreeMixedSequences,
  checkFourSameNumber,
  checkFiveSameNumber,
  checkConcealedPureStraight,
  checkOpenPureStraight,
  checkConcealedMixedStraight,
  checkOpenMixedStraight,

  // Triplet patterns
  checkAllTriplets,
  checkTwoConcealedTriplets,
  checkThreeConcealedTriplets,
  checkFourConcealedTriplets,
  checkFiveConcealedTriplets,
  checkTwoBrothers,
  checkSmallThreeBrothers,
  checkBigThreeBrothers,
  checkSmallThreeSisters,
  checkBigThreeSisters,
  checkFourToOne,
  checkFourToTwo,
  checkFourToFour,

  // Flush
  checkHalfFlush,
  checkFullFlush,

  // Terminal
  checkAllMiddle,
  checkMixedTerminalChows,
  checkPureTerminalChows,
  checkMixedTerminals,
  checkAllTerminals,

  // Open hand
  checkFullyOpen,
  checkHalfOpen,

  // Special
  checkLastDiscard,
  checkLastTileSelfDraw,
  checkWinAfterKong,
  checkRobbingKong,
  checkKongOnKong,
  checkFourKongs,
  checkWinWithin7,
  checkWinWithin10,
  checkHeavenlyHand,
  checkEarthlyHand,
  checkHumanHand,
  checkAllConcealedTripletsSD,
  checkThirteenOrphans,
  checkSixteenUnrelated,
  checkEightPairs,
];
