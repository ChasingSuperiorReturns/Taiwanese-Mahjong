// ─── Pre-built quiz scenarios ───
// Each scenario has a hand, context overrides, expected total tai, and difficulty.
// All expected tai values are computed AFTER conflict resolution via calculateScore().
// Open hands (isConcealed=false) isolate specific rules for cleaner quiz questions.

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

// ─── Helper: standard base hand (triggers 0 tai by itself) ───
// Mixed suits, has a pong, no honors, one chi kept concealed to avoid FullyOpen.
// isConcealed=false overall (not all melds concealed).
const baseHand = () => [
  chi([W(1), W(2), W(3)]),         // concealed chi — prevents FullyOpen(2)
  chi([T(4), T(5), T(6)], false),
  chi([S(2), S(3), S(4)], false),
  pong(W(9), false),
  chi([T(7), T(8), T(9)], false),
] as const;

export const QUIZ_SCENARIOS: QuizScenario[] = [
  // ════════════════════════════════════════════
  // EASY — single rule, 1 tai each
  // Open hands isolate one rule at a time.
  // ════════════════════════════════════════════

  // e1: 自摸 — Self-Draw
  {
    id: 'e1',
    hand: createHand([...baseHand()], [S(5), S(5)], S(5)),
    context: { isSelfDraw: true },
    expectedTai: 1,
    difficulty: 'easy',
    hintZh: '自摸',
    hintEn: 'Self-Draw',
  },

  // e2: 莊家 — Dealer
  {
    id: 'e2',
    hand: createHand([...baseHand()], [S(5), S(5)], S(5)),
    context: { isDealer: true, dealerStreak: 0 },
    expectedTai: 1,
    difficulty: 'easy',
    hintZh: '莊家',
    hintEn: 'Dealer',
  },

  // e3: 三元牌（紅中）— Dragon Triplet (Red)
  {
    id: 'e3',
    hand: createHand(
      [chi([W(1), W(2), W(3)]), chi([T(4), T(5), T(6)], false), chi([S(2), S(3), S(4)], false), pong(RED, false), chi([T(7), T(8), T(9)], false)],
      [W(5), W(5)], W(5),
    ),
    context: {},
    expectedTai: 1,
    difficulty: 'easy',
    hintZh: '三元牌（紅中）',
    hintEn: 'Dragon Triplet (Red)',
  },

  // e4: 圈風牌（東風）— Round Wind (East)
  {
    id: 'e4',
    hand: createHand(
      [chi([W(1), W(2), W(3)]), chi([T(4), T(5), T(6)], false), chi([S(2), S(3), S(4)], false), pong(EAST, false), chi([T(7), T(8), T(9)], false)],
      [W(5), W(5)], W(5),
    ),
    context: { roundWind: Wind.East, seatWind: Wind.South },
    expectedTai: 1,
    difficulty: 'easy',
    hintZh: '圈風牌（東風）',
    hintEn: 'Round Wind (East)',
  },

  // e5: 門風牌（南風）— Seat Wind (South)
  {
    id: 'e5',
    hand: createHand(
      [chi([W(1), W(2), W(3)]), chi([T(4), T(5), T(6)], false), chi([S(2), S(3), S(4)], false), pong(SOUTH, false), chi([T(7), T(8), T(9)], false)],
      [W(5), W(5)], W(5),
    ),
    context: { seatWind: Wind.South, roundWind: Wind.West },
    expectedTai: 1,
    difficulty: 'easy',
    hintZh: '門風牌（南風）',
    hintEn: 'Seat Wind (South)',
  },

  // e6: 門清 — Concealed Hand (discard win)
  {
    id: 'e6',
    hand: createHand(
      [chi([W(1), W(2), W(3)]), chi([T(4), T(5), T(6)]), chi([S(2), S(3), S(4)]), pong(W(9)), chi([T(7), T(8), T(9)])],
      [S(5), S(5)], S(5),
    ),
    context: { isSelfDraw: false },
    expectedTai: 1,
    difficulty: 'easy',
    hintZh: '門清（食銃胡牌）',
    hintEn: 'Concealed Hand (win by discard)',
  },

  // e7: 獨聽 — Single Wait
  {
    id: 'e7',
    hand: createHand([...baseHand()], [S(5), S(5)], S(5), true),
    context: {},
    expectedTai: 1,
    difficulty: 'easy',
    hintZh: '獨聽',
    hintEn: 'Single Wait',
  },

  // e8: 正花（東位持春）— Matching Flower
  {
    id: 'e8',
    hand: createHand([...baseHand()], [S(5), S(5)], S(5)),
    context: { seatWind: Wind.East, flowers: [flowerTile(FlowerType.Spring)] },
    expectedTai: 1,
    difficulty: 'easy',
    hintZh: '正花（東位持春）',
    hintEn: 'Matching Flower (Spring for East)',
  },

  // e9: 河底撈魚 — Win on Last Discard
  {
    id: 'e9',
    hand: createHand([...baseHand()], [S(5), S(5)], S(5)),
    context: { isLastDiscard: true },
    expectedTai: 1,
    difficulty: 'easy',
    hintZh: '河底撈魚',
    hintEn: 'Win on Last Discard',
  },

  // e10: 搶槓 — Robbing a Kong
  {
    id: 'e10',
    hand: createHand([...baseHand()], [S(5), S(5)], S(5)),
    context: { isRobbingKong: true },
    expectedTai: 1,
    difficulty: 'easy',
    hintZh: '搶槓',
    hintEn: 'Robbing a Kong',
  },

  // ════════════════════════════════════════════
  // MEDIUM — 2-5 tai
  // ════════════════════════════════════════════

  // m1: 平胡 — All Sequences (2 tai)
  // Open chis, no flowers, no honors, discard win, not single wait
  {
    id: 'm1',
    hand: createHand(
      [chi([W(1), W(2), W(3)]), chi([W(4), W(5), W(6)], false), chi([T(1), T(2), T(3)], false), chi([T(4), T(5), T(6)], false), chi([S(1), S(2), S(3)], false)],
      [S(5), S(5)], S(5),
    ),
    context: {},
    expectedTai: 2,
    difficulty: 'medium',
    hintZh: '平胡（無花、無字、無刻、聽雙頭、非自摸）',
    hintEn: 'All Sequences (strict conditions)',
  },

  // m2: 三暗刻 — 3 Concealed Triplets (2 tai)
  // 3 concealed pongs + 2 open chis; hand is NOT concealed overall
  {
    id: 'm2',
    hand: createHand(
      [pong(W(1)), pong(T(3)), pong(S(5)), chi([W(4), W(5), W(6)], false), chi([T(7), T(8), T(9)], false)],
      [S(9), S(9)], S(9),
    ),
    context: {},
    expectedTai: 2,
    difficulty: 'medium',
    hintZh: '三暗刻',
    hintEn: '3 Concealed Triplets',
  },

  // m3: 槓上開花＋自摸 — Win After Kong + Self-Draw (2 tai)
  {
    id: 'm3',
    hand: createHand([...baseHand()], [S(5), S(5)], S(5)),
    context: { isSelfDraw: true, isAfterKong: true },
    expectedTai: 2,
    difficulty: 'medium',
    hintZh: '槓上開花＋自摸',
    hintEn: 'Win After Kong + Self-Draw',
  },

  // m4: 海底撈月＋自摸 — Last Tile Self-Draw + Self-Draw (2 tai)
  {
    id: 'm4',
    hand: createHand([...baseHand()], [S(5), S(5)], S(5)),
    context: { isSelfDraw: true, isLastTileSelfDraw: true },
    expectedTai: 2,
    difficulty: 'medium',
    hintZh: '海底撈月＋自摸',
    hintEn: 'Win on Last Draw + Self-Draw',
  },

  // m5: 全求＋獨聽 — Fully Open + Single Wait (3 tai)
  // All 5 melds open, pair wait, discard win
  {
    id: 'm5',
    hand: createHand(
      [chi([W(1), W(2), W(3)], false), chi([T(4), T(5), T(6)], false), chi([S(2), S(3), S(4)], false), pong(W(9), false), pong(T(9), false)],
      [S(5), S(5)], S(5), true,
    ),
    context: { isSelfDraw: false },
    expectedTai: 3,
    difficulty: 'medium',
    hintZh: '全求＋獨聽',
    hintEn: 'Fully Open + Single Wait',
  },

  // m6: 不求（門清自摸）— Concealed Self-Draw (3 tai)
  // Replaces Concealed(1) + SelfDraw(1) via conflict resolution
  {
    id: 'm6',
    hand: createHand(
      [chi([W(1), W(2), W(3)]), chi([T(4), T(5), T(6)]), chi([S(2), S(3), S(4)]), pong(W(9)), chi([T(7), T(8), T(9)])],
      [S(5), S(5)], S(5),
    ),
    context: { isSelfDraw: true },
    expectedTai: 3,
    difficulty: 'medium',
    hintZh: '不求（門清自摸）— 取代門清＋自摸',
    hintEn: 'Concealed Self-Draw — replaces Concealed + Self-Draw',
  },

  // m7: 連一拉一 — Dealer Streak (3 tai = 2×1+1)
  {
    id: 'm7',
    hand: createHand([...baseHand()], [S(5), S(5)], S(5)),
    context: { isDealer: true, dealerStreak: 1 },
    expectedTai: 3,
    difficulty: 'medium',
    hintZh: '連一拉一（連莊拉莊）',
    hintEn: 'Dealer Streak (1 consecutive)',
  },

  // m8: 花槓（四季）＋正花 — Flower Group + Matching Flower (3 tai = 2+1)
  {
    id: 'm8',
    hand: createHand([...baseHand()], [S(5), S(5)], S(5)),
    context: {
      seatWind: Wind.East,
      flowers: [
        flowerTile(FlowerType.Spring), flowerTile(FlowerType.Summer),
        flowerTile(FlowerType.Autumn), flowerTile(FlowerType.Winter),
      ],
    },
    expectedTai: 3,
    difficulty: 'medium',
    hintZh: '花槓（四季）＋正花',
    hintEn: 'Flower Group (Seasons) + Matching Flower',
  },

  // m9: 小三元 — Small Three Dragons (4 tai)
  // Excludes individual Dragon Triplets
  {
    id: 'm9',
    hand: createHand(
      [chi([W(1), W(2), W(3)]), chi([T(4), T(5), T(6)], false), chi([S(2), S(3), S(4)], false), pong(RED, false), pong(GREEN, false)],
      [WHITE, WHITE], WHITE,
    ),
    context: {},
    expectedTai: 4,
    difficulty: 'medium',
    hintZh: '小三元（兩刻一眼，取代三元牌）',
    hintEn: 'Small Three Dragons (replaces Dragon Triplets)',
  },

  // m10: 混一色 — Half Flush (4 tai)
  // One suit (萬) + honors; set wind context to avoid wind bonuses
  {
    id: 'm10',
    hand: createHand(
      [chi([W(1), W(2), W(3)]), chi([W(4), W(5), W(6)], false), chi([W(7), W(8), W(9)], false), pong(EAST, false), pong(SOUTH, false)],
      [W(5), W(5)], W(5),
    ),
    context: { roundWind: Wind.West, seatWind: Wind.North },
    expectedTai: 4,
    difficulty: 'medium',
    hintZh: '混一色（萬＋字）',
    hintEn: 'Half Flush (one suit + honors)',
  },

  // m11: 碰碰胡＋三元牌 — All Triplets + Dragon Triplet (5 tai = 4+1)
  {
    id: 'm11',
    hand: createHand(
      [pong(W(1)), pong(T(3), false), pong(S(5), false), pong(W(7), false), pong(RED, false)],
      [T(9), T(9)], T(9),
    ),
    context: {},
    expectedTai: 5,
    difficulty: 'medium',
    hintZh: '碰碰胡＋三元牌',
    hintEn: 'All Triplets + Dragon Triplet',
  },

  // m12: 四暗刻 — 4 Concealed Triplets (5 tai)
  // 4 concealed pongs + 1 open chi; excludes 3 Concealed Triplets
  {
    id: 'm12',
    hand: createHand(
      [pong(W(1)), pong(T(3)), pong(S(5)), pong(W(7)), chi([T(7), T(8), T(9)], false)],
      [S(9), S(9)], S(9),
    ),
    context: {},
    expectedTai: 5,
    difficulty: 'medium',
    hintZh: '四暗刻（取代三暗刻）',
    hintEn: '4 Concealed Triplets (replaces 3 Concealed Triplets)',
  },

  // ════════════════════════════════════════════
  // HARD — 8+ tai
  // ════════════════════════════════════════════

  // h1: 清一色 — Full Flush (8 tai)
  // Excludes Half Flush
  {
    id: 'h1',
    hand: createHand(
      [chi([W(1), W(2), W(3)]), chi([W(4), W(5), W(6)], false), chi([W(7), W(8), W(9)], false), pong(W(1), false), pong(W(2), false)],
      [W(5), W(5)], W(5),
    ),
    context: {},
    expectedTai: 8,
    difficulty: 'hard',
    hintZh: '清一色（取代混一色）',
    hintEn: 'Full Flush (replaces Half Flush)',
  },

  // h2: 大三元 — Big Three Dragons (8 tai)
  // Excludes Small Three Dragons + Dragon Triplets
  {
    id: 'h2',
    hand: createHand(
      [chi([W(1), W(2), W(3)]), chi([T(4), T(5), T(6)], false), pong(RED, false), pong(GREEN, false), pong(WHITE, false)],
      [S(5), S(5)], S(5),
    ),
    context: {},
    expectedTai: 8,
    difficulty: 'hard',
    hintZh: '大三元（取代小三元及三元牌）',
    hintEn: 'Big Three Dragons (replaces Small Three Dragons)',
  },

  // h3: 小四喜 — Small Four Winds (8 tai)
  // 3 wind pongs + wind pair; set context to avoid wind bonuses
  {
    id: 'h3',
    hand: createHand(
      [chi([W(1), W(2), W(3)]), chi([T(4), T(5), T(6)], false), pong(EAST, false), pong(WEST, false), pong(NORTH, false)],
      [SOUTH, SOUTH], SOUTH,
    ),
    context: { roundWind: Wind.South, seatWind: Wind.South },
    expectedTai: 8,
    difficulty: 'hard',
    hintZh: '小四喜（三風刻＋一風眼）',
    hintEn: 'Small Four Winds',
  },

  // h4: 四槓牌＋碰碰胡 — Four Kongs + All Triplets (12 tai = 8+4)
  {
    id: 'h4',
    hand: createHand(
      [kong(W(1), MeldType.Kong), kong(T(3), MeldType.Kong), kong(S(5), MeldType.Kong), kong(W(7), MeldType.ConcealedKong), pong(T(9), false)],
      [S(1), S(1)], S(1),
    ),
    context: {},
    expectedTai: 12,
    difficulty: 'hard',
    hintZh: '四槓牌＋碰碰胡',
    hintEn: 'Four Kongs + All Triplets',
  },

  // h5: 七搶一＋花槓＋正花 — Seven Rob One combo (12 tai = 8+2+1+1)
  {
    id: 'h5',
    hand: createHand([...baseHand()], [S(5), S(5)], S(5)),
    context: {
      seatWind: Wind.East,
      flowers: [
        flowerTile(FlowerType.Spring), flowerTile(FlowerType.Summer),
        flowerTile(FlowerType.Autumn), flowerTile(FlowerType.Winter),
        flowerTile(FlowerType.Plum), flowerTile(FlowerType.Orchid),
        flowerTile(FlowerType.Chrysanthemum),
      ],
    },
    expectedTai: 12,
    difficulty: 'hard',
    hintZh: '七搶一＋花槓（四季）＋正花×2',
    hintEn: 'Seven Rob One + Flower Group + 2× Matching Flower',
  },

  // h6: 八朵花 combo — Eight Flowers (14 tai = 8+2+2+1+1)
  {
    id: 'h6',
    hand: createHand([...baseHand()], [S(5), S(5)], S(5)),
    context: {
      seatWind: Wind.East,
      flowers: [
        flowerTile(FlowerType.Spring), flowerTile(FlowerType.Summer),
        flowerTile(FlowerType.Autumn), flowerTile(FlowerType.Winter),
        flowerTile(FlowerType.Plum), flowerTile(FlowerType.Orchid),
        flowerTile(FlowerType.Chrysanthemum), flowerTile(FlowerType.Bamboo),
      ],
    },
    expectedTai: 14,
    difficulty: 'hard',
    hintZh: '八朵花＋花槓×2＋正花×2',
    hintEn: 'Eight Flowers + 2× Flower Group + 2× Matching Flower',
  },

  // h7: 五暗刻＋碰碰胡＋門清自摸 — 5CT + AllTriplets + CSD (15 tai = 8+4+3)
  {
    id: 'h7',
    hand: createHand(
      [pong(W(1)), pong(T(3)), pong(S(5)), pong(W(7)), pong(T(9))],
      [S(1), S(1)], S(1),
    ),
    context: { isSelfDraw: true },
    expectedTai: 15,
    difficulty: 'hard',
    hintZh: '五暗刻＋碰碰胡＋門清自摸',
    hintEn: '5 Concealed Triplets + All Triplets + Concealed Self-Draw',
  },

  // h8: 大四喜 — Big Four Winds (16 tai)
  // Excludes SmallFourWinds, RoundWind, SeatWind
  {
    id: 'h8',
    hand: createHand(
      [pong(EAST, false), pong(SOUTH, false), pong(WEST, false), pong(NORTH, false), chi([W(1), W(2), W(3)])],
      [T(5), T(5)], T(5),
    ),
    context: { roundWind: Wind.East, seatWind: Wind.South },
    expectedTai: 16,
    difficulty: 'hard',
    hintZh: '大四喜（取代小四喜、圈風、門風）',
    hintEn: 'Big Four Winds (replaces Small Four Winds + wind tai)',
  },

  // h9: 地胡＋門清自摸 — Earthly Hand + CSD (19 tai = 16+3)
  {
    id: 'h9',
    hand: createHand(
      [chi([W(1), W(2), W(3)]), chi([T(4), T(5), T(6)]), chi([S(2), S(3), S(4)]), pong(W(9)), chi([T(7), T(8), T(9)])],
      [S(5), S(5)], S(5),
    ),
    context: { isSelfDraw: true, isEarthlyHand: true },
    expectedTai: 19,
    difficulty: 'hard',
    hintZh: '地胡＋門清自摸',
    hintEn: 'Earthly Hand + Concealed Self-Draw',
  },

  // h10: 天胡＋莊家＋門清自摸 — Heavenly Hand combo (36 tai = 32+1+3)
  {
    id: 'h10',
    hand: createHand(
      [chi([W(1), W(2), W(3)]), chi([T(4), T(5), T(6)]), chi([S(2), S(3), S(4)]), pong(W(9)), chi([T(7), T(8), T(9)])],
      [S(5), S(5)], S(5),
    ),
    context: { isSelfDraw: true, isDealer: true, dealerStreak: 0, isHeavenlyHand: true },
    expectedTai: 36,
    difficulty: 'hard',
    hintZh: '天胡＋莊家＋門清自摸',
    hintEn: 'Heavenly Hand + Dealer + Concealed Self-Draw',
  },
];
