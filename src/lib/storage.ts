import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { compressToWebP } from '@/lib/image-compressor';

export const ORDER_SLIPS_BUCKET = 'order-slips';

/**
 * Extracts relative storage object path from a URL or raw path string.
 * Handles full Supabase storage URLs, relative bucket paths, or plain filenames.
 */
export function extractSlipStoragePath(rawUrlOrPath?: string | null): string | null {
  if (!rawUrlOrPath) return null;
  const str = rawUrlOrPath.trim();

  // If it's a blob/data URI or legacy public product-images URL, it doesn't need signing
  if (str.startsWith('blob:') || str.startsWith('data:') || str.includes('/product-images/')) {
    return null;
  }

  // If it's a Supabase storage URL containing order-slips
  const marker = `/${ORDER_SLIPS_BUCKET}/`;
  if (str.includes(marker)) {
    const after = str.substring(str.indexOf(marker) + marker.length);
    return after.split('?')[0];
  }

  // If it starts with order-slips/
  if (str.startsWith(`${ORDER_SLIPS_BUCKET}/`)) {
    return str.substring(ORDER_SLIPS_BUCKET.length + 1).split('?')[0];
  }

  // Strip leading slashes
  return str.replace(/^\/+/, '').split('?')[0];
}

/**
 * Generates a signed URL for a bank deposit slip stored in the private 'order-slips' bucket.
 * If the path is already a public URL, blob, or data URL, it returns it directly.
 */
export async function getSignedSlipUrl(
  rawUrlOrPath?: string | null,
  expiresInSeconds: number = 7200
): Promise<string | null> {
  if (!rawUrlOrPath) return null;
  const str = rawUrlOrPath.trim();

  // 1. Direct local preview or public URL
  if (str.startsWith('blob:') || str.startsWith('data:') || str.includes('/product-images/')) {
    return str;
  }

  // 2. Already has active signed token
  if (str.includes('?token=')) {
    return str;
  }

  // 3. Extract the relative object path
  const path = extractSlipStoragePath(str);
  if (!path || !isSupabaseConfigured()) {
    return str;
  }

  try {
    const { data, error } = await supabase.storage
      .from(ORDER_SLIPS_BUCKET)
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data?.signedUrl) {
      console.warn('[Storage] Could not create signed URL for slip:', error?.message);
      return str;
    }

    return data.signedUrl;
  } catch (err) {
    console.warn('[Storage] Exception generating signed URL:', err);
    return str;
  }
}

/**
 * React hook to resolve and keep a signed URL updated for deposit slip rendering.
 */
export function useSignedSlipUrl(rawUrlOrPath?: string | null) {
  const [signedUrl, setSignedUrl] = useState<string | null>(rawUrlOrPath || null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!rawUrlOrPath) {
      setSignedUrl(null);
      return;
    }

    // If local preview or public URL, no async lookup needed
    if (
      rawUrlOrPath.startsWith('blob:') ||
      rawUrlOrPath.startsWith('data:') ||
      rawUrlOrPath.includes('/product-images/')
    ) {
      setSignedUrl(rawUrlOrPath);
      return;
    }

    // Already signed
    if (rawUrlOrPath.includes('?token=')) {
      setSignedUrl(rawUrlOrPath);
      return;
    }

    const path = extractSlipStoragePath(rawUrlOrPath);
    if (!path || !isSupabaseConfigured()) {
      setSignedUrl(rawUrlOrPath);
      return;
    }

    setIsLoading(true);
    getSignedSlipUrl(path, 7200)
      .then((url) => {
        if (isMounted) {
          setSignedUrl(url || rawUrlOrPath);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSignedUrl(rawUrlOrPath);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [rawUrlOrPath]);

  return { signedUrl: signedUrl || rawUrlOrPath || null, isLoading };
}

/**
 * Uploads a bank deposit slip (Image or PDF) to the private 'order-slips' storage bucket.
 * Returns the storage path to record in the database.
 */
export async function uploadBankSlipFile(
  orderId: string,
  file: File,
  userId?: string | null
): Promise<{ path: string; bucket: string }> {
  let fileToUpload: File = file;

  if (file.type.startsWith('image/')) {
    fileToUpload = await compressToWebP(file, { maxWidth: 1400, maxHeight: 1400 });
  } else if (file.type !== 'application/pdf') {
    throw new Error('Unsupported file format. Please upload JPG, PNG, WebP, or PDF.');
  }

  const safeFileName = fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const folder = userId ? `${userId}` : `${orderId}`;
  const filePath = `${folder}/${Date.now()}-${safeFileName}`;

  if (!isSupabaseConfigured()) {
    throw new Error('Storage service is not configured.');
  }

  const { data, error } = await supabase.storage
    .from(ORDER_SLIPS_BUCKET)
    .upload(filePath, fileToUpload, {
      contentType: fileToUpload.type || 'image/webp',
      upsert: true,
    });

  if (error) {
    throw error;
  }

  return {
    path: data?.path || filePath,
    bucket: ORDER_SLIPS_BUCKET,
  };
}
