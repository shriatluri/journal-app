// Image compression utility
// MVP: Using expo-image-picker's built-in compression (quality: 0.7)
// Post-MVP: Install expo-image-manipulator for more control

export async function compressImage(
  uri: string,
  _maxWidth: number = 1024
): Promise<{ uri: string; base64: string }> {
  // For MVP, return uri as-is since we use expo-image-picker's compression
  return {
    uri,
    base64: '',
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
