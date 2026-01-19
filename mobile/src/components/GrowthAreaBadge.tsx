import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { colors } from '../constants/colors';

interface GrowthAreaBadgeProps {
  name: string;
  progress?: 'improving' | 'steady' | 'struggling' | 'first_mention';
  compact?: boolean;
  onPress?: () => void;
}

export default function GrowthAreaBadge({
  name,
  progress = 'steady',
  compact = false,
  onPress,
}: GrowthAreaBadgeProps) {
  const progressColor = colors.progress[progress];

  return (
    <Chip
      compact={compact}
      style={[styles.chip, { backgroundColor: progressColor + '20' }]}
      textStyle={[styles.text, { color: progressColor }]}
      onPress={onPress}
    >
      {name}
    </Chip>
  );
}

const styles = StyleSheet.create({
  chip: {
    marginRight: 6,
    marginBottom: 6,
  },
  text: {
    fontSize: 12,
  },
});
