import { 
    VIN_NUMBER,VIN_FAILURE,VIN_SUCCESS,
    DELETE_VIN_NUMBER,
    } from "../constants/actionTypes";
    
    const initialState = {
        number : '',
        vin_Details : {},
        failure : false,
      };
    
    export default function odometer_picture(state = initialState , action) {
    
    switch(action.type){
        case VIN_NUMBER : {
            return {
                ...state,
                number: action.number
            }
        }

        case DELETE_VIN_NUMBER:
            return {
              ...state,
            //   pictures: state.pictures.filter((item, index) => index !== action.index)
            };
        case VIN_SUCCESS :
            return{
                ...state,
                vin_Details : action.detils
            }
        case VIN_FAILURE :
            return{
                ...state,
                failure : true
            }
    
        default :
            return state
    
    }
    }