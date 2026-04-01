// ─── Tai Rule Catalog ───
// Canonical reference for all Taiwanese Mahjong tai rules.
// Source: https://zh.wikibooks.org/wiki/臺灣麻將 (§胡牌計分 → §台數表)
// Single source of truth — the scoring engine references these IDs.

export enum TaiRuleId {
  Dealer = 'dealer',
  DealerStreak = 'dealer_streak',
  Concealed = 'concealed',
  SelfDraw = 'self_draw',
  ConcealedSelfDraw = 'concealed_self_draw',
  SingleWait = 'single_wait',
  RoundWind = 'round_wind',
  SeatWind = 'seat_wind',
  DragonTriplet = 'dragon_triplet',
  MatchingFlower = 'matching_flower',
  LastDiscard = 'last_discard',
  LastTileSelfDraw = 'last_tile_self_draw',
  WinAfterKong = 'win_after_kong',
  RobbingKong = 'robbing_kong',
  FullyOpen = 'fully_open',
  FlowerGroup = 'flower_group',
  AllSequences = 'all_sequences',
  ThreeConcealedTriplets = 'three_concealed_triplets',
  HalfFlush = 'half_flush',
  AllTriplets = 'all_triplets',
  SmallThreeDragons = 'small_three_dragons',
  FourConcealedTriplets = 'four_concealed_triplets',
  FullFlush = 'full_flush',
  FiveConcealedTriplets = 'five_concealed_triplets',
  BigThreeDragons = 'big_three_dragons',
  SmallFourWinds = 'small_four_winds',
  FourKongs = 'four_kongs',
  EightFlowers = 'eight_flowers',
  SevenRobOne = 'seven_rob_one',
  BigFourWinds = 'big_four_winds',
  EarthlyHand = 'earthly_hand',
  HeavenlyHand = 'heavenly_hand',
}

export interface TaiRuleDef {
  id: TaiRuleId;
  /** Tai value. -1 = variable (e.g. dealer streak), 0 = auto-win */
  tai: number;
  name: { zh: string; en: string };
  description: { zh: string; en: string };
  category: 'basic' | 'wind' | 'dragon' | 'flower' | 'flush' | 'pattern' | 'special';
  /** IDs of tai rules this one excludes (supersedes) when both match */
  excludes: TaiRuleId[];
  /** Whether this rule can appear multiple times (e.g., dragon triplets) */
  stackable: boolean;
}

/**
 * Complete tai rule catalog — canonical values from Wikibooks 臺灣麻將.
 * Ordered roughly by tai value ascending.
 */
export const TAI_CATALOG: TaiRuleDef[] = [
  // ─── 1 台 ───
  {
    id: TaiRuleId.Dealer,
    tai: 1,
    name: { zh: '莊家', en: 'Dealer' },
    description: {
      zh: '做莊者，無論胡牌或放槍都多算一台',
      en: 'The dealer receives/pays an extra tai',
    },
    category: 'basic',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.DealerStreak,
    tai: -1, // Variable: 2N+1
    name: { zh: '連莊拉莊', en: 'Dealer Streak' },
    description: {
      zh: '連一拉一為3台，連二拉二為5台，以此類推 (2N+1)',
      en: 'Consecutive dealer wins: 2N+1 tai (streak 1 = 3 tai, streak 2 = 5, etc.)',
    },
    category: 'basic',
    excludes: [TaiRuleId.Dealer], // Streak already includes the dealer tai
    stackable: false,
  },
  {
    id: TaiRuleId.Concealed,
    tai: 1,
    name: { zh: '門清', en: 'Concealed Hand' },
    description: {
      zh: '沒有吃沒有碰沒有槓，全部牌都是自己摸到的，只有放槍那隻不是自己摸的情況下胡牌',
      en: 'Fully concealed hand — win by discard only (if self-drawn, use Concealed Self-Draw instead)',
    },
    category: 'basic',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.SelfDraw,
    tai: 1,
    name: { zh: '自摸', en: 'Self-Draw' },
    description: {
      zh: '自己摸進牌的時候剛好胡牌',
      en: 'Win by drawing the winning tile yourself',
    },
    category: 'basic',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.SingleWait,
    tai: 1,
    name: { zh: '獨聽', en: 'Single Wait' },
    description: {
      zh: '只有一種牌才能完成胡牌（邊張/中洞/單吊）',
      en: 'Only one possible tile can complete the hand (edge/middle wait or single tile)',
    },
    category: 'basic',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.RoundWind,
    tai: 1,
    name: { zh: '圈風牌', en: 'Round Wind' },
    description: {
      zh: '持有圈風的刻子（或槓）即有一台',
      en: 'Triplet/kong of the current round wind',
    },
    category: 'wind',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.SeatWind,
    tai: 1,
    name: { zh: '門風牌', en: 'Seat Wind' },
    description: {
      zh: '持有門風的刻子（或槓）即有一台',
      en: 'Triplet/kong of your own seat wind',
    },
    category: 'wind',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.DragonTriplet,
    tai: 1,
    name: { zh: '三元牌', en: 'Dragon Triplet' },
    description: {
      zh: '胡牌時，拿到任何一副中、發、白的刻子（或槓）',
      en: 'Triplet/kong of any dragon tile (Red, Green, or White)',
    },
    category: 'dragon',
    excludes: [],
    stackable: true, // Can score 1 台 per dragon triplet
  },
  {
    id: TaiRuleId.MatchingFlower,
    tai: 1,
    name: { zh: '正花', en: 'Matching Flower' },
    description: {
      zh: '花牌與座位風相符即有一台。東=春/梅、南=夏/蘭、西=秋/菊、北=冬/竹',
      en: 'Flower matching your seat wind. East=Spring/Plum, South=Summer/Orchid, West=Autumn/Chrysanthemum, North=Winter/Bamboo',
    },
    category: 'flower',
    excludes: [],
    stackable: true, // Up to 2 matching flowers per seat
  },
  {
    id: TaiRuleId.LastDiscard,
    tai: 1,
    name: { zh: '河底撈魚', en: 'Win on Last Discard' },
    description: {
      zh: '流局前最後一個玩家最後一次捨牌剛好胡牌',
      en: 'Win off the very last discard before a draw',
    },
    category: 'special',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.LastTileSelfDraw,
    tai: 1,
    name: { zh: '海底撈月', en: 'Win on Last Draw' },
    description: {
      zh: '最後一張剛好自摸，可加算自摸台',
      en: 'Self-draw the very last tile in the wall. Can stack with Self-Draw tai',
    },
    category: 'special',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.WinAfterKong,
    tai: 1,
    name: { zh: '槓上開花', en: 'Win After Kong' },
    description: {
      zh: '因補花、加槓或暗槓而補牌，補牌後剛好胡牌，可加算自摸台',
      en: 'Win on the supplement tile drawn after declaring a kong. Can stack with Self-Draw',
    },
    category: 'special',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.RobbingKong,
    tai: 1,
    name: { zh: '搶槓', en: 'Robbing a Kong' },
    description: {
      zh: '別人加槓時，可視為將牌捨出來胡牌',
      en: 'Win by claiming a tile that an opponent is using to upgrade a pong to a kong',
    },
    category: 'special',
    excludes: [],
    stackable: false,
  },

  // ─── 2 台 ───
  {
    id: TaiRuleId.FullyOpen,
    tai: 2,
    name: { zh: '全求', en: 'Fully Open Hand' },
    description: {
      zh: '手牌裡只剩一張牌聽同一張牌，其餘的牌已吃或碰或槓掉。非自摸才算',
      en: 'All melds open, single tile left as pair wait. Must win by discard (not self-draw)',
    },
    category: 'pattern',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.FlowerGroup,
    tai: 2,
    name: { zh: '花槓', en: 'Flower Group' },
    description: {
      zh: '胡牌時，集齊「四季」或「四君子」。可加算正花台',
      en: 'Collect all 4 Seasons or all 4 Gentlemen flowers. Matching Flower tai stacks on top',
    },
    category: 'flower',
    excludes: [],
    stackable: true, // Can have both season and gentleman groups
  },
  {
    id: TaiRuleId.AllSequences,
    tai: 2,
    name: { zh: '平胡', en: 'All Sequences' },
    description: {
      zh: '無花、無字、無刻、先有眼、聽雙頭、非自摸',
      en: 'STRICT: No flowers, no honor tiles, no triplets, must have pre-existing pair, double-sided wait, not self-drawn',
    },
    category: 'pattern',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.ThreeConcealedTriplets,
    tai: 2,
    name: { zh: '三暗刻', en: '3 Concealed Triplets' },
    description: {
      zh: '胡牌時，有三個暗刻。非碰牌所得',
      en: 'Three concealed triplets (not formed by claiming discards)',
    },
    category: 'pattern',
    excludes: [],
    stackable: false,
  },

  // ─── 3 台 ───
  {
    id: TaiRuleId.ConcealedSelfDraw,
    tai: 3,
    name: { zh: '不求（門清自摸）', en: 'Concealed Self-Draw' },
    description: {
      zh: '門清加自摸。不與門清及自摸重複計算',
      en: 'Concealed hand + self-draw. Replaces Concealed(1) + Self-Draw(1) — not additive',
    },
    category: 'basic',
    excludes: [TaiRuleId.Concealed, TaiRuleId.SelfDraw],
    stackable: false,
  },

  // ─── 4 台 ───
  {
    id: TaiRuleId.HalfFlush,
    tai: 4,
    name: { zh: '混一色', en: 'Half Flush' },
    description: {
      zh: '胡牌時，只有單一種數牌加上字牌',
      en: 'Hand contains only one suit plus honor tiles',
    },
    category: 'flush',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.AllTriplets,
    tai: 4,
    name: { zh: '碰碰胡', en: 'All Triplets' },
    description: {
      zh: '胡牌時，沒有順子也沒吃過',
      en: 'All melds are triplets/kongs, no sequences',
    },
    category: 'pattern',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.SmallThreeDragons,
    tai: 4,
    name: { zh: '小三元', en: 'Small Three Dragons' },
    description: {
      zh: '胡牌時，有中發白兩刻一眼。不得重複計算三元台',
      en: 'Two dragon triplets + one dragon pair. Does not stack with individual Dragon Triplet tai',
    },
    category: 'dragon',
    excludes: [TaiRuleId.DragonTriplet],
    stackable: false,
  },

  // ─── 5 台 ───
  {
    id: TaiRuleId.FourConcealedTriplets,
    tai: 5,
    name: { zh: '四暗刻', en: '4 Concealed Triplets' },
    description: {
      zh: '胡牌時，有四個暗刻。不得重複計算三暗刻',
      en: 'Four concealed triplets. Does not stack with 3 Concealed Triplets',
    },
    category: 'pattern',
    excludes: [TaiRuleId.ThreeConcealedTriplets],
    stackable: false,
  },

  // ─── 8 台 ───
  {
    id: TaiRuleId.FullFlush,
    tai: 8,
    name: { zh: '清一色', en: 'Full Flush' },
    description: {
      zh: '胡牌時，只有單一種數牌',
      en: 'Hand contains tiles of only one suit (no honors)',
    },
    category: 'flush',
    excludes: [TaiRuleId.HalfFlush],
    stackable: false,
  },
  {
    id: TaiRuleId.FiveConcealedTriplets,
    tai: 8,
    name: { zh: '五暗刻', en: '5 Concealed Triplets' },
    description: {
      zh: '胡牌時，手牌有五個暗刻，不得重複計算其他暗刻台',
      en: 'All five melds are concealed triplets. Excludes 3/4 Concealed Triplets',
    },
    category: 'pattern',
    excludes: [TaiRuleId.ThreeConcealedTriplets, TaiRuleId.FourConcealedTriplets],
    stackable: false,
  },
  {
    id: TaiRuleId.BigThreeDragons,
    tai: 8,
    name: { zh: '大三元', en: 'Big Three Dragons' },
    description: {
      zh: '胡牌時，手牌有中發白三刻，不得重複計算三元台',
      en: 'Triplets of all three dragons (Red, Green, White). Excludes Small Three Dragons and individual Dragon Triplets',
    },
    category: 'dragon',
    excludes: [TaiRuleId.SmallThreeDragons, TaiRuleId.DragonTriplet],
    stackable: false,
  },
  {
    id: TaiRuleId.SmallFourWinds,
    tai: 8,
    name: { zh: '小四喜', en: 'Small Four Winds' },
    description: {
      zh: '胡牌時，手牌有東南西北三刻一眼，得加計風牌台（圈風及門風）',
      en: 'Three wind triplets + one wind pair. CAN stack with Round/Seat Wind tai',
    },
    category: 'wind',
    excludes: [], // Note: does NOT exclude individual wind tai
    stackable: false,
  },
  {
    id: TaiRuleId.FourKongs,
    tai: 8,
    name: { zh: '四槓牌', en: 'Four Kongs' },
    description: {
      zh: '玩家單獨完成四槓時，即以胡牌計算。不得加算自摸台',
      en: 'Player declares 4 kongs — auto-win. No self-draw tai added',
    },
    category: 'special',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.EightFlowers,
    tai: 8,
    name: { zh: '八朵花（八仙過海）', en: 'Eight Flowers' },
    description: {
      zh: '手牌集八張花，視為自摸8台',
      en: 'Collect all 8 flower tiles — auto-win, treated as 8-tai self-draw',
    },
    category: 'flower',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.SevenRobOne,
    tai: 8,
    name: { zh: '七搶一', en: 'Seven Flowers Rob One' },
    description: {
      zh: '手牌集任七張花，視為胡另一位拿花牌的玩家',
      en: 'Collect 7 flowers — win by robbing the player holding the 8th flower',
    },
    category: 'flower',
    excludes: [],
    stackable: false,
  },

  // ─── 16 台 ───
  {
    id: TaiRuleId.BigFourWinds,
    tai: 16,
    name: { zh: '大四喜', en: 'Big Four Winds' },
    description: {
      zh: '胡牌時，手牌有東南西北四刻，不重複計算風牌台',
      en: 'Triplets of all four winds. Excludes Small Four Winds and individual wind tai',
    },
    category: 'wind',
    excludes: [TaiRuleId.SmallFourWinds, TaiRuleId.RoundWind, TaiRuleId.SeatWind],
    stackable: false,
  },
  {
    id: TaiRuleId.EarthlyHand,
    tai: 16,
    name: { zh: '地胡', en: 'Earthly Hand' },
    description: {
      zh: '開局後，莊家捨出的第一張牌，即宣告胡牌',
      en: 'Non-dealer wins on the dealer\'s very first discard',
    },
    category: 'special',
    excludes: [],
    stackable: false,
  },

  // ─── 32 台 ───
  {
    id: TaiRuleId.HeavenlyHand,
    tai: 32,
    name: { zh: '天胡', en: 'Heavenly Hand' },
    description: {
      zh: '開局後，莊家未捨牌即胡牌為天胡',
      en: 'Dealer wins on the dealt hand before discarding any tile',
    },
    category: 'special',
    excludes: [],
    stackable: false,
  },
];

/** Quick lookup map: TaiRuleId → TaiRuleDef */
export const TAI_CATALOG_MAP: Record<TaiRuleId, TaiRuleDef> = Object.fromEntries(
  TAI_CATALOG.map((rule) => [rule.id, rule]),
) as Record<TaiRuleId, TaiRuleDef>;
