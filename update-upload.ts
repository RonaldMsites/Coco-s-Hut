const dataURLtoBlob = (dataurl: string) => {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : '';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {type:mime});
};

const uploadToCloudinary = async (fileOrDataUrl: string | File, resourceType: 'image' | 'video' | 'auto' = 'auto', onProgress?: (p: number) => void): Promise<string> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  
  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary configuration missing. Please add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in AI Studio Settings -> Environment Variables.");
  }
  
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  const formData = new FormData();
  
  let fileToUpload: string | Blob | File = fileOrDataUrl;
  if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:')) {
    try {
      fileToUpload = dataURLtoBlob(fileOrDataUrl);
    } catch (e) {
      console.error("Failed to convert data URL to Blob", e);
    }
  }
  
  formData.append('file', fileToUpload);
  formData.append('upload_preset', uploadPreset);
  
  try {
    if (onProgress) onProgress(30);
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Upload failed with status ${response.status}: ${errText}`);
    }
    
    const data = await response.json();
    if (onProgress) onProgress(100);
    return data.secure_url;
  } catch (err: any) {
    console.error("Cloudinary upload error:", err);
    throw new Error(`${err.message}`);
  }
};
