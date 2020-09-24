import {
  UPDATE_PART,
  ADD_PART,
  STORE_PARTS,
  CLEAR_PARTS,
  REMOVE_PART,
  SHOW_DELETE_ALERT,
  REMOVE_PARTS_BY_IMAGE_ID
} from "../constants/actionTypes";

const initialState = {
  parts: [],
  maxId: 0,
  showRemovePartAlert: true
};

export default (state = initialState, action) => {
  switch (action.type) {
    case STORE_PARTS:
      return {
        ...state,
        parts: action.parts,
        maxId: action.parts.length - 1,
        showRemovePartAlert: true
      };
    case ADD_PART:
      const part = { ...action.part, id: state.maxId + 1 };
      return {
        ...state,
        parts: [...state.parts, part],
        maxId: state.maxId + 1
      };
    case UPDATE_PART:
      return {
        ...state,
        parts: state.parts.map(item => {
          if (item.id === action.part.id) {
            return action.part;
          } else {
            return item;
          }
        })
      };
    case REMOVE_PART:
      return {
        ...state,
        parts: state.parts.filter(item => item.id !== action.id)
      };
    case CLEAR_PARTS:
      return {
        ...state,
        parts: [],
        maxId: 0
      };
    case REMOVE_PARTS_BY_IMAGE_ID:
      return {
        ...state,
        parts: state.parts.filter(item => item.imageId !== action.id)
      };
    case SHOW_DELETE_ALERT:
      return {
        ...state,
        showRemovePartAlert: action.showAlert
      };
    default:
      return state;
  }
};
