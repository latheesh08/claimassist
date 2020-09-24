
import { sendData } from "../../../../api/http_proxy";

export const postPose = async (image, userInfo) => {
    const payload = {
        incidentId: image.incidentId,
        imageId: image.imageId,
        imageType: image.type
    }
    try {
        const resp = await sendData('POST', process.env.REACT_APP_POSE_API_ENDPOINT, payload, userInfo, { "Content-Type": "application/json" });
        if(resp.error){
            console.log("postPose error");
            console.log(image)
            console.log(resp.error);
            throw {
                ...payload,
                error: resp.error
            }
        } else {
            console.log("postPose success response");
            console.log(resp.data);
            if(image.dataStore.userPose !== resp.data.inferredPose){
                console.log("---------- POSE MISMATCH ----------")
                console.log("---------- ------------- ----------")
                console.log(image.dataStore.userPose)
                console.log(resp.data.inferredPose)
                console.log("---------- ------------- ----------")
                console.log("---------- POSE MISMATCH ----------")
            }
            return resp.data
        }
    } catch (error) {
        console.log("postPose error");
        console.log(error);
        throw {
            ...payload,
            error: error
        }
    }
}  