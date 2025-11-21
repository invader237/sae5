import { Platform } from 'react-native';
import axiosInstance from './axiosConfig';

type UploadOptions = {
  mimeType?: string | null;
  filename?: string | null;
};

/**
 * Envoi d'une image au serveur avec axios (multipart/form-data)
 */
export async function uploadFrame(endpoint: string, uri: string, _options?: UploadOptions) {
  const form = new FormData();
  form.append('type', 'analyse');

  if (Platform.OS === 'web') {
    // Upload depuis navigateur -> convertir l'URI en Blob pour l'envoyer via FormData
    const response = await fetch(uri);
    const blob = await response.blob();
    form.append('file', blob);
  } else {
    // Upload depuis mobile (React Native), on passe un objet { uri, type, name }
    form.append('file', {
      uri,
      type: 'image/jpeg',
      name: `frame-${Date.now()}.jpg`,
    } as any);
  }

  try {
    await axiosInstance.post(endpoint, form, {
      timeout: 20000,
    });
  } catch (e: any) {
    const status = e?.response?.status;
    const data = e?.response?.data;
    const msg = typeof data === 'string' ? data : JSON.stringify(data ?? {});
    throw new Error(`Upload échoué (${status ?? 'ERR'}): ${msg}`);
  }
}
