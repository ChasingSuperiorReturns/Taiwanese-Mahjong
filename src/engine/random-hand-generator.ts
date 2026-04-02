// ─── Random Hand Generator ───
// Generates random valid 16-tile Taiwanese Mahjong hands for quiz mode.
// Each hand is scored by the engine to produce the correct answer.

import {
  PlayTile, Meld, MeldType, Suit, SuitValue, Wind, Dragon,
  FlowerType, FlowerTile,
  suitTile, windTile, dragonTile, flowerTile, tileKey,
} from './tiles';
import { Hand, createHand, chi, pong, kong } from './hand';
import { GameContext } from './scoring/context';
import { calculateScore, ScoreBreakdown } from './scoring';

// ─── Tile Pool ───

const ALL_SUIT_TILES: PlayTile[] = [];
for (const suit of [Suit.Wan, Suit.Tong, Suit.Tiao]) {
  for (let v = 1; v <= 9; v++) {
    ALL_SUIT_TILES.push(suitTile(suit, v as SuitValue));
  }
}

const ALL_WIND_TILES: PlayTile[] = [
  windTile(Wind.East), windTile(Wind.South),
  windTile(Wind.West), windTile(Wind.North),
];

const ALL_DRAGON_TILES: PlayTile[] = [
  dragonTile(Dragon.Red), dragonTile(Dragon.Green), dragonTile(Dragon.White),
];

const ALL_HONOR_TILES: PlayTile[] = [...ALL_WIND_TILES, ...ALL_DRAGON_TILES];
const ALL_PLAY_TILES: PlayTile[] = [...ALL_SUIT_TILES, ...ALL_HONOR_TILES];

const ALL_FLOWERS: FlowerType[] = [
  FlowerType.Spring, FlowerType.Summer, FlowerType.Autumn, FlowerType.Winter,
  FlowerType.Plum, FlowerType.Orchid, FlowerType.Chrysanthemum, FlowerType.Bamboo,
];

const WINDS: Wind[] = [Wind.East, Wind.South, Wind.West, Wind.North];

// ─── Helpers ───

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randBool(prob: number = 0.5): boolean {
  return Math.random() < prob;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Track how many of each tile are used (max 4 per tile in a real game) */
class TileTracker {
  private counts = new Map<string, number>();

  use(tile: PlayTile, count: number = 1): boolean {
    const key = tileKey(tile);
    const current = this.counts.get(key) ?? 0;
    if (current + count > 4) return false;
    this.counts.set(key, current + count);
    return true;
  }

  available(tile: PlayTile, count: number = 1): boolean {
    const key = tileKey(tile);
    const current = this.counts.get(key) ?? 0;
    return current + count <= 4;
  }

  clone(): TileTracker {
    const t = new TileTracker();
    for (const [k, v] of this.counts) t.counts.set(k, v);
    return t;
  }
}

// ─── Meld Generators ───

type MeldStrategy = 'chi' | 'pong' | 'kong' | 'concealed_kong';

function tryGenerateChi(tracker: TileTracker, suit?: Suit): Meld | null {
  const s = suit ?? randChoice([Suit.Wan, Suit.Tong, Suit.Tiao]);
  const startVal = randInt(1, 7) as SuitValue;
  const tiles: [PlayTile, PlayTile, PlayTile] = [
    suitTile(s, startVal),
    suitTile(s, (startVal + 1) as SuitValue),
    suitTile(s, (startVal + 2) as SuitValue),
  ];
  // Check availability
  for (const t of tiles) {
    if (!tracker.available(t)) return null;
  }
  for (const t of tiles) tracker.use(t);
  const isConcealed = randBool(0.4);
  return chi(tiles, isConcealed);
}

function tryGeneratePong(tracker: TileTracker, tile?: PlayTile): Meld | null {
  const t = tile ?? randChoice(ALL_PLAY_TILES);
  if (!tracker.available(t, 3)) return null;
  tracker.use(t, 3);
  const isConcealed = randBool(0.4);
  return pong(t, isConcealed);
}

function tryGenerateKong(tracker: TileTracker, tile?: PlayTile): Meld | null {
  const t = tile ?? randChoice(ALL_PLAY_TILES);
  if (!tracker.available(t, 4)) return null;
  tracker.use(t, 4);
  const isConcealed = randBool(0.5);
  const type = isConcealed ? MeldType.ConcealedKong : (randBool(0.5) ? MeldType.Kong : MeldType.AddedKong);
  return kong(t, type);
}

function tryGeneratePair(tracker: TileTracker, tile?: PlayTile): [PlayTile, PlayTile] | null {
  const t = tile ?? randChoice(ALL_PLAY_TILES);
  if (!tracker.available(t, 2)) return null;
  tracker.use(t, 2);
  return [t, t];
}

// ─── Strategy-Based Hand Generation ───

export type HandTemplate =
  | 'random'
  | 'all_sequences'     // 平胡
  | 'all_triplets'      // 對對胡
  | 'half_flush'        // 混一色
  | 'full_flush'        // 清一色
  | 'wind_heavy'        // many wind pongs
  | 'dragon_heavy'      // dragon pongs
  | 'terminal_hand'     // 么/terminal patterns
  | 'straight'          // 龍 (1-2-3, 4-5-6, 7-8-9)
  | 'kong_heavy'        // hands with kongs
  | 'concealed';        // 門清 patterns

const ALL_TEMPLATES: HandTemplate[] = [
  'random', 'random', 'random',  // weight random higher
  'all_sequences', 'all_triplets',
  'half_flush', 'full_flush',
  'wind_heavy', 'dragon_heavy',
  'terminal_hand', 'straight',
  'kong_heavy', 'concealed',
];

function generateHandFromTemplate(template: HandTemplate): { hand: Hand; ctx: Partial<GameContext> } | null {
  const tracker = new TileTracker();
  const melds: Meld[] = [];
  let pair: [PlayTile, PlayTile] | null = null;

  const MAX_ATTEMPTS = 20;

  switch (template) {

    case 'all_sequences': {
      // 5 chi melds + pair
      for (let i = 0; i < 5; i++) {
        let m: Meld | null = null;
        for (let a = 0; a < MAX_ATTEMPTS && !m; a++) m = tryGenerateChi(tracker);
        if (!m) return null;
        melds.push(m);
      }
      // Pair: prefer non-honor to allow NoHonors bonus
      const pairTile = randBool(0.6)
        ? suitTile(randChoice([Suit.Wan, Suit.Tong, Suit.Tiao]), randInt(1, 9) as SuitValue)
        : randChoice(ALL_PLAY_TILES);
      pair = tryGeneratePair(tracker, pairTile);
      if (!pair) {
        for (let a = 0; a < MAX_ATTEMPTS && !pair; a++) pair = tryGeneratePair(tracker);
      }
      break;
    }

    case 'all_triplets': {
      // 5 pong/kong melds + pair
      for (let i = 0; i < 5; i++) {
        const useKong = randBool(0.15);
        let m: Meld | null = null;
        for (let a = 0; a < MAX_ATTEMPTS && !m; a++) {
          m = useKong ? tryGenerateKong(tracker) : tryGeneratePong(tracker);
        }
        if (!m) return null;
        melds.push(m);
      }
      for (let a = 0; a < MAX_ATTEMPTS && !pair; a++) pair = tryGeneratePair(tracker);
      break;
    }

    case 'half_flush': {
      // All tiles from one suit + honors
      const suit = randChoice([Suit.Wan, Suit.Tong, Suit.Tiao]);
      const numHonorMelds = randInt(1, 2);
      // Honor melds first
      for (let i = 0; i < numHonorMelds; i++) {
        let m: Meld | null = null;
        for (let a = 0; a < MAX_ATTEMPTS && !m; a++) {
          m = tryGeneratePong(tracker, randChoice(ALL_HONOR_TILES));
        }
        if (!m) return null;
        melds.push(m);
      }
      // Suit melds
      for (let i = melds.length; i < 5; i++) {
        const useChi = randBool(0.6);
        let m: Meld | null = null;
        for (let a = 0; a < MAX_ATTEMPTS && !m; a++) {
          m = useChi ? tryGenerateChi(tracker, suit) : tryGeneratePong(tracker, suitTile(suit, randInt(1, 9) as SuitValue));
        }
        if (!m) return null;
        melds.push(m);
      }
      // Pair from same suit
      for (let a = 0; a < MAX_ATTEMPTS && !pair; a++) {
        pair = tryGeneratePair(tracker, suitTile(suit, randInt(1, 9) as SuitValue));
      }
      break;
    }

    case 'full_flush': {
      // All tiles from one suit only
      const suit = randChoice([Suit.Wan, Suit.Tong, Suit.Tiao]);
      for (let i = 0; i < 5; i++) {
        const useChi = randBool(0.5);
        let m: Meld | null = null;
        for (let a = 0; a < MAX_ATTEMPTS && !m; a++) {
          m = useChi
            ? tryGenerateChi(tracker, suit)
            : tryGeneratePong(tracker, suitTile(suit, randInt(1, 9) as SuitValue));
        }
        if (!m) return null;
        melds.push(m);
      }
      for (let a = 0; a < MAX_ATTEMPTS && !pair; a++) {
        pair = tryGeneratePair(tracker, suitTile(suit, randInt(1, 9) as SuitValue));
      }
      break;
    }

    case 'wind_heavy': {
      const numWinds = randInt(2, 4);
      const winds = shuffle(WINDS).slice(0, numWinds);
      for (const w of winds) {
        const m = tryGeneratePong(tracker, windTile(w));
        if (!m) return null;
        melds.push(m);
      }
      // Fill remaining with chi
      for (let i = melds.length; i < 5; i++) {
        let m: Meld | null = null;
        for (let a = 0; a < MAX_ATTEMPTS && !m; a++) m = tryGenerateChi(tracker);
        if (!m) return null;
        melds.push(m);
      }
      // Pair: possibly a wind pair for small wind patterns
      if (numWinds <= 3 && randBool(0.5)) {
        const remainingWinds = WINDS.filter((w) => !winds.includes(w));
        if (remainingWinds.length > 0) {
          pair = tryGeneratePair(tracker, windTile(randChoice(remainingWinds)));
        }
      }
      if (!pair) {
        for (let a = 0; a < MAX_ATTEMPTS && !pair; a++) pair = tryGeneratePair(tracker);
      }
      break;
    }

    case 'dragon_heavy': {
      const numDragons = randInt(2, 3);
      const dragons = shuffle([Dragon.Red, Dragon.Green, Dragon.White]).slice(0, numDragons);
      for (const d of dragons) {
        const m = tryGeneratePong(tracker, dragonTile(d));
        if (!m) return null;
        melds.push(m);
      }
      // Fill with chi
      for (let i = melds.length; i < 5; i++) {
        let m: Meld | null = null;
        for (let a = 0; a < MAX_ATTEMPTS && !m; a++) m = tryGenerateChi(tracker);
        if (!m) return null;
        melds.push(m);
      }
      // Pair — maybe the remaining dragon for small three dragons
      if (numDragons === 2 && randBool(0.6)) {
        const remaining = [Dragon.Red, Dragon.Green, Dragon.White].filter((d) => !dragons.includes(d));
        pair = tryGeneratePair(tracker, dragonTile(remaining[0]));
      }
      if (!pair) {
        for (let a = 0; a < MAX_ATTEMPTS && !pair; a++) pair = tryGeneratePair(tracker);
      }
      break;
    }

    case 'terminal_hand': {
      // All melds include 1 or 9. Mix of 1XX/7XX chi and 1/9 pongs
      for (let i = 0; i < 5; i++) {
        const usePong = randBool(0.4);
        let m: Meld | null = null;
        if (usePong) {
          const suit = randChoice([Suit.Wan, Suit.Tong, Suit.Tiao]);
          const val = randChoice([1, 9]) as SuitValue;
          for (let a = 0; a < MAX_ATTEMPTS && !m; a++) {
            m = tryGeneratePong(tracker, suitTile(suit, val));
          }
        } else {
          const suit = randChoice([Suit.Wan, Suit.Tong, Suit.Tiao]);
          const startVal = randChoice([1, 7]) as SuitValue;
          const tiles: [PlayTile, PlayTile, PlayTile] = [
            suitTile(suit, startVal),
            suitTile(suit, (startVal + 1) as SuitValue),
            suitTile(suit, (startVal + 2) as SuitValue),
          ];
          for (const t of tiles) {
            if (!tracker.available(t)) { m = null; break; }
          }
          if (m !== null || tiles.every((t) => tracker.available(t))) {
            for (const t of tiles) tracker.use(t);
            m = chi(tiles, randBool(0.4));
          }
        }
        if (!m) {
          // Fallback to any valid meld
          for (let a = 0; a < MAX_ATTEMPTS && !m; a++) m = tryGenerateChi(tracker);
          if (!m) for (let a = 0; a < MAX_ATTEMPTS && !m; a++) m = tryGeneratePong(tracker);
        }
        if (!m) return null;
        melds.push(m);
      }
      // Pair: terminal or honor
      const pairCandidates = [
        ...([1, 9] as SuitValue[]).flatMap((v) =>
          [Suit.Wan, Suit.Tong, Suit.Tiao].map((s) => suitTile(s, v)),
        ),
        ...ALL_HONOR_TILES,
      ];
      for (let a = 0; a < MAX_ATTEMPTS && !pair; a++) {
        pair = tryGeneratePair(tracker, randChoice(pairCandidates));
      }
      break;
    }

    case 'straight': {
      // Build 1-2-3, 4-5-6, 7-8-9 in one or mixed suits
      const sameSuit = randBool(0.5);
      const baseSuit = randChoice([Suit.Wan, Suit.Tong, Suit.Tiao]);

      for (const startVal of [1, 4, 7] as SuitValue[]) {
        const suit = sameSuit ? baseSuit : randChoice([Suit.Wan, Suit.Tong, Suit.Tiao]);
        const tiles: [PlayTile, PlayTile, PlayTile] = [
          suitTile(suit, startVal),
          suitTile(suit, (startVal + 1) as SuitValue),
          suitTile(suit, (startVal + 2) as SuitValue),
        ];
        const canUse = tiles.every((t) => tracker.available(t));
        if (!canUse) return null;
        for (const t of tiles) tracker.use(t);
        melds.push(chi(tiles, randBool(0.4)));
      }
      // 2 more melds
      for (let i = 0; i < 2; i++) {
        const usePong = randBool(0.4);
        let m: Meld | null = null;
        for (let a = 0; a < MAX_ATTEMPTS && !m; a++) {
          m = usePong ? tryGeneratePong(tracker) : tryGenerateChi(tracker);
        }
        if (!m) return null;
        melds.push(m);
      }
      for (let a = 0; a < MAX_ATTEMPTS && !pair; a++) pair = tryGeneratePair(tracker);
      break;
    }

    case 'kong_heavy': {
      const numKongs = randInt(1, 3);
      for (let i = 0; i < numKongs; i++) {
        let m: Meld | null = null;
        for (let a = 0; a < MAX_ATTEMPTS && !m; a++) m = tryGenerateKong(tracker);
        if (!m) return null;
        melds.push(m);
      }
      // Fill rest
      for (let i = melds.length; i < 5; i++) {
        const useChi = randBool(0.6);
        let m: Meld | null = null;
        for (let a = 0; a < MAX_ATTEMPTS && !m; a++) {
          m = useChi ? tryGenerateChi(tracker) : tryGeneratePong(tracker);
        }
        if (!m) return null;
        melds.push(m);
      }
      for (let a = 0; a < MAX_ATTEMPTS && !pair; a++) pair = tryGeneratePair(tracker);
      break;
    }

    case 'concealed': {
      // All melds concealed
      for (let i = 0; i < 5; i++) {
        const useChi = randBool(0.5);
        let m: Meld | null = null;
        for (let a = 0; a < MAX_ATTEMPTS && !m; a++) {
          if (useChi) {
            const suit = randChoice([Suit.Wan, Suit.Tong, Suit.Tiao]);
            const startVal = randInt(1, 7) as SuitValue;
            const tiles: [PlayTile, PlayTile, PlayTile] = [
              suitTile(suit, startVal),
              suitTile(suit, (startVal + 1) as SuitValue),
              suitTile(suit, (startVal + 2) as SuitValue),
            ];
            if (tiles.every((t) => tracker.available(t))) {
              for (const t of tiles) tracker.use(t);
              m = chi(tiles, true); // always concealed
            }
          } else {
            const tile = randChoice(ALL_PLAY_TILES);
            if (tracker.available(tile, 3)) {
              tracker.use(tile, 3);
              m = pong(tile, true); // always concealed
            }
          }
        }
        if (!m) return null;
        melds.push(m);
      }
      for (let a = 0; a < MAX_ATTEMPTS && !pair; a++) pair = tryGeneratePair(tracker);
      break;
    }

    default: {
      // Random: mix of chi, pong, kong
      for (let i = 0; i < 5; i++) {
        const r = Math.random();
        let m: Meld | null = null;
        if (r < 0.55) {
          for (let a = 0; a < MAX_ATTEMPTS && !m; a++) m = tryGenerateChi(tracker);
        } else if (r < 0.90) {
          for (let a = 0; a < MAX_ATTEMPTS && !m; a++) m = tryGeneratePong(tracker);
        } else {
          for (let a = 0; a < MAX_ATTEMPTS && !m; a++) m = tryGenerateKong(tracker);
        }
        // Fallback
        if (!m) for (let a = 0; a < MAX_ATTEMPTS && !m; a++) m = tryGenerateChi(tracker);
        if (!m) for (let a = 0; a < MAX_ATTEMPTS && !m; a++) m = tryGeneratePong(tracker);
        if (!m) return null;
        melds.push(m);
      }
      for (let a = 0; a < MAX_ATTEMPTS && !pair; a++) pair = tryGeneratePair(tracker);
      break;
    }
  }

  if (!pair || melds.length !== 5) return null;

  // Pick a winning tile from the hand
  const allTilesInHand = [...melds.flatMap((m) => m.tiles), ...pair];
  const winningTile = randChoice(allTilesInHand);

  // Determine single wait randomly (low probability)
  const isSingleWait = randBool(0.1);

  const hand = createHand(melds, pair as [PlayTile, PlayTile], winningTile, isSingleWait);

  // Generate random context
  const ctx = generateRandomContext(hand);

  return { hand, ctx };
}

function generateRandomContext(hand: Hand): Partial<GameContext> {
  const seatWind = randChoice(WINDS);
  const roundWind = randChoice(WINDS);
  const isDealer = randBool(0.25);
  const dealerStreak = isDealer && randBool(0.3) ? randInt(1, 4) : 0;
  const isSelfDraw = randBool(0.3);

  // Flowers: 0-4 random flowers
  const numFlowers = randBool(0.3) ? 0 : randInt(1, Math.min(4, 8));
  const flowers: FlowerTile[] = shuffle(ALL_FLOWERS)
    .slice(0, numFlowers)
    .map((f) => flowerTile(f));

  // Special conditions (rare)
  const isLastTileSelfDraw = isSelfDraw && randBool(0.05);
  const isLastDiscard = !isSelfDraw && randBool(0.05);
  const isAfterKong = isSelfDraw && randBool(0.08);
  const isRobbingKong = !isSelfDraw && randBool(0.05);
  const isKongOnKong = isAfterKong && randBool(0.1);
  const isReady = randBool(0.08);
  const isDoublePongWait = !hand.isSingleWait && randBool(0.1);
  const isHeavenlyHand = isDealer && isSelfDraw && hand.isConcealed && randBool(0.02);
  const isEarthlyHand = !isDealer && !isSelfDraw && randBool(0.02);
  const isHumanHand = !isDealer && !isSelfDraw && !isEarthlyHand && randBool(0.03);

  return {
    seatWind,
    roundWind,
    isDealer,
    dealerStreak,
    isSelfDraw,
    isLastTileSelfDraw,
    isLastDiscard,
    isAfterKong,
    isRobbingKong,
    isKongOnKong,
    isReady,
    isDoublePongWait,
    isHeavenlyHand,
    isEarthlyHand,
    isHumanHand,
    flowers,
  };
}

// ─── Public API ───

export interface GeneratedQuiz {
  hand: Hand;
  context: Partial<GameContext>;
  breakdown: ScoreBreakdown;
  difficulty: 'easy' | 'medium' | 'hard';
}

function classifyDifficulty(breakdown: ScoreBreakdown): 'easy' | 'medium' | 'hard' {
  const numRules = breakdown.results.length;
  const totalTai = breakdown.totalTai;

  if (numRules <= 3 && totalTai <= 8) return 'easy';
  if (numRules <= 5 && totalTai <= 30) return 'medium';
  return 'hard';
}

/**
 * Generate a single random quiz hand.
 * Returns null if generation fails (retry externally).
 */
export function generateOneQuiz(): GeneratedQuiz | null {
  const template = randChoice(ALL_TEMPLATES);
  const result = generateHandFromTemplate(template);
  if (!result) return null;

  const breakdown = calculateScore(result.hand, result.ctx);
  if (breakdown.totalTai < 1) return null;

  return {
    hand: result.hand,
    context: result.ctx,
    breakdown,
    difficulty: classifyDifficulty(breakdown),
  };
}

/**
 * Generate a batch of quiz hands with guaranteed variety.
 * Retries internally until `count` valid hands are produced.
 */
export function generateQuizBatch(count: number): GeneratedQuiz[] {
  const results: GeneratedQuiz[] = [];
  let attempts = 0;
  const maxAttempts = count * 10;

  while (results.length < count && attempts < maxAttempts) {
    attempts++;
    const quiz = generateOneQuiz();
    if (quiz && quiz.breakdown.totalTai >= 1) {
      results.push(quiz);
    }
  }

  return shuffle(results);
}

/**
 * Generate a batch with balanced difficulty distribution.
 * Target: ~40% easy, ~35% medium, ~25% hard.
 */
export function generateBalancedBatch(totalCount: number): GeneratedQuiz[] {
  const easyTarget = Math.floor(totalCount * 0.4);
  const medTarget = Math.floor(totalCount * 0.35);
  const hardTarget = totalCount - easyTarget - medTarget;

  const all = generateQuizBatch(totalCount * 3); // generate extra to filter

  const easy = all.filter((q) => q.difficulty === 'easy').slice(0, easyTarget);
  const medium = all.filter((q) => q.difficulty === 'medium').slice(0, medTarget);
  const hard = all.filter((q) => q.difficulty === 'hard').slice(0, hardTarget);

  // Fill remaining slots
  const remaining = all.filter(
    (q) => !easy.includes(q) && !medium.includes(q) && !hard.includes(q),
  );

  const combined = [...easy, ...medium, ...hard];
  while (combined.length < totalCount && remaining.length > 0) {
    combined.push(remaining.pop()!);
  }

  return shuffle(combined);
}
