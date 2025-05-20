import sharp from 'sharp';
import fs from 'fs';

/**
 * 
 * @param {*} inputPath the absolute path of the input file (this input file is temporary and will be deleted by this function)
 * @param {*} compressedUploadDir the target absolute output directory the file will be stored in
 * @param {*} originalFileName 
 * @returns object with relative path to compressed image
 */
export async function compressUploadImage(inputPath, compressedUploadDir, originalFileName, resize_width = 1080, out_quality = 75){

    const outputPath = `${compressedUploadDir}/${originalFileName}.jpg`;

    try {

        const compressed_file = await sharp(inputPath)
        .resize({width: resize_width})
        .jpeg({quality: out_quality})
        .toFile(outputPath);
        
        // cleanup temp file
        fs.unlinkSync(inputPath);
        
        return {success: true, relpath: `compressed/${originalFileName}.jpg`};

    }
    catch (err){
        console.error("Error while compressing image: ", err);
        return {success: false, message: "Cannot post image at the moment. Compression failed. Please try again later."};
    }

} 