// ─── Pre-built quiz scenarios ───
// Each scenario has a hand, context overrides, expected total tai, and difficulty.

import { Hand } from '@/src/engine/hand';
import { createHand, chi, pong, kong } from '@/src/engine/hand';
import {
  W, T, S, EAST, SOUTH, WEST, NORTH, RED, GREEN, WHITE,
  Wind, FlowerType, flowerTile,
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

export const QUIZ_SCENARIOS: QuizScenario[] = [
  // ─── Easy (1-2 tai) ───
  {
    id: 'e1',
    hand: createHand(
      [
        chi([W(1), W(2), W(3)]),
        chi([T(4), T(5), T(6)]),
        chi([S(2), S(3), S(4)]),
        pong(W(9)),
        chi([T(1), T(2), T(3)]),
      ],
      [S(5), S(5)],
      S(5),
    ),
    context: { isSelfDraw: true },
    expectedTai: 1,
    difficulty: 'easy',
    hintZh: '只有自摸',
    hintEn: 'Self-draw only',
  },
  {
    id: 'e2',
    hand: createHand(
      [
        chi([W(1), W(2), W(3)]),
        chi([W(4), W(5), W(6)]),
        chi([T(2), T(3), T(4)]),
        chi([S(5), S(6), S(7)]),
        chi([S(1), S(2), S(3)]),
      ],
      [T(9), T(9)],
      T(9),
    ),
    context: { isDealer: true },
    expectedTai: 1,
    difficulty: 'easy',
    hintZh: '莊家胡牌',
    hintEn: 'Dealer wins',
  },
  {
    id: 'e3',
    hand: createHand(
      [
        chi([W(1), W(2), W(3)]),
        chi([T(4), T(5), T(6)]),
        chi([S(2), S(3), S(4)]),
        pong(RED),
        chi([T(1), T(2), T(3)]),
      ],
      [W(5), W(5)],
      W(5),
    ),
    context: {},
    expectedTai: 1,
    difficulty: 'easy',
    hintZh: '三元牌 — 紅中刻子',
    hintEn: 'Dragon triplet — Red',
  },
  {
    id: 'e4',
    hand: createHand(
      [
        chi([W(1), W(2), W(3)]),
        chi([T(4), T(5), T(6)]),
        chi([S(2), S(3), S(4)]),
        pong(EAST),
        chi([T(7), T(8), T(9)]),
      ],
      [W(5), W(5)],
      W(5),
    ),
    context: { roundWind: Wind.East, seatWind: Wind.South },
    expectedTai: 1,
    difficulty: 'easy',
    hintZh: '圈風 — 東風刻子',
    hintEn: 'Round wind — East triplet',
  },

  // ─── Medium (2-4 tai) ───
  {
    id: 'm1',
    hand: createHand(
      [
        chi([W(1), W(2), W(3)]),
        chi([W(4), W(5), W(6)]),
        chi([W(7), W(8), W(9)]),
        pong(EAST),
        chi([T(3), T(4), T(5)]),
      ],
      [GREEN, GREEN],
      GREEN,
    ),
    context: {
      isSelfDraw: true,
      seatWind: Wind.East,
      roundWind: Wind.East,
    },
    expectedTai: 3,
    difficulty: 'medium',
    hintZh: '自摸＋圈風＋門風',
    hintEn: 'Self-draw + round wind + seat wind',
  },
  {
    id: 'm2',
    hand: createHand(
      [
        chi([W(1), W(2), W(3)]),
        chi([W(4), W(5), W(6)]),
        chi([W(7), W(8), W(9)]),
        chi([T(3), T(4), T(5)]),
        chi([T(6), T(7), T(8)]),
      ],
      [T(9), T(9)],
      T(9),
    ),
    context: {},
    expectedTai: 2,
    difficulty: 'medium',
    hintZh: '平胡 — 嚴格條件',
    hintEn: 'All Sequences (strict)',
  },
  {
    id: 'm3',
    hand: createHand(
      [
        pong(W(1)),
        pong(W(5)),
        pong(W(9)),
        chi([T(3), T(4), T(5)]),
        chi([S(1), S(2), S(3)]),
      ],
      [NORTH, NORTH],
      NORTH,
    ),
    context: {},
    expectedTai: 2,
    difficulty: 'medium',
    hintZh: '三暗刻',
    hintEn: '3 concealed triplets',
  },
  {
    id: 'm4',
    hand: createHand(
      [
        chi([W(1), W(2), W(3)]),
        chi([T(4), T(5), T(6)]),
        chi([S(7), S(8), S(9)]),
        pong(RED),
        pong(GREEN),
      ],
      [WHITE, WHITE],
      WHITE,
    ),
    context: {},
    expectedTai: 4,
    difficulty: 'medium',
    hintZh: '小三元 — 兩刻一眼',
    hintEn: 'Small Three Dragons',
  },
  {
    id: 'm5',
    hand: createHand(
      [
        pong(W(1)),
        pong(W(5)),
        pong(W(9)),
        pong(EAST),
        pong(RED),
      ],
      [T(3), T(3)],
      T(3),
    ),
    context: {},
    expectedTai: 5,
    difficulty: 'medium',
    hintZh: '碰碰胡＋三元牌',
    hintEn: 'All Triplets + Dragon',
  },

  // ─── Hard (4+ tai) ───
  {
    id: 'h1',
    hand: createHand(
      [
        chi([W(1), W(2), W(3)]),
        chi([W(4), W(5), W(6)]),
        chi([W(7), W(8), W(9)]),
        pong(EAST),
        pong(NORTH),
      ],
      [RED, RED],
      RED,
    ),
    context: {},
    expectedTai: 4,
    difficulty: 'hard',
    hintZh: '混一色（萬＋字）',
    hintEn: 'Half Flush (wan + honors)',
  },
  {
    id: 'h2',
    hand: createHand(
      [
        chi([T(1), T(2), T(3)]),
        chi([T(4), T(5), T(6)]),
        chi([T(7), T(8), T(9)]),
        chi([T(1), T(2), T(3)]),
        chi([T(4), T(5), T(6)]),
      ],
      [T(9), T(9)],
      T(9),
    ),
    context: {},
    expectedTai: 8,
    difficulty: 'hard',
    hintZh: '清一色',
    hintEn: 'Full Flush',
  },
  {
    id: 'h3',
    hand: createHand(
      [
        pong(RED),
        pong(GREEN),
        pong(WHITE),
        chi([W(1), W(2), W(3)]),
        chi([T(4), T(5), T(6)]),
      ],
      [S(5), S(5)],
      S(5),
    ),
    context: {},
    expectedTai: 8,
    difficulty: 'hard',
    hintZh: '大三元',
    hintEn: 'Big Three Dragons',
  },
  {
    id: 'h4',
    hand: createHand(
      [
        pong(EAST),
        pong(SOUTH),
        pong(WEST),
        chi([W(1), W(2), W(3)]),
        chi([T(4), T(5), T(6)]),
      ],
      [NORTH, NORTH],
      NORTH,
    ),
    context: { roundWind: Wind.East, seatWind: Wind.East },
    expectedTai: 9,
    difficulty: 'hard',
    hintZh: '小四喜＋圈風',
    hintEn: 'Small Four Winds + Round Wind',
  },
  {
    id: 'h5',
    hand: createHand(
      [
        pong(EAST),
        pong(SOUTH),
        pong(WEST),
        pong(NORTH),
        chi([W(1), W(2), W(3)]),
      ],
      [T(5), T(5)],
      T(5),
    ),
    context: {},
    expectedTai: 16,
    difficulty: 'hard',
    hintZh: '大四喜',
    hintEn: 'Big Four Winds',
  },
  {
    id: 'h6',
    hand: createHand(
      [
        pong(W(1)),
        pong(W(5)),
        pong(W(9)),
        pong(T(3)),
        pong(RED),
      ],
      [S(7), S(7)],
      S(7),
      true,
    ),
    context: { isSelfDraw: true },
    expectedTai: 10,
    difficulty: 'hard',
    hintZh: '五暗刻＋門清自摸＋三元牌＋獨聽',
    hintEn: '5 Concealed Triplets + Concealed Self-Draw + Dragon + Single Wait',
  },
];
