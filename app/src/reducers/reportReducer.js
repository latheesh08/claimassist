import { 
    REPORT_ID,CLEAR_REPORT_ID
    } from "../constants/actionTypes";
    
    const initialState = {
        reportId :''
      };
    
    export default function odometer_picture(state = initialState , action) {
    
    switch(action.type){
        case REPORT_ID : {
            return {
                ...state,
                reportId: action.reportId
            }
        }
        case CLEAR_REPORT_ID:
            return {
              ...state,
              reportId :''  
            };
        default :
            return state
    
    }
    }