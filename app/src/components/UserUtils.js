import { get } from "../api/http_proxy"

export const getUser = async (param, id, token) => {
    console.log("in get user");
    const headers = { "Accept": "application/json" };
    const url = param === 'userId' ? process.env.REACT_APP_USERS_API_ENDPOINT + id : process.env.REACT_APP_USERS_API_ENDPOINT + `?` + param + `=` + id;
    console.log(url);
    try {
        const userResp = await get(url, { role: 'admin', token : token }, headers);
        console.log("====================================");
        console.log("GET USER RESP");
        console.log(userResp);
        if (typeof(userResp.data) !== "undefined" && typeof(userResp.data.role) !== "undefined" && userResp.data.role.length > 0) {

            let user = userResp.data
            const role = user.role;
            user.token = token;
            user.isUnderwriting = role.includes("policy") ? true : false;
            user.isSubmitter = role.includes("submitter") ? true : false;
            user.isReviewer = role.includes("reviewer") ? true : false;
            user.isSupervisor = role.includes("supervisor") ? true : false;
            return user
        } else {
            
            throw { error : "user is missing a role" }
        }
    } catch (error) {
        console.log("GET USER ERROR");
        console.log(error);
        throw error
    }
};