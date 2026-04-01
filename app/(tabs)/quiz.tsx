import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet, Pressable, ScrollView,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import HandDisplay from '@/components/HandDisplay';
import { QUIZ_SCENARIOS, QuizScenario } from '@/src/data/quiz-hands';
import { calculateScore } from '@/src/engine/scoring';
import { TAI_CATALOG_MAP } from '@/src/data/tai-catalog';

type Difficulty = 'easy' | 'medium' | 'hard';

function generateChoices(correct: number): number[] {
  const choices = new Set<number>([correct]);
  // Generate plausible wrong answers near the correct one
  const candidates = [
    Math.max(0, correct - 2),
    Math.max(0, correct - 1),
    correct + 1,
    correct + 2,
    correct + 3,
    Math.max(1, Math.floor(correct / 2)),
    correct * 2,
  ].filter((n) => n !== correct && n >= 0);

  while (choices.size < 4 && candidates.length > 0) {
    const idx = Math.floor(Math.random() * candidates.length);
    choices.add(candidates.splice(idx, 1)[0]);
  }
  // Fill remaining with random
  while (choices.size < 4) {
    choices.add(Math.floor(Math.random() * 20));
  }

  return Array.from(choices).sort((a, b) => a - b);
}

export default function QuizScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const scenarios = useMemo(
    () => QUIZ_SCENARIOS.filter((s) => s.difficulty === difficulty),
    [difficulty],
  );

  const scenario = scenarios[currentIdx % scenarios.length];
  const choices = useMemo(
    () => generateChoices(scenario.expectedTai),
    [scenario.id],
  );

  const breakdown = useMemo(
    () => calculateScore(scenario.hand, scenario.context),
    [scenario.id],
  );

  const handleSelect = useCallback(
    (choice: number) => {
      if (selected !== null) return;
      setSelected(choice);
      setScore((prev) => ({
        correct: prev.correct + (choice === scenario.expectedTai ? 1 : 0),
        total: prev.total + 1,
      }));
    },
    [selected, scenario],
  );

  const handleNext = () => {
    setSelected(null);
    setShowHint(false);
    setCurrentIdx((i) => i + 1);
  };

  const handleChangeDifficulty = (d: Difficulty) => {
    setDifficulty(d);
    setCurrentIdx(0);
    setSelected(null);
    setShowHint(false);
    setScore({ correct: 0, total: 0 });
  };

  const DIFFICULTIES: { key: Difficulty; label: string; labelEn: string }[] = [
    { key: 'easy', label: '初級', labelEn: 'Easy' },
    { key: 'medium', label: '中級', labelEn: 'Medium' },
    { key: 'hard', label: '高級', labelEn: 'Hard' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.diffRow}>
        {DIFFICULTIES.map((d) => (
          <Pressable
            key={d.key}
            onPress={() => handleChangeDifficulty(d.key)}
            style={[
              styles.diffBtn,
              {
                backgroundColor: difficulty === d.key ? colors.tint : colors.card,
                borderColor: difficulty === d.key ? colors.tint : colors.cardBorder,
              },
            ]}
          >
            <Text style={[styles.diffText, { color: difficulty === d.key ? '#f0e6d3' : colors.text }]}>
              {d.label}
            </Text>
          </Pressable>
        ))}
        <View style={[styles.scoreBadge, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.scoreText, { color: colors.accent }]}>
            {score.correct}/{score.total}
          </Text>
        </View>
      </View>

      <View style={styles.questionNum}>
        <Text style={[styles.questionNumText, { color: colors.subtitle }]}>
          第 {(currentIdx % scenarios.length) + 1} / {scenarios.length} 題
        </Text>
      </View>

      <View style={[styles.handBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <HandDisplay hand={scenario.hand} flowers={scenario.context.flowers} size="sm" />
        {/* Show context info */}
        <View style={styles.contextTags}>
          {scenario.context.isSelfDraw && <Tag text="自摸" color="#4a8a5a" />}
          {scenario.context.isDealer && <Tag text="莊家" color="#8a6a4a" />}
          {scenario.context.roundWind && (
            <Tag
              text={`圈風: ${{ east: '東', south: '南', west: '西', north: '北' }[scenario.context.roundWind]}`}
              color="#4a7a9a"
            />
          )}
          {scenario.context.seatWind && (
            <Tag
              text={`門風: ${{ east: '東', south: '南', west: '西', north: '北' }[scenario.context.seatWind]}`}
              color="#4a7a9a"
            />
          )}
          {scenario.context.dealerStreak != null && scenario.context.dealerStreak > 0 && (
            <Tag text={`連${scenario.context.dealerStreak}`} color="#9a6a4a" />
          )}
        </View>
      </View>

      <Text style={[styles.prompt, { color: colors.text }]}>這手牌幾台？</Text>
      <Text style={[styles.promptEn, { color: colors.subtitle }]}>How many tai is this hand?</Text>

      <View style={styles.choices}>
        {choices.map((c) => {
          const isCorrect = c === scenario.expectedTai;
          const isSelected = selected === c;
          let bgColor = colors.card;
          let borderCol = colors.cardBorder;
          if (selected !== null) {
            if (isCorrect) {
              bgColor = '#2a7a3a22';
              borderCol = '#2a7a3a';
            } else if (isSelected) {
              bgColor = '#aa333322';
              borderCol = '#aa3333';
            }
          }
          return (
            <Pressable
              key={c}
              onPress={() => handleSelect(c)}
              style={[styles.choiceBtn, { backgroundColor: bgColor, borderColor: borderCol }]}
            >
              <Text style={[styles.choiceText, { color: colors.text }]}>{c} 台</Text>
            </Pressable>
          );
        })}
      </View>

      {selected === null && (
        <Pressable onPress={() => setShowHint(true)} style={styles.hintBtn}>
          <Text style={[styles.hintBtnText, { color: colors.accent }]}>
            {showHint ? '' : '💡 提示 Hint'}
          </Text>
        </Pressable>
      )}

      {showHint && selected === null && (
        <View style={[styles.hintBox, { backgroundColor: colors.card, borderColor: colors.accent }]}>
          <Text style={{ color: colors.text }}>{scenario.hintZh}</Text>
          <Text style={{ color: colors.subtitle, fontSize: 12 }}>{scenario.hintEn}</Text>
        </View>
      )}

      {selected !== null && (
        <View style={[styles.breakdownBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.breakdownTitle, { color: selected === scenario.expectedTai ? '#2a7a3a' : '#aa3333' }]}>
            {selected === scenario.expectedTai ? '✅ 正確！' : `❌ 答案是 ${scenario.expectedTai} 台`}
          </Text>
          <Text style={[styles.breakdownSubtitle, { color: colors.subtitle }]}>台數明細：</Text>
          {breakdown.results.map((r, i) => {
            const def = TAI_CATALOG_MAP[r.ruleId];
            return (
              <View key={i} style={styles.breakdownRow}>
                <Text style={[styles.breakdownTai, { color: colors.accent }]}>+{r.tai}</Text>
                <Text style={{ color: colors.text, flex: 1 }}>
                  {def?.name.zh ?? r.ruleId} {r.label ? `(${r.label})` : ''}
                </Text>
              </View>
            );
          })}
          <Pressable onPress={handleNext} style={[styles.nextBtn, { backgroundColor: colors.tint }]}>
            <Text style={styles.nextBtnText}>下一題 Next →</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

function Tag({ text, color }: { text: string; color: string }) {
  return (
    <View style={[styles.tag, { backgroundColor: color + '22', borderColor: color }]}>
      <Text style={[styles.tagText, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40, gap: 12 },
  diffRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  diffBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  diffText: { fontSize: 14, fontWeight: '600' },
  scoreBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  scoreText: { fontSize: 16, fontWeight: '700' },
  questionNum: { alignItems: 'center' },
  questionNumText: { fontSize: 13 },
  handBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  contextTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  tagText: { fontSize: 11, fontWeight: '600' },
  prompt: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  promptEn: { fontSize: 14, textAlign: 'center' },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  choiceBtn: {
    width: '45%',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  choiceText: { fontSize: 20, fontWeight: '700' },
  hintBtn: { alignItems: 'center', paddingVertical: 8 },
  hintBtnText: { fontSize: 14 },
  hintBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 2,
  },
  breakdownBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  breakdownTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  breakdownSubtitle: { fontSize: 13, marginTop: 4 },
  breakdownRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  breakdownTai: { fontSize: 14, fontWeight: '700', width: 32 },
  nextBtn: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextBtnText: { color: '#f0e6d3', fontSize: 16, fontWeight: '700' },
});
