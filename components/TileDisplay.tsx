import React from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { PlayTile } from '@/src/engine/tiles';

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

function getTileKey(tile: PlayTile): string {
  switch (tile.kind) {
    case 'suit': return `${tile.suit}_${tile.value}`;
    case 'wind': return `wind_${tile.wind}`;
    case 'dragon': return `dragon_${tile.dragon}`;
  }
}

// Static image map - Metro bundler requires literal require() paths
const TILE_IMAGES: Record<string, ImageSourcePropType> = {
  // 萬 (Characters / Man)
  'wan_1': require('../assets/images/tiles/Man1.png'),
  'wan_2': require('../assets/images/tiles/Man2.png'),
  'wan_3': require('../assets/images/tiles/Man3.png'),
  'wan_4': require('../assets/images/tiles/Man4.png'),
  'wan_5': require('../assets/images/tiles/Man5.png'),
  'wan_6': require('../assets/images/tiles/Man6.png'),
  'wan_7': require('../assets/images/tiles/Man7.png'),
  'wan_8': require('../assets/images/tiles/Man8.png'),
  'wan_9': require('../assets/images/tiles/Man9.png'),
  // 筒 (Circles / Pin)
  'tong_1': require('../assets/images/tiles/Pin1.png'),
  'tong_2': require('../assets/images/tiles/Pin2.png'),
  'tong_3': require('../assets/images/tiles/Pin3.png'),
  'tong_4': require('../assets/images/tiles/Pin4.png'),
  'tong_5': require('../assets/images/tiles/Pin5.png'),
  'tong_6': require('../assets/images/tiles/Pin6.png'),
  'tong_7': require('../assets/images/tiles/Pin7.png'),
  'tong_8': require('../assets/images/tiles/Pin8.png'),
  'tong_9': require('../assets/images/tiles/Pin9.png'),
  // 條 (Bamboo / Sou)
  'tiao_1': require('../assets/images/tiles/Sou1.png'),
  'tiao_2': require('../assets/images/tiles/Sou2.png'),
  'tiao_3': require('../assets/images/tiles/Sou3.png'),
  'tiao_4': require('../assets/images/tiles/Sou4.png'),
  'tiao_5': require('../assets/images/tiles/Sou5.png'),
  'tiao_6': require('../assets/images/tiles/Sou6.png'),
  'tiao_7': require('../assets/images/tiles/Sou7.png'),
  'tiao_8': require('../assets/images/tiles/Sou8.png'),
  'tiao_9': require('../assets/images/tiles/Sou9.png'),
  // Winds
  'wind_east': require('../assets/images/tiles/Ton.png'),
  'wind_south': require('../assets/images/tiles/Nan.png'),
  'wind_west': require('../assets/images/tiles/Shaa.png'),
  'wind_north': require('../assets/images/tiles/Pei.png'),
  // Dragons
  'dragon_red': require('../assets/images/tiles/Chun.png'),
  'dragon_green': require('../assets/images/tiles/Hatsu.png'),
  'dragon_white': require('../assets/images/tiles/Haku.png'),
};

const FLOWER_LABELS: Record<string, string> = {
  'flower_1': '梅', 'flower_2': '蘭', 'flower_3': '竹', 'flower_4': '菊',
  'flower_5': '春', 'flower_6': '夏', 'flower_7': '秋', 'flower_8': '冬',
};

const FLOWER_COLORS: Record<string, string> = {
  'flower_1': '#cc2222', 'flower_2': '#1a7a2a', 'flower_3': '#1a7a2a', 'flower_4': '#cc2222',
  'flower_5': '#cc2222', 'flower_6': '#cc2222', 'flower_7': '#1a5ea6', 'flower_8': '#1a5ea6',
};

const SIZES = {
  sm: { w: 28, h: 36, imgPad: 3, flowerFont: 16 },
  md: { w: 36, h: 48, imgPad: 4, flowerFont: 22 },
  lg: { w: 48, h: 64, imgPad: 5, flowerFont: 30 },
};

export default function TileDisplay({ tile, size = 'md', highlighted = false }: TileDisplayProps) {
  const key = getTileKey(tile);
  const s = SIZES[size];
  const img = TILE_IMAGES[key];
  const flowerLabel = FLOWER_LABELS[key];
  const flowerColor = FLOWER_COLORS[key];

  return (
    <View style={[
      styles.tile,
      { width: s.w, height: s.h },
      highlighted && styles.highlighted,
    ]}>
      {img ? (
        <Image
          source={img}
          style={{
            width: s.w - s.imgPad * 2,
            height: s.h - s.imgPad * 2,
          }}
          resizeMode="contain"
        />
      ) : flowerLabel ? (
        <Text style={[styles.flowerText, { fontSize: s.flowerFont, color: flowerColor }]}>
          {flowerLabel}
        </Text>
      ) : (
        <Text style={styles.fallbackText}>?</Text>
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
    overflow: 'hidden',
  },
  highlighted: {
    borderColor: '#c9a94e',
    borderWidth: 2,
    backgroundColor: '#fff8e8',
  },
  flowerText: {
    fontWeight: 'bold',
  },
  fallbackText: {
    fontSize: 14,
    color: '#999',
  },
});
