import {
  STORE_RESULTS,
  CLEAR_RESULTS,
  STORE_INCIDENT_STATE,
  STORE_IMAGES,
  REMOVE_IMAGE,
  STORE_APPRAISAL,
  CLEAR_APPRAISAL,
  CLONE_APPRAISAL,
  CLEAR_CLONED_APPRAISAL,
  REMOVE_DAMAGE,
  UPDATE_APPRAISAL,
  UPDATE_DAMAGE_SIZE,
  ADD_APPRAISAL_PART,
  ADD_APPRAISAL_DAMAGE,
  REMOVE_APPRAISAL_DAMAGE,
  STORE_ESTIMATE
} from "../constants/actionTypes";

const initialState = {
  images: [],
  incidents: null,
  idtState: "",
  appraisal: null,
  clonedAppraisal: null,
  estimate: null
};

export default function resultReducer(state = initialState, action) {
  switch (action.type) {
    case CLEAR_APPRAISAL:
      return {
        ...state,
        appraisal: null
      };
    case STORE_APPRAISAL:
      return {
        ...state,
        appraisal: action.appraisal
      };
    case CLEAR_CLONED_APPRAISAL:
      return {
        ...state,
        clonedAppraisal: null
      };
    case CLONE_APPRAISAL:
      return {
        ...state,
        clonedAppraisal: action.appraisal
      };
    case REMOVE_DAMAGE:
      const { partId, damageId } = action.damage;
      return {
        ...state,
        clonedAppraisal: {
          ...state.clonedAppraisal,
          parts: state.clonedAppraisal.parts.map(part => {
            if (part.partId === partId) {
              // find the damage
              return {
                ...part,
                damages: part.damages.filter(
                  damage => damage.damageId !== damageId
                )
              };
            } else {
              return part;
            }
          })
        }
      };
    case UPDATE_APPRAISAL:
      return {
        ...state,
        clonedAppraisal: {
          ...state.clonedAppraisal,
          parts: state.clonedAppraisal.parts.map(part => {
            if (part.partId === action.part.partId) {
              return action.part;
            } else {
              return part;
            }
          })
        }
      };
    case UPDATE_DAMAGE_SIZE:
      return {
        ...state,
        clonedAppraisal: {
          ...state.clonedAppraisal,
          parts: state.clonedAppraisal.parts.map(part => {
            if (part.partId === action.damageSizeOutput.part.partId) {
              return {
                ...part,
                damages: part.damages.map(damage => {
                  if (damage.damageId === action.damageSizeOutput.damage.damageId) {
                    console.log("REDUX UPDATING DAMAGE SIZE!");
                    console.log(action.damageSizeOutput.damage.dmg_size);
                    return {
                      ...damage,
                      size : action.damageSizeOutput.damage.size
                    }
                  }else{
                    return damage
                  }
                })
              }
            }else{
              return part;
            }
          })
        }
      };
    case ADD_APPRAISAL_DAMAGE:
      return {
        ...state,
        clonedAppraisal: {
          ...state.clonedAppraisal,
          parts: state.clonedAppraisal.parts.map(part => {
            if (part.partId === action.partId) {
              console.log("PART LOOP");
              console.log(part);
              part.subCategory = "damage";
              console.log("DAMAGE SOURCE");
              console.log(action.damage);
              if (part.hasOwnProperty("damages")) {
                part.damages.push(action.damage);
                part.damageSummary = part.damages
                  .map(dmg => dmg.type)
                  .join(",");
              } else {
                part.damages = [action.damage];
                part.damageSummary = action.damage.type;
              }
              // return [...part, action.damage];
              return part;
            } else {
              return part;
            }
          })
        }
      };
    case REMOVE_APPRAISAL_DAMAGE: // pass in partId and damageId
      console.log("REDUX REMOVE APPRAISAL DAMAGE!");
      console.log(action);
      return {
        ...state,
        clonedAppraisal: {
          ...state.clonedAppraisal,
          parts: state.clonedAppraisal.parts.map(part => {
            if (part.partId === action.partId) {
              return {
                ...part,
                damages: part.damages.filter(
                  damage => damage.damageId !== action.damageId
                )
              };
            } else {
              return part;
            }
          })
        }
      };
    case ADD_APPRAISAL_PART:
      return {
        ...state,
        clonedAppraisal: {
          ...state.clonedAppraisal,
          parts: [...state.clonedAppraisal.parts, action.part]
        }
      };
    case STORE_INCIDENT_STATE:
      return {
        ...state,
        idtState: action.idtState
      };
    case STORE_ESTIMATE:
      return {
        ...state,
        estimate: action.estimate
      };
    case STORE_RESULTS:
      // console.log("INSIDE REDUCER");
      // console.log(action);
      return {
        ...state,
        appraisal: action.appraisal,
        clonedAppraisal: action.clonedAppraisal
      };
    case CLEAR_RESULTS:
      return {
        ...state,
        appraisal: null,
        clonedAppraisal: null
      };
    case STORE_IMAGES:
      console.log("STORE IMAGES");
      console.log(action);
      return {
        ...state,
        images: action.images
      };
    case REMOVE_IMAGE:
      return {
        ...state,
        images: state.images.filter(item => item.imageId !== action.imageId)
      };
    default:
      return state;
  }
}
