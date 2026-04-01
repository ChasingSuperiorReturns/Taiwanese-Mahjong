// ─── Tile Data Model ───
// All 144 tiles for 16-tile Taiwanese Mahjong (台灣麻將)

/** Numbered suits (數牌) */
export enum Suit {
  /** 萬子 */
  Wan = 'wan',
  /** 筒子 (餅子) */
  Tong = 'tong',
  /** 條子 (索子) */
  Tiao = 'tiao',
}

/** Wind types (風牌) */
export enum Wind {
  /** 東 */
  East = 'east',
  /** 南 */
  South = 'south',
  /** 西 */
  West = 'west',
  /** 北 */
  North = 'north',
}

/** Dragon types (三元牌) */
export enum Dragon {
  /** 中 */
  Red = 'red',
  /** 發 */
  Green = 'green',
  /** 白 */
  White = 'white',
}

/** Flower types */
export enum FlowerType {
  /** 春 */ Spring = 'spring',
  /** 夏 */ Summer = 'summer',
  /** 秋 */ Autumn = 'autumn',
  /** 冬 */ Winter = 'winter',
  /** 梅 */ Plum = 'plum',
  /** 蘭 */ Orchid = 'orchid',
  /** 菊 */ Chrysanthemum = 'chrysanthemum',
  /** 竹 */ Bamboo = 'bamboo',
}

/** Tile number value (1-9 for suited tiles) */
export type SuitValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// ─── Tile Types ───

export interface SuitTile {
  kind: 'suit';
  suit: Suit;
  value: SuitValue;
}

export interface WindTile {
  kind: 'wind';
  wind: Wind;
}

export interface DragonTile {
  kind: 'dragon';
  dragon: Dragon;
}

export interface FlowerTile {
  kind: 'flower';
  flower: FlowerType;
}

/** A playable tile (non-flower) that can be part of melds */
export type PlayTile = SuitTile | WindTile | DragonTile;

/** Any tile including flowers */
export type Tile = PlayTile | FlowerTile;

// ─── Meld Types ───

export enum MeldType {
  /** 順子 — 3 sequential suited tiles */
  Chi = 'chi',
  /** 刻子 — 3 identical tiles */
  Pong = 'pong',
  /** 明槓 — 4 identical tiles (open) */
  Kong = 'kong',
  /** 暗槓 — 4 identical tiles (concealed) */
  ConcealedKong = 'concealed_kong',
  /** 加槓 — pong upgraded to kong */
  AddedKong = 'added_kong',
}

export interface Meld {
  type: MeldType;
  tiles: PlayTile[];
  /** Whether this meld was formed from the player's own draws (no chi/pong) */
  isConcealed: boolean;
}

// ─── Tile Construction Helpers ───

export function suitTile(suit: Suit, value: SuitValue): SuitTile {
  return { kind: 'suit', suit, value };
}

export function windTile(wind: Wind): WindTile {
  return { kind: 'wind', wind };
}

export function dragonTile(dragon: Dragon): DragonTile {
  return { kind: 'dragon', dragon };
}

export function flowerTile(flower: FlowerType): FlowerTile {
  return { kind: 'flower', flower };
}

// Short aliases for test readability
export const W = (v: SuitValue) => suitTile(Suit.Wan, v);
export const T = (v: SuitValue) => suitTile(Suit.Tong, v);
export const S = (v: SuitValue) => suitTile(Suit.Tiao, v);
export const EAST = windTile(Wind.East);
export const SOUTH = windTile(Wind.South);
export const WEST = windTile(Wind.West);
export const NORTH = windTile(Wind.North);
export const RED = dragonTile(Dragon.Red);
export const GREEN = dragonTile(Dragon.Green);
export const WHITE = dragonTile(Dragon.White);

// ─── Tile Comparison & Utilities ───

/** Canonical string key for a play tile (for dedup, counting, etc.) */
export function tileKey(tile: PlayTile): string {
  switch (tile.kind) {
    case 'suit':
      return `${tile.suit}_${tile.value}`;
    case 'wind':
      return `wind_${tile.wind}`;
    case 'dragon':
      return `dragon_${tile.dragon}`;
  }
}

/** Check if two play tiles are the same type */
export function tilesEqual(a: PlayTile, b: PlayTile): boolean {
  return tileKey(a) === tileKey(b);
}

export function isHonor(tile: PlayTile): boolean {
  return tile.kind === 'wind' || tile.kind === 'dragon';
}

export function isTerminal(tile: PlayTile): boolean {
  return tile.kind === 'suit' && (tile.value === 1 || tile.value === 9);
}

export function isSuit(tile: PlayTile): tile is SuitTile {
  return tile.kind === 'suit';
}

export function isWind(tile: PlayTile): tile is WindTile {
  return tile.kind === 'wind';
}

export function isDragon(tile: PlayTile): tile is DragonTile {
  return tile.kind === 'dragon';
}

/**
 * Flower-to-seat mapping:
 * East = 春/梅, South = 夏/蘭, West = 秋/菊, North = 冬/竹
 */
export function flowerMatchesWind(flower: FlowerType, wind: Wind): boolean {
  const map: Record<FlowerType, Wind> = {
    [FlowerType.Spring]: Wind.East,
    [FlowerType.Plum]: Wind.East,
    [FlowerType.Summer]: Wind.South,
    [FlowerType.Orchid]: Wind.South,
    [FlowerType.Autumn]: Wind.West,
    [FlowerType.Chrysanthemum]: Wind.West,
    [FlowerType.Winter]: Wind.North,
    [FlowerType.Bamboo]: Wind.North,
  };
  return map[flower] === wind;
}

/** Check if a flower belongs to the season group (春夏秋冬) */
export function isSeasonFlower(flower: FlowerType): boolean {
  return [FlowerType.Spring, FlowerType.Summer, FlowerType.Autumn, FlowerType.Winter].includes(flower);
}

/** Check if a flower belongs to the gentleman group (梅蘭菊竹) */
export function isGentlemanFlower(flower: FlowerType): boolean {
  return [FlowerType.Plum, FlowerType.Orchid, FlowerType.Chrysanthemum, FlowerType.Bamboo].includes(flower);
}

/** Get all suit values for a given suit from a set of tiles */
export function getSuitValues(tiles: PlayTile[], suit: Suit): SuitValue[] {
  return tiles
    .filter((t): t is SuitTile => t.kind === 'suit' && t.suit === suit)
    .map((t) => t.value);
}

/** Count occurrences of each tile in a list */
export function countTiles(tiles: PlayTile[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const tile of tiles) {
    const k = tileKey(tile);
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  return counts;
}
