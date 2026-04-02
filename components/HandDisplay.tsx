import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Hand, } from '@/src/engine/hand';
import { FlowerTile, FlowerType, MeldType, tilesEqual } from '@/src/engine/tiles';
import TileDisplay from './TileDisplay';

interface HandDisplayProps {
  hand: Hand;
  flowers?: FlowerTile[];
  showWinning?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const FLOWER_LABELS: Record<FlowerType, string> = {
  [FlowerType.Spring]: '春',
  [FlowerType.Summer]: '夏',
  [FlowerType.Autumn]: '秋',
  [FlowerType.Winter]: '冬',
  [FlowerType.Plum]: '梅',
  [FlowerType.Orchid]: '蘭',
  [FlowerType.Chrysanthemum]: '菊',
  [FlowerType.Bamboo]: '竹',
};

const tileSizes = { sm: 28, md: 36, lg: 48 };

export default function HandDisplay({ hand, flowers, showWinning = true, size = 'md' }: HandDisplayProps) {
  return (
    <View style={styles.container}>
      <View style={styles.melds}>
        {hand.melds.map((meld, mi) => (
          <View key={mi} style={styles.meldGroup}>
            {meld.type === MeldType.ConcealedKong ? (
              <View style={styles.concealedKongBadge}>
                <Text style={styles.concealedKongText}>暗槓</Text>
              </View>
            ) : !meld.isConcealed ? (
              <View style={styles.openBadge}>
                <Text style={styles.openText}>明</Text>
              </View>
            ) : null}
            <View style={styles.meldTiles}>
              {meld.type === MeldType.ConcealedKong ? (
                <>
                  {/* Concealed kong: show first tile face-down, middle two face-up, last face-down */}
                  <View style={[styles.faceDownTile, { width: tileSizes[size], height: tileSizes[size] * 1.35 }]}>
                    <View style={styles.faceDownPattern}>
                      <View style={styles.faceDownDiamond} />
                    </View>
                  </View>
                  <TileDisplay
                    key={`${mi}-1`}
                    tile={meld.tiles[1]}
                    size={size}
                    highlighted={showWinning && tilesEqual(meld.tiles[1], hand.winningTile) && isLastMatch(meld.tiles, hand.winningTile, 1)}
                  />
                  <TileDisplay
                    key={`${mi}-2`}
                    tile={meld.tiles[2]}
                    size={size}
                    highlighted={showWinning && tilesEqual(meld.tiles[2], hand.winningTile) && isLastMatch(meld.tiles, hand.winningTile, 2)}
                  />
                  <View style={[styles.faceDownTile, { width: tileSizes[size], height: tileSizes[size] * 1.35 }]}>
                    <View style={styles.faceDownPattern}>
                      <View style={styles.faceDownDiamond} />
                    </View>
                  </View>
                </>
              ) : (
                meld.tiles.map((tile, ti) => (
                  <TileDisplay
                    key={`${mi}-${ti}`}
                    tile={tile}
                    size={size}
                    highlighted={showWinning && tilesEqual(tile, hand.winningTile) && isLastMatch(meld.tiles, hand.winningTile, ti)}
                  />
                ))
              )}
            </View>
            {(meld.type === MeldType.Kong || meld.type === MeldType.AddedKong) && (
              <Text style={styles.kongLabel}>槓</Text>
            )}
          </View>
        ))}
        <View style={[styles.meldGroup, styles.pairGroup]}>
          {hand.pair.map((tile, i) => (
            <TileDisplay
              key={`pair-${i}`}
              tile={tile}
              size={size}
              highlighted={showWinning && tilesEqual(tile, hand.winningTile) && i === 1}
            />
          ))}
        </View>
      </View>
      {flowers && flowers.length > 0 && (
        <View style={styles.flowers}>
          <Text style={styles.flowerTitle}>花</Text>
          {flowers.map((f, i) => (
            <View key={i} style={styles.flowerChip}>
              <Text style={styles.flowerText}>{FLOWER_LABELS[f.flower]}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/** Only highlight the last matching tile in a meld (the winning tile position) */
function isLastMatch(tiles: any[], winningTile: any, currentIndex: number): boolean {
  let lastIdx = -1;
  for (let i = 0; i < tiles.length; i++) {
    if (tilesEqual(tiles[i], winningTile)) lastIdx = i;
  }
  return currentIndex === lastIdx;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  melds: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  meldGroup: {
    alignItems: 'center',
    gap: 2,
  },
  meldTiles: {
    flexDirection: 'row',
  },
  pairGroup: {
    marginLeft: 8,
  },
  openBadge: {
    backgroundColor: '#e8d8a8',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  openText: {
    fontSize: 9,
    color: '#8a7a4a',
    fontWeight: '600',
  },
  concealedKongBadge: {
    backgroundColor: '#1a472a',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#c9a94e',
  },
  concealedKongText: {
    fontSize: 11,
    color: '#c9a94e',
    fontWeight: '700',
    letterSpacing: 2,
  },
  faceDownTile: {
    backgroundColor: '#1a472a',
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#2a6a4a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceDownPattern: {
    width: '60%',
    height: '60%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceDownDiamond: {
    width: 10,
    height: 10,
    backgroundColor: '#2a6a4a',
    borderWidth: 1,
    borderColor: '#3a8a5a',
    transform: [{ rotate: '45deg' }],
  },
  kongLabel: {
    fontSize: 9,
    color: '#c9a94e',
    fontWeight: '600',
  },
  flowers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  flowerTitle: {
    fontSize: 12,
    color: '#8a7a4a',
    fontWeight: '600',
    marginRight: 2,
  },
  flowerChip: {
    backgroundColor: '#f8e8c8',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#d4c4a4',
  },
  flowerText: {
    fontSize: 12,
    color: '#8a6a2a',
    fontWeight: '600',
  },
});
