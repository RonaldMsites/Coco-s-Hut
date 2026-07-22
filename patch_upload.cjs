const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

const newUploadToCloudinary = `const uploadToCloudinary = (fileOrDataUrl: string | File, resourceType: 'image' | 'video' | 'auto' = 'auto', onProgress?: (p: number) => void): Promise<string> => {
  return new Promise((resolve, reject) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return reject(new Error("Cloudinary configuration missing. Please add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in AI Studio Settings -> Environment Variables."));
    }

    const url = \`https://api.cloudinary.com/v1_1/\${cloudName}/\${resourceType}/upload\`;
    const formData = new FormData();
    formData.append('file', fileOrDataUrl);
    formData.append('upload_preset', uploadPreset);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url);
        } catch (err) {
          reject(new Error('Invalid response from Cloudinary'));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.error?.message || 'Upload failed'));
        } catch (err) {
          reject(new Error(\`Upload failed with status \${xhr.status}\`));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(formData);
  });
};`;

code = code.replace(/const uploadToCloudinary = async.*?\n\};\n/s, newUploadToCloudinary + '\n');

// Also update ProductEditorModal to have uploadProgress state
code = code.replace(
  `const [isUploading, setIsUploading] = useState(false);`,
  `const [isUploading, setIsUploading] = useState(false);\n  const [uploadProgress, setUploadProgress] = useState<{status: string, percent: number} | null>(null);`
);

// Update images upload to Cloudinary call to include progress
code = code.replace(
  `return await uploadToCloudinary(item, 'image');`,
  `return await uploadToCloudinary(item, 'image', (p) => setUploadProgress({ status: 'Uploading Images', percent: p }));`
);

// Update video upload to Cloudinary call to include progress
code = code.replace(
  `uploadedVideoUrl = await uploadToCloudinary(video, 'video');`,
  `uploadedVideoUrl = await uploadToCloudinary(video, 'video', (p) => setUploadProgress({ status: 'Uploading Video', percent: p }));`
);

// clear progress when done
code = code.replace(
  `setIsUploading(false);`,
  `setIsUploading(false);\n      setUploadProgress(null);`
);

// Update button text to show progress
code = code.replace(
  `{isUploading ? 'Uploading...' : 'Save Product'}`,
  `{isUploading ? (uploadProgress ? \`\${uploadProgress.status} (\${uploadProgress.percent}%)\` : 'Uploading...') : 'Save Product'}`
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
