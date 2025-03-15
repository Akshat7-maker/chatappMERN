import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
const db_connect = async () =>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_DB_URL}/${DB_NAME}`);
        console.log(`Database connected ${connectionInstance.connection.host}`);
        // return connectionInstance
        
    } catch (error) {
        console.log("Database connection faileddddd", error);
        throw error
        
    }
}

export default db_connect 