import {
  STORE_CLAIMS,
  STORE_CURRENT_CLAIM,
  CLEAR_CURRENT_CLAIM,
  STORE_INCIDENT_ID,
  RE_EDIT
} from "../constants/actionTypes";

const initialState = {
  claims: [],
  currentClaim: null,
  current_incident_id : '',
  reEdit : false
};

export default (state = initialState, action) => {
  switch (action.type) {
    case STORE_CLAIMS:
      return {
        ...state,
        claims: action.claims
      };
    case STORE_CURRENT_CLAIM:
      return {
        ...state,
        currentClaim: action.claim
      };
    case CLEAR_CURRENT_CLAIM:
      return {
        ...state,
        currentClaim: null,
      };
    case STORE_INCIDENT_ID:
      return{
        ...state,
        current_incident_id : action.id
      }
    case RE_EDIT:
      return{
        ...state,
        reEdit : action.reEdit
      }
    default:
      return state;
  }
};
