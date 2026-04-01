import React from 'react';
import { StyleSheet, Pressable, useWindowDimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const FEATURES = [
  {
    icon: '📖',
    titleZh: '台數表',
    titleEn: 'Tai Reference',
    descZh: '查閱全部 33 條台數規則',
    descEn: 'Browse all 33 scoring rules',
    route: '/reference' as const,
  },
  {
    icon: '🧮',
    titleZh: '算台器',
    titleEn: 'Score Calculator',
    descZh: '輸入手牌，即時計算台數',
    descEn: 'Calculate tai for any hand',
    route: '/calculator' as const,
  },
  {
    icon: '🎯',
    titleZh: '台數測驗',
    titleEn: 'Tai Quiz',
    descZh: '測試你的算台功力',
    descEn: 'Test your scoring knowledge',
    route: '/quiz' as const,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isWide = width > 700;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.hero}>
        <Text style={[styles.title, { color: colors.tint }]}>🀄 牌爛未必輸硬</Text>
        <Text style={[styles.subtitle, { color: colors.subtitle }]}>
          台灣麻將台數學習工具
        </Text>
        <Text style={[styles.subtitleEn, { color: colors.subtitle }]}>
          Taiwanese Mahjong Scoring Trainer
        </Text>
      </View>

      <View style={[styles.cards, isWide && styles.cardsWide]}>
        {FEATURES.map((f) => (
          <Pressable
            key={f.route}
            onPress={() => router.push(f.route)}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: pressed ? colors.accent : colors.cardBorder,
              },
              isWide && styles.cardWide,
              pressed && styles.cardPressed,
            ]}
          >
            <Text style={styles.cardIcon}>{f.icon}</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{f.titleZh}</Text>
            <Text style={[styles.cardTitleEn, { color: colors.accent }]}>{f.titleEn}</Text>
            <Text style={[styles.cardDesc, { color: colors.subtitle }]}>{f.descZh}</Text>
            <Text style={[styles.cardDescEn, { color: colors.subtitle }]}>{f.descEn}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.subtitle }]}>
          台灣十六張麻將 · 33 條台數 · 隨時練習
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  subtitleEn: {
    fontSize: 14,
  },
  cards: {
    paddingHorizontal: 20,
    gap: 16,
  },
  cardsWide: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
    gap: 4,
  },
  cardWide: {
    width: 220,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  cardIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  cardTitleEn: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    textAlign: 'center',
  },
  cardDescEn: {
    fontSize: 12,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
  },
});
