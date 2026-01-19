import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { JournalProvider } from './src/context/JournalContext';
import RootNavigator from './src/navigation/RootNavigator';
import { theme } from './src/constants/colors';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <JournalProvider>
            <RootNavigator />
            <StatusBar style="auto" />
          </JournalProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
