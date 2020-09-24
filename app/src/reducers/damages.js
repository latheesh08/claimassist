import {
  UPDATE_DAMAGE,
  ADD_DAMAGE,
  STORE_DAMAGES,
  CLEAR_DAMAGES,
  REMOVE_DAMAGE,
  SHOW_DELETE_ALERT,
  REMOVE_DAMAGES_BY_IMAGE_ID,
  RESET_MODIFIED_FLAG
} from "../constants/actionTypes";

const initialState = {
  damages: [],
  maxId: 0,
  showRemoveDamageAlert: true,
  modified: false
};

export default (state = initialState, action) => {
  switch (action.type) {
    case RESET_MODIFIED_FLAG:
      return {
        ...state,
        modified: false
      };
    case STORE_DAMAGES:
      // console.log("STORING DAMAGES...");
      // console.log(action.damages);
      return {
        ...state,
        damages: action.damages,
        maxId: action.damages.length - 1,
        showRemoveDamageAlert: true
      };
    case ADD_DAMAGE:
      const damage = { ...action.damage, id: state.maxId + 1 };
      return {
        ...state,
        damages: [...state.damages, damage],
        maxId: state.maxId + 1,
        modified: true
      };
    case UPDATE_DAMAGE:
      return {
        ...state,
        modified: true,
        damages: state.damages.map(item => {
          if (item.id === action.damage.id) {
            return action.damage;
          } else {
            return item;
          }
        })
      };
    case REMOVE_DAMAGE:
      console.log("REMOVING DAMAGE...");
      // when you remove damage mark all the rest as modified
      return {
        ...state,
        modified: true,
        damages: state.damages.filter(item => item.damageId !== action.damage.damageId)
      };
    case CLEAR_DAMAGES:
      return {
        ...state,
        damages: [],
        maxId: 0
      };
    case REMOVE_DAMAGES_BY_IMAGE_ID:
      return {
        ...state,
        damages: state.damages.filter(item => item.imageId !== action.id)
      };
    case SHOW_DELETE_ALERT:
      return {
        ...state,
        showRemoveDamageAlert: action.showAlert
      };
    default:
      return state;
  }
};
