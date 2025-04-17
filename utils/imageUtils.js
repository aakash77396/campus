// const fs = require('fs');
// const path = require('path');
// const cloudinary = require('cloudinary').v2;

// // Upload to Cloudinary
// const uploadToCloudinary = async (imagePath, options = {}) => {
//     try {
//         const result = await cloudinary.uploader.upload(imagePath, {
//             folder: "upload", // Folder in Cloudinary
//             public_id: path.basename(imagePath), // Filename in Cloudinary
//             resource_type: "image",
//         });
//         return result.secure_url;
//     } catch (error) {
//         throw new Error(`Error uploading to Cloudinary: ${error.message}`);
//     }
// };

// // Main function to process image
// const processAndUploadImage = async (imagePath, options = {}) => {
//     try {
//         // Ensure the file exists
//         if (!fs.existsSync(imagePath)) {
//             throw new Error(`File not found at path: ${imagePath}`);
//         }

//         // Upload to Cloudinary
//         const cloudinaryUrl = await uploadToCloudinary(imagePath, options);

//         // Clean up the temporary file
//         fs.unlinkSync(imagePath);

//         return {
//             success: true,
//             url: cloudinaryUrl
//         };
//     } catch (error) {
//         if (fs.existsSync(imagePath)) {
//             fs.unlinkSync(imagePath);
//         }
//         throw error;
//     }
// };

// module.exports = {
//     processAndUploadImage
// };
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Process image and upload to Cloudinary
 * @param {string} filePath - Path to uploaded file
 * @param {object} options - Processing options
 * @returns {Promise<object>} - Uploaded image data
 */
const processAndUploadImage = async (filePath, options = {}) => {
  try {
    // Process image with Sharp
    const processedImagePath = path.join(
      path.dirname(filePath),
      `processed-${path.basename(filePath)}`
    );
    
    // Get image metadata
    const metadata = await sharp(filePath).metadata();
    
    // Resize if needed (maintaining aspect ratio)
    let sharpInstance = sharp(filePath);
    if (options.resize) {
      sharpInstance = sharpInstance.resize({
        width: options.resize.width || undefined,
        height: options.resize.height || undefined,
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // Quality optimization
    sharpInstance = sharpInstance.jpeg({ quality: options.quality || 80 });
    
    // Save processed image
    await sharpInstance.toFile(processedImagePath);
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(processedImagePath, {
      folder: 'social_media_posts',
      resource_type: 'auto'
    });
    
    // Clean up temporary files
    fs.unlinkSync(filePath);
    fs.unlinkSync(processedImagePath);
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    // Clean up on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

/**
 * Process video and upload to Cloudinary
 * @param {string} filePath - Path to uploaded file
 * @returns {Promise<object>} - Uploaded video data
 */
const processAndUploadVideo = async (filePath) => {
  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'social_media_videos',
      resource_type: 'video',
      eager: [
        { format: 'mp4', transformation: [
          { width: 720, crop: 'scale' },
          { quality: 'auto:good' }
        ]}
      ],
      eager_async: true
    });
    
    // Clean up temporary file
    fs.unlinkSync(filePath);
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      thumbnail: result.secure_url.replace(/\.[^/.]+$/, ".jpg"),
      width: result.width,
      height: result.height,
      duration: result.duration
    };
  } catch (error) {
    // Clean up on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

/**
 * Delete media from Cloudinary
 * @param {string} publicId - Public ID of the media to delete
 * @param {string} type - Type of media ('image' or 'video')
 * @returns {Promise<object>} - Deletion result
 */
const deleteMedia = async (publicId, type = 'image') => {
  return await cloudinary.uploader.destroy(publicId, {
    resource_type: type === 'video' ? 'video' : 'image'
  });
};

module.exports = {
  processAndUploadImage,
  processAndUploadVideo,
  deleteMedia
};