// ─── Example tiles for each tai rule ───
// Each entry shows the key tiles that trigger the rule.
// Groups are rendered as visual meld clusters in the reference screen.

import { PlayTile, W, T, S, EAST, SOUTH, WEST, NORTH, RED, GREEN, WHITE } from '@/src/engine/tiles';
import { TaiRuleId } from './tai-catalog';

export interface TaiExample {
  /** Tile groups — each inner array is a visual cluster (meld/pair/context) */
  tiles: PlayTile[][];
  /** Optional short label for the example, e.g. "東位" */
  label?: string;
}

/**
 * Example tiles for each tai rule.
 * Rules that are purely contextual (no tile pattern) have no entry.
 */
export const TAI_EXAMPLES: Partial<Record<TaiRuleId, TaiExample>> = {

  // ═══════════════ BASIC ═══════════════

  // Dealer / DealerStreak / SelfDraw / Ready — contextual, no tile pattern

  [TaiRuleId.Concealed]: {
    // Full concealed hand example
    tiles: [
      [W(1), W(2), W(3)],
      [T(4), T(5), T(6)],
      [S(7), S(8), S(9)],
      [EAST, EAST, EAST],
      [W(5), W(5)],
    ],
    label: '門前清，全部暗牌',
  },

  [TaiRuleId.ConcealedSelfDraw]: {
    tiles: [
      [W(2), W(3), W(4)],
      [T(3), T(4), T(5)],
      [S(1), S(2), S(3)],
      [NORTH, NORTH, NORTH],
      [T(9), T(9)],
    ],
    label: '門前清 + 自摸',
  },

  [TaiRuleId.SingleWait]: {
    tiles: [
      [W(5), W(5)],
    ],
    label: '單釣一隻牌',
  },

  [TaiRuleId.DoublePongWait]: {
    tiles: [
      [T(3), T(3)],
      [S(7), S(7)],
    ],
    label: '等其中一隻碰出',
  },

  [TaiRuleId.ChickenHand]: {
    tiles: [
      [W(1), W(2), W(3)],
      [T(4), T(5), T(6)],
      [S(2), S(3), S(4)],
      [EAST, EAST, EAST],
      [W(9), W(9)],
    ],
    label: '只得一台（風牌）',
  },

  [TaiRuleId.OpenKongBonus]: {
    tiles: [
      [W(3), W(3), W(3), W(3)],
    ],
    label: '明槓',
  },

  [TaiRuleId.ConcealedKongBonus]: {
    tiles: [
      [T(5), T(5), T(5), T(5)],
    ],
    label: '暗槓',
  },

  [TaiRuleId.NoHonors]: {
    tiles: [
      [W(1), W(2), W(3)],
      [T(4), T(5), T(6)],
      [S(7), S(8), S(9)],
      [W(4), W(5), W(6)],
      [T(2), T(2)],
    ],
    label: '沒有東南西北中發白',
  },

  [TaiRuleId.NoHonorsNoFlowers]: {
    tiles: [
      [W(2), W(3), W(4)],
      [T(5), T(6), T(7)],
      [S(1), S(2), S(3)],
      [W(7), W(8), W(9)],
      [S(5), S(5)],
    ],
    label: '沒有番字，沒有花',
  },

  [TaiRuleId.GrandPingHu]: {
    tiles: [
      [W(1), W(2), W(3)],
      [T(4), T(5), T(6)],
      [S(1), S(2), S(3)],
      [T(7), T(8), T(9)],
      [W(5), W(5)],
    ],
    label: '全順子 + 無字花',
  },

  [TaiRuleId.MissingOneSuit]: {
    tiles: [
      [W(1), W(2), W(3)],
      [W(4), W(5), W(6)],
      [T(2), T(3), T(4)],
      [EAST, EAST, EAST],
      [T(8), T(8)],
    ],
    label: '缺條子',
  },

  [TaiRuleId.FiveTypes]: {
    tiles: [
      [W(1), W(2), W(3)],
      [T(4), T(5), T(6)],
      [S(7), S(8), S(9)],
      [RED, RED, RED],
      [EAST, EAST],
    ],
    label: '萬＋筒＋條＋風＋三元',
  },

  // ═══════════════ WIND ═══════════════

  [TaiRuleId.MatchingWindTriplet]: {
    tiles: [
      [EAST, EAST, EAST],
    ],
    label: '東位碰東風',
  },

  [TaiRuleId.WindTriplet]: {
    tiles: [
      [SOUTH, SOUTH, SOUTH],
    ],
    label: '碰南風（非正風）',
  },

  [TaiRuleId.SmallThreeWinds]: {
    tiles: [
      [EAST, EAST, EAST],
      [SOUTH, SOUTH, SOUTH],
      [WEST, WEST],
    ],
    label: '兩組風刻 + 風眼',
  },

  [TaiRuleId.BigThreeWinds]: {
    tiles: [
      [EAST, EAST, EAST],
      [SOUTH, SOUTH, SOUTH],
      [WEST, WEST, WEST],
    ],
    label: '三組風刻',
  },

  [TaiRuleId.SmallFourWinds]: {
    tiles: [
      [EAST, EAST, EAST],
      [SOUTH, SOUTH, SOUTH],
      [WEST, WEST, WEST],
      [NORTH, NORTH],
    ],
    label: '三組風刻 + 風眼',
  },

  [TaiRuleId.BigFourWinds]: {
    tiles: [
      [EAST, EAST, EAST],
      [SOUTH, SOUTH, SOUTH],
      [WEST, WEST, WEST],
      [NORTH, NORTH, NORTH],
    ],
    label: '四組風刻',
  },

  // ═══════════════ DRAGON ═══════════════

  [TaiRuleId.DragonTriplet]: {
    tiles: [
      [RED, RED, RED],
    ],
    label: '碰中',
  },

  [TaiRuleId.SmallThreeDragons]: {
    tiles: [
      [RED, RED, RED],
      [GREEN, GREEN, GREEN],
      [WHITE, WHITE],
    ],
    label: '兩三元刻 + 三元眼',
  },

  [TaiRuleId.BigThreeDragons]: {
    tiles: [
      [RED, RED, RED],
      [GREEN, GREEN, GREEN],
      [WHITE, WHITE, WHITE],
    ],
    label: '三組三元刻',
  },

  // ═══════════════ FLOWER ═══════════════
  // Flower rules use FlowerTile, not PlayTile — handled with labels only

  [TaiRuleId.NoFlowers]: {
    tiles: [],
    label: '沒有花牌',
  },

  // ═══════════════ PATTERN — Sequences ═══════════════

  [TaiRuleId.AllSequences]: {
    tiles: [
      [W(1), W(2), W(3)],
      [T(4), T(5), T(6)],
      [S(7), S(8), S(9)],
      [W(4), W(5), W(6)],
      [T(2), T(2)],
    ],
    label: '全部順子',
  },

  [TaiRuleId.PairOf258]: {
    tiles: [
      [T(5), T(5)],
    ],
    label: '以二、五或八做眼',
  },

  [TaiRuleId.OldAndYoung]: {
    tiles: [
      [W(1), W(2), W(3)],
      [W(7), W(8), W(9)],
    ],
    label: '同門 1-2-3 + 7-8-9',
  },

  [TaiRuleId.SameSequencePair]: {
    tiles: [
      [T(3), T(4), T(5)],
      [T(3), T(4), T(5)],
    ],
    label: '兩個一樣的順子',
  },

  [TaiRuleId.ThreeSameSequences]: {
    tiles: [
      [S(2), S(3), S(4)],
      [S(2), S(3), S(4)],
      [S(2), S(3), S(4)],
    ],
    label: '三個一樣的順子',
  },

  [TaiRuleId.FourSameSequences]: {
    tiles: [
      [W(1), W(2), W(3)],
      [W(1), W(2), W(3)],
      [W(1), W(2), W(3)],
      [W(1), W(2), W(3)],
    ],
    label: '四個一樣的順子',
  },

  [TaiRuleId.TwoMixedSequences]: {
    tiles: [
      [W(4), W(5), W(6)],
      [T(4), T(5), T(6)],
    ],
    label: '兩款不同但數字一樣',
  },

  [TaiRuleId.ThreeMixedSequences]: {
    tiles: [
      [W(4), W(5), W(6)],
      [T(4), T(5), T(6)],
      [S(4), S(5), S(6)],
    ],
    label: '三門同數字順子',
  },

  [TaiRuleId.FourSameNumber]: {
    tiles: [
      [W(2), W(3), W(4)],
      [W(2), W(3), W(4)],
      [T(2), T(3), T(4)],
      [S(2), S(3), S(4)],
    ],
    label: '四組同數字順子',
  },

  [TaiRuleId.FiveSameNumber]: {
    tiles: [
      [W(1), W(2), W(3)],
      [W(1), W(2), W(3)],
      [T(1), T(2), T(3)],
      [S(1), S(2), S(3)],
      // pair is also 1-2-3 range
    ],
    label: '五組同數字（含眼）',
  },

  [TaiRuleId.OpenPureStraight]: {
    tiles: [
      [T(1), T(2), T(3)],
      [T(4), T(5), T(6)],
      [T(7), T(8), T(9)],
    ],
    label: '同門 1-9 青龍（有明）',
  },

  [TaiRuleId.ConcealedPureStraight]: {
    tiles: [
      [W(1), W(2), W(3)],
      [W(4), W(5), W(6)],
      [W(7), W(8), W(9)],
    ],
    label: '同門 1-9 暗龍',
  },

  [TaiRuleId.OpenMixedStraight]: {
    tiles: [
      [W(1), W(2), W(3)],
      [T(4), T(5), T(6)],
      [S(7), S(8), S(9)],
    ],
    label: '不同門 1-9 雜龍（有明）',
  },

  [TaiRuleId.ConcealedMixedStraight]: {
    tiles: [
      [W(1), W(2), W(3)],
      [T(4), T(5), T(6)],
      [S(7), S(8), S(9)],
    ],
    label: '不同門 1-9 暗雜龍',
  },

  // ═══════════════ PATTERN — Triplets ═══════════════

  [TaiRuleId.AllTriplets]: {
    tiles: [
      [W(1), W(1), W(1)],
      [T(5), T(5), T(5)],
      [S(9), S(9), S(9)],
      [EAST, EAST, EAST],
      [W(3), W(3)],
    ],
    label: '全部刻子',
  },

  [TaiRuleId.TwoConcealedTriplets]: {
    tiles: [
      [T(3), T(3), T(3)],
      [S(7), S(7), S(7)],
    ],
    label: '兩個暗刻',
  },

  [TaiRuleId.ThreeConcealedTriplets]: {
    tiles: [
      [W(2), W(2), W(2)],
      [T(6), T(6), T(6)],
      [S(8), S(8), S(8)],
    ],
    label: '三個暗刻',
  },

  [TaiRuleId.FourConcealedTriplets]: {
    tiles: [
      [W(1), W(1), W(1)],
      [T(4), T(4), T(4)],
      [S(7), S(7), S(7)],
      [NORTH, NORTH, NORTH],
    ],
    label: '四個暗刻',
  },

  [TaiRuleId.FiveConcealedTriplets]: {
    tiles: [
      [W(3), W(3), W(3)],
      [T(6), T(6), T(6)],
      [S(9), S(9), S(9)],
      [RED, RED, RED],
      [EAST, EAST],
    ],
    label: '五個暗刻（含眼）',
  },

  [TaiRuleId.TwoBrothers]: {
    tiles: [
      [W(3), W(3), W(3)],
      [T(3), T(3), T(3)],
    ],
    label: '兩款同數字刻子',
  },

  [TaiRuleId.SmallThreeBrothers]: {
    tiles: [
      [W(5), W(5), W(5)],
      [T(5), T(5), T(5)],
      [S(5), S(5)],
    ],
    label: '二兄弟 + 兄弟眼',
  },

  [TaiRuleId.BigThreeBrothers]: {
    tiles: [
      [W(7), W(7), W(7)],
      [T(7), T(7), T(7)],
      [S(7), S(7), S(7)],
    ],
    label: '三門同數字刻子',
  },

  [TaiRuleId.SmallThreeSisters]: {
    tiles: [
      [W(3), W(3), W(3)],
      [W(4), W(4), W(4)],
      [W(5), W(5)],
    ],
    label: '連續刻子 + 相連眼',
  },

  [TaiRuleId.BigThreeSisters]: {
    tiles: [
      [T(2), T(2), T(2)],
      [T(3), T(3), T(3)],
      [T(4), T(4), T(4)],
    ],
    label: '三組相連同門刻子',
  },

  [TaiRuleId.FourToOne]: {
    tiles: [
      [W(5), W(5), W(5)],
      [W(4), W(5), W(6)],
    ],
    label: '四隻同牌分散使用',
  },

  [TaiRuleId.FourToTwo]: {
    tiles: [
      [T(3), T(3), T(3)],
      [T(3)],
    ],
    label: '4隻同牌，2做眼2做組',
  },

  [TaiRuleId.FourToFour]: {
    tiles: [
      [W(4), W(5), W(6)],
      [T(4), T(5), T(6)],
      [S(4), S(5), S(6)],
      [W(4), W(5), W(6)],
    ],
    label: '4隻同牌分散在順子中',
  },

  // ═══════════════ FLUSH ═══════════════

  [TaiRuleId.HalfFlush]: {
    tiles: [
      [T(1), T(2), T(3)],
      [T(4), T(5), T(6)],
      [T(7), T(8), T(9)],
      [EAST, EAST, EAST],
      [T(5), T(5)],
    ],
    label: '一門牌 + 番子',
  },

  [TaiRuleId.FullFlush]: {
    tiles: [
      [W(1), W(2), W(3)],
      [W(3), W(4), W(5)],
      [W(5), W(6), W(7)],
      [W(7), W(8), W(9)],
      [W(2), W(2)],
    ],
    label: '全部同一門',
  },

  // ═══════════════ TERMINAL ═══════════════

  [TaiRuleId.AllMiddle]: {
    tiles: [
      [W(2), W(3), W(4)],
      [T(5), T(6), T(7)],
      [S(3), S(4), S(5)],
      [T(2), T(3), T(4)],
      [W(6), W(6)],
    ],
    label: '全部 2-8，無么九番子',
  },

  [TaiRuleId.MixedTerminalChows]: {
    tiles: [
      [W(1), W(2), W(3)],
      [T(7), T(8), T(9)],
      [S(1), S(2), S(3)],
      [NORTH, NORTH, NORTH],
      [W(9), W(9)],
    ],
    label: '每組都有么九或番子',
  },

  [TaiRuleId.PureTerminalChows]: {
    tiles: [
      [W(1), W(2), W(3)],
      [T(7), T(8), T(9)],
      [S(1), S(2), S(3)],
      [W(7), W(8), W(9)],
      [T(1), T(1)],
    ],
    label: '每組都有么九，無番子',
  },

  [TaiRuleId.MixedTerminals]: {
    tiles: [
      [W(1), W(1), W(1)],
      [T(9), T(9), T(9)],
      [EAST, EAST, EAST],
      [RED, RED, RED],
      [S(1), S(1)],
    ],
    label: '全部么九 + 番子',
  },

  [TaiRuleId.AllTerminals]: {
    tiles: [
      [W(1), W(1), W(1)],
      [W(9), W(9), W(9)],
      [T(1), T(1), T(1)],
      [S(9), S(9), S(9)],
      [T(9), T(9)],
    ],
    label: '全部么九',
  },

  // ═══════════════ OPEN HAND ═══════════════

  [TaiRuleId.FullyOpen]: {
    tiles: [
      [W(1), W(2), W(3)],
      [T(4), T(5), T(6)],
      [S(7), S(8), S(9)],
      [EAST, EAST, EAST],
      [W(5), W(5)],
    ],
    label: '全部明牌，單釣食糊',
  },

  [TaiRuleId.HalfOpen]: {
    tiles: [
      [W(2), W(3), W(4)],
      [T(5), T(6), T(7)],
      [S(1), S(2), S(3)],
      [RED, RED, RED],
      [W(8), W(8)],
    ],
    label: '全部明牌，自摸',
  },

  // ═══════════════ SPECIAL ═══════════════

  // LastDiscard, LastTileSelfDraw, WinAfterKong, RobbingKong, KongOnKong — contextual
  // WinWithin7, WinWithin10 — contextual
  // HeavenlyHand, EarthlyHand, HumanHand — contextual

  [TaiRuleId.FourKongs]: {
    tiles: [
      [W(3), W(3), W(3), W(3)],
      [T(6), T(6), T(6), T(6)],
      [S(1), S(1), S(1), S(1)],
      [EAST, EAST, EAST, EAST],
    ],
    label: '四組槓',
  },

  [TaiRuleId.AllConcealedTripletsSD]: {
    tiles: [
      [W(2), W(2), W(2)],
      [T(5), T(5), T(5)],
      [S(8), S(8), S(8)],
      [NORTH, NORTH, NORTH],
      [RED, RED],
    ],
    label: '全暗刻 + 自摸',
  },

  [TaiRuleId.ThirteenOrphans]: {
    tiles: [
      [W(1)], [W(9)],
      [T(1)], [T(9)],
      [S(1)], [S(9)],
      [EAST], [SOUTH], [WEST], [NORTH],
      [RED], [GREEN], [WHITE],
    ],
    label: '13張么九番子各一',
  },

  [TaiRuleId.SixteenUnrelated]: {
    tiles: [
      [EAST], [SOUTH], [WEST], [NORTH],
      [RED], [GREEN], [WHITE],
      [W(1)], [W(5)], [W(9)],
      [T(2)], [T(6)],
      [S(3)], [S(7)],
    ],
    label: '16張不搭牌',
  },

  [TaiRuleId.EightPairs]: {
    tiles: [
      [W(1), W(1)],
      [W(5), W(5)],
      [T(3), T(3)],
      [T(7), T(7)],
      [S(2), S(2)],
      [S(9), S(9)],
      [EAST, EAST],
      [RED, RED],
    ],
    label: '八對子',
  },
};
