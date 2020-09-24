import { STORE_APPLICATION_ID, CLEAR_APPLICATION_ID, STORE_USER_INFO, CLEAR_USER_INFO } from "../constants/actionTypes";


const initialState = {
  applicationId: '',
  userInfo: {}
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case STORE_APPLICATION_ID:
      return {
        ...state,
        applicationId: action.applicationId
      };
    case CLEAR_APPLICATION_ID:
      return {
        ...state,
        applicationId: ''
      };
    case STORE_USER_INFO:
      return {
        ...state,
        userInfo: action.userInfo
      };
    case CLEAR_USER_INFO:
      return {
        ...state,
        userInfo: {}
      };
    default:
      return state;
  }
}
