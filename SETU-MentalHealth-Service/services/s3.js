const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// Create an S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadImageToS3 = async (file) => {
  // Generate unique filename with timestamp to avoid conflicts
  const timestamp = Date.now();
  const fileExtension = file.originalname.split('.').pop();
  const uniqueFileName = `assessment_${timestamp}.${fileExtension}`;
  const key = `Mental_health/global/assessments/${uniqueFileName}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  // Upload to S3
  await s3Client.send(command);

  // Return the S3 key instead of presigned URL
  return key;
};

const getImageUrl = async (imageKey) => {
  if (!imageKey) return null;
  
  try {
    // Generate a presigned URL for temporary access (expires in 1 hour)
    const presignedUrl = await getSignedUrl(s3Client, new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: imageKey,
    }), { expiresIn: 3600 });

    return presignedUrl;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return null;
  }
};

module.exports = { uploadImageToS3, getImageUrl };
