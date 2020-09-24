import { CLEAR_GRADES, STORE_GRADES } from "../constants/actionTypes";

const initialState = {
  grades: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case STORE_GRADES:
      return {
        grades: action.grades
      };
    case CLEAR_GRADES:
      return {
        grades: []
      };
    default:
      return state;
  }
};
