// ─── Hand Model ───
// Represents a winning hand in 16-tile Taiwanese Mahjong.
// Includes hand decomposition logic to enumerate all valid meld splits.

import {
  PlayTile, Meld, MeldType, Suit, SuitValue,
  tileKey, tilesEqual, isSuit, isHonor,
  suitTile,
} from './tiles';

/**
 * A winning hand decomposed into melds + pair.
 * In Taiwanese 16-tile mahjong: 5 melds + 1 pair = 16 tiles
 * (or 4 melds + 1 pair + kong supplements)
 */
export interface Hand {
  /** The 5 sets (chi/pong/kong) */
  melds: Meld[];
  /** The pair (雀頭/眼) — exactly 2 identical tiles */
  pair: PlayTile[];
  /** Whether the entire hand is concealed (no open chi/pong/kong) */
  isConcealed: boolean;
  /** The winning tile */
  winningTile: PlayTile;
  /** Whether the winning tile completes a single-wait (獨聽: 邊張/中洞/單吊) */
  isSingleWait: boolean;
}

/**
 * Create a Hand from explicit melds and pair.
 * Convenience for building test hands.
 */
export function createHand(
  melds: Meld[],
  pair: [PlayTile, PlayTile],
  winningTile: PlayTile,
  isSingleWait: boolean = false,
): Hand {
  const isConcealed = melds.every((m) => m.isConcealed);
  return { melds, pair, isConcealed, winningTile, isSingleWait };
}

/** Create a chi (sequence) meld */
export function chi(tiles: [PlayTile, PlayTile, PlayTile], isConcealed: boolean = true): Meld {
  return { type: MeldType.Chi, tiles, isConcealed };
}

/** Create a pong (triplet) meld */
export function pong(tile: PlayTile, isConcealed: boolean = true): Meld {
  return { type: MeldType.Pong, tiles: [tile, tile, tile], isConcealed };
}

/** Create a kong (quad) meld */
export function kong(tile: PlayTile, type: MeldType.Kong | MeldType.ConcealedKong | MeldType.AddedKong = MeldType.Kong): Meld {
  const isConcealed = type === MeldType.ConcealedKong;
  return { type, tiles: [tile, tile, tile, tile], isConcealed };
}

// ─── Hand Decomposition ───

/**
 * Given a list of concealed tiles (not in open melds), enumerate all valid
 * decompositions into sets (chi/pong) + pair. Returns all valid decompositions
 * so the scorer can pick the highest-tai one.
 *
 * This handles the standard winning pattern: 5 sets + 1 pair for 16-tile hands.
 * Open melds are already fixed — only concealed tiles need decomposing.
 */
export function decomposeHand(
  concealedTiles: PlayTile[],
  openMelds: Meld[],
  winningTile: PlayTile,
): Hand[] {
  const setsNeeded = 5 - openMelds.length;
  // We need: setsNeeded sets + 1 pair from concealedTiles
  // concealedTiles should have setsNeeded * 3 + 2 tiles

  const results: Hand[] = [];
  const sorted = sortTiles(concealedTiles);

  findDecompositions(
    sorted,
    setsNeeded,
    true, // needPair
    [],
    null,
    (melds, pair) => {
      const allMelds = [
        ...openMelds,
        ...melds.map((m) => ({ ...m, isConcealed: true })),
      ];
      const isConcealed = openMelds.every((m) => m.isConcealed);
      // Determine if this is a single wait
      const isSingleWait = checkSingleWait(sorted, openMelds, winningTile);
      results.push({
        melds: allMelds,
        pair: pair!,
        isConcealed,
        winningTile,
        isSingleWait,
      });
    },
  );

  return results;
}

/**
 * Recursive backtracking to find all valid tile decompositions.
 */
function findDecompositions(
  tiles: PlayTile[],
  setsNeeded: number,
  needPair: boolean,
  currentMelds: Meld[],
  currentPair: PlayTile[] | null,
  onFound: (melds: Meld[], pair: PlayTile[]) => void,
): void {
  // Base case: no more sets needed and pair found
  if (setsNeeded === 0 && !needPair) {
    if (tiles.length === 0) {
      onFound(currentMelds, currentPair!);
    }
    return;
  }

  if (tiles.length === 0) return;

  const first = tiles[0];

  // Try extracting a pair (if still needed)
  if (needPair) {
    const pairIdx = tiles.findIndex((t, i) => i > 0 && tilesEqual(t, first));
    if (pairIdx !== -1) {
      const remaining = [...tiles];
      remaining.splice(pairIdx, 1);
      remaining.splice(0, 1);
      findDecompositions(
        remaining,
        setsNeeded,
        false,
        currentMelds,
        [first, tiles[pairIdx]],
        onFound,
      );
    }
  }

  if (setsNeeded === 0) return;

  // Try extracting a pong (triplet)
  const sameCount = tiles.filter((t) => tilesEqual(t, first)).length;
  if (sameCount >= 3) {
    const remaining = [...tiles];
    // Remove 3 copies of first
    let removed = 0;
    const filtered = remaining.filter((t) => {
      if (removed < 3 && tilesEqual(t, first)) {
        removed++;
        return false;
      }
      return true;
    });
    findDecompositions(
      filtered,
      setsNeeded - 1,
      needPair,
      [...currentMelds, { type: MeldType.Pong, tiles: [first, first, first], isConcealed: true }],
      currentPair,
      onFound,
    );
  }

  // Try extracting a chi (sequence) — only for suit tiles
  if (isSuit(first)) {
    const v = first.value;
    if (v <= 7) {
      const next1 = tiles.find((t) => isSuit(t) && t.suit === first.suit && t.value === (v + 1) as SuitValue);
      const next2 = tiles.find((t) => isSuit(t) && t.suit === first.suit && t.value === (v + 2) as SuitValue);
      if (next1 && next2) {
        const remaining = [...tiles];
        // Remove one copy of each of the 3 sequential tiles
        removeFirst(remaining, first);
        removeFirst(remaining, next1);
        removeFirst(remaining, next2);
        const chiTiles: [PlayTile, PlayTile, PlayTile] = [
          suitTile(first.suit, v),
          suitTile(first.suit, (v + 1) as SuitValue),
          suitTile(first.suit, (v + 2) as SuitValue),
        ];
        findDecompositions(
          remaining,
          setsNeeded - 1,
          needPair,
          [...currentMelds, { type: MeldType.Chi, tiles: chiTiles, isConcealed: true }],
          currentPair,
          onFound,
        );
      }
    }
  }
}

/** Remove the first occurrence of a tile from an array (mutates) */
function removeFirst(arr: PlayTile[], target: PlayTile): void {
  const idx = arr.findIndex((t) => tilesEqual(t, target));
  if (idx !== -1) arr.splice(idx, 1);
}

/** Sort tiles for consistent decomposition: by suit, then value, then honor type */
function sortTiles(tiles: PlayTile[]): PlayTile[] {
  return [...tiles].sort((a, b) => {
    const order = tileOrder(a) - tileOrder(b);
    return order;
  });
}

function tileOrder(tile: PlayTile): number {
  if (tile.kind === 'suit') {
    const suitOrder = { wan: 0, tong: 1, tiao: 2 };
    return suitOrder[tile.suit] * 10 + tile.value;
  }
  if (tile.kind === 'wind') {
    const windOrder = { east: 30, south: 31, west: 32, north: 33 };
    return windOrder[tile.wind];
  }
  const dragonOrder = { red: 40, green: 41, white: 42 };
  return dragonOrder[tile.dragon];
}

/**
 * Check if the winning tile creates a single wait (獨聽).
 * Single wait = 邊張 (edge wait), 中洞 (middle wait), or 單吊 (single tile pair wait).
 */
function checkSingleWait(
  concealedTiles: PlayTile[],
  openMelds: Meld[],
  winningTile: PlayTile,
): boolean {
  // Remove the winning tile from concealed to get the "waiting" hand
  const waiting = [...concealedTiles];
  const idx = waiting.findIndex((t) => tilesEqual(t, winningTile));
  if (idx === -1) return false;
  waiting.splice(idx, 1);

  // Try to form valid hands with each possible tile as the winning tile
  // If only 1 unique tile could complete the hand, it's a single wait
  const possibleWinTiles = new Set<string>();

  // Check all possible tiles that could complete this waiting hand
  const allPossibleTiles = generateAllPlayTiles();
  for (const candidate of allPossibleTiles) {
    const testHand = [...waiting, candidate];
    const setsNeeded = 5 - openMelds.length;
    if (canDecompose(sortTiles(testHand), setsNeeded)) {
      possibleWinTiles.add(tileKey(candidate));
    }
  }

  return possibleWinTiles.size === 1;
}

/** Check if tiles can be decomposed into the required number of sets + 1 pair */
function canDecompose(tiles: PlayTile[], setsNeeded: number): boolean {
  let found = false;
  findDecompositions(tiles, setsNeeded, true, [], null, () => { found = true; });
  return found;
}

/** Generate one of each unique play tile (34 types) */
function generateAllPlayTiles(): PlayTile[] {
  const tiles: PlayTile[] = [];
  for (const suit of [Suit.Wan, Suit.Tong, Suit.Tiao]) {
    for (let v = 1; v <= 9; v++) {
      tiles.push(suitTile(suit, v as SuitValue));
    }
  }
  tiles.push({ kind: 'wind', wind: 'east' as any });
  tiles.push({ kind: 'wind', wind: 'south' as any });
  tiles.push({ kind: 'wind', wind: 'west' as any });
  tiles.push({ kind: 'wind', wind: 'north' as any });
  tiles.push({ kind: 'dragon', dragon: 'red' as any });
  tiles.push({ kind: 'dragon', dragon: 'green' as any });
  tiles.push({ kind: 'dragon', dragon: 'white' as any });
  return tiles;
}

// ─── Utility for Hand Analysis ───

/** Get all tiles in a hand (melds + pair) as a flat list */
export function getAllTiles(hand: Hand): PlayTile[] {
  const tiles: PlayTile[] = [];
  for (const meld of hand.melds) {
    tiles.push(...meld.tiles);
  }
  tiles.push(...hand.pair);
  return tiles;
}

/** Count concealed triplets (暗刻) in a hand */
export function countConcealedTriplets(hand: Hand): number {
  return hand.melds.filter(
    (m) =>
      m.isConcealed &&
      (m.type === MeldType.Pong || m.type === MeldType.ConcealedKong),
  ).length;
}

/** Check if hand has only triplets/kongs (no chi) — for 碰碰胡 */
export function isAllTriplets(hand: Hand): boolean {
  return hand.melds.every(
    (m) =>
      m.type === MeldType.Pong ||
      m.type === MeldType.Kong ||
      m.type === MeldType.ConcealedKong ||
      m.type === MeldType.AddedKong,
  );
}

/** Check if hand has only sequences (chi) — for 平胡 base check */
export function isAllSequences(hand: Hand): boolean {
  return hand.melds.every((m) => m.type === MeldType.Chi);
}

/** Get all unique suits present in a hand's tiles */
export function getSuitsInHand(hand: Hand): Set<Suit> {
  const suits = new Set<Suit>();
  for (const tile of getAllTiles(hand)) {
    if (isSuit(tile)) {
      suits.add(tile.suit);
    }
  }
  return suits;
}

/** Check if hand contains any honor tiles (winds or dragons) */
export function hasHonorTiles(hand: Hand): boolean {
  return getAllTiles(hand).some(isHonor);
}

/** Count kongs in hand */
export function countKongs(hand: Hand): number {
  return hand.melds.filter(
    (m) =>
      m.type === MeldType.Kong ||
      m.type === MeldType.ConcealedKong ||
      m.type === MeldType.AddedKong,
  ).length;
}
