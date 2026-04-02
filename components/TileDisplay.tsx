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
  sm: { w: 28, h: 36, main: 14, sub: 8, coin: 6, stick: { w: 3, h: 10 }, pad: 1 },
  md: { w: 36, h: 48, main: 18, sub: 10, coin: 8, stick: { w: 4, h: 13 }, pad: 1.5 },
  lg: { w: 48, h: 64, main: 24, sub: 12, coin: 10, stick: { w: 5, h: 17 }, pad: 2 },
};

// ─── 筒 (Circles) — Traditional coin-style hollow rings ───
// Layout: rows of circle counts per value
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

// Color for each circle, flattened order (top-left → bottom-right)
const COIN_COLORS: Record<number, string[]> = {
  1: ['#cc2222'],
  2: ['#1a8a2a', '#cc2222'],
  3: ['#1a5ea6', '#cc2222', '#1a8a2a'],
  4: ['#cc2222', '#1a5ea6', '#1a8a2a', '#cc2222'],
  5: ['#1a5ea6', '#1a8a2a', '#cc2222', '#1a8a2a', '#1a5ea6'],
  6: ['#1a5ea6', '#1a8a2a', '#cc2222', '#1a5ea6', '#1a8a2a', '#cc2222'],
  7: ['#1a5ea6', '#cc2222', '#1a8a2a', '#cc2222', '#1a8a2a', '#1a5ea6', '#cc2222'],
  8: ['#1a5ea6', '#1a8a2a', '#cc2222', '#1a5ea6', '#cc2222', '#1a8a2a', '#1a5ea6', '#cc2222'],
  9: ['#1a5ea6', '#1a8a2a', '#cc2222', '#1a8a2a', '#cc2222', '#1a5ea6', '#cc2222', '#1a8a2a', '#1a5ea6'],
};

// ─── 條 (Bamboo) — Traditional segmented sticks ───
const BAMBOO_ROWS: Record<number, number[]> = {
  1: [1],        // bird (special)
  2: [2],
  3: [3],
  4: [2, 2],
  5: [3, 2],
  6: [3, 3],
  7: [4, 3],
  8: [4, 4],
  9: [3, 3, 3],
};

// Alternating green/blue for each stick, flattened
const STICK_COLORS: Record<number, string[]> = {
  2: ['#1a8a2a', '#1a5ea6'],
  3: ['#1a5ea6', '#1a8a2a', '#1a5ea6'],
  4: ['#1a8a2a', '#1a5ea6', '#1a5ea6', '#1a8a2a'],
  5: ['#1a5ea6', '#1a8a2a', '#1a5ea6', '#1a8a2a', '#1a5ea6'],
  6: ['#1a8a2a', '#1a5ea6', '#1a8a2a', '#1a5ea6', '#1a8a2a', '#1a5ea6'],
  7: ['#1a5ea6', '#1a8a2a', '#1a5ea6', '#1a8a2a', '#1a8a2a', '#1a5ea6', '#1a8a2a'],
  8: ['#1a8a2a', '#1a5ea6', '#1a8a2a', '#1a5ea6', '#1a5ea6', '#1a8a2a', '#1a5ea6', '#1a8a2a'],
  9: ['#1a5ea6', '#1a8a2a', '#1a5ea6', '#1a8a2a', '#1a5ea6', '#1a8a2a', '#1a5ea6', '#1a8a2a', '#1a5ea6'],
};

// ─── Circle (筒) sub-component — coin-style hollow ring ───
function Coin({ diameter, color }: { diameter: number; color: string }) {
  const border = Math.max(1.5, diameter * 0.2);
  const innerD = Math.max(1, diameter * 0.25);
  return (
    <View style={{
      width: diameter,
      height: diameter,
      borderRadius: diameter / 2,
      borderWidth: border,
      borderColor: color,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <View style={{
        width: innerD,
        height: innerD,
        borderRadius: innerD / 2,
        backgroundColor: color,
      }} />
    </View>
  );
}

function CirclePattern({ value, size }: { value: number; size: 'sm' | 'md' | 'lg' }) {
  const s = SIZES[size];
  const rows = CIRCLE_ROWS[value];
  const colors = COIN_COLORS[value];
  const gap = s.pad;
  // For 1筒: larger coin
  const coinSize = value === 1 ? s.coin * 2.2 : s.coin;
  let colorIdx = 0;

  return (
    <View style={patternStyles.patternContainer}>
      {rows.map((count, rowIdx) => (
        <View key={rowIdx} style={[patternStyles.patternRow, { gap }]}>
          {Array.from({ length: count }).map((_, i) => {
            const c = colors[colorIdx % colors.length];
            colorIdx++;
            return <Coin key={i} diameter={coinSize} color={c} />;
          })}
        </View>
      ))}
    </View>
  );
}

// ─── Bamboo (條) sub-component — segmented stick ───
function BambooStick({ width, height, color }: { width: number; height: number; color: string }) {
  const nodeH = Math.max(0.5, height * 0.06);
  const capH = Math.max(1, height * 0.12);
  const lighterColor = color === '#1a8a2a' ? '#4dc96f' : '#5ba3d9';
  const capColor = color === '#1a8a2a' ? '#0f5a1a' : '#0e3d6e';

  return (
    <View style={{
      width: width,
      height: height,
      borderRadius: width / 2.5,
      backgroundColor: color,
      overflow: 'hidden',
      alignItems: 'center',
    }}>
      {/* Top cap */}
      <View style={{
        position: 'absolute', top: 0,
        width: width, height: capH,
        borderRadius: capH / 2,
        backgroundColor: capColor,
      }} />
      {/* Node 1 */}
      <View style={{
        position: 'absolute', top: height * 0.32,
        width: width * 1.15, height: nodeH,
        backgroundColor: lighterColor,
      }} />
      {/* Node 2 */}
      <View style={{
        position: 'absolute', top: height * 0.62,
        width: width * 1.15, height: nodeH,
        backgroundColor: lighterColor,
      }} />
      {/* Bottom cap */}
      <View style={{
        position: 'absolute', bottom: 0,
        width: width, height: capH,
        borderRadius: capH / 2,
        backgroundColor: capColor,
      }} />
    </View>
  );
}

// 1索: Stylized bird (sparrow) — the traditional design
function BambooBird({ width, height }: { width: number; height: number }) {
  const bodyW = width * 2.5;
  const bodyH = height * 0.55;
  const headD = bodyW * 0.45;
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: bodyW + 4, height }}>
      {/* Head */}
      <View style={{
        width: headD, height: headD,
        borderRadius: headD / 2,
        backgroundColor: '#cc2222',
        position: 'absolute', top: 0,
        zIndex: 2,
      }}>
        {/* Eye */}
        <View style={{
          width: headD * 0.25, height: headD * 0.25,
          borderRadius: headD * 0.125,
          backgroundColor: '#fff',
          position: 'absolute', right: headD * 0.2, top: headD * 0.25,
        }} />
      </View>
      {/* Beak */}
      <View style={{
        position: 'absolute', top: headD * 0.35,
        right: -1, zIndex: 3,
        width: 0, height: 0,
        borderLeftWidth: headD * 0.35,
        borderTopWidth: headD * 0.15,
        borderBottomWidth: headD * 0.15,
        borderLeftColor: '#e8a020',
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
      }} />
      {/* Body */}
      <View style={{
        width: bodyW, height: bodyH,
        borderRadius: bodyH / 2,
        backgroundColor: '#1a8a2a',
        position: 'absolute', bottom: height * 0.15,
      }} />
      {/* Wing stripe */}
      <View style={{
        width: bodyW * 0.6, height: bodyH * 0.2,
        borderRadius: bodyH * 0.1,
        backgroundColor: '#4dc96f',
        position: 'absolute', bottom: height * 0.15 + bodyH * 0.3,
      }} />
      {/* Tail feathers */}
      <View style={{
        width: bodyW * 0.4, height: bodyH * 0.5,
        borderRadius: 2,
        backgroundColor: '#1a5ea6',
        position: 'absolute', bottom: height * 0.15 + bodyH * 0.3,
        left: -bodyW * 0.1,
        transform: [{ rotate: '-20deg' }],
      }} />
    </View>
  );
}

function BambooPattern({ value, size }: { value: number; size: 'sm' | 'md' | 'lg' }) {
  const s = SIZES[size];
  const { w: sw, h: sh } = s.stick;
  const gap = s.pad;

  // Special: 1索 is the bird
  if (value === 1) {
    return (
      <View style={patternStyles.patternContainer}>
        <BambooBird width={sw} height={sh} />
      </View>
    );
  }

  const rows = BAMBOO_ROWS[value];
  const colors = STICK_COLORS[value];
  let colorIdx = 0;

  return (
    <View style={patternStyles.patternContainer}>
      {rows.map((count, rowIdx) => (
        <View key={rowIdx} style={[patternStyles.patternRow, { gap: gap + 1 }]}>
          {Array.from({ length: count }).map((_, i) => {
            const c = colors[colorIdx % colors.length];
            colorIdx++;
            return <BambooStick key={i} width={sw} height={sh} color={c} />;
          })}
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
