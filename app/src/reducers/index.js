import { combineReducers } from "redux";
import requestReducer from "./request";
import incidentReducer from "./incidents";
import userReducer from "./user";
import customerReducer from "./customerReducer";
import pictureReducer from "./picture";
import resultReducer from "./result";
import partReducer from "./parts";
import damageReducer from "./damages";
import gradeReducer from "./grades";
import posesReducer from "./posesreducer";
import vinReducer from "./vinReducer";
import reportReducer from './reportReducer';
import chooseAngleReducer from './chooseAngleReducer';
import analysisResultReducer from './analysisResults';

const rootReducer = combineReducers({
  requestReducer,
  incidentReducer,
  customerReducer,
  userReducer,
  pictureReducer,
  resultReducer,
  partReducer,
  damageReducer,
  gradeReducer,
  posesReducer,
  vinReducer,
  chooseAngleReducer,
  reportReducer,
  analysisResultReducer
});

export default rootReducer;
