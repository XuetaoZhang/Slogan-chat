import { S3 } from "aws-sdk";
import { toaster } from "@/utils";

const extractFilePath = (url: string) => {
  const regex = /\/([^\/]+\/[^\/?]+)\?/;
  const match = url.match(regex);
  return match ? decodeURIComponent(match[1]) : null;
};

const deleteFile = async (fileUrl: string) => {
  try {
    const s3 = new S3({
      accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY,
      secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_KEY,
      endpoint: process.env.NEXT_PUBLIC_S3_ENDPOINT,
    });
    const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
    const filePath = extractFilePath(fileUrl);

    if (!bucketName) {
      throw new Error("S3 bucket name is not defined");
    }
    if (!filePath) {
      throw new Error("File name is not defined");
    }

    const params = {
      Bucket: bucketName,
      Key: filePath,
    };

    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error("Delete failed:", error);
    toaster("error", "Delete failed! Please try again.");
  }
};

export default deleteFile;
