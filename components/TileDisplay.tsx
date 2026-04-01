import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PlayTile, Suit, Dragon } from '@/src/engine/tiles';

interface TileDisplayProps {
  tile: PlayTile;
  size?: 'sm' | 'md' | 'lg';
  highlighted?: boolean;
}

const TILE_LABELS: Record<string, string> = {
  // Wan
  'wan_1': '一萬', 'wan_2': '二萬', 'wan_3': '三萬',
  'wan_4': '四萬', 'wan_5': '五萬', 'wan_6': '六萬',
  'wan_7': '七萬', 'wan_8': '八萬', 'wan_9': '九萬',
  // Tong
  'tong_1': '一筒', 'tong_2': '二筒', 'tong_3': '三筒',
  'tong_4': '四筒', 'tong_5': '五筒', 'tong_6': '六筒',
  'tong_7': '七筒', 'tong_8': '八筒', 'tong_9': '九筒',
  // Tiao
  'tiao_1': '一條', 'tiao_2': '二條', 'tiao_3': '三條',
  'tiao_4': '四條', 'tiao_5': '五條', 'tiao_6': '六條',
  'tiao_7': '七條', 'tiao_8': '八條', 'tiao_9': '九條',
  // Winds
  'wind_east': '東', 'wind_south': '南',
  'wind_west': '西', 'wind_north': '北',
  // Dragons
  'dragon_red': '中', 'dragon_green': '發', 'dragon_white': '白',
};

const SHORT_LABELS: Record<string, string> = {
  'wan_1': '一', 'wan_2': '二', 'wan_3': '三',
  'wan_4': '四', 'wan_5': '五', 'wan_6': '六',
  'wan_7': '七', 'wan_8': '八', 'wan_9': '九',
  'tong_1': '①', 'tong_2': '②', 'tong_3': '③',
  'tong_4': '④', 'tong_5': '⑤', 'tong_6': '⑥',
  'tong_7': '⑦', 'tong_8': '⑧', 'tong_9': '⑨',
  'tiao_1': '1', 'tiao_2': '2', 'tiao_3': '3',
  'tiao_4': '4', 'tiao_5': '5', 'tiao_6': '6',
  'tiao_7': '7', 'tiao_8': '8', 'tiao_9': '9',
  'wind_east': '東', 'wind_south': '南',
  'wind_west': '西', 'wind_north': '北',
  'dragon_red': '中', 'dragon_green': '發', 'dragon_white': '白',
};

const SUIT_LABEL: Record<string, string> = {
  wan: '萬', tong: '筒', tiao: '條',
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
    if (tile.suit === Suit.Tong) return '#2266cc';
    return '#1a8a2a';
  }
  return '#333';
}

const SIZES = {
  sm: { w: 28, h: 36, main: 14, sub: 8 },
  md: { w: 36, h: 48, main: 18, sub: 10 },
  lg: { w: 48, h: 64, main: 24, sub: 12 },
};

export default function TileDisplay({ tile, size = 'md', highlighted = false }: TileDisplayProps) {
  const key = getTileKey(tile);
  const color = getTileColor(tile);
  const s = SIZES[size];

  const isHonor = tile.kind === 'wind' || tile.kind === 'dragon';
  const shortLabel = SHORT_LABELS[key] ?? '?';
  const suitLabel = tile.kind === 'suit' ? SUIT_LABEL[tile.suit] : '';

  return (
    <View style={[
      styles.tile,
      { width: s.w, height: s.h },
      highlighted && styles.highlighted,
    ]}>
      <Text style={[
        styles.mainChar,
        { fontSize: isHonor ? s.main + 2 : s.main, color },
      ]}>
        {shortLabel}
      </Text>
      {!isHonor && (
        <Text style={[styles.suitLabel, { fontSize: s.sub, color }]}>
          {suitLabel}
        </Text>
      )}
    </View>
  );
}

export { TILE_LABELS, getTileKey };

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
