import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useJournal } from '../context/JournalContext';
import { colors } from '../constants/colors';

type ProcessingScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Processing'>;
  route: RouteProp<RootStackParamList, 'Processing'>;
};

const LOADING_MESSAGES = [
  'Reflecting on your day...',
  'Finding growth patterns...',
  'Identifying key moments...',
  'Crafting your insight...',
];

export default function ProcessingScreen({ navigation, route }: ProcessingScreenProps) {
  const { text, imageBase64 } = route.params;
  const { createEntry } = useJournal();
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const analyze = async () => {
      try {
        const result = await createEntry(text, imageBase64);
        navigation.replace('GrowthNote', { entryId: result.entryId });
      } catch (err: any) {
        setError(err.response?.data?.error || 'Analysis failed. Please try again.');
      }
    };

    analyze();
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <Text variant="headlineSmall" style={styles.errorTitle}>
          Oops!
        </Text>
        <Text variant="bodyMedium" style={styles.errorMessage}>
          {error}
        </Text>
        <Text
          variant="bodyMedium"
          style={styles.backLink}
          onPress={() => navigation.goBack()}
        >
          Go back and try again
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      <Text variant="headlineSmall" style={styles.message}>
        {LOADING_MESSAGES[messageIndex]}
      </Text>
      <Text variant="bodyMedium" style={styles.subMessage}>
        This usually takes 5-10 seconds
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 24,
  },
  spinner: {
    marginBottom: 24,
  },
  message: {
    textAlign: 'center',
    color: colors.primary,
    marginBottom: 8,
  },
  subMessage: {
    textAlign: 'center',
    color: colors.gray[500],
  },
  errorTitle: {
    color: colors.accent,
    marginBottom: 12,
  },
  errorMessage: {
    textAlign: 'center',
    color: colors.gray[700],
    marginBottom: 24,
  },
  backLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
