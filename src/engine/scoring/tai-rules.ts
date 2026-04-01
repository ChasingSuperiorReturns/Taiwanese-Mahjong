// ─── Tai Rule Implementations ───
// Each rule is a pure function: (hand, context) => TaiResult[] | null
// Returns array to support stackable rules (e.g., multiple dragon triplets).

import {
  PlayTile, MeldType, Wind, Dragon, Suit,
  isDragon, isWind, isSuit, isHonor,
  flowerMatchesWind, isSeasonFlower, isGentlemanFlower, FlowerType,
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
  /** Descriptive label, e.g. "Dragon Triplet (中)" */
  label?: string;
}

type TaiRuleFn = (hand: Hand, ctx: GameContext) => TaiResult[] | null;

// ─── Basic Rules (1台) ───

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

export const checkConcealed: TaiRuleFn = (hand, ctx) => {
  // 門清: concealed hand, win by discard (not self-draw)
  // If self-draw + concealed, handled by ConcealedSelfDraw instead
  if (hand.isConcealed && !ctx.isSelfDraw) {
    return [{ ruleId: TaiRuleId.Concealed, tai: 1 }];
  }
  return null;
};

export const checkSelfDraw: TaiRuleFn = (_hand, ctx) => {
  // 自摸: won by self-draw
  // If concealed + self-draw, this is excluded by ConcealedSelfDraw in conflict resolution
  if (ctx.isSelfDraw) {
    return [{ ruleId: TaiRuleId.SelfDraw, tai: 1 }];
  }
  return null;
};

export const checkSingleWait: TaiRuleFn = (hand, _ctx) => {
  if (hand.isSingleWait) {
    return [{ ruleId: TaiRuleId.SingleWait, tai: 1 }];
  }
  return null;
};

// ─── Wind Rules ───

export const checkRoundWind: TaiRuleFn = (hand, ctx) => {
  const hasRoundWind = hand.melds.some(
    (m) =>
      (m.type === MeldType.Pong || m.type === MeldType.Kong ||
       m.type === MeldType.ConcealedKong || m.type === MeldType.AddedKong) &&
      m.tiles[0].kind === 'wind' &&
      m.tiles[0].wind === ctx.roundWind,
  );
  if (hasRoundWind) {
    return [{ ruleId: TaiRuleId.RoundWind, tai: 1 }];
  }
  return null;
};

export const checkSeatWind: TaiRuleFn = (hand, ctx) => {
  const hasSeatWind = hand.melds.some(
    (m) =>
      (m.type === MeldType.Pong || m.type === MeldType.Kong ||
       m.type === MeldType.ConcealedKong || m.type === MeldType.AddedKong) &&
      m.tiles[0].kind === 'wind' &&
      m.tiles[0].wind === ctx.seatWind,
  );
  if (hasSeatWind) {
    return [{ ruleId: TaiRuleId.SeatWind, tai: 1 }];
  }
  return null;
};

// ─── Dragon Rules ───

export const checkDragonTriplets: TaiRuleFn = (hand, _ctx) => {
  const results: TaiResult[] = [];
  const dragonLabels: Record<Dragon, string> = {
    [Dragon.Red]: '中',
    [Dragon.Green]: '發',
    [Dragon.White]: '白',
  };

  for (const meld of hand.melds) {
    if (
      (meld.type === MeldType.Pong || meld.type === MeldType.Kong ||
       meld.type === MeldType.ConcealedKong || meld.type === MeldType.AddedKong) &&
      meld.tiles[0].kind === 'dragon'
    ) {
      const dragon = meld.tiles[0].dragon;
      results.push({
        ruleId: TaiRuleId.DragonTriplet,
        tai: 1,
        label: `三元牌 (${dragonLabels[dragon]})`,
      });
    }
  }

  return results.length > 0 ? results : null;
};

export const checkSmallThreeDragons: TaiRuleFn = (hand, _ctx) => {
  // 小三元: 2 dragon triplets + 1 dragon pair
  const dragonMelds = hand.melds.filter(
    (m) =>
      (m.type === MeldType.Pong || m.type === MeldType.Kong ||
       m.type === MeldType.ConcealedKong || m.type === MeldType.AddedKong) &&
      m.tiles[0].kind === 'dragon',
  );
  const dragonPair =
    hand.pair[0].kind === 'dragon' && hand.pair[1].kind === 'dragon';

  if (dragonMelds.length === 2 && dragonPair) {
    return [{ ruleId: TaiRuleId.SmallThreeDragons, tai: 4 }];
  }
  return null;
};

export const checkBigThreeDragons: TaiRuleFn = (hand, _ctx) => {
  // 大三元: triplets of all 3 dragons
  const dragonMelds = hand.melds.filter(
    (m) =>
      (m.type === MeldType.Pong || m.type === MeldType.Kong ||
       m.type === MeldType.ConcealedKong || m.type === MeldType.AddedKong) &&
      m.tiles[0].kind === 'dragon',
  );
  const dragons = new Set(dragonMelds.map((m) => (m.tiles[0] as { dragon: Dragon }).dragon));

  if (dragons.size === 3) {
    return [{ ruleId: TaiRuleId.BigThreeDragons, tai: 8 }];
  }
  return null;
};

// ─── Flower Rules ───

export const checkMatchingFlowers: TaiRuleFn = (_hand, ctx) => {
  const results: TaiResult[] = [];
  for (const flower of ctx.flowers) {
    if (flowerMatchesWind(flower.flower, ctx.seatWind)) {
      results.push({
        ruleId: TaiRuleId.MatchingFlower,
        tai: 1,
        label: `正花 (${flower.flower})`,
      });
    }
  }
  return results.length > 0 ? results : null;
};

export const checkFlowerGroup: TaiRuleFn = (_hand, ctx) => {
  const results: TaiResult[] = [];
  const flowers = ctx.flowers.map((f) => f.flower);

  const hasAllSeasons =
    flowers.includes(FlowerType.Spring) &&
    flowers.includes(FlowerType.Summer) &&
    flowers.includes(FlowerType.Autumn) &&
    flowers.includes(FlowerType.Winter);

  const hasAllGentlemen =
    flowers.includes(FlowerType.Plum) &&
    flowers.includes(FlowerType.Orchid) &&
    flowers.includes(FlowerType.Chrysanthemum) &&
    flowers.includes(FlowerType.Bamboo);

  if (hasAllSeasons) {
    results.push({ ruleId: TaiRuleId.FlowerGroup, tai: 2, label: '花槓 (四季)' });
  }
  if (hasAllGentlemen) {
    results.push({ ruleId: TaiRuleId.FlowerGroup, tai: 2, label: '花槓 (四君子)' });
  }

  return results.length > 0 ? results : null;
};

export const checkEightFlowers: TaiRuleFn = (_hand, ctx) => {
  if (ctx.flowers.length === 8) {
    return [{ ruleId: TaiRuleId.EightFlowers, tai: 8 }];
  }
  return null;
};

export const checkSevenRobOne: TaiRuleFn = (_hand, ctx) => {
  if (ctx.flowers.length === 7) {
    return [{ ruleId: TaiRuleId.SevenRobOne, tai: 8 }];
  }
  return null;
};

// ─── Special Rules ───

export const checkLastDiscard: TaiRuleFn = (_hand, ctx) => {
  if (ctx.isLastDiscard) {
    return [{ ruleId: TaiRuleId.LastDiscard, tai: 1 }];
  }
  return null;
};

export const checkLastTileSelfDraw: TaiRuleFn = (_hand, ctx) => {
  if (ctx.isLastTileSelfDraw) {
    return [{ ruleId: TaiRuleId.LastTileSelfDraw, tai: 1 }];
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

export const checkHeavenlyHand: TaiRuleFn = (_hand, ctx) => {
  if (ctx.isHeavenlyHand) {
    return [{ ruleId: TaiRuleId.HeavenlyHand, tai: 32 }];
  }
  return null;
};

export const checkEarthlyHand: TaiRuleFn = (_hand, ctx) => {
  if (ctx.isEarthlyHand) {
    return [{ ruleId: TaiRuleId.EarthlyHand, tai: 16 }];
  }
  return null;
};

// ─── Pattern Rules ───

export const checkAllTriplets: TaiRuleFn = (hand, _ctx) => {
  if (isAllTriplets(hand)) {
    return [{ ruleId: TaiRuleId.AllTriplets, tai: 4 }];
  }
  return null;
};

export const checkAllSequences: TaiRuleFn = (hand, ctx) => {
  // 平胡 strict conditions:
  // 1. No flowers (無花)
  // 2. No honor tiles (無字)
  // 3. No triplets — all sequences (無刻)
  // 4. Pair must be pre-existing (先有眼) — pair is not the winning component
  // 5. Double-sided wait (聽雙頭) — not a single wait
  // 6. Not self-drawn (非自摸)

  if (ctx.flowers.length > 0) return null; // 無花
  if (hasHonorTiles(hand)) return null; // 無字
  if (!isAllSequences(hand)) return null; // 無刻
  if (ctx.isSelfDraw) return null; // 非自摸
  if (hand.isSingleWait) return null; // 聽雙頭 (NOT single wait)

  // Check that none of the melds are open (concealed = no chi from others)
  // Actually for 平胡, having open chi is debatable. The strict rule says "no chi claimed".
  // But the Wikibooks source doesn't explicitly require concealed for 平胡.
  // We'll follow the common interpretation: 平胡 can include open chi.

  return [{ ruleId: TaiRuleId.AllSequences, tai: 2 }];
};

export const checkConcealedSelfDraw: TaiRuleFn = (hand, ctx) => {
  // 不求（門清自摸）: concealed + self-draw = 3 tai
  if (hand.isConcealed && ctx.isSelfDraw) {
    return [{ ruleId: TaiRuleId.ConcealedSelfDraw, tai: 3 }];
  }
  return null;
};

export const checkFullyOpen: TaiRuleFn = (hand, ctx) => {
  // 全求: all melds are open, hand has only 1 tile left (pair wait), win by discard
  if (ctx.isSelfDraw) return null;

  const openMelds = hand.melds.filter((m) => !m.isConcealed);
  if (openMelds.length === hand.melds.length && hand.melds.length === 5) {
    // All 5 melds open and the pair is the wait — that's 全求
    // The "single tile left" condition is implicit: 5 open melds = 15 tiles open, 1 tile as pair wait
    return [{ ruleId: TaiRuleId.FullyOpen, tai: 2 }];
  }
  return null;
};

export const checkThreeConcealedTriplets: TaiRuleFn = (hand, _ctx) => {
  const count = countConcealedTriplets(hand);
  if (count >= 3) {
    return [{ ruleId: TaiRuleId.ThreeConcealedTriplets, tai: 2 }];
  }
  return null;
};

export const checkFourConcealedTriplets: TaiRuleFn = (hand, _ctx) => {
  const count = countConcealedTriplets(hand);
  if (count >= 4) {
    return [{ ruleId: TaiRuleId.FourConcealedTriplets, tai: 5 }];
  }
  return null;
};

export const checkFiveConcealedTriplets: TaiRuleFn = (hand, _ctx) => {
  const count = countConcealedTriplets(hand);
  if (count === 5) {
    return [{ ruleId: TaiRuleId.FiveConcealedTriplets, tai: 8 }];
  }
  return null;
};

// ─── Flush Rules ───

export const checkHalfFlush: TaiRuleFn = (hand, _ctx) => {
  // 混一色: one suit + honors
  const suits = getSuitsInHand(hand);
  const hasHonors = hasHonorTiles(hand);

  if (suits.size === 1 && hasHonors) {
    return [{ ruleId: TaiRuleId.HalfFlush, tai: 4 }];
  }
  return null;
};

export const checkFullFlush: TaiRuleFn = (hand, _ctx) => {
  // 清一色: one suit only, no honors
  const allTiles = getAllTiles(hand);
  const suitTiles = allTiles.filter(isSuit);

  if (suitTiles.length === allTiles.length && suitTiles.length > 0) {
    const suits = new Set(suitTiles.map((t) => t.suit));
    if (suits.size === 1) {
      return [{ ruleId: TaiRuleId.FullFlush, tai: 8 }];
    }
  }
  return null;
};

// ─── Wind Combination Rules ───

function countWindTriplets(hand: Hand): { tripletWinds: Set<Wind>; pairWind: Wind | null } {
  const tripletWinds = new Set<Wind>();
  for (const meld of hand.melds) {
    if (
      (meld.type === MeldType.Pong || meld.type === MeldType.Kong ||
       meld.type === MeldType.ConcealedKong || meld.type === MeldType.AddedKong) &&
      meld.tiles[0].kind === 'wind'
    ) {
      tripletWinds.add(meld.tiles[0].wind);
    }
  }
  const pairWind =
    hand.pair[0].kind === 'wind' ? hand.pair[0].wind : null;

  return { tripletWinds, pairWind };
}

export const checkSmallFourWinds: TaiRuleFn = (hand, _ctx) => {
  const { tripletWinds, pairWind } = countWindTriplets(hand);
  if (tripletWinds.size === 3 && pairWind !== null && !tripletWinds.has(pairWind)) {
    return [{ ruleId: TaiRuleId.SmallFourWinds, tai: 8 }];
  }
  return null;
};

export const checkBigFourWinds: TaiRuleFn = (hand, _ctx) => {
  const { tripletWinds } = countWindTriplets(hand);
  if (tripletWinds.size === 4) {
    return [{ ruleId: TaiRuleId.BigFourWinds, tai: 16 }];
  }
  return null;
};

// ─── Kong Rule ───

export const checkFourKongs: TaiRuleFn = (hand, _ctx) => {
  const kongCount = countKongs(hand);
  if (kongCount === 4) {
    return [{ ruleId: TaiRuleId.FourKongs, tai: 8 }];
  }
  return null;
};

// ─── All Rules Registry ───

/**
 * All tai rule check functions, in evaluation order.
 * The scorer runs all of these, collects results, then applies conflict resolution.
 */
export const ALL_TAI_RULES: TaiRuleFn[] = [
  // Basic
  checkDealer,
  checkDealerStreak,
  checkConcealed,
  checkSelfDraw,
  checkConcealedSelfDraw,
  checkSingleWait,

  // Wind
  checkRoundWind,
  checkSeatWind,
  checkSmallFourWinds,
  checkBigFourWinds,

  // Dragon
  checkDragonTriplets,
  checkSmallThreeDragons,
  checkBigThreeDragons,

  // Flower
  checkMatchingFlowers,
  checkFlowerGroup,
  checkEightFlowers,
  checkSevenRobOne,

  // Pattern
  checkAllTriplets,
  checkAllSequences,
  checkFullyOpen,
  checkThreeConcealedTriplets,
  checkFourConcealedTriplets,
  checkFiveConcealedTriplets,

  // Flush
  checkHalfFlush,
  checkFullFlush,

  // Special
  checkLastDiscard,
  checkLastTileSelfDraw,
  checkWinAfterKong,
  checkRobbingKong,
  checkFourKongs,
  checkHeavenlyHand,
  checkEarthlyHand,
];
