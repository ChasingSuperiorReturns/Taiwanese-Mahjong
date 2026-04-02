// ─── Pre-built quiz scenarios ───
// All tai values verified against calculateScore() with twmahjong.com rules.
//
// Base hand design (used where noted):
//   Melds: chi(W234) + chi(T456,open) + chi(S678,open) + pong(EAST,open) + chi(T123,open)
//   Pair: [W(6),W(6)]   Context: seatWind=West, roundWind=South, flowers=[]
//   Ambient = WindTriplet(1) + NoFlowers(1) = 2 tai
//
// Sequence starts = {2,4,6,1} → no straight, no same-number, no old&young.
// W(6) pair → not 2/5/8. EAST pong → has honor. 3 suits → no MissingOneSuit.

import { Hand } from '@/src/engine/hand';
import { createHand, chi, pong, kong } from '@/src/engine/hand';
import {
  W, T, S, EAST, SOUTH, WEST, NORTH, RED, GREEN, WHITE,
  Wind, MeldType, FlowerType, flowerTile,
} from '@/src/engine/tiles';
import { GameContext } from '@/src/engine/scoring/context';

export interface QuizScenario {
  id: string;
  hand: Hand;
  context: Partial<GameContext>;
  expectedTai: number;
  difficulty: 'easy' | 'medium' | 'hard';
  hintZh: string;
  hintEn: string;
}

// ─── Base hand: triggers exactly WindTriplet(1) + NoFlowers(1) = 2 tai ───
const BASE_CTX: Partial<GameContext> = {
  seatWind: Wind.West,
  roundWind: Wind.South,
  flowers: [],
};

const baseMelds = () => [
  chi([W(2), W(3), W(4)]),          // concealed — prevents FullyOpen
  chi([T(4), T(5), T(6)], false),
  chi([S(6), S(7), S(8)], false),
  pong(EAST, false),                // honor → prevents NoHonors
  chi([T(1), T(2), T(3)], false),
];

const BASE_PAIR: [ReturnType<typeof W>, ReturnType<typeof W>] = [W(6), W(6)];

export const QUIZ_SCENARIOS: QuizScenario[] = [
  // ════════════════════════════════════════════
  // EASY — ambient(2) + featured rule
  // ════════════════════════════════════════════

  // e1: 自摸(1) + WindTriplet(1) + NoFlowers(1) = 3
  {
    id: 'e1',
    hand: createHand([...baseMelds()], BASE_PAIR, W(6)),
    context: { ...BASE_CTX, isSelfDraw: true },
    expectedTai: 3,
    difficulty: 'easy',
    hintZh: '自摸(1) + 風牌(1) + 無花(1)',
    hintEn: 'Self-Draw(1) + Wind Triplet(1) + No Flowers(1)',
  },

  // e2: 莊家(1) + ambient(2) = 3
  {
    id: 'e2',
    hand: createHand([...baseMelds()], BASE_PAIR, W(6)),
    context: { ...BASE_CTX, isDealer: true, dealerStreak: 0 },
    expectedTai: 3,
    difficulty: 'easy',
    hintZh: '莊家(1) + 風牌(1) + 無花(1)',
    hintEn: 'Dealer(1) + Wind Triplet(1) + No Flowers(1)',
  },

  // e3: 獨獨(2) + ambient(2) = 4
  {
    id: 'e3',
    hand: createHand([...baseMelds()], BASE_PAIR, W(6), true),
    context: { ...BASE_CTX },
    expectedTai: 4,
    difficulty: 'easy',
    hintZh: '獨獨(2) + 風牌(1) + 無花(1)',
    hintEn: 'Single Wait(2) + Wind Triplet(1) + No Flowers(1)',
  },

  // e4: 中發白(2) — RED pong, no wind pong → DragonTriplet(2) + NoFlowers(1) = 3
  {
    id: 'e4',
    hand: createHand(
      [chi([W(2), W(3), W(4)]), chi([T(4), T(5), T(6)], false), chi([S(6), S(7), S(8)], false), pong(RED, false), chi([T(1), T(2), T(3)], false)],
      BASE_PAIR, W(6),
    ),
    context: { ...BASE_CTX },
    expectedTai: 3,
    difficulty: 'easy',
    hintZh: '中發白(2) + 無花(1)',
    hintEn: 'Dragon Triplet(2) + No Flowers(1)',
  },

  // e5: 正風(2) — WEST pong, seatWind=West → MatchingWind(2) + NoFlowers(1) = 3
  {
    id: 'e5',
    hand: createHand(
      [chi([W(2), W(3), W(4)]), chi([T(4), T(5), T(6)], false), chi([S(6), S(7), S(8)], false), pong(WEST, false), chi([T(1), T(2), T(3)], false)],
      BASE_PAIR, W(6),
    ),
    context: { ...BASE_CTX },
    expectedTai: 3,
    difficulty: 'easy',
    hintZh: '正風(2) + 無花(1)',
    hintEn: 'Matching Wind(2) + No Flowers(1)',
  },

  // e6: 正花(2) — Autumn matches West seat → MatchingFlower(2) + WindTriplet(1) = 3
  {
    id: 'e6',
    hand: createHand([...baseMelds()], BASE_PAIR, W(6)),
    context: { ...BASE_CTX, flowers: [flowerTile(FlowerType.Autumn)] },
    expectedTai: 3,
    difficulty: 'easy',
    hintZh: '正花(2) + 風牌(1)',
    hintEn: 'Matching Flower(2) + Wind Triplet(1)',
  },

  // e7: 爛花(1) — Spring(East) ≠ West → NonMatchingFlower(1) + WindTriplet(1) = 2
  {
    id: 'e7',
    hand: createHand([...baseMelds()], BASE_PAIR, W(6)),
    context: { ...BASE_CTX, flowers: [flowerTile(FlowerType.Spring)] },
    expectedTai: 2,
    difficulty: 'easy',
    hintZh: '爛花(1) + 風牌(1)',
    hintEn: 'Non-Matching Flower(1) + Wind Triplet(1)',
  },

  // e8: Just the base — WindTriplet(1) + NoFlowers(1) = 2
  {
    id: 'e8',
    hand: createHand([...baseMelds()], BASE_PAIR, W(6)),
    context: { ...BASE_CTX },
    expectedTai: 2,
    difficulty: 'easy',
    hintZh: '風牌(1) + 無花(1)',
    hintEn: 'Wind Triplet(1) + No Flowers(1)',
  },

  // ════════════════════════════════════════════
  // MEDIUM — pattern rules, 3–20 tai
  // ════════════════════════════════════════════

  // m1: 平胡(3) + 無字(1) + 爛花(1) = 5
  //   All chi, no pong, with non-matching flower
  //   Starts: 2(W),3(T),5(S),6(W),7(T) — all unique, no {1,4,7}
  {
    id: 'm1',
    hand: createHand(
      [chi([W(2), W(3), W(4)]), chi([T(3), T(4), T(5)], false), chi([S(5), S(6), S(7)], false), chi([W(6), W(7), W(8)], false), chi([T(7), T(8), T(9)], false)],
      [S(9), S(9)], S(9),
    ),
    context: { ...BASE_CTX, flowers: [flowerTile(FlowerType.Spring)] },
    expectedTai: 5,
    difficulty: 'medium',
    hintZh: '平胡(3) + 無字(1) + 爛花(1)',
    hintEn: 'All Sequences(3) + No Honors(1) + Non-Matching Flower(1)',
  },

  // m2: 門清(3) + WindTriplet(1) + NoFlowers(1) = 5
  //   All concealed, discard win
  {
    id: 'm2',
    hand: createHand(
      [chi([W(2), W(3), W(4)]), chi([T(4), T(5), T(6)]), chi([S(6), S(7), S(8)]), pong(EAST), chi([T(1), T(2), T(3)])],
      BASE_PAIR, W(6),
    ),
    context: { ...BASE_CTX, isSelfDraw: false },
    expectedTai: 5,
    difficulty: 'medium',
    hintZh: '門清(3) + 風牌(1) + 無花(1)',
    hintEn: 'Concealed(3) + Wind Triplet(1) + No Flowers(1)',
  },

  // m3: 門清自摸(5) + WindTriplet(1) + NoFlowers(1) = 7
  {
    id: 'm3',
    hand: createHand(
      [chi([W(2), W(3), W(4)]), chi([T(4), T(5), T(6)]), chi([S(6), S(7), S(8)]), pong(EAST), chi([T(1), T(2), T(3)])],
      BASE_PAIR, W(6),
    ),
    context: { ...BASE_CTX, isSelfDraw: true },
    expectedTai: 7,
    difficulty: 'medium',
    hintZh: '門清自摸(5) + 風牌(1) + 無花(1)',
    hintEn: 'Concealed Self-Draw(5) + Wind(1) + No Flowers(1)',
  },

  // m4: 明龍(10) — W123+W456+W789, open + WindTriplet(1) + NoFlowers(1) = 12
  //   Extra chi T345 avoids same-number with W starts
  {
    id: 'm4',
    hand: createHand(
      [chi([W(1), W(2), W(3)]), chi([W(4), W(5), W(6)], false), chi([W(7), W(8), W(9)], false), pong(EAST, false), chi([T(3), T(4), T(5)], false)],
      [S(6), S(6)], S(6),
    ),
    context: { ...BASE_CTX },
    expectedTai: 12,
    difficulty: 'medium',
    hintZh: '明龍(10) + 風牌(1) + 無花(1)',
    hintEn: 'Open Pure Straight(10) + Wind(1) + No Flowers(1)',
  },

  // m5: 一般高(3) — two identical W234 + WindTriplet(1) + NoFlowers(1) = 5
  {
    id: 'm5',
    hand: createHand(
      [chi([W(2), W(3), W(4)]), chi([W(2), W(3), W(4)], false), chi([T(5), T(6), T(7)], false), pong(EAST, false), chi([S(3), S(4), S(5)], false)],
      [T(9), T(9)], T(9),
    ),
    context: { ...BASE_CTX },
    expectedTai: 5,
    difficulty: 'medium',
    hintZh: '一般高(3) + 風牌(1) + 無花(1)',
    hintEn: 'Identical Seq Pair(3) + Wind(1) + No Flowers(1)',
  },

  // m6: 老少(2) — W123+W789 + WindTriplet(1) + NoFlowers(1) = 4
  //   Extra chi starts 5(T), 3(S) — all unique, no straight
  {
    id: 'm6',
    hand: createHand(
      [chi([W(1), W(2), W(3)]), chi([W(7), W(8), W(9)], false), chi([T(5), T(6), T(7)], false), pong(EAST, false), chi([S(3), S(4), S(5)], false)],
      [T(9), T(9)], T(9),
    ),
    context: { ...BASE_CTX },
    expectedTai: 4,
    difficulty: 'medium',
    hintZh: '老少(2) + 風牌(1) + 無花(1)',
    hintEn: 'Old & Young(2) + Wind(1) + No Flowers(1)',
  },

  // m7: 二兄弟(3) — pong W5+T5 + WindTriplet(1) + NoFlowers(1) = 5
  {
    id: 'm7',
    hand: createHand(
      [chi([W(2), W(3), W(4)]), pong(W(5), false), pong(T(5), false), chi([S(3), S(4), S(5)], false), pong(EAST, false)],
      [T(9), T(9)], T(9),
    ),
    context: { ...BASE_CTX },
    expectedTai: 5,
    difficulty: 'medium',
    hintZh: '二兄弟(3) + 風牌(1) + 無花(1)',
    hintEn: 'Two Brothers(3) + Wind(1) + No Flowers(1)',
  },

  // m8: 小三元(20) — 2 dragon pongs + WHITE pair + NoFlowers(1) = 21
  //   Starts: 2(W),5(T),3(S) — all unique
  {
    id: 'm8',
    hand: createHand(
      [chi([W(2), W(3), W(4)]), pong(RED, false), pong(GREEN, false), chi([T(5), T(6), T(7)], false), chi([S(3), S(4), S(5)], false)],
      [WHITE, WHITE], WHITE,
    ),
    context: { ...BASE_CTX },
    expectedTai: 21,
    difficulty: 'medium',
    hintZh: '小三元(20) + 無花(1)',
    hintEn: 'Small Three Dragons(20) + No Flowers(1)',
  },

  // m9: 斷么(5) — AllMiddle excludes NoHonors. +NonMatchingFlower(1) = 6
  //   All tiles value 2-8, no honors. Starts: 2(W),3(T),4(S),6(T) — all unique
  {
    id: 'm9',
    hand: createHand(
      [chi([W(2), W(3), W(4)]), chi([T(3), T(4), T(5)], false), chi([S(4), S(5), S(6)], false), pong(W(5), false), chi([T(6), T(7), T(8)], false)],
      [S(3), S(3)], S(3),
    ),
    context: { ...BASE_CTX, flowers: [flowerTile(FlowerType.Spring)] },
    expectedTai: 6,
    difficulty: 'medium',
    hintZh: '斷么(5) + 爛花(1)',
    hintEn: 'All Simples(5) + Non-Matching Flower(1)',
  },

  // m10: 缺一門(5) — only wan+tong + WindTriplet(1) + NoFlowers(1) = 7
  {
    id: 'm10',
    hand: createHand(
      [chi([W(2), W(3), W(4)]), chi([T(4), T(5), T(6)], false), chi([W(6), W(7), W(8)], false), pong(EAST, false), chi([T(1), T(2), T(3)], false)],
      [W(9), W(9)], W(9),
    ),
    context: { ...BASE_CTX },
    expectedTai: 7,
    difficulty: 'medium',
    hintZh: '缺一門(5) + 風牌(1) + 無花(1)',
    hintEn: 'Missing One Suit(5) + Wind(1) + No Flowers(1)',
  },

  // ════════════════════════════════════════════
  // HARD — high-value combos, 30+ tai
  // ════════════════════════════════════════════

  // h1: 對對胡(30) — all pongs + WindTriplet(1) + NoFlowers(1) = 32
  //   First pong concealed to avoid FullyOpen
  {
    id: 'h1',
    hand: createHand(
      [pong(W(2)), pong(T(3), false), pong(S(7), false), pong(EAST, false), pong(W(9), false)],
      [T(6), T(6)], T(6),
    ),
    context: { ...BASE_CTX },
    expectedTai: 32,
    difficulty: 'hard',
    hintZh: '對對胡(30) + 風牌(1) + 無花(1)',
    hintEn: 'All Triplets(30) + Wind(1) + No Flowers(1)',
  },

  // h2: 混一色(30) — wan+honors, with pure straight & dragon
  //   HalfFlush(30)+OpenPureStraight(10)+WindTriplet(1)+DragonTriplet(2)+NoFlowers(1)=44
  {
    id: 'h2',
    hand: createHand(
      [chi([W(1), W(2), W(3)]), chi([W(4), W(5), W(6)], false), chi([W(7), W(8), W(9)], false), pong(EAST, false), pong(RED, false)],
      [W(6), W(6)], W(6),
    ),
    context: { ...BASE_CTX },
    expectedTai: 44,
    difficulty: 'hard',
    hintZh: '混一色(30) + 明龍(10) + 風牌(1) + 中發白(2) + 無花(1)',
    hintEn: 'Half Flush(30) + Pure Straight(10) + Wind(1) + Dragon(2) + No Flowers(1)',
  },

  // h3: 清一色(80) + NonMatchingFlower(1) = 81
  //   All tong. Flower avoids NoHonorsNoFlowers. Starts: 2,5,3,6 — no straight
  {
    id: 'h3',
    hand: createHand(
      [chi([T(2), T(3), T(4)]), chi([T(5), T(6), T(7)], false), pong(T(9), false), chi([T(3), T(4), T(5)], false), chi([T(6), T(7), T(8)], false)],
      [T(1), T(1)], T(1),
    ),
    context: { ...BASE_CTX, flowers: [flowerTile(FlowerType.Spring)] },
    expectedTai: 81,
    difficulty: 'hard',
    hintZh: '清一色(80) + 爛花(1)',
    hintEn: 'Full Flush(80) + Non-Matching Flower(1)',
  },

  // h4: 大三元(40) + NoFlowers(1) = 41
  {
    id: 'h4',
    hand: createHand(
      [chi([W(2), W(3), W(4)]), pong(RED, false), pong(GREEN, false), pong(WHITE, false), chi([T(5), T(6), T(7)], false)],
      [S(6), S(6)], S(6),
    ),
    context: { ...BASE_CTX },
    expectedTai: 41,
    difficulty: 'hard',
    hintZh: '大三元(40) + 無花(1)',
    hintEn: 'Big Three Dragons(40) + No Flowers(1)',
  },

  // h5: 大四喜(80) + 缺一門(5) + NoFlowers(1) = 86
  //   4 wind pongs + chi(W234) + pair T(6) → 2 suits
  {
    id: 'h5',
    hand: createHand(
      [chi([W(2), W(3), W(4)]), pong(EAST, false), pong(SOUTH, false), pong(WEST, false), pong(NORTH, false)],
      [T(6), T(6)], T(6),
    ),
    context: { ...BASE_CTX },
    expectedTai: 86,
    difficulty: 'hard',
    hintZh: '大四喜(80) + 缺一門(5) + 無花(1)',
    hintEn: 'Big Four Winds(80) + Missing One Suit(5) + No Flowers(1)',
  },

  // h6: 全求人(15) — all open, discard win + WindTriplet(1) + NoFlowers(1) = 17
  {
    id: 'h6',
    hand: createHand(
      [chi([W(2), W(3), W(4)], false), chi([T(4), T(5), T(6)], false), chi([S(6), S(7), S(8)], false), pong(EAST, false), chi([T(1), T(2), T(3)], false)],
      BASE_PAIR, W(6),
    ),
    context: { ...BASE_CTX, isSelfDraw: false },
    expectedTai: 17,
    difficulty: 'hard',
    hintZh: '全求人(15) + 風牌(1) + 無花(1)',
    hintEn: 'Fully Open(15) + Wind(1) + No Flowers(1)',
  },

  // h7: 海底撈月(20) + 自摸(1) + WindTriplet(1) + NoFlowers(1) = 23
  {
    id: 'h7',
    hand: createHand([...baseMelds()], BASE_PAIR, W(6)),
    context: { ...BASE_CTX, isSelfDraw: true, isLastTileSelfDraw: true },
    expectedTai: 23,
    difficulty: 'hard',
    hintZh: '海底撈月(20) + 自摸(1) + 風牌(1) + 無花(1)',
    hintEn: 'Last Draw(20) + Self-Draw(1) + Wind(1) + No Flowers(1)',
  },

  // h8: 天胡(100) — concealed, dealer, self draw
  //   HeavenlyHand(100)+ConcealedSelfDraw(5)+Dealer(1)+WindTriplet(1)+NoFlowers(1)=108
  {
    id: 'h8',
    hand: createHand(
      [chi([W(2), W(3), W(4)]), chi([T(4), T(5), T(6)]), chi([S(6), S(7), S(8)]), pong(EAST), chi([T(1), T(2), T(3)])],
      BASE_PAIR, W(6),
    ),
    context: { ...BASE_CTX, isHeavenlyHand: true, isDealer: true, dealerStreak: 0, isSelfDraw: true },
    expectedTai: 108,
    difficulty: 'hard',
    hintZh: '天胡(100) + 門清自摸(5) + 莊家(1) + 風牌(1) + 無花(1)',
    hintEn: 'Heavenly(100) + Concealed SD(5) + Dealer(1) + Wind(1) + No Flowers(1)',
  },

  // h9: 一台花(10) — four seasons + WindTriplet(1) = 11
  {
    id: 'h9',
    hand: createHand([...baseMelds()], BASE_PAIR, W(6)),
    context: {
      ...BASE_CTX,
      flowers: [
        flowerTile(FlowerType.Spring), flowerTile(FlowerType.Summer),
        flowerTile(FlowerType.Autumn), flowerTile(FlowerType.Winter),
      ],
    },
    expectedTai: 11,
    difficulty: 'hard',
    hintZh: '一台花(10) + 風牌(1)',
    hintEn: 'Flower Group(10) + Wind Triplet(1)',
  },

  // h10: 間間胡(100) — concealed all-pongs self-draw
  //   AllConcealedTripletsSD(100) + WindTriplet(1) + NoFlowers(1) = 102
  //   S(1) instead of W(1) avoids OldAndYoung with W(9)
  {
    id: 'h10',
    hand: createHand(
      [pong(S(1)), pong(T(3)), pong(S(7)), pong(EAST), pong(W(9))],
      [T(6), T(6)], T(6),
    ),
    context: { ...BASE_CTX, isSelfDraw: true },
    expectedTai: 102,
    difficulty: 'hard',
    hintZh: '間間胡(100) + 風牌(1) + 無花(1)',
    hintEn: 'All Concealed Triplets SD(100) + Wind(1) + No Flowers(1)',
  },
];
