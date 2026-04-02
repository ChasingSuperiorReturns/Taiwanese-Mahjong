// ─── Scoring Engine Unit Tests ───
// Tests individual tai rule functions against the twmahjong.com rule set.

import {
  W, T, S, EAST, SOUTH, WEST, NORTH, RED, GREEN, WHITE,
  Wind, MeldType, FlowerType, flowerTile,
} from '../../../src/engine/tiles';
import {
  Hand, createHand, chi, pong, kong,
} from '../../../src/engine/hand';
import { defaultContext } from '../../../src/engine/scoring/context';
import { TaiRuleId } from '../../../src/data/tai-catalog';
import {
  checkDealer, checkDealerStreak, checkConcealed, checkSelfDraw,
  checkConcealedSelfDraw, checkSingleWait,
  checkMatchingWindTriplet, checkWindTriplet,
  checkSmallThreeWinds, checkBigThreeWinds,
  checkSmallFourWinds, checkBigFourWinds,
  checkDragonTriplets, checkSmallThreeDragons, checkBigThreeDragons,
  checkMatchingFlowers, checkNonMatchingFlowers, checkNoFlowers,
  checkOneFlowerGroup, checkTwoFlowerGroups,
  checkAllTriplets, checkAllSequences,
  checkHalfFlush, checkFullFlush,
  checkFullyOpen, checkHalfOpen,
  checkNoHonors, checkNoHonorsNoFlowers,
  checkAllMiddle,
  checkOldAndYoung,
  checkOpenPureStraight, checkConcealedPureStraight,
  checkOpenMixedStraight, checkConcealedMixedStraight,
  checkSameSequencePair,
  checkTwoBrothers,
  checkAllConcealedTripletsSD,
  checkFourKongs,
} from '../../../src/engine/scoring/tai-rules';
import { resolveConflicts } from '../../../src/engine/scoring/conflicts';
import { calculateScore } from '../../../src/engine/scoring/index';

// ─── Helpers ───
function simpleHand(melds: any[], pair: [any, any], winTile: any, singleWait = false): Hand {
  return createHand(melds, pair, winTile, singleWait);
}

// ─── Basic Rules ───

describe('Basic tai rules', () => {
  const baseHand = simpleHand(
    [chi([W(1), W(2), W(3)]), chi([T(4), T(5), T(6)]), chi([S(7), S(8), S(9)]), pong(W(5)), pong(T(9))],
    [S(1), S(1)], S(1),
  );

  test('Dealer = 1 tai', () => {
    expect(checkDealer(baseHand, defaultContext({ isDealer: true, dealerStreak: 0 })))
      .toMatchObject([{ ruleId: TaiRuleId.Dealer, tai: 1 }]);
  });

  test('Dealer — not dealer → null', () => {
    expect(checkDealer(baseHand, defaultContext({ isDealer: false }))).toBeNull();
  });

  test('DealerStreak — streak 2 = 5 tai (2*2+1)', () => {
    const res = checkDealerStreak(baseHand, defaultContext({ isDealer: true, dealerStreak: 2 }));
    expect(res).toHaveLength(1);
    expect(res![0].tai).toBe(5);
  });

  test('Concealed = 3 tai (discard win only)', () => {
    const ctx = defaultContext({ isSelfDraw: false });
    expect(checkConcealed(baseHand, ctx)).toMatchObject([{ ruleId: TaiRuleId.Concealed, tai: 3 }]);
  });

  test('Concealed — self-draw → null', () => {
    expect(checkConcealed(baseHand, defaultContext({ isSelfDraw: true }))).toBeNull();
  });

  test('SelfDraw = 1 tai', () => {
    expect(checkSelfDraw(baseHand, defaultContext({ isSelfDraw: true })))
      .toMatchObject([{ ruleId: TaiRuleId.SelfDraw, tai: 1 }]);
  });

  test('ConcealedSelfDraw = 5 tai', () => {
    expect(checkConcealedSelfDraw(baseHand, defaultContext({ isSelfDraw: true })))
      .toMatchObject([{ ruleId: TaiRuleId.ConcealedSelfDraw, tai: 5 }]);
  });

  test('SingleWait = 2 tai', () => {
    const hand = simpleHand(
      [chi([W(1), W(2), W(3)]), chi([T(4), T(5), T(6)]), chi([S(7), S(8), S(9)]), pong(W(5)), pong(T(9))],
      [S(1), S(1)], S(1), true,
    );
    expect(checkSingleWait(hand, defaultContext())).toMatchObject([{ ruleId: TaiRuleId.SingleWait, tai: 2 }]);
  });

  test('NoHonors = 1 tai (no honor tiles)', () => {
    const noHonorHand = simpleHand(
      [chi([W(1), W(2), W(3)]), chi([T(4), T(5), T(6)]), chi([S(2), S(3), S(4)]), pong(W(5)), pong(T(9))],
      [S(1), S(1)], S(1),
    );
    expect(checkNoHonors(noHonorHand, defaultContext())).toMatchObject([{ ruleId: TaiRuleId.NoHonors, tai: 1 }]);
  });

  test('NoHonors — hand with honors → null', () => {
    const honorHand = simpleHand(
      [chi([W(1), W(2), W(3)]), chi([T(4), T(5), T(6)]), chi([S(7), S(8), S(9)]), pong(EAST), pong(T(9))],
      [S(1), S(1)], S(1),
    );
    expect(checkNoHonors(honorHand, defaultContext())).toBeNull();
  });
});

// ─── Wind Rules ───

describe('Wind tai rules', () => {
  test('Matching Wind Triplet = 2 tai (seat wind pong)', () => {
    const hand = simpleHand(
      [chi([W(1), W(2), W(3)]), chi([T(4), T(5), T(6)]), pong(SOUTH), pong(W(5)), pong(T(9))],
      [S(1), S(1)], S(1),
    );
    expect(checkMatchingWindTriplet(hand, defaultContext({ seatWind: Wind.South })))
      .toMatchObject([{ ruleId: TaiRuleId.MatchingWindTriplet, tai: 2 }]);
  });

  test('Wind Triplet = 1 tai (non-seat wind pong)', () => {
    const hand = simpleHand(
      [chi([W(1), W(2), W(3)]), chi([T(4), T(5), T(6)]), pong(EAST), pong(W(5)), pong(T(9))],
      [S(1), S(1)], S(1),
    );
    const res = checkWindTriplet(hand, defaultContext({ seatWind: Wind.South }));
    expect(res).toHaveLength(1);
    expect(res![0]).toMatchObject({ ruleId: TaiRuleId.WindTriplet, tai: 1 });
  });

  test('SmallFourWinds = 60 tai (3 wind pongs + wind pair)', () => {
    const hand = simpleHand(
      [pong(EAST), pong(SOUTH), pong(WEST), pong(W(5)), chi([T(1), T(2), T(3)])],
      [NORTH, NORTH], W(5),
    );
    expect(checkSmallFourWinds(hand, defaultContext()))
      .toMatchObject([{ ruleId: TaiRuleId.SmallFourWinds, tai: 60 }]);
  });

  test('BigFourWinds = 80 tai (4 wind pongs)', () => {
    const hand = simpleHand(
      [pong(EAST), pong(SOUTH), pong(WEST), pong(NORTH), pong(W(5))],
      [T(1), T(1)], W(5),
    );
    expect(checkBigFourWinds(hand, defaultContext()))
      .toMatchObject([{ ruleId: TaiRuleId.BigFourWinds, tai: 80 }]);
  });
});

// ─── Dragon Rules ───

describe('Dragon tai rules', () => {
  test('Dragon Triplet = 2 tai each', () => {
    const hand = simpleHand(
      [chi([W(1), W(2), W(3)]), pong(RED), pong(T(9)), pong(W(5)), chi([S(7), S(8), S(9)])],
      [S(1), S(1)], S(1),
    );
    const res = checkDragonTriplets(hand, defaultContext());
    expect(res).toHaveLength(1);
    expect(res![0]).toMatchObject({ ruleId: TaiRuleId.DragonTriplet, tai: 2 });
  });

  test('SmallThreeDragons = 20 tai', () => {
    const hand = simpleHand(
      [pong(RED), pong(GREEN), chi([W(1), W(2), W(3)]), chi([T(4), T(5), T(6)]), pong(W(5))],
      [WHITE, WHITE], W(5),
    );
    expect(checkSmallThreeDragons(hand, defaultContext()))
      .toMatchObject([{ ruleId: TaiRuleId.SmallThreeDragons, tai: 20 }]);
  });

  test('BigThreeDragons = 40 tai', () => {
    const hand = simpleHand(
      [pong(RED), pong(GREEN), pong(WHITE), chi([W(1), W(2), W(3)]), chi([T(4), T(5), T(6)])],
      [S(1), S(1)], S(1),
    );
    expect(checkBigThreeDragons(hand, defaultContext()))
      .toMatchObject([{ ruleId: TaiRuleId.BigThreeDragons, tai: 40 }]);
  });
});

// ─── Flower Rules ───

describe('Flower tai rules', () => {
  const baseHand = simpleHand(
    [chi([W(1), W(2), W(3)]), chi([T(4), T(5), T(6)]), chi([S(7), S(8), S(9)]), pong(W(5)), pong(T(9))],
    [S(1), S(1)], S(1),
  );

  test('Matching Flower = 2 tai', () => {
    const ctx = defaultContext({ seatWind: Wind.East, flowers: [flowerTile(FlowerType.Spring)] });
    const res = checkMatchingFlowers(baseHand, ctx);
    expect(res).toHaveLength(1);
    expect(res![0]).toMatchObject({ ruleId: TaiRuleId.MatchingFlower, tai: 2 });
  });

  test('Non-Matching Flower = 1 tai', () => {
    const ctx = defaultContext({ seatWind: Wind.East, flowers: [flowerTile(FlowerType.Summer)] });
    const res = checkNonMatchingFlowers(baseHand, ctx);
    expect(res).toHaveLength(1);
    expect(res![0]).toMatchObject({ ruleId: TaiRuleId.NonMatchingFlower, tai: 1 });
  });

  test('NoFlowers = 1 tai', () => {
    expect(checkNoFlowers(baseHand, defaultContext({ flowers: [] })))
      .toMatchObject([{ ruleId: TaiRuleId.NoFlowers, tai: 1 }]);
  });

  test('One Flower Group = 10 tai (4 seasons)', () => {
    const ctx = defaultContext({
      flowers: [
        flowerTile(FlowerType.Spring), flowerTile(FlowerType.Summer),
        flowerTile(FlowerType.Autumn), flowerTile(FlowerType.Winter),
      ],
    });
    const res = checkOneFlowerGroup(baseHand, ctx);
    expect(res).toHaveLength(1);
    expect(res![0]).toMatchObject({ ruleId: TaiRuleId.OneFlowerGroup, tai: 10 });
  });

  test('Two Flower Groups = 30 tai (all 8 flowers)', () => {
    const ctx = defaultContext({
      flowers: [
        flowerTile(FlowerType.Spring), flowerTile(FlowerType.Summer),
        flowerTile(FlowerType.Autumn), flowerTile(FlowerType.Winter),
        flowerTile(FlowerType.Plum), flowerTile(FlowerType.Orchid),
        flowerTile(FlowerType.Chrysanthemum), flowerTile(FlowerType.Bamboo),
      ],
    });
    expect(checkTwoFlowerGroups(baseHand, ctx))
      .toMatchObject([{ ruleId: TaiRuleId.TwoFlowerGroups, tai: 30 }]);
  });
});

// ─── Pattern Rules ───

describe('Pattern tai rules', () => {
  test('AllTriplets = 30 tai', () => {
    const hand = simpleHand(
      [pong(W(1)), pong(T(3)), pong(S(5)), pong(EAST), pong(W(9))],
      [T(6), T(6)], T(6),
    );
    expect(checkAllTriplets(hand, defaultContext()))
      .toMatchObject([{ ruleId: TaiRuleId.AllTriplets, tai: 30 }]);
  });

  test('AllSequences = 3 tai', () => {
    const hand = simpleHand(
      [chi([W(1), W(2), W(3)]), chi([T(4), T(5), T(6)]), chi([S(7), S(8), S(9)]), chi([W(4), W(5), W(6)]), chi([T(1), T(2), T(3)])],
      [S(1), S(1)], S(1),
    );
    expect(checkAllSequences(hand, defaultContext()))
      .toMatchObject([{ ruleId: TaiRuleId.AllSequences, tai: 3 }]);
  });

  test('HalfFlush = 30 tai (one suit + honors)', () => {
    const hand = simpleHand(
      [chi([W(1), W(2), W(3)]), chi([W(4), W(5), W(6)]), pong(EAST), pong(RED), chi([W(7), W(8), W(9)])],
      [W(5), W(5)], W(5),
    );
    expect(checkHalfFlush(hand, defaultContext()))
      .toMatchObject([{ ruleId: TaiRuleId.HalfFlush, tai: 30 }]);
  });

  test('FullFlush = 80 tai (one suit only)', () => {
    const hand = simpleHand(
      [chi([W(1), W(2), W(3)]), chi([W(4), W(5), W(6)]), chi([W(7), W(8), W(9)]), pong(W(5)), pong(W(9))],
      [W(1), W(1)], W(1),
    );
    expect(checkFullFlush(hand, defaultContext()))
      .toMatchObject([{ ruleId: TaiRuleId.FullFlush, tai: 80 }]);
  });

  test('FullyOpen = 15 tai (all open, discard win)', () => {
    const hand = simpleHand(
      [chi([W(1), W(2), W(3)], false), chi([T(4), T(5), T(6)], false), chi([S(7), S(8), S(9)], false), pong(W(5), false), pong(T(9), false)],
      [S(1), S(1)], S(1),
    );
    expect(checkFullyOpen(hand, defaultContext({ isSelfDraw: false })))
      .toMatchObject([{ ruleId: TaiRuleId.FullyOpen, tai: 15 }]);
  });

  test('HalfOpen = 8 tai (all open, self-draw)', () => {
    const hand = simpleHand(
      [chi([W(1), W(2), W(3)], false), chi([T(4), T(5), T(6)], false), chi([S(7), S(8), S(9)], false), pong(W(5), false), pong(T(9), false)],
      [S(1), S(1)], S(1),
    );
    expect(checkHalfOpen(hand, defaultContext({ isSelfDraw: true })))
      .toMatchObject([{ ruleId: TaiRuleId.HalfOpen, tai: 8 }]);
  });

  test('OpenPureStraight = 10 tai (123+456+789 same suit, open)', () => {
    const hand = simpleHand(
      [chi([W(1), W(2), W(3)]), chi([W(4), W(5), W(6)], false), chi([W(7), W(8), W(9)], false), pong(EAST, false), chi([T(3), T(4), T(5)], false)],
      [S(6), S(6)], S(6),
    );
    expect(checkOpenPureStraight(hand, defaultContext()))
      .toMatchObject([{ ruleId: TaiRuleId.OpenPureStraight, tai: 10 }]);
  });

  test('OldAndYoung = 2 tai (123+789 same suit)', () => {
    const hand = simpleHand(
      [chi([W(1), W(2), W(3)]), chi([W(7), W(8), W(9)], false), chi([T(5), T(6), T(7)], false), pong(EAST, false), chi([S(3), S(4), S(5)], false)],
      [T(9), T(9)], T(9),
    );
    const res = checkOldAndYoung(hand, defaultContext());
    expect(res).toHaveLength(1);
    expect(res![0]).toMatchObject({ ruleId: TaiRuleId.OldAndYoung, tai: 2 });
  });

  test('SameSequencePair = 3 tai (two identical chis)', () => {
    const hand = simpleHand(
      [chi([W(2), W(3), W(4)]), chi([W(2), W(3), W(4)], false), chi([T(5), T(6), T(7)], false), pong(EAST, false), chi([S(3), S(4), S(5)], false)],
      [T(9), T(9)], T(9),
    );
    expect(checkSameSequencePair(hand, defaultContext()))
      .toMatchObject([{ ruleId: TaiRuleId.SameSequencePair, tai: 3 }]);
  });

  test('TwoBrothers = 3 tai (same number diff suit triplets)', () => {
    const hand = simpleHand(
      [pong(W(5)), pong(T(5)), chi([S(1), S(2), S(3)], false), pong(EAST, false), chi([W(7), W(8), W(9)], false)],
      [T(9), T(9)], T(9),
    );
    expect(checkTwoBrothers(hand, defaultContext()))
      .toMatchObject([{ ruleId: TaiRuleId.TwoBrothers, tai: 3 }]);
  });

  test('AllMiddle = 5 tai (no terminals, no honors)', () => {
    const hand = simpleHand(
      [chi([W(2), W(3), W(4)]), chi([T(3), T(4), T(5)], false), chi([S(4), S(5), S(6)], false), pong(W(5), false), chi([T(6), T(7), T(8)], false)],
      [S(3), S(3)], S(3),
    );
    expect(checkAllMiddle(hand, defaultContext()))
      .toMatchObject([{ ruleId: TaiRuleId.AllMiddle, tai: 5 }]);
  });

  test('FourKongs = 8 tai', () => {
    const hand = simpleHand(
      [kong(W(1)), kong(T(3), MeldType.ConcealedKong), kong(S(5)), kong(EAST), pong(W(9))],
      [T(6), T(6)], T(6),
    );
    expect(checkFourKongs(hand, defaultContext()))
      .toMatchObject([{ ruleId: TaiRuleId.FourKongs, tai: 8 }]);
  });

  test('AllConcealedTripletsSD = 100 tai', () => {
    const hand = simpleHand(
      [pong(W(1)), pong(T(3)), pong(S(5)), pong(EAST), pong(W(9))],
      [T(6), T(6)], T(6),
    );
    expect(checkAllConcealedTripletsSD(hand, defaultContext({ isSelfDraw: true })))
      .toMatchObject([{ ruleId: TaiRuleId.AllConcealedTripletsSD, tai: 100 }]);
  });
});

// ─── Conflict Resolution ───

describe('Conflict resolution', () => {
  test('ConcealedSelfDraw excludes Concealed + SelfDraw', () => {
    const results = [
      { ruleId: TaiRuleId.ConcealedSelfDraw, tai: 5 },
      { ruleId: TaiRuleId.Concealed, tai: 3 },
      { ruleId: TaiRuleId.SelfDraw, tai: 1 },
    ];
    const resolved = resolveConflicts(results);
    expect(resolved).toMatchObject([{ ruleId: TaiRuleId.ConcealedSelfDraw, tai: 5 }]);
  });

  test('BigFourWinds excludes all wind sub-rules', () => {
    const results = [
      { ruleId: TaiRuleId.BigFourWinds, tai: 80 },
      { ruleId: TaiRuleId.MatchingWindTriplet, tai: 2 },
      { ruleId: TaiRuleId.WindTriplet, tai: 1 },
      { ruleId: TaiRuleId.SmallFourWinds, tai: 60 },
      { ruleId: TaiRuleId.BigThreeWinds, tai: 30 },
    ];
    const resolved = resolveConflicts(results);
    expect(resolved).toMatchObject([{ ruleId: TaiRuleId.BigFourWinds, tai: 80 }]);
  });

  test('FullFlush excludes HalfFlush + MissingOneSuit + NoHonors', () => {
    const results = [
      { ruleId: TaiRuleId.FullFlush, tai: 80 },
      { ruleId: TaiRuleId.HalfFlush, tai: 30 },
      { ruleId: TaiRuleId.MissingOneSuit, tai: 5 },
      { ruleId: TaiRuleId.NoHonors, tai: 1 },
    ];
    const resolved = resolveConflicts(results);
    expect(resolved).toMatchObject([{ ruleId: TaiRuleId.FullFlush, tai: 80 }]);
  });

  test('AllConcealedTripletsSD excludes AllTriplets + FiveConcealedTriplets + ConcealedSelfDraw + Concealed + SelfDraw', () => {
    const results = [
      { ruleId: TaiRuleId.AllConcealedTripletsSD, tai: 100 },
      { ruleId: TaiRuleId.AllTriplets, tai: 30 },
      { ruleId: TaiRuleId.FiveConcealedTriplets, tai: 80 },
      { ruleId: TaiRuleId.ConcealedSelfDraw, tai: 5 },
      { ruleId: TaiRuleId.SelfDraw, tai: 1 },
      { ruleId: TaiRuleId.Concealed, tai: 3 },
    ];
    const resolved = resolveConflicts(results);
    expect(resolved).toMatchObject([{ ruleId: TaiRuleId.AllConcealedTripletsSD, tai: 100 }]);
  });
});

// ─── Integration: calculateScore ───

describe('calculateScore integration', () => {
  test('Simple concealed self-draw hand', () => {
    const hand = simpleHand(
      [chi([W(2), W(3), W(4)]), chi([T(4), T(5), T(6)]), chi([S(6), S(7), S(8)]), pong(EAST), chi([T(1), T(2), T(3)])],
      [W(6), W(6)], W(6),
    );
    const score = calculateScore(hand, {
      seatWind: Wind.West,
      roundWind: Wind.South,
      flowers: [],
      isSelfDraw: true,
    });
    // ConcealedSelfDraw(5) + WindTriplet(1) + NoFlowers(1) = 7
    expect(score.totalTai).toBe(7);
    expect(score.results.some(r => r.ruleId === TaiRuleId.ConcealedSelfDraw)).toBe(true);
  });

  test('Full flush hand', () => {
    const hand = simpleHand(
      [chi([T(2), T(3), T(4)]), chi([T(5), T(6), T(7)], false), pong(T(9), false), chi([T(3), T(4), T(5)], false), chi([T(6), T(7), T(8)], false)],
      [T(1), T(1)], T(1),
    );
    const score = calculateScore(hand, {
      seatWind: Wind.West,
      roundWind: Wind.South,
      flowers: [flowerTile(FlowerType.Spring)],
    });
    // FullFlush(80) + NonMatchingFlower(1) = 81
    expect(score.totalTai).toBe(81);
    expect(score.results.some(r => r.ruleId === TaiRuleId.FullFlush)).toBe(true);
  });
});
