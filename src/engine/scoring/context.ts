// ─── Game Context ───
// All situational information needed to evaluate context-dependent tai rules.
// This is separate from the hand tiles — it represents the game state at win time.

import { Wind, FlowerTile } from '../tiles';

export interface GameContext {
  /** Current round wind (圈風): East for round 1, South for round 2, etc. */
  roundWind: Wind;

  /** Player's seat wind (門風) */
  seatWind: Wind;

  /** Whether the winning player is the dealer (莊家) */
  isDealer: boolean;

  /** Dealer consecutive win streak count. 0 = first time dealer. 連N拉N = 2N+1 台 */
  dealerStreak: number;

  /** Whether the winning tile was self-drawn (自摸) vs from a discard */
  isSelfDraw: boolean;

  /** Whether the winning tile was the very last tile in the wall (海底撈月) */
  isLastTileSelfDraw: boolean;

  /** Whether the win was off the last player's last discard (河底撈魚) */
  isLastDiscard: boolean;

  /** Whether the win came from a supplement tile after kong/flower (槓上開花) */
  isAfterKong: boolean;

  /** Whether the win was by robbing an opponent's added kong (搶槓) */
  isRobbingKong: boolean;

  /** Whether the dealer won on the dealt hand before discarding (天胡) */
  isHeavenlyHand: boolean;

  /** Whether a non-dealer won off the dealer's very first discard (地胡) */
  isEarthlyHand: boolean;

  /** The player's flower tiles (collected beside the hand) */
  flowers: FlowerTile[];
}

/** Create a default GameContext (useful for testing) */
export function defaultContext(overrides?: Partial<GameContext>): GameContext {
  return {
    roundWind: Wind.East,
    seatWind: Wind.East,
    isDealer: false,
    dealerStreak: 0,
    isSelfDraw: false,
    isLastTileSelfDraw: false,
    isLastDiscard: false,
    isAfterKong: false,
    isRobbingKong: false,
    isHeavenlyHand: false,
    isEarthlyHand: false,
    flowers: [],
    ...overrides,
  };
}
