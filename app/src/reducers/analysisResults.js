import { 
   STORE_ANALYSIS_RESULTS
    } from "../constants/actionTypes";
    
    const initialState = {
        result : {}
      };
    
    export default function analys_results(state = initialState , action) {
    
    switch(action.type){
        case STORE_ANALYSIS_RESULTS : {
            return {
                ...state,
                result : action.result
            }
        }
        default :
            return state
    
    }
    }