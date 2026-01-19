import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { TextInput, Button, Text, IconButton } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../constants/colors';

type NewEntryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'NewEntry'>;
};

export default function NewEntryScreen({ navigation }: NewEntryScreenProps) {
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | undefined>();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 || undefined);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 || undefined);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImageBase64(undefined);
  };

  const handleSubmit = () => {
    if (!text && !imageBase64) return;
    navigation.navigate('Processing', { text, imageBase64 });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="bodyLarge" style={styles.prompt}>
          What happened today? How did you feel?
        </Text>

        <TextInput
          mode="outlined"
          multiline
          numberOfLines={10}
          value={text}
          onChangeText={setText}
          placeholder="Write about your day, interactions, challenges, wins..."
          style={styles.textInput}
        />

        <View style={styles.imageSection}>
          <Text variant="labelLarge" style={styles.sectionTitle}>
            Or capture a journal page
          </Text>

          {image ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: image }} style={styles.previewImage} />
              <IconButton
                icon="close"
                mode="contained"
                containerColor={colors.accent}
                iconColor={colors.white}
                size={20}
                style={styles.removeButton}
                onPress={removeImage}
              />
            </View>
          ) : (
            <View style={styles.imageButtons}>
              <Button
                mode="outlined"
                icon="camera"
                onPress={takePhoto}
                style={styles.imageButton}
              >
                Take Photo
              </Button>
              <Button
                mode="outlined"
                icon="image"
                onPress={pickImage}
                style={styles.imageButton}
              >
                Choose Image
              </Button>
            </View>
          )}
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={!text && !imageBase64}
          style={styles.submitButton}
        >
          Analyze Entry
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
  prompt: {
    marginBottom: 16,
    color: colors.gray[700],
  },
  textInput: {
    marginBottom: 24,
    minHeight: 200,
  },
  imageSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    color: colors.gray[600],
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  imageButton: {
    flex: 1,
  },
  imagePreview: {
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  submitButton: {
    paddingVertical: 4,
  },
});
