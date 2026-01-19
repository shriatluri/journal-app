import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, Chip, IconButton } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { userService } from '../services/userService';
import { colors } from '../constants/colors';

type OnboardingScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

const SUGGESTED_AREAS = [
  { name: 'Communication', description: 'Improve clarity and charisma in conversations' },
  { name: 'Productivity', description: 'Better time management and focus' },
  { name: 'Health', description: 'Physical fitness and wellness habits' },
  { name: 'Relationships', description: 'Deeper connections with others' },
  { name: 'Creativity', description: 'Express and develop creative abilities' },
  { name: 'Mindfulness', description: 'Present awareness and emotional balance' },
  { name: 'Finance', description: 'Better money management and saving habits' },
];

export default function OnboardingScreen({ navigation }: OnboardingScreenProps) {
  const [selectedAreas, setSelectedAreas] = useState<{ name: string; description: string }[]>([]);
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleArea = (area: { name: string; description: string }) => {
    const exists = selectedAreas.find((a) => a.name === area.name);
    if (exists) {
      setSelectedAreas(selectedAreas.filter((a) => a.name !== area.name));
    } else if (selectedAreas.length < 5) {
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  const addCustomArea = () => {
    if (customName && selectedAreas.length < 5) {
      setSelectedAreas([
        ...selectedAreas,
        { name: customName, description: customDescription || `Track progress in ${customName}` },
      ]);
      setCustomName('');
      setCustomDescription('');
    }
  };

  const removeArea = (name: string) => {
    setSelectedAreas(selectedAreas.filter((a) => a.name !== name));
  };

  const handleSave = async () => {
    if (selectedAreas.length < 2) return;

    setLoading(true);
    try {
      await userService.updateGrowthAreas(selectedAreas);
      navigation.replace('Home');
    } catch (error) {
      console.error('Failed to save growth areas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          What do you want to improve?
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Select 2-5 growth areas to track in your journal
        </Text>

        <View style={styles.selectedContainer}>
          <Text variant="labelLarge" style={styles.sectionTitle}>
            Selected ({selectedAreas.length}/5)
          </Text>
          <View style={styles.chipContainer}>
            {selectedAreas.map((area) => (
              <Chip
                key={area.name}
                onClose={() => removeArea(area.name)}
                style={styles.selectedChip}
                textStyle={{ color: colors.white }}
              >
                {area.name}
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.suggestedContainer}>
          <Text variant="labelLarge" style={styles.sectionTitle}>
            Suggested Areas
          </Text>
          <View style={styles.chipContainer}>
            {SUGGESTED_AREAS.filter(
              (area) => !selectedAreas.find((a) => a.name === area.name)
            ).map((area) => (
              <Chip
                key={area.name}
                onPress={() => toggleArea(area)}
                style={styles.suggestedChip}
                disabled={selectedAreas.length >= 5}
              >
                {area.name}
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.customContainer}>
          <Text variant="labelLarge" style={styles.sectionTitle}>
            Add Custom Area
          </Text>
          <TextInput
            label="Area Name"
            value={customName}
            onChangeText={setCustomName}
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Description (optional)"
            value={customDescription}
            onChangeText={setCustomDescription}
            style={styles.input}
            mode="outlined"
            multiline
          />
          <Button
            mode="outlined"
            onPress={addCustomArea}
            disabled={!customName || selectedAreas.length >= 5}
            style={styles.addButton}
          >
            Add Area
          </Button>
        </View>

        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading || selectedAreas.length < 2}
          style={styles.saveButton}
        >
          Continue
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    padding: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.gray[600],
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    color: colors.gray[700],
  },
  selectedContainer: {
    marginBottom: 24,
  },
  suggestedContainer: {
    marginBottom: 24,
  },
  customContainer: {
    marginBottom: 24,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedChip: {
    backgroundColor: colors.primary,
  },
  suggestedChip: {
    backgroundColor: colors.gray[200],
  },
  input: {
    marginBottom: 12,
  },
  addButton: {
    alignSelf: 'flex-start',
  },
  saveButton: {
    marginTop: 16,
    paddingVertical: 4,
  },
});
