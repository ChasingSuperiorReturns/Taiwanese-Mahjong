import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PlayTile, Suit, Dragon } from '@/src/engine/tiles';

interface TileDisplayProps {
  tile: PlayTile;
  size?: 'sm' | 'md' | 'lg';
  highlighted?: boolean;
}

const TILE_LABELS: Record<string, string> = {
  'wan_1': '一萬', 'wan_2': '二萬', 'wan_3': '三萬',
  'wan_4': '四萬', 'wan_5': '五萬', 'wan_6': '六萬',
  'wan_7': '七萬', 'wan_8': '八萬', 'wan_9': '九萬',
  'tong_1': '一筒', 'tong_2': '二筒', 'tong_3': '三筒',
  'tong_4': '四筒', 'tong_5': '五筒', 'tong_6': '六筒',
  'tong_7': '七筒', 'tong_8': '八筒', 'tong_9': '九筒',
  'tiao_1': '一條', 'tiao_2': '二條', 'tiao_3': '三條',
  'tiao_4': '四條', 'tiao_5': '五條', 'tiao_6': '六條',
  'tiao_7': '七條', 'tiao_8': '八條', 'tiao_9': '九條',
  'wind_east': '東', 'wind_south': '南',
  'wind_west': '西', 'wind_north': '北',
  'dragon_red': '中', 'dragon_green': '發', 'dragon_white': '白',
};

const WAN_LABELS: Record<number, string> = {
  1: '一', 2: '二', 3: '三', 4: '四', 5: '五',
  6: '六', 7: '七', 8: '八', 9: '九',
};

const HONOR_LABELS: Record<string, string> = {
  'wind_east': '東', 'wind_south': '南',
  'wind_west': '西', 'wind_north': '北',
  'dragon_red': '中', 'dragon_green': '發', 'dragon_white': '白',
};

// ─── Circle patterns for 筒 (Tong) ───
// Each entry is an array of rows; each row has N circles
const CIRCLE_ROWS: Record<number, number[]> = {
  1: [1],
  2: [1, 1],
  3: [1, 1, 1],
  4: [2, 2],
  5: [2, 1, 2],
  6: [2, 2, 2],
  7: [3, 1, 3],
  8: [3, 2, 3],
  9: [3, 3, 3],
};

// ─── Bamboo patterns for 條 (Tiao) ───
// Each entry is an array of rows; each row has N sticks
const BAMBOO_ROWS: Record<number, number[]> = {
  1: [1],
  2: [2],
  3: [3],
  4: [2, 2],
  5: [3, 2],
  6: [3, 3],
  7: [4, 3],
  8: [4, 4],
  9: [3, 3, 3],
};

function getTileKey(tile: PlayTile): string {
  switch (tile.kind) {
    case 'suit': return `${tile.suit}_${tile.value}`;
    case 'wind': return `wind_${tile.wind}`;
    case 'dragon': return `dragon_${tile.dragon}`;
  }
}

function getTileColor(tile: PlayTile): string {
  if (tile.kind === 'dragon') {
    if (tile.dragon === Dragon.Red) return '#cc2222';
    if (tile.dragon === Dragon.Green) return '#1a8a2a';
    return '#444';
  }
  if (tile.kind === 'suit') {
    if (tile.suit === Suit.Wan) return '#cc2222';
    if (tile.suit === Suit.Tong) return '#1a5ea6';
    return '#1a8a2a';
  }
  return '#333';
}

const SIZES = {
  sm: { w: 28, h: 36, main: 14, sub: 8, circle: 5, stick: { w: 3, h: 8 }, pad: 2 },
  md: { w: 36, h: 48, main: 18, sub: 10, circle: 6, stick: { w: 4, h: 10 }, pad: 3 },
  lg: { w: 48, h: 64, main: 24, sub: 12, circle: 8, stick: { w: 5, h: 14 }, pad: 4 },
};

// ─── Pattern sub-components ───

function CirclePattern({ value, size }: { value: number; size: 'sm' | 'md' | 'lg' }) {
  const s = SIZES[size];
  const rows = CIRCLE_ROWS[value];
  const r = s.circle;
  const gap = Math.max(1, s.pad - 1);
  return (
    <View style={patternStyles.patternContainer}>
      {rows.map((count, rowIdx) => (
        <View key={rowIdx} style={[patternStyles.patternRow, { gap }]}>
          {Array.from({ length: count }).map((_, i) => (
            <View
              key={i}
              style={{
                width: r,
                height: r,
                borderRadius: r / 2,
                backgroundColor: '#1a5ea6',
                borderWidth: 0.5,
                borderColor: '#0e3d6e',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function BambooPattern({ value, size }: { value: number; size: 'sm' | 'md' | 'lg' }) {
  const s = SIZES[size];
  const rows = BAMBOO_ROWS[value];
  const { w: sw, h: sh } = s.stick;
  const gap = Math.max(1, s.pad - 1);

  // Special: 1 bamboo is a bird-like icon (single decorated stick)
  if (value === 1) {
    return (
      <View style={patternStyles.patternContainer}>
        <View style={{
          width: sw + 4,
          height: sh + 6,
          borderRadius: (sw + 4) / 2,
          backgroundColor: '#1a8a2a',
          borderWidth: 0.5,
          borderColor: '#0f5a1a',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <View style={{
            width: sw,
            height: 1,
            backgroundColor: '#fff',
            position: 'absolute',
          }} />
        </View>
      </View>
    );
  }

  return (
    <View style={patternStyles.patternContainer}>
      {rows.map((count, rowIdx) => (
        <View key={rowIdx} style={[patternStyles.patternRow, { gap }]}>
          {Array.from({ length: count }).map((_, i) => (
            <View key={i} style={{ alignItems: 'center' }}>
              {/* Bamboo stick: green bar with a node line in the middle */}
              <View style={{
                width: sw,
                height: sh,
                borderRadius: sw / 3,
                backgroundColor: '#1a8a2a',
                borderWidth: 0.5,
                borderColor: '#0f5a1a',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <View style={{
                  width: sw + 1,
                  height: 1,
                  backgroundColor: '#4dc96f',
                  position: 'absolute',
                }} />
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

// ─── Main component ───

export default function TileDisplay({ tile, size = 'md', highlighted = false }: TileDisplayProps) {
  const key = getTileKey(tile);
  const color = getTileColor(tile);
  const s = SIZES[size];

  const isHonor = tile.kind === 'wind' || tile.kind === 'dragon';
  const isTong = tile.kind === 'suit' && tile.suit === Suit.Tong;
  const isTiao = tile.kind === 'suit' && tile.suit === Suit.Tiao;
  const isWan = tile.kind === 'suit' && tile.suit === Suit.Wan;

  return (
    <View style={[
      styles.tile,
      { width: s.w, height: s.h },
      highlighted && styles.highlighted,
    ]}>
      {isTong && tile.kind === 'suit' && (
        <CirclePattern value={tile.value} size={size} />
      )}
      {isTiao && tile.kind === 'suit' && (
        <BambooPattern value={tile.value} size={size} />
      )}
      {isWan && (
        <>
          <Text style={[styles.mainChar, { fontSize: s.main, color }]}>
            {WAN_LABELS[tile.kind === 'suit' ? tile.value : 0]}
          </Text>
          <Text style={[styles.suitLabel, { fontSize: s.sub, color }]}>
            萬
          </Text>
        </>
      )}
      {isHonor && (
        <Text style={[styles.mainChar, { fontSize: s.main + 2, color }]}>
          {HONOR_LABELS[key] ?? '?'}
        </Text>
      )}
    </View>
  );
}

export { TILE_LABELS, getTileKey };

const patternStyles = StyleSheet.create({
  patternContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  patternRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const styles = StyleSheet.create({
  tile: {
    backgroundColor: '#faf8f0',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#c8c0a8',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 2,
  },
  highlighted: {
    borderColor: '#c9a94e',
    borderWidth: 2,
    backgroundColor: '#fff8e8',
  },
  mainChar: {
    fontWeight: 'bold',
    lineHeight: undefined,
  },
  suitLabel: {
    marginTop: -2,
  },
});
