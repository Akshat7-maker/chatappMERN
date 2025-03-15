import { useState } from "react";


const useLoder = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const withLoder = async (func) => {
        setLoading(true);
        setError(null);
        try {
            await func();
        } catch (error) {
            console.log(error);
            setError(error.response?.data?.message || "Something went wrong");
        }
        finally {
            setLoading(false);
        }
    }
    return [loading, error, withLoder]
}

export default useLoder