import {
  STORE_INCIDENTS,
  DIRTY_CURRENT_INCIDENT,
  STORE_CURRENT_INCIDENT,
  CLEAR_CURRENT_INCIDENT,
  DELETE_IMAGES,
  RE_EDIT,
  RE_UPLOAD
} from "../constants/actionTypes";

const initialState = {
  incidents: [],
  currentIncident: null,
  dirtyIncident: false,
  reEdit: false,
  reUpload : {
    odometer : true,
    license : true,
    registration : true,
    driving : true
  },
  // reUpload : true
};

export default (state = initialState, action) => {
  switch (action.type) {
    case STORE_INCIDENTS:
      return {
        ...state,
        incidents: action.incidents
      };
    case DIRTY_CURRENT_INCIDENT:
      console.log("reducer dirty incident");
      console.log(action);
      return {
        ...state,
        dirtyIncident: action.dirty
      };
    case STORE_CURRENT_INCIDENT:
      console.log("reducer incident store");
      console.log(action);
      return {
        ...state,
        currentIncident: action.incident
      };
    case CLEAR_CURRENT_INCIDENT:
      return {
        ...state,
        currentIncident: null,
        reEdit: false,
        reUpload : {
          odometer : true,
          license : true,
          registration : true,
          driving : true
        }
      };
    case DELETE_IMAGES:
      state.currentIncident.images = state.currentIncident.images.filter((item) => item.contentType !== action.name)
      return {
        ...state
      }
    case RE_EDIT:
      return {
        ...state,
        reEdit: action.reEdit
      }
    case RE_UPLOAD :
      state.reUpload[action.name] = action.bool
      return {
        ...state
      }
    // case ADD_VEHICLE:
    //   console.log("VEHICLE ADDING IN REDUX");
    //   console.log(action.vehicle);
    //   return {
    //     ...state,
    //     currentIncident: {
    //       ...state.currentIncident,
    //       vehicles: [ action.vehicle ]
    //     }
    //   }
    // case UPDATE_VEHICLE:
    //   console.log("IN UPDATE VEHICLE IN REDUX");
    //   console.log(action);
    //   console.log(state.currentIncident);
    //   return {
    //     ...state,
    //     currentIncident: {
    //       ...state.currentIncident,
    //       vehicles: state.currentIncident.vehicles.map(vehicle => {
    //         if(vehicle.vehicleId === action.vehicle.vehicleId){
    //           console.log("VEHICLE UPDATING IN REDUX");
    //           console.log(action.vehicle);
    //           return action.vehicle
    //         }else{
    //           return vehicle
    //         }
    //       })
    //     }
    //   };
    // case REMOVE_VEHICLE:
    //   return {
    //     ...state,
    //     currentIncident: {
    //       ...state.currentIncident,
    //       vehicles: state.currentIncident.vehicles.filter(
    //         vehicle => vehicle.vehicleId !== action.vehicle.vehicleId
    //       )
    //     }
    //   };
    default:
      return state;
  }
};
