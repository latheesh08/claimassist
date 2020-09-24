import {
  STORE_PICTURES,
  STORE_PICTURE_INFO,
  DELETE_PICTURE_INFO,
  CLEAR_PICTURES,
  REMOVE_PICTURE_BY_ID
} from "../constants/actionTypes";

const initialState = {
  pictures: []
};

export default function pictureReducer(state = initialState, action) {
  switch (action.type) {
    case STORE_PICTURES:
      return {
        ...state,
        pictures: action.pictures
      };
    case STORE_PICTURE_INFO:
      return {
        ...state,
        pictures: [...state.pictures, action.picture]
      };
    case DELETE_PICTURE_INFO:
      return {
        ...state,
        pictures: state.pictures.filter((item, index) => index !== action.index)
      };
    case REMOVE_PICTURE_BY_ID:
      console.log("INSIDE PICTURE REDUCER");
      console.log(action);
      return {
        ...state,
        pictures: state.pictures.filter(item => item.imageId !== action.id)
      };
    case CLEAR_PICTURES:
      return {
        ...state,
        pictures: []
      };
    default:
      return state;
  }
}
