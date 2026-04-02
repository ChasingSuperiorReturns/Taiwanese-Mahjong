// ─── Tai Rule Catalog ───
// Canonical reference for all Taiwanese Mahjong tai rules (港式).
// Source: https://twmahjong.com/
// Single source of truth — the scoring engine references these IDs.

export enum TaiRuleId {
  // ── Basic ──
  Dealer = 'dealer',
  DealerStreak = 'dealer_streak',
  SelfDraw = 'self_draw',
  Concealed = 'concealed',
  ConcealedSelfDraw = 'concealed_self_draw',
  SingleWait = 'single_wait',
  DoublePongWait = 'double_pong_wait',
  Ready = 'ready',
  ChickenHand = 'chicken_hand',
  OpenKongBonus = 'open_kong_bonus',
  ConcealedKongBonus = 'concealed_kong_bonus',
  NoHonors = 'no_honors',
  NoHonorsNoFlowers = 'no_honors_no_flowers',
  GrandPingHu = 'grand_ping_hu',
  MissingOneSuit = 'missing_one_suit',
  FiveTypes = 'five_types',

  // ── Wind ──
  MatchingWindTriplet = 'matching_wind_triplet',
  WindTriplet = 'wind_triplet',
  SmallThreeWinds = 'small_three_winds',
  BigThreeWinds = 'big_three_winds',
  SmallFourWinds = 'small_four_winds',
  BigFourWinds = 'big_four_winds',

  // ── Dragon ──
  DragonTriplet = 'dragon_triplet',
  SmallThreeDragons = 'small_three_dragons',
  BigThreeDragons = 'big_three_dragons',

  // ── Flower ──
  MatchingFlower = 'matching_flower',
  NonMatchingFlower = 'non_matching_flower',
  NoFlowers = 'no_flowers',
  OneFlowerGroup = 'one_flower_group',
  TwoFlowerGroups = 'two_flower_groups',
  SevenRobOne = 'seven_rob_one',

  // ── Sequence Pattern ──
  AllSequences = 'all_sequences',
  PairOf258 = 'pair_of_258',
  OldAndYoung = 'old_and_young',
  SameSequencePair = 'same_sequence_pair',
  ThreeSameSequences = 'three_same_sequences',
  FourSameSequences = 'four_same_sequences',
  TwoMixedSequences = 'two_mixed_sequences',
  ThreeMixedSequences = 'three_mixed_sequences',
  FourSameNumber = 'four_same_number',
  FiveSameNumber = 'five_same_number',
  OpenPureStraight = 'open_pure_straight',
  ConcealedPureStraight = 'concealed_pure_straight',
  OpenMixedStraight = 'open_mixed_straight',
  ConcealedMixedStraight = 'concealed_mixed_straight',

  // ── Triplet Pattern ──
  AllTriplets = 'all_triplets',
  TwoConcealedTriplets = 'two_concealed_triplets',
  ThreeConcealedTriplets = 'three_concealed_triplets',
  FourConcealedTriplets = 'four_concealed_triplets',
  FiveConcealedTriplets = 'five_concealed_triplets',
  TwoBrothers = 'two_brothers',
  SmallThreeBrothers = 'small_three_brothers',
  BigThreeBrothers = 'big_three_brothers',
  SmallThreeSisters = 'small_three_sisters',
  BigThreeSisters = 'big_three_sisters',
  FourToOne = 'four_to_one',
  FourToTwo = 'four_to_two',
  FourToFour = 'four_to_four',

  // ── Flush ──
  HalfFlush = 'half_flush',
  FullFlush = 'full_flush',

  // ── Terminal ──
  AllMiddle = 'all_middle',
  MixedTerminalChows = 'mixed_terminal_chows',
  PureTerminalChows = 'pure_terminal_chows',
  MixedTerminals = 'mixed_terminals',
  AllTerminals = 'all_terminals',

  // ── Open Hand ──
  FullyOpen = 'fully_open',
  HalfOpen = 'half_open',

  // ── Special ──
  LastDiscard = 'last_discard',
  LastTileSelfDraw = 'last_tile_self_draw',
  WinAfterKong = 'win_after_kong',
  RobbingKong = 'robbing_kong',
  KongOnKong = 'kong_on_kong',
  FourKongs = 'four_kongs',
  WinWithin7 = 'win_within_7',
  WinWithin10 = 'win_within_10',
  HeavenlyHand = 'heavenly_hand',
  EarthlyHand = 'earthly_hand',
  HumanHand = 'human_hand',
  AllConcealedTripletsSD = 'all_concealed_triplets_sd',
  ThirteenOrphans = 'thirteen_orphans',
  SixteenUnrelated = 'sixteen_unrelated',
  EightPairs = 'eight_pairs',
}

export interface TaiRuleDef {
  id: TaiRuleId;
  /** Tai value. -1 = variable (e.g. dealer streak) */
  tai: number;
  name: { zh: string; en: string };
  description: { zh: string; en: string };
  category: 'basic' | 'wind' | 'dragon' | 'flower' | 'flush' | 'pattern' | 'terminal' | 'special';
  /** IDs of tai rules this one excludes (supersedes) when both match */
  excludes: TaiRuleId[];
  /** Whether this rule can appear multiple times */
  stackable: boolean;
}

// ─────────────────────────────────────────────────
//  Complete tai rule catalog — values from twmahjong.com
// ─────────────────────────────────────────────────

export const TAI_CATALOG: TaiRuleDef[] = [

  // ═══════════════ BASIC ═══════════════

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
    tai: -1,
    name: { zh: '連莊拉莊', en: 'Dealer Streak' },
    description: {
      zh: '以 1、3、5、7、9、11 計。連一拉一為3台，連二拉二為5台 (2N+1)',
      en: 'Consecutive dealer wins: 1, 3, 5, 7, 9, 11 … (2N+1)',
    },
    category: 'basic',
    excludes: [TaiRuleId.Dealer],
    stackable: false,
  },
  {
    id: TaiRuleId.SelfDraw,
    tai: 1,
    name: { zh: '自摸', en: 'Self-Draw' },
    description: {
      zh: '自己摸食出',
      en: 'Win by drawing the winning tile yourself',
    },
    category: 'basic',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.Concealed,
    tai: 3,
    name: { zh: '門清', en: 'Concealed Hand' },
    description: {
      zh: '門前清，暗槓亦可。放槍胡牌才算門清',
      en: 'Fully concealed hand (concealed kongs allowed). Win by discard only',
    },
    category: 'basic',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.ConcealedSelfDraw,
    tai: 5,
    name: { zh: '門清自摸', en: 'Concealed Self-Draw' },
    description: {
      zh: '門前清自摸。不與門清及自摸重複計算',
      en: 'Concealed hand + self-draw. Replaces Concealed(3) + Self-Draw(1)',
    },
    category: 'basic',
    excludes: [TaiRuleId.Concealed, TaiRuleId.SelfDraw],
    stackable: false,
  },
  {
    id: TaiRuleId.SingleWait,
    tai: 2,
    name: { zh: '獨獨', en: 'Single Wait' },
    description: {
      zh: '單釣或叫偏章',
      en: 'Only one tile can complete the hand (edge/middle wait or single pair)',
    },
    category: 'basic',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.DoublePongWait,
    tai: 1,
    name: { zh: '對碰', en: 'Double Pong Wait' },
    description: {
      zh: '叫胡叫對碰',
      en: 'Waiting on either of two possible pong tiles',
    },
    category: 'basic',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.Ready,
    tai: 5,
    name: { zh: '聽牌', en: 'Ready (Ting)' },
    description: {
      zh: '聲明已經叫胡，不得轉章，不得暗槓，可以睇其他家的牌',
      en: 'Declared ready (ting). Cannot change hand. May view other discards',
    },
    category: 'basic',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.ChickenHand,
    tai: 10,
    name: { zh: '雞胡', en: 'Chicken Hand' },
    description: {
      zh: '胡出時(不計莊前)只得一番。自摸或已叫聽牌就不是雞胡',
      en: 'Winning hand has only 1 tai (excl. dealer). Not if self-drawn or declared ready',
    },
    category: 'basic',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.OpenKongBonus,
    tai: 1,
    name: { zh: '明摃', en: 'Open/Added Kong' },
    description: {
      zh: '自己摸到三張相同牌，碰出第四張',
      en: 'Having an open or added kong in the winning hand',
    },
    category: 'basic',
    excludes: [],
    stackable: true,
  },
  {
    id: TaiRuleId.ConcealedKongBonus,
    tai: 2,
    name: { zh: '暗摃', en: 'Concealed Kong' },
    description: {
      zh: '自己摸到四張相同牌',
      en: 'Having a concealed kong in the winning hand',
    },
    category: 'basic',
    excludes: [],
    stackable: true,
  },
  {
    id: TaiRuleId.NoHonors,
    tai: 1,
    name: { zh: '無字', en: 'No Honors' },
    description: {
      zh: '沒有番子',
      en: 'No honor tiles (winds or dragons) in the hand',
    },
    category: 'basic',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.NoHonorsNoFlowers,
    tai: 5,
    name: { zh: '無字花', en: 'No Honors No Flowers' },
    description: {
      zh: '沒有番子及沒有花',
      en: 'No honor tiles and no flower tiles',
    },
    category: 'basic',
    excludes: [TaiRuleId.NoHonors, TaiRuleId.NoFlowers],
    stackable: false,
  },
  {
    id: TaiRuleId.GrandPingHu,
    tai: 10,
    name: { zh: '大平糊（無字花平胡）', en: 'Grand Ping Hu' },
    description: {
      zh: '沒有番子，沒有花，又是平胡',
      en: 'No honors + no flowers + all sequences',
    },
    category: 'basic',
    excludes: [TaiRuleId.AllSequences, TaiRuleId.NoHonorsNoFlowers, TaiRuleId.NoHonors, TaiRuleId.NoFlowers],
    stackable: false,
  },
  {
    id: TaiRuleId.MissingOneSuit,
    tai: 5,
    name: { zh: '缺一門', en: 'Missing One Suit' },
    description: {
      zh: '不計番子而缺少筒、索或萬一門',
      en: 'Hand uses only 2 of the 3 suits (honors not counted)',
    },
    category: 'basic',
    excludes: [TaiRuleId.NoHonors],
    stackable: false,
  },
  {
    id: TaiRuleId.FiveTypes,
    tai: 10,
    name: { zh: '五門齊', en: 'Five Types' },
    description: {
      zh: '東南西北為一門，中發白為一門，筒索萬各三門。全副牌五門都有齊',
      en: 'Hand contains all 5 types: wan, tong, tiao, winds, and dragons',
    },
    category: 'basic',
    excludes: [],
    stackable: false,
  },

  // ═══════════════ WIND ═══════════════

  {
    id: TaiRuleId.MatchingWindTriplet,
    tai: 2,
    name: { zh: '正風刻子', en: 'Matching Wind Triplet' },
    description: {
      zh: '碰出東、南、西或北（正風）',
      en: 'Triplet/kong of your seat wind',
    },
    category: 'wind',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.WindTriplet,
    tai: 1,
    name: { zh: '風牌刻子', en: 'Wind Triplet' },
    description: {
      zh: '碰出東、南、西或北（不是正風）',
      en: 'Triplet/kong of a non-seat wind',
    },
    category: 'wind',
    excludes: [],
    stackable: true,
  },
  {
    id: TaiRuleId.SmallThreeWinds,
    tai: 15,
    name: { zh: '小三風', en: 'Small Three Winds' },
    description: {
      zh: '有東、南、西、北其中兩組刻子及一對做眼',
      en: 'Two wind triplets + one wind pair',
    },
    category: 'wind',
    excludes: [TaiRuleId.MatchingWindTriplet, TaiRuleId.WindTriplet],
    stackable: false,
  },
  {
    id: TaiRuleId.BigThreeWinds,
    tai: 30,
    name: { zh: '大三風', en: 'Big Three Winds' },
    description: {
      zh: '有東、南、西、北其中三組刻子',
      en: 'Three wind triplets',
    },
    category: 'wind',
    excludes: [TaiRuleId.SmallThreeWinds, TaiRuleId.MatchingWindTriplet, TaiRuleId.WindTriplet],
    stackable: false,
  },
  {
    id: TaiRuleId.SmallFourWinds,
    tai: 60,
    name: { zh: '小四喜', en: 'Small Four Winds' },
    description: {
      zh: '有東、南、西、北其中三組刻子及一對做眼',
      en: 'Three wind triplets + one wind pair',
    },
    category: 'wind',
    excludes: [TaiRuleId.BigThreeWinds, TaiRuleId.SmallThreeWinds, TaiRuleId.MatchingWindTriplet, TaiRuleId.WindTriplet],
    stackable: false,
  },
  {
    id: TaiRuleId.BigFourWinds,
    tai: 80,
    name: { zh: '大四喜', en: 'Big Four Winds' },
    description: {
      zh: '有東、南、西、北四組刻子',
      en: 'Triplets of all four winds',
    },
    category: 'wind',
    excludes: [TaiRuleId.SmallFourWinds, TaiRuleId.BigThreeWinds, TaiRuleId.SmallThreeWinds, TaiRuleId.MatchingWindTriplet, TaiRuleId.WindTriplet],
    stackable: false,
  },

  // ═══════════════ DRAGON ═══════════════

  {
    id: TaiRuleId.DragonTriplet,
    tai: 2,
    name: { zh: '中發白刻子', en: 'Dragon Triplet' },
    description: {
      zh: '碰出中、發或白',
      en: 'Triplet/kong of any dragon tile (Red, Green, or White)',
    },
    category: 'dragon',
    excludes: [],
    stackable: true,
  },
  {
    id: TaiRuleId.SmallThreeDragons,
    tai: 20,
    name: { zh: '小三元', en: 'Small Three Dragons' },
    description: {
      zh: '中、發、白其中兩組刻子及一對子',
      en: 'Two dragon triplets + one dragon pair',
    },
    category: 'dragon',
    excludes: [TaiRuleId.DragonTriplet],
    stackable: false,
  },
  {
    id: TaiRuleId.BigThreeDragons,
    tai: 40,
    name: { zh: '大三元', en: 'Big Three Dragons' },
    description: {
      zh: '中、發、白三組刻子',
      en: 'Triplets of all three dragons',
    },
    category: 'dragon',
    excludes: [TaiRuleId.SmallThreeDragons, TaiRuleId.DragonTriplet],
    stackable: false,
  },

  // ═══════════════ FLOWER ═══════════════

  {
    id: TaiRuleId.MatchingFlower,
    tai: 2,
    name: { zh: '正花', en: 'Matching Flower' },
    description: {
      zh: '花牌數字同坐位相同。東=春/梅、南=夏/蘭、西=秋/菊、北=冬/竹',
      en: 'Flower matching your seat wind (East=Spring/Plum, South=Summer/Orchid, etc.)',
    },
    category: 'flower',
    excludes: [],
    stackable: true,
  },
  {
    id: TaiRuleId.NonMatchingFlower,
    tai: 1,
    name: { zh: '爛花', en: 'Non-Matching Flower' },
    description: {
      zh: '花牌數字同坐位不同',
      en: 'Flower that does not match your seat wind',
    },
    category: 'flower',
    excludes: [],
    stackable: true,
  },
  {
    id: TaiRuleId.NoFlowers,
    tai: 1,
    name: { zh: '無花', en: 'No Flowers' },
    description: {
      zh: '沒有花牌',
      en: 'No flower tiles drawn',
    },
    category: 'flower',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.OneFlowerGroup,
    tai: 10,
    name: { zh: '一台花', en: 'Flower Group' },
    description: {
      zh: '四隻同系列的花（四季或四君子）',
      en: 'Collect all 4 Seasons or all 4 Gentlemen flowers',
    },
    category: 'flower',
    excludes: [TaiRuleId.MatchingFlower, TaiRuleId.NonMatchingFlower, TaiRuleId.NoFlowers],
    stackable: true,
  },
  {
    id: TaiRuleId.TwoFlowerGroups,
    tai: 30,
    name: { zh: '兩台花（花胡）', en: 'Two Flower Groups' },
    description: {
      zh: '二台花可以立刻食胡，不須要計手上的牌',
      en: 'Both flower groups complete — auto-win',
    },
    category: 'flower',
    excludes: [TaiRuleId.OneFlowerGroup, TaiRuleId.MatchingFlower, TaiRuleId.NonMatchingFlower, TaiRuleId.NoFlowers],
    stackable: false,
  },
  {
    id: TaiRuleId.SevenRobOne,
    tai: 8,
    name: { zh: '七搶一', en: 'Seven Flowers Rob One' },
    description: {
      zh: '手牌集任七張花，視為胡另一位拿花牌的玩家',
      en: 'Collect 7 flowers — win by robbing the player holding the 8th',
    },
    category: 'flower',
    excludes: [],
    stackable: false,
  },

  // ═══════════════ PATTERN — Sequences ═══════════════

  {
    id: TaiRuleId.AllSequences,
    tai: 3,
    name: { zh: '平胡', en: 'All Sequences' },
    description: {
      zh: '沒有刻子，全部順子',
      en: 'All melds are sequences (no triplets)',
    },
    category: 'pattern',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.PairOf258,
    tai: 1,
    name: { zh: '將眼', en: 'Pair of 2/5/8' },
    description: {
      zh: '以一對二、五或八做眼',
      en: 'Pair is a 2, 5, or 8 tile',
    },
    category: 'pattern',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.OldAndYoung,
    tai: 2,
    name: { zh: '老少', en: 'Old & Young' },
    description: {
      zh: '同門一二三加七八九，或一一一加九九九（有同門牌亦可）',
      en: 'Same suit: 1-2-3 + 7-8-9 sequences, or 1-1-1 + 9-9-9 triplets',
    },
    category: 'pattern',
    excludes: [],
    stackable: true,
  },
  {
    id: TaiRuleId.SameSequencePair,
    tai: 3,
    name: { zh: '一般高', en: 'Identical Sequence Pair' },
    description: {
      zh: '兩個一樣的順子',
      en: 'Two identical sequences (same suit and numbers)',
    },
    category: 'pattern',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.ThreeSameSequences,
    tai: 15,
    name: { zh: '三般高', en: 'Three Identical Sequences' },
    description: {
      zh: '三個一樣的順子',
      en: 'Three identical sequences',
    },
    category: 'pattern',
    excludes: [TaiRuleId.SameSequencePair],
    stackable: false,
  },
  {
    id: TaiRuleId.FourSameSequences,
    tai: 30,
    name: { zh: '四般高', en: 'Four Identical Sequences' },
    description: {
      zh: '四個一樣的順子',
      en: 'Four identical sequences',
    },
    category: 'pattern',
    excludes: [TaiRuleId.ThreeSameSequences, TaiRuleId.SameSequencePair],
    stackable: false,
  },
  {
    id: TaiRuleId.TwoMixedSequences,
    tai: 2,
    name: { zh: '二相逢', en: 'Two Mixed Sequences' },
    description: {
      zh: '二個款式不同的但數字一樣順子',
      en: 'Two sequences with same numbers but different suits',
    },
    category: 'pattern',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.ThreeMixedSequences,
    tai: 10,
    name: { zh: '三相逢', en: 'Three Mixed Sequences' },
    description: {
      zh: '三個款式不同的但數字一樣順子',
      en: 'Three sequences with same numbers, all different suits',
    },
    category: 'pattern',
    excludes: [TaiRuleId.TwoMixedSequences],
    stackable: false,
  },
  {
    id: TaiRuleId.FourSameNumber,
    tai: 20,
    name: { zh: '四同順', en: 'Four Same-Number Sequences' },
    description: {
      zh: '四個數字一樣順子，不論款式',
      en: 'Four sequences with same numbers (any suits)',
    },
    category: 'pattern',
    excludes: [TaiRuleId.ThreeMixedSequences, TaiRuleId.TwoMixedSequences, TaiRuleId.SameSequencePair, TaiRuleId.ThreeSameSequences],
    stackable: false,
  },
  {
    id: TaiRuleId.FiveSameNumber,
    tai: 40,
    name: { zh: '五同順', en: 'Five Same-Number Sequences' },
    description: {
      zh: '五個數字一樣順子，不論款式',
      en: 'All five sequences with same numbers (any suits)',
    },
    category: 'pattern',
    excludes: [TaiRuleId.FourSameNumber, TaiRuleId.ThreeMixedSequences, TaiRuleId.TwoMixedSequences, TaiRuleId.SameSequencePair, TaiRuleId.ThreeSameSequences, TaiRuleId.FourSameSequences],
    stackable: false,
  },
  {
    id: TaiRuleId.OpenPureStraight,
    tai: 10,
    name: { zh: '明龍（青龍）', en: 'Open Pure Straight' },
    description: {
      zh: '同一個款式，有一至九的三組順子（一二三、四五六、七八九），其中有些是上回來的',
      en: 'Three sequences 1-2-3, 4-5-6, 7-8-9 of same suit, at least one open',
    },
    category: 'pattern',
    excludes: [TaiRuleId.OldAndYoung],
    stackable: false,
  },
  {
    id: TaiRuleId.ConcealedPureStraight,
    tai: 20,
    name: { zh: '暗龍', en: 'Concealed Pure Straight' },
    description: {
      zh: '同一個款式，有一至九的三組順子，全部是手裡的',
      en: 'Three sequences 1-2-3, 4-5-6, 7-8-9 of same suit, all concealed',
    },
    category: 'pattern',
    excludes: [TaiRuleId.OpenPureStraight, TaiRuleId.OldAndYoung],
    stackable: false,
  },
  {
    id: TaiRuleId.OpenMixedStraight,
    tai: 8,
    name: { zh: '明雜龍', en: 'Open Mixed Straight' },
    description: {
      zh: '不同款式，有一至九的三組順子（一二三、四五六、七八九），其中有些是上回來的',
      en: 'Three sequences 1-2-3, 4-5-6, 7-8-9 of different suits, at least one open',
    },
    category: 'pattern',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.ConcealedMixedStraight,
    tai: 15,
    name: { zh: '暗雜龍', en: 'Concealed Mixed Straight' },
    description: {
      zh: '不同款式，有一至九的三組順子，全部是手裡的',
      en: 'Three sequences 1-2-3, 4-5-6, 7-8-9 of different suits, all concealed',
    },
    category: 'pattern',
    excludes: [TaiRuleId.OpenMixedStraight],
    stackable: false,
  },

  // ═══════════════ PATTERN — Triplets ═══════════════

  {
    id: TaiRuleId.AllTriplets,
    tai: 30,
    name: { zh: '對對胡', en: 'All Triplets' },
    description: {
      zh: '全副牌是刻子',
      en: 'All melds are triplets/kongs (no sequences)',
    },
    category: 'pattern',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.TwoConcealedTriplets,
    tai: 3,
    name: { zh: '二暗刻', en: '2 Concealed Triplets' },
    description: {
      zh: '二個暗刻（明摃、暗摃或手裡三隻一樣的牌）',
      en: 'Two concealed triplets (including concealed kongs)',
    },
    category: 'pattern',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.ThreeConcealedTriplets,
    tai: 10,
    name: { zh: '三暗刻', en: '3 Concealed Triplets' },
    description: {
      zh: '三個刻子在自己手裡',
      en: 'Three concealed triplets',
    },
    category: 'pattern',
    excludes: [TaiRuleId.TwoConcealedTriplets],
    stackable: false,
  },
  {
    id: TaiRuleId.FourConcealedTriplets,
    tai: 30,
    name: { zh: '四暗刻', en: '4 Concealed Triplets' },
    description: {
      zh: '四個刻子在自己手裡',
      en: 'Four concealed triplets',
    },
    category: 'pattern',
    excludes: [TaiRuleId.ThreeConcealedTriplets, TaiRuleId.TwoConcealedTriplets],
    stackable: false,
  },
  {
    id: TaiRuleId.FiveConcealedTriplets,
    tai: 80,
    name: { zh: '五暗刻', en: '5 Concealed Triplets' },
    description: {
      zh: '五個刻子在自己手裡',
      en: 'All five melds are concealed triplets',
    },
    category: 'pattern',
    excludes: [TaiRuleId.FourConcealedTriplets, TaiRuleId.ThreeConcealedTriplets, TaiRuleId.TwoConcealedTriplets],
    stackable: false,
  },
  {
    id: TaiRuleId.TwoBrothers,
    tai: 3,
    name: { zh: '二兄弟', en: 'Two Brothers' },
    description: {
      zh: '兩款數字一樣的刻子',
      en: 'Two triplets of the same number in different suits',
    },
    category: 'pattern',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.SmallThreeBrothers,
    tai: 10,
    name: { zh: '小三兄弟', en: 'Small Three Brothers' },
    description: {
      zh: '二兄弟再加上另一個兄弟做眼',
      en: 'Two brother triplets + third brother as pair',
    },
    category: 'pattern',
    excludes: [TaiRuleId.TwoBrothers],
    stackable: false,
  },
  {
    id: TaiRuleId.BigThreeBrothers,
    tai: 15,
    name: { zh: '大三兄弟', en: 'Big Three Brothers' },
    description: {
      zh: '三款數字一樣的刻子',
      en: 'Three triplets of the same number in all three suits',
    },
    category: 'pattern',
    excludes: [TaiRuleId.SmallThreeBrothers, TaiRuleId.TwoBrothers],
    stackable: false,
  },
  {
    id: TaiRuleId.SmallThreeSisters,
    tai: 8,
    name: { zh: '小三姊妹', en: 'Small Three Sisters' },
    description: {
      zh: '兩副同款而數子相連的刻子，另加一對數子相連的眼',
      en: 'Two consecutive same-suit triplets + consecutive pair',
    },
    category: 'pattern',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.BigThreeSisters,
    tai: 15,
    name: { zh: '大三姊妹', en: 'Big Three Sisters' },
    description: {
      zh: '三副同款而數子相連的刻子',
      en: 'Three consecutive same-suit triplets',
    },
    category: 'pattern',
    excludes: [TaiRuleId.SmallThreeSisters],
    stackable: false,
  },
  {
    id: TaiRuleId.FourToOne,
    tai: 5,
    name: { zh: '四歸一', en: 'Four of a Kind (Split)' },
    description: {
      zh: '用盡同一隻牌的四隻牌',
      en: 'All 4 copies of a tile used across different melds',
    },
    category: 'pattern',
    excludes: [],
    stackable: true,
  },
  {
    id: TaiRuleId.FourToTwo,
    tai: 10,
    name: { zh: '四歸二', en: 'Four of a Kind (Pair)' },
    description: {
      zh: '用盡同一隻牌的四隻牌，兩隻做眼',
      en: 'All 4 copies used — 2 in pair, 2 in melds',
    },
    category: 'pattern',
    excludes: [TaiRuleId.FourToOne],
    stackable: false,
  },
  {
    id: TaiRuleId.FourToFour,
    tai: 20,
    name: { zh: '四歸四', en: 'Four of a Kind (Sequences)' },
    description: {
      zh: '用盡同一隻牌的四隻牌（順子）',
      en: 'All 4 copies of a tile used in sequences',
    },
    category: 'pattern',
    excludes: [TaiRuleId.FourToOne],
    stackable: false,
  },

  // ═══════════════ FLUSH ═══════════════

  {
    id: TaiRuleId.HalfFlush,
    tai: 30,
    name: { zh: '混一色', en: 'Half Flush' },
    description: {
      zh: '只有一門牌及番子',
      en: 'Only one suit plus honor tiles',
    },
    category: 'flush',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.FullFlush,
    tai: 80,
    name: { zh: '清一色', en: 'Full Flush' },
    description: {
      zh: '只有一門牌及沒有番子',
      en: 'Only one suit, no honor tiles',
    },
    category: 'flush',
    excludes: [TaiRuleId.HalfFlush, TaiRuleId.MissingOneSuit, TaiRuleId.NoHonors],
    stackable: false,
  },

  // ═══════════════ TERMINAL ═══════════════

  {
    id: TaiRuleId.AllMiddle,
    tai: 5,
    name: { zh: '斷么', en: 'All Simples' },
    description: {
      zh: '全副牌沒有么九及番子',
      en: 'No terminals (1 or 9) and no honor tiles',
    },
    category: 'terminal',
    excludes: [TaiRuleId.NoHonors],
    stackable: false,
  },
  {
    id: TaiRuleId.MixedTerminalChows,
    tai: 10,
    name: { zh: '全帶混么', en: 'Mixed Terminal Chows' },
    description: {
      zh: '全副牌每一組合都有么九或番子',
      en: 'Every meld and pair contains a terminal (1/9) or honor tile',
    },
    category: 'terminal',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.PureTerminalChows,
    tai: 15,
    name: { zh: '全帶么', en: 'Pure Terminal Chows' },
    description: {
      zh: '全副牌每一組合都有么九，無番子',
      en: 'Every meld and pair contains a terminal, no honors',
    },
    category: 'terminal',
    excludes: [TaiRuleId.MixedTerminalChows, TaiRuleId.NoHonors],
    stackable: false,
  },
  {
    id: TaiRuleId.MixedTerminals,
    tai: 30,
    name: { zh: '混么', en: 'Mixed Terminals' },
    description: {
      zh: '全副牌都是么九及番子',
      en: 'Hand consists only of terminals (1/9) and honor tiles',
    },
    category: 'terminal',
    excludes: [TaiRuleId.MixedTerminalChows, TaiRuleId.AllTriplets],
    stackable: false,
  },
  {
    id: TaiRuleId.AllTerminals,
    tai: 80,
    name: { zh: '清么', en: 'All Terminals' },
    description: {
      zh: '全副牌都是么九',
      en: 'Hand consists only of terminal tiles (1s and 9s)',
    },
    category: 'terminal',
    excludes: [TaiRuleId.MixedTerminals, TaiRuleId.PureTerminalChows, TaiRuleId.MixedTerminalChows, TaiRuleId.AllTriplets, TaiRuleId.NoHonors],
    stackable: false,
  },

  // ═══════════════ OPEN HAND ═══════════════

  {
    id: TaiRuleId.FullyOpen,
    tai: 15,
    name: { zh: '全求人', en: 'Fully Open' },
    description: {
      zh: '全副牌落地，單釣而其他家打出胡牌（明槓亦可，暗槓不可）',
      en: 'All melds open, single pair wait, win by discard',
    },
    category: 'pattern',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.HalfOpen,
    tai: 8,
    name: { zh: '半求人', en: 'Half Open' },
    description: {
      zh: '全副牌落地，單釣而自摸（明槓亦可，暗槓不可）',
      en: 'All melds open, single pair wait, win by self-draw',
    },
    category: 'pattern',
    excludes: [],
    stackable: false,
  },

  // ═══════════════ SPECIAL ═══════════════

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
    tai: 20,
    name: { zh: '海底撈月', en: 'Win on Last Draw' },
    description: {
      zh: '最後一隻牌自摸',
      en: 'Self-draw the very last tile in the wall',
    },
    category: 'special',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.WinAfterKong,
    tai: 1,
    name: { zh: '花上/摃上食胡', en: 'Win After Kong/Flower' },
    description: {
      zh: '摸花時自摸或開摃時自摸',
      en: 'Win on a supplement tile drawn after a kong or flower',
    },
    category: 'special',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.RobbingKong,
    tai: 1,
    name: { zh: '搶摃食胡', en: 'Robbing a Kong' },
    description: {
      zh: '搶摃不當自摸，搶摃只當是被搶那家出沖',
      en: 'Win by claiming a tile used to upgrade a pong to a kong',
    },
    category: 'special',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.KongOnKong,
    tai: 30,
    name: { zh: '摃上摃食胡', en: 'Kong on Kong Win' },
    description: {
      zh: '開槓後再開槓時自摸',
      en: 'Win on a supplement tile after declaring a second kong in succession',
    },
    category: 'special',
    excludes: [TaiRuleId.WinAfterKong],
    stackable: false,
  },
  {
    id: TaiRuleId.FourKongs,
    tai: 8,
    name: { zh: '四槓牌', en: 'Four Kongs' },
    description: {
      zh: '玩家單獨完成四槓時，即以胡牌計算',
      en: 'Player declares 4 kongs — auto-win',
    },
    category: 'special',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.WinWithin7,
    tai: 20,
    name: { zh: '七只內', en: 'Win Within 7 Tiles' },
    description: {
      zh: '拿走食胡牌後，地下只有七隻牌內食胡（算至第七隻），不計上及碰了的牌',
      en: 'Win with 7 or fewer concealed tiles remaining (excl. open melds)',
    },
    category: 'special',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.WinWithin10,
    tai: 10,
    name: { zh: '十只內', en: 'Win Within 10 Tiles' },
    description: {
      zh: '拿走食胡牌後，地下只有十隻牌內食胡（算至第十隻），不計上及碰了的牌',
      en: 'Win with 10 or fewer concealed tiles remaining',
    },
    category: 'special',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.HeavenlyHand,
    tai: 100,
    name: { zh: '天胡', en: 'Heavenly Hand' },
    description: {
      zh: '莊家一開牌補花後即吃糊',
      en: 'Dealer wins on the dealt hand after flower replacement',
    },
    category: 'special',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.EarthlyHand,
    tai: 80,
    name: { zh: '地胡', en: 'Earthly Hand' },
    description: {
      zh: '閒家第一次摸牌即自摸',
      en: 'Non-dealer wins by self-draw on very first turn',
    },
    category: 'special',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.HumanHand,
    tai: 80,
    name: { zh: '人胡', en: 'Human Hand' },
    description: {
      zh: '閒家在四隻牌內吃糊',
      en: 'Non-dealer wins within the first 4 discards',
    },
    category: 'special',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.AllConcealedTripletsSD,
    tai: 100,
    name: { zh: '間間胡', en: 'Concealed All-Triplets Self-Draw' },
    description: {
      zh: '自摸門前對對糊',
      en: 'Concealed hand + all triplets + self-draw',
    },
    category: 'special',
    excludes: [
      TaiRuleId.AllTriplets,
      TaiRuleId.FiveConcealedTriplets,
      TaiRuleId.FourConcealedTriplets,
      TaiRuleId.ThreeConcealedTriplets,
      TaiRuleId.TwoConcealedTriplets,
      TaiRuleId.ConcealedSelfDraw,
      TaiRuleId.SelfDraw,
      TaiRuleId.Concealed,
    ],
    stackable: false,
  },
  {
    id: TaiRuleId.ThirteenOrphans,
    tai: 80,
    name: { zh: '十三么', en: 'Thirteen Orphans' },
    description: {
      zh: '十三么，另三隻是自己摸回來的順子或暗刻',
      en: 'One each of all 13 terminal/honor tiles + one duplicate',
    },
    category: 'special',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.SixteenUnrelated,
    tai: 40,
    name: { zh: '十六不搭（九唔搭八）', en: 'Sixteen Unrelated' },
    description: {
      zh: '東南西北中發白，其他三門每樣三隻，但不能搭上，再加一對眼',
      en: 'All 7 honors + 3 tiles from each suit that form no melds + one pair',
    },
    category: 'special',
    excludes: [],
    stackable: false,
  },
  {
    id: TaiRuleId.EightPairs,
    tai: 40,
    name: { zh: '嚦咕嚦咕', en: 'Eight Pairs' },
    description: {
      zh: '八對子，三隻一樣的不能碰出',
      en: 'Eight pairs — any triplet must not be claimed (concealed)',
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
