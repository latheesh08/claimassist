import {
    SELECTED_POSES, CLEAR_POSE_IMAGES, POSE_IMAGES, DELETE_POSE_IMAGES, RE_EDIT_POSE_PICTURE, RE_UPLOAD_FROM_POSES, STORE_INFERRED_POSE,
    SELECT_MORE_POSES, DELETE_SELECT_MORE_POSES, CLEAR_SELECT_MORE_POSES, ADD_TOTAL_IMAGES, UPLOADED_POSES, INTACT_DAMAGED, RE_EDIT_POSE_NAME, REMOVE_TOTAL_IMAGES
} from "../constants/actionTypes";

const initialState = {
    re_edit_name: '',
    re_upload: false,
    isReUploadFromPoses: false,
    poses: [],
    inferredPoses: [],
    poseimages: {
        'rear': [], 'rear_left': [], 'right': [],
        'rear_right': [], 'front': [], 'left': [],
        'front_left': [], 'front_right': [],
    },
    more_pose_images: {
        'rear': [], 'rear_left': [], 'right': [],
        'rear_right': [], 'front': [], 'left': [],
        'front_left': [], 'front_right': [],
    },
    uploaded_poses: {
        rear: false, rear_left: false, right: false, rear_right: false, front: false,
        left: false, front_left: false, front_right: false
    },
    totalImages: [],
    intact_damaged: {
        rear: false, rear_left: false, right: false, rear_right: false, front: false,
        left: false, front_left: false, front_right: false
    }
};

export default function selected_poses(state = initialState, action) {

    switch (action.type) {
        case STORE_INFERRED_POSE: {
            return {
                ...state,
                inferredPoses: [...state.inferredPoses.concat(action.inferredPoses)]
            }
        }
        case RE_UPLOAD_FROM_POSES: {
            return {
                ...state,
                isReUploadFromPoses: action.val
            }
        }
        case RE_EDIT_POSE_PICTURE: {
            return {
                ...state,
                re_upload: true
            }
        }
        case SELECTED_POSES: {
            return {
                ...state,
                poses: action.poses
            }
        }
        case RE_EDIT_POSE_NAME: {
            return {
                ...state,
                re_edit_name: action.poseName
            }
        }
        case POSE_IMAGES: {

            state.poseimages[action.title] = [action.pictures]
            return {
                ...state,
            }
        }
        case DELETE_POSE_IMAGES: {
            state.uploaded_poses[action.title] = false
            state.re_upload = true
            state.poseimages[action.title] = state.poseimages[action.title].filter((item, index) => index !== action.index)
            return {
                ...state
            }
        }
        case UPLOADED_POSES: {
            state.uploaded_poses[action.title] = true
            return {
                ...state
            }
        }
        case INTACT_DAMAGED: {
            state.intact_damaged[action.title] = !state.intact_damaged[action.title]
            return {
                ...state
            }
        }
        case CLEAR_POSE_IMAGES: {
            return {
                ...state,
                poses: [],
                re_edit_name: '',
                re_upload: false,
                isReUploadFromPoses: false,
                inferredPoses: [],
                poseimages: {
                    'rear': [], 'rear_left': [], 'right': [],
                    'rear_right': [], 'front': [], 'left': [],
                    'front_left': [], 'front_right': [],
                },
                more_pose_images: {
                    'rear': [], 'rear_left': [], 'right': [],
                    'rear_right': [], 'front': [], 'left': [],
                    'front_left': [], 'front_right': [],
                },
                uploaded_poses: {
                    rear: false, rear_left: false, right: false, rear_right: false, front: false,
                    left: false, front_left: false, front_right: false
                },
                totalImages: [],
                intact_damaged: {
                    rear: false, rear_left: false, right: false, rear_right: false, front: false,
                    left: false, front_left: false, front_right: false
                }
            }
        }
        case SELECT_MORE_POSES: {
            // var temp = ...state.more_pose_images[action.title]
            state.uploaded_poses[action.title] = true
            state.more_pose_images[action.title] = [...state.more_pose_images[action.title], action.pictures]
            return {
                ...state,
            }
        }
        case DELETE_SELECT_MORE_POSES: {
            // state.uploaded_poses[action.title] = false
            state.more_pose_images[action.title] = state.more_pose_images[action.title].filter((item, index) => index !== action.index)
            return {
                ...state
            }
        }
        case CLEAR_SELECT_MORE_POSES: {
            return {
                ...state,
                poses: [],
                re_edit_name: '',
                re_upload: false,
                isReUploadFromPoses: false,
                inferredPoses: [],
                poseimages: {
                    'rear': [], 'rear_left': [], 'right': [],
                    'rear_right': [], 'front': [], 'left': [],
                    'front_left': [], 'front_right': [],
                },
                more_pose_images: {
                    'rear': [], 'rear_left': [], 'right': [],
                    'rear_right': [], 'front': [], 'left': [],
                    'front_left': [], 'front_right': [],
                },
                uploaded_poses: {
                    rear: false, rear_left: false, right: false, rear_right: false, front: false,
                    left: false, front_left: false, front_right: false
                },
                totalImages: [],
                intact_damaged: {
                    rear: false, rear_left: false, right: false, rear_right: false, front: false,
                    left: false, front_left: false, front_right: false
                }
            }
        }
        case ADD_TOTAL_IMAGES: {
            return {
                ...state,
                totalImages: [...state.totalImages.concat(action.totalImages)]
            }
        }
        case REMOVE_TOTAL_IMAGES: {
            state.totalImages = state.totalImages.filter((it, id) => id !== state.totalImages.findIndex(it => it.image_id === action.id))
            return {
                ...state,
            }
        }
        default:
            return state

    }

}
