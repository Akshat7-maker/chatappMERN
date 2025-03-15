// let configAPI = {
//     withCredentials: true,
//     headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${JSON.parse(sessionStorage.getItem("user"))?.refreshToken}`
//     },
// }



// export default configAPI

let configAPI = () => ({
    withCredentials: true,
    headers: {
        "Authorization": `Bearer ${JSON.parse(sessionStorage.getItem("user"))?.refreshToken}`
    },
})

export default configAPI