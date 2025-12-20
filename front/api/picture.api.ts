import { Platform } from 'react-native';
import axiosInstance from './axiosConfig';
import PicturePvaDTO from './DTO/picturePva.dto';
import * as ImageManipulator from 'expo-image-manipulator';

type UploadOptions = {
  mimeType?: string | null;
  filename?: string | null;
};

/**
 * Envoi d'une image au serveur avec axios (multipart/form-data)
 */
export async function uploadFrame(uri: string, _options?: UploadOptions) {
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
      type: _options?.mimeType || 'image/jpeg',
      name: _options?.filename || `frame-${Date.now()}.jpg`,
    } as any);
  }

  try {
    const response = await axiosInstance.post('/pictures/import?type=analyse', form, {
      timeout: 20000,
    });
    return response.data;
  } catch (e: any) {
    const status = e?.response?.status;
    const data = e?.response?.data;
    const msg = typeof data === 'string' ? data : JSON.stringify(data ?? {});
    throw new Error(`Upload échoué (${status ?? 'ERR'}): ${msg}`);
  }
}

async function resizeImageWeb(blob: Blob, maxSize: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        const url = URL.createObjectURL(blob);
        img.onload = () => {
          let { width, height } = img;
          const ratio = width / height;
          if (width > height) {
            if (width > maxSize) {
              width = maxSize;
              height = Math.round(maxSize / ratio);
            }
          } else {
            if (height > maxSize) {
              height = maxSize;
              width = Math.round(maxSize * ratio);
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(url);
            return reject(new Error('Canvas context unavailable'));
          }
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((b) => {
            URL.revokeObjectURL(url);
            if (b) resolve(b);
            else reject(new Error('Failed to convert canvas to blob'));
          }, 'image/jpeg', 0.9);
        };
        img.onerror = (ev) => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load image for resize'));
        };
        img.src = url;
      } catch (err) {
        reject(err);
      }
    });
  }

export async function fetchToValidatePictures( limit: number = 50, offset: number = 0): Promise<PicturePvaDTO[]> {
  try {
    const response = await axiosInstance.get<PicturePvaDTO[]>( '/pictures/to-validate',
      {
        params: {
          limit,
          offset,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching pictures to validate:', error);
    throw error;
  }
}

export async function validatePictures(pictures: PicturePvaDTO[]) {
  try {
    const response = await axiosInstance.patch('/pictures/validate', pictures);
    return response.data; 
  } catch (error: any) {
    console.error('Error validating pictures:', error);
    throw error;
  }
}

export async function deletePicturesPva(pictures: PicturePvaDTO[]) {
  try {
    const response = await axiosInstance.delete('/pictures/pva', {
      data: pictures,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error deleting pictures:', error);
    throw error;
  }
}

export const updateRoomForPictures = async (
  pictures: PicturePvaDTO[]
): Promise<PicturePvaDTO[]> => {
  try {
    const response = await axiosInstance.patch('/pictures/pva/update-room', pictures);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des salles PVA :', error);
    throw error;
  }
};
