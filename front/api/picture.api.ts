import { Platform } from 'react-native';
import axiosInstance, { baseURL } from './axiosConfig';
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
  const TARGET_SIZE = 384;

  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    const blob = await response.blob();
    const resized = await resizeImageWeb(blob, TARGET_SIZE);
    form.append('file', resized, _options?.filename || `frame-${Date.now()}.jpg`);
  } else {
    form.append('file', {
      uri,
      type: _options?.mimeType ?? 'image/jpeg',
      name: _options?.filename ?? `frame-${Date.now()}.jpg`,
    } as any);
  }

  try {
    console.warn('[picture.api] Uploading image', { uri, platform: Platform.OS });

    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      const url = `${baseURL}/pictures/import?type=analyse`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      const resp = await fetch(url, {
        method: 'POST',
        body: form,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
        },
      });

      clearTimeout(timeout);

      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        console.error('[picture.api] fetch upload non-ok', { status: resp.status, body: text });
        throw new Error(`Upload échoué (${resp.status}): ${text}`);
      }

      const data = await resp.json().catch(() => ({}));
      return data;
    }

    const config = {
      timeout: 20000,
      headers: {
        Accept: 'application/json',
      },
      transformRequest: [(data: any, headers: any) => {
        if (headers) {
          if (headers['Content-Type']) delete headers['Content-Type'];
          if (headers['content-type']) delete headers['content-type'];
        }
        return data;
      }],
    } as any;

    const response = await axiosInstance.post('/pictures/import?type=analyse', form, config);
    return response.data;
  } catch (e: any) {
    const status = e?.response?.status ?? e?.status;
    const data = e?.response?.data ?? e?.data;
    const msg = typeof data === 'string' ? data : JSON.stringify(data ?? {});
    console.error('[picture.api] Upload failed', { uri, status, data, error: e?.message ?? e, requestHeaders: e?.config?.headers });
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
export async function fetchPvaStatus(): Promise<{ enabled: boolean }> {
  const response = await axiosInstance.get<{ enabled: boolean }>('/pictures/pva/status');
  return response.data;
}

export async function togglePvaStatus(enabled: boolean): Promise<{ enabled: boolean }> {
  const response = await axiosInstance.patch<{ enabled: boolean }>('/pictures/pva/status', { enabled });
  return response.data;
}

export async function fetchPvaToValidateCount(): Promise<number> {
  const response = await axiosInstance.get<{ count: number }>('/pictures/to-validate/count');
  return response.data.count;
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

export async function fetchValidatedPicturesByRoom(
  roomId: string,
  limit: number = 500,
  offset: number = 0
): Promise<PicturePvaDTO[]> {
  try {
    const response = await axiosInstance.get<PicturePvaDTO[]>(
      `/pictures/validated/by-room/${roomId}`,
      {
        params: {
          limit,
          offset,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching validated pictures by room:', error);
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
