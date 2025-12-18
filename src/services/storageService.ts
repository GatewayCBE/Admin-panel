import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const uploadTurfImages = async (
  turfId: string,
  ownerId: string,
  files: File[]
): Promise<string[]> => {
  const urls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileRef = ref(
      storage,
      `turf_images/${turfId}/image_${i + 1}_${Date.now()}.jpg`
    );

    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    urls.push(url);
  }

  return urls;
};
