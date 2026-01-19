import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../constants/colors';

interface CameraCaptureProps {
  imageUri: string | null;
  onImageCaptured: (uri: string, base64: string) => void;
  onImageRemoved: () => void;
}

export default function CameraCapture({
  imageUri,
  onImageCaptured,
  onImageRemoved,
}: CameraCaptureProps) {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      onImageCaptured(asset.uri, asset.base64 || '');
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
      const asset = result.assets[0];
      onImageCaptured(asset.uri, asset.base64 || '');
    }
  };

  if (imageUri) {
    return (
      <View style={styles.previewContainer}>
        <Image source={{ uri: imageUri }} style={styles.preview} />
        <IconButton
          icon="close"
          mode="contained"
          containerColor={colors.accent}
          iconColor={colors.white}
          size={20}
          style={styles.removeButton}
          onPress={onImageRemoved}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="labelLarge" style={styles.label}>
        Capture journal page
      </Text>
      <View style={styles.buttonRow}>
        <Button
          mode="outlined"
          icon="camera"
          onPress={takePhoto}
          style={styles.button}
        >
          Take Photo
        </Button>
        <Button
          mode="outlined"
          icon="image"
          onPress={pickImage}
          style={styles.button}
        >
          Choose Image
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    marginBottom: 12,
    color: colors.gray[600],
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
  previewContainer: {
    position: 'relative',
    marginVertical: 16,
  },
  preview: {
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
});
