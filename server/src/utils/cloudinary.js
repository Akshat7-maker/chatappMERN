import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET
})


const uploadOnCloudinary = async(localFilePath)=>{
    try {
        
        if(!localFilePath) return null

        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })

        // if file is sucessfully uploaded 
        // console.log("file is sucessfully uploaded", response.url)
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath)  // remove the locally saved temporary file as uplpod operation got failed
        return null
        
    }

}

export const deleteFomCloudinary = async (publicId) =>{
    try {
        if(!publicId) return

        // delete from cloudinary 
        const response = await cloudinary.uploader.destroy(publicId)
        console.log("Delete from cloudinary ", result)
    } catch (error) {
        console.error("Error deleting image:", error);
        
    }

}

export default uploadOnCloudinary