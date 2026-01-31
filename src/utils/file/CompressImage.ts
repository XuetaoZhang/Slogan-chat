const compressImage = async (
  file: File,
  maxSizeMB: number = 1,
  quality: number = 0.8
) => {
  return new Promise<File>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0, img.width, img.height);

        const originalFormat = file.type || "image/jpeg";
        let currentQuality = quality;

        const compress = async (q: number): Promise<Blob | null> => {
          return new Promise((res) => {
            canvas.toBlob((blob) => res(blob), originalFormat, q);
          });
        };

        let blob = await compress(currentQuality);

        while (
          blob &&
          blob.size > maxSizeMB * 1024 * 1024 &&
          currentQuality > 0.1
        ) {
          currentQuality -= 0.05;
          blob = await compress(currentQuality);
        }

        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: originalFormat,
          });
          resolve(compressedFile);
        } else {
          reject(new Error("Compression failed"));
        }
      };
    };
  });
};

export default compressImage;
