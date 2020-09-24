import {
CHOOSE_ANGLE_INFO,CLEAR_CHOOSE_ANGLE_INFO,ISUNDERWRITING,ISFOURPASE
} from "../constants/actionTypes";

const initialState ={
    // selected_poses : null ,
    selected_poses : [
        {
            image: require('../scenes/home/scenes/choose-angle/AngleImages/front.png'),
            title: "Front",
            description : "Take photos of the front of your car.",
            storage_name : "front",
            select : false
        },
        {
            image: require('../scenes/home/scenes/choose-angle/AngleImages/front_left.png'),
            title: "Front Left",
            description : "Take photos of the front left of your car.",
            storage_name : "front_left",
            select : false
        },
        {
            image: require('../scenes/home/scenes/choose-angle/AngleImages/left.png'),
            title: "Left",
            description : "Take photos of the left of your car.",
            storage_name : "left",
            select : false
        },
        {
            image: require('../scenes/home/scenes/choose-angle/AngleImages/rear_left.png'),
            title: "Rear Left",
            description : "Take photos of the rear left of your car.",
            storage_name : "rear_left",
            select : false
        },
        {
            image: require('../scenes/home/scenes/choose-angle/AngleImages/rear.png'),
            title: "Rear",
            description : "Take photos of the rear of your car.",
            storage_name : "rear",
            select : false
        },
        {
            image: require('../scenes/home/scenes/choose-angle/AngleImages/rear_right.png'),
            title: "Rear Right",
            description :"Take photos of the rear right of your car.",
            storage_name : "rear_right",
            select : false
        },
        {
            image: require('../scenes/home/scenes/choose-angle/AngleImages/right.png'),
            title: "Right",
            description : "Take photos of the right of your car.",
            storage_name : "right",
            select : false
        },
        {
            image: require('../scenes/home/scenes/choose-angle/AngleImages/front_right.png'),
            title: "Front Right",
            description : "Take photos of the front right of your car.",
            storage_name : "front_right",
            select : false
        },
    ]
}

export default function choose_angle(state = initialState , action){

    switch(action.type){
        case CHOOSE_ANGLE_INFO : {
            return{
                ...state,
                selected_poses: action.data,
            }
        }
        case CLEAR_CHOOSE_ANGLE_INFO :{
            return{
                ...state,
                selected_poses : [
                    {
                        image: require('../scenes/home/scenes/choose-angle/AngleImages/front.png'),
                        title: "Front",
                        description : "Take photos of the front of your car.",
                        storage_name : "front",
                        select : false
                    },
                    {
                        image: require('../scenes/home/scenes/choose-angle/AngleImages/front_left.png'),
                        title: "Front Left",
                        description : "Take photos of the front left of your car.",
                        storage_name : "front_left",
                        select : false
                    },
                    {
                        image: require('../scenes/home/scenes/choose-angle/AngleImages/left.png'),
                        title: "Left",
                        description : "Take photos of the left of your car.",
                        storage_name : "left",
                        select : false
                    },
                    {
                        image: require('../scenes/home/scenes/choose-angle/AngleImages/rear_left.png'),
                        title: "Rear Left",
                        description : "Take photos of the rear left of your car.",
                        storage_name : "rear_left",
                        select : false
                    },
                    {
                        image: require('../scenes/home/scenes/choose-angle/AngleImages/rear.png'),
                        title: "Rear",
                        description : "Take photos of the rear of your car.",
                        storage_name : "rear",
                        select : false
                    },
                    {
                        image: require('../scenes/home/scenes/choose-angle/AngleImages/rear_right.png'),
                        title: "Rear Right",
                        description :"Take photos of the rear right of your car.",
                        storage_name : "rear_right",
                        select : false
                    },
                    {
                        image: require('../scenes/home/scenes/choose-angle/AngleImages/right.png'),
                        title: "Right",
                        description : "Take photos of the right of your car.",
                        storage_name : "right",
                        select : false
                    },
                    {
                        image: require('../scenes/home/scenes/choose-angle/AngleImages/front_right.png'),
                        title: "Front Right",
                        description : "Take photos of the front right of your car.",
                        storage_name : "front_right",
                        select : false
                    },
                ]
            }
        }
        case ISUNDERWRITING :{
            return{
                ...state,
                selected_poses : [
                    {
                        image: require('../scenes/home/scenes/choose-angle/AngleImages/front.png'),
                        title: "Front",
                        description : "Take photos of the front of your car.",
                        storage_name : "front",
                        select : true
                    },
                    {
                        image: require('../scenes/home/scenes/choose-angle/AngleImages/front_left.png'),
                        title: "Front Left",
                        description : "Take photos of the front left of your car.",
                        storage_name : "front_left",
                        select : true
                    },
                    {
                        image: require('../scenes/home/scenes/choose-angle/AngleImages/left.png'),
                        title: "Left",
                        description : "Take photos of the left of your car.",
                        storage_name : "left",
                        select : true
                    },
                    {
                        image: require('../scenes/home/scenes/choose-angle/AngleImages/rear_left.png'),
                        title: "Rear Left",
                        description : "Take photos of the rear left of your car.",
                        storage_name : "rear_left",
                        select : true
                    },
                    {
                        image: require('../scenes/home/scenes/choose-angle/AngleImages/rear.png'),
                        title: "Rear",
                        description : "Take photos of the rear of your car.",
                        storage_name : "rear",
                        select : true
                    },
                    {
                        image: require('../scenes/home/scenes/choose-angle/AngleImages/rear_right.png'),
                        title: "Rear Right",
                        description :"Take photos of the rear right of your car.",
                        storage_name : "rear_right",
                        select : true
                    },
                    {
                        image: require('../scenes/home/scenes/choose-angle/AngleImages/right.png'),
                        title: "Right",
                        description : "Take photos of the right of your car.",
                        storage_name : "right",
                        select : true
                    },
                    {
                        image: require('../scenes/home/scenes/choose-angle/AngleImages/front_right.png'),
                        title: "Front Right",
                        description : "Take photos of the front right of your car.",
                        storage_name : "front_right",
                        select : true
                    },
                ]
            }
        }
        case ISFOURPASE : {
            return{
                ...state,
                selected_poses :[
                    {
                        image: require('../scenes/home/scenes/choose-angle/AngleImages/front.png'),
                        title: "Front",
                        description : "Take photos of the front of your car.",
                        storage_name : "front",
                        select : true
                    },
                    {
                        image: require('../scenes/home/scenes/choose-angle/AngleImages/right.png'),
                        title: "Right",
                        description : "Take photos of the right of your car.",
                        storage_name : "right",
                        select : true
                    },
                    {
                        image: require('../scenes/home/scenes/choose-angle/AngleImages/rear.png'),
                        title: "Rear",
                        description : "Take photos of the rear of your car.",
                        storage_name : "rear",
                        select : true
                    },
                    {
                        image: require('../scenes/home/scenes/choose-angle/AngleImages/left.png'),
                        title: "Left",
                        description : "Take photos of the left of your car.",
                        storage_name : "left",
                        select : true
                    },
                ]
            }
        }
        default:
                return state
    }

}