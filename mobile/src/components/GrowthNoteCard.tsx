import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { GrowthNote } from '../types';
import { colors } from '../constants/colors';

interface GrowthNoteCardProps {
  growthNote: GrowthNote;
  date: string;
  onPress?: () => void;
}

export default function GrowthNoteCard({ growthNote, date, onPress }: GrowthNoteCardProps) {
  const sentimentColor = colors.sentiment[growthNote.overallSentiment];

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="labelLarge">{date}</Text>
          <View style={[styles.sentimentDot, { backgroundColor: sentimentColor }]} />
        </View>

        {growthNote.detectedAreas.length > 0 && (
          <View style={styles.areasContainer}>
            {growthNote.detectedAreas.map((area) => (
              <Chip
                key={area.areaName}
                compact
                style={[
                  styles.areaChip,
                  { backgroundColor: colors.progress[area.progressIndicator] + '20' },
                ]}
                textStyle={{ fontSize: 11 }}
              >
                {area.areaName}
              </Chip>
            ))}
          </View>
        )}

        {growthNote.actionableInsight && (
          <Text variant="bodySmall" style={styles.insight} numberOfLines={2}>
            {growthNote.actionableInsight}
          </Text>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sentimentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  areasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  areaChip: {
    height: 24,
  },
  insight: {
    color: colors.primary,
    fontStyle: 'italic',
  },
});
