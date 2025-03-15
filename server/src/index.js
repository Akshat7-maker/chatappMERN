import "dotenv/config";
import { httpServer } from "./app.js";
import db_connect from "./db/db.js";

db_connect().then(() => {
    httpServer.listen(8000, () => {
        console.log("Server is running on port 8000");
    });

    httpServer.on("error", (error) => console.log(error));
}).catch((error) => console.log("Database connection failed", error));