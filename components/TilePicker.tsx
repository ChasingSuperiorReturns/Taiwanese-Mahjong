import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import {
  PlayTile, Suit, SuitValue, Wind, Dragon, FlowerTile, FlowerType,
  suitTile, windTile, dragonTile, flowerTile,
} from '@/src/engine/tiles';
import TileDisplay from './TileDisplay';
import { gold } from '@/constants/Colors';

interface TilePickerProps {
  onSelectTile: (tile: PlayTile) => void;
  onSelectFlower?: (flower: FlowerTile) => void;
  showFlowers?: boolean;
  disabledTiles?: Set<string>;
}

const SUIT_ROWS: { suit: Suit; label: string }[] = [
  { suit: Suit.Wan, label: '萬' },
  { suit: Suit.Tong, label: '筒' },
  { suit: Suit.Tiao, label: '條' },
];

const WINDS: { wind: Wind; label: string }[] = [
  { wind: Wind.East, label: '東' },
  { wind: Wind.South, label: '南' },
  { wind: Wind.West, label: '西' },
  { wind: Wind.North, label: '北' },
];

const DRAGONS: { dragon: Dragon; label: string }[] = [
  { dragon: Dragon.Red, label: '中' },
  { dragon: Dragon.Green, label: '發' },
  { dragon: Dragon.White, label: '白' },
];

const FLOWERS: { flower: FlowerType; label: string }[] = [
  { flower: FlowerType.Spring, label: '春' },
  { flower: FlowerType.Summer, label: '夏' },
  { flower: FlowerType.Autumn, label: '秋' },
  { flower: FlowerType.Winter, label: '冬' },
  { flower: FlowerType.Plum, label: '梅' },
  { flower: FlowerType.Orchid, label: '蘭' },
  { flower: FlowerType.Chrysanthemum, label: '菊' },
  { flower: FlowerType.Bamboo, label: '竹' },
];

export default function TilePicker({ onSelectTile, onSelectFlower, showFlowers = false }: TilePickerProps) {
  const values: SuitValue[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {SUIT_ROWS.map(({ suit, label }) => (
        <View key={suit} style={styles.row}>
          <Text style={styles.rowLabel}>{label}</Text>
          <View style={styles.tiles}>
            {values.map((v) => {
              const tile = suitTile(suit, v);
              return (
                <Pressable key={v} onPress={() => onSelectTile(tile)}>
                  <TileDisplay tile={tile} size="sm" />
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      <View style={styles.row}>
        <Text style={styles.rowLabel}>字</Text>
        <View style={styles.tiles}>
          {WINDS.map(({ wind }) => {
            const tile = windTile(wind);
            return (
              <Pressable key={wind} onPress={() => onSelectTile(tile)}>
                <TileDisplay tile={tile} size="sm" />
              </Pressable>
            );
          })}
          {DRAGONS.map(({ dragon }) => {
            const tile = dragonTile(dragon);
            return (
              <Pressable key={dragon} onPress={() => onSelectTile(tile)}>
                <TileDisplay tile={tile} size="sm" />
              </Pressable>
            );
          })}
        </View>
      </View>

      {showFlowers && onSelectFlower && (
        <View style={styles.row}>
          <Text style={styles.rowLabel}>花</Text>
          <View style={styles.tiles}>
            {FLOWERS.map(({ flower }) => (
              <Pressable
                key={flower}
                onPress={() => onSelectFlower(flowerTile(flower))}
              >
                <TileDisplay tile={flowerTile(flower)} size="sm" />
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 260,
  },
  content: {
    gap: 6,
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowLabel: {
    width: 20,
    fontSize: 12,
    fontWeight: '700',
    color: '#5a6b5a',
    textAlign: 'center',
  },
  tiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
});
