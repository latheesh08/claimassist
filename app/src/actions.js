import {
  STORE_CUSTOMER_INFO,
  STORE_USER_INFO,
  STORE_APPLICATION_ID,
  CLEAR_APPLICATION_ID,
  REQUEST_FULFILLED,
  REQUEST_PENDING,
  // REQUEST_REJECTED,
  STORE_PICTURES,
  STORE_PICTURE_INFO,
  DELETE_PICTURE_INFO,
  STORE_RESULTS,
  STORE_INCIDENT_STATE,
  STORE_APPRAISAL,
  CLONE_APPRAISAL,
  UPDATE_APPRAISAL,
  UPDATE_DAMAGE_SIZE,
  CLEAR_CLONED_APPRAISAL,
  CLEAR_APPRAISAL,
  // UPDATE_SHAPE,
  CLEAR_PICTURES,
  CLEAR_RESULTS,
  CLEAR_CUSTOMER_INFO,
  CLEAR_USER_INFO,
  STORE_PARTS,
  ADD_PART,
  UPDATE_PART,
  CLEAR_PARTS,
  REMOVE_PART,
  STORE_DAMAGES,
  REMOVE_PARTS_BY_IMAGE_ID,
  ADD_DAMAGE,
  UPDATE_DAMAGE,
  CLEAR_DAMAGES,
  REMOVE_DAMAGE,
  SHOW_DELETE_ALERT,
  REMOVE_PICTURE_BY_ID,
  REMOVE_DAMAGES_BY_IMAGE_ID,
  RESET_MODIFIED_FLAG,
  STORE_INCIDENTS,
  STORE_IMAGES,
  REMOVE_IMAGE,
  CLEAR_GRADES,
  STORE_GRADES,
  CLEAR_INCIDENTS,
  DIRTY_CURRENT_INCIDENT,
  STORE_CURRENT_INCIDENT,
  CLEAR_CURRENT_INCIDENT,
  ADD_APPRAISAL_PART,
  ADD_APPRAISAL_DAMAGE,
  REMOVE_APPRAISAL_DAMAGE,

  //Estimate
  STORE_ESTIMATE,

  REPORT_ID,
  CLEAR_REPORT_ID,

  SELECTED_POSES,
  UPLOADED_POSES,
  INTACT_DAMAGED,
  CHOOSE_ANGLE_INFO,
  CLEAR_CHOOSE_ANGLE_INFO,
  ISUNDERWRITING,

  VIN_NUMBER,
  DELETE_VIN_NUMBER,

  VIN_SUCCESS,
  VIN_FAILURE,

  RE_EDIT_POSE_PICTURE,

  POSE_IMAGES,
  DELETE_POSE_IMAGES,
  CLEAR_POSE_IMAGES,

  SELECT_MORE_POSES,
  DELETE_SELECT_MORE_POSES,
  CLEAR_SELECT_MORE_POSES,
  STORE_INFERRED_POSE,

  ADD_TOTAL_IMAGES,

  RE_EDIT,
  RE_EDIT_POSE_NAME,
  RE_UPLOAD_FROM_POSES,
  RE_UPLOAD,

  STORE_ANALYSIS_RESULTS,
  REMOVE_TOTAL_IMAGES,
  DELETE_IMAGES
} from "./constants/actionTypes";

const _requestPending = () => {
  return {
    type: REQUEST_PENDING
  };
};

// const _requestRejected = () => {
//   return {
//     type: REQUEST_REJECTED
//   };
// };

const _requestFulfilled = () => {
  return {
    type: REQUEST_FULFILLED
  };
};

export const storeCustomerInfo = customerInfo => {
  return dispatch => {
    dispatch(_storeCustomerInfo(customerInfo));
  };
};
const _storeCustomerInfo = customerInfo => {
  return {
    type: STORE_CUSTOMER_INFO,
    customerInfo: customerInfo
  };
};

export const storeUserInfo = userInfo => {
  return dispatch => {
    dispatch(_storeUserInfo(userInfo));
  };
};
const _storeUserInfo = userInfo => {
  return {
    type: STORE_USER_INFO,
    userInfo: userInfo
  };
};

export const storeApplicationId = applicationId => {
  return dispatch => {
    dispatch(_storeApplicationId(applicationId));
  };
};
const _storeApplicationId = applicationId => {
  return {
    type: STORE_APPLICATION_ID,
    applicationId: applicationId
  };
};

export function store_analysis_results(args) {
  return (dispatch) => {
    dispatch({
      type: STORE_ANALYSIS_RESULTS,
      result: args
    });
  };
}

export const selectedPoses = poses => {
  return dispatch => {
    dispatch(_selectedposes(poses));
  };
};
const _selectedposes = poses => {
  return {
    type: SELECTED_POSES,
    poses: poses
  };
};

export const reEdit = edit => {
  return dispatch =>{
    dispatch(_reedit(edit));
  }
};
const _reedit = edit => {
  return{
    type : RE_EDIT,
    reEdit : edit
  }
}

export const reEditPoseName = name => {
  return dispatch =>{
    dispatch(_reEditPoseName(name));
  }
};
const _reEditPoseName = name => {
  return{
    type : RE_EDIT_POSE_NAME,
    poseName : name
  }
}

export const uploadedPoses = title => {
  return dispatch => {
    dispatch(_uploadedPoses(title));
  };
};
const _uploadedPoses = title => {
  return {
    type: UPLOADED_POSES,
    title: title
  };
};

export const intact_damaged = title => {
  return dispatch => {
    dispatch(_intact_damaged(title));
  };
};
const _intact_damaged = title => {
  return {
    type: INTACT_DAMAGED,
    title: title
  };
};


export const chosenAngles = data =>{
  return dispatch =>{
    dispatch(_chosenAngles(data));
  }
}
const _chosenAngles = data =>{
  return{
    type : CHOOSE_ANGLE_INFO,
    data : data
  }
}

export const vinNumber = number => {
  return dispatch => {
    dispatch(_vinNumber(number));
  };
};
const _vinNumber = number => {
  return {
    type: VIN_NUMBER,
    number: number
  };
};
export const deletevinNumber = index => {
  return dispatch => {
    dispatch(_deletevinNumber(index));
  };
};
const _deletevinNumber = index => {
  return {
    type: DELETE_VIN_NUMBER,
    index: index
  };
};




export const reEdit_pose_picture = () => {
  return dispatch =>{
    dispatch({
      type:RE_EDIT_POSE_PICTURE
    })
  }
}

export const reEdit_from_poses = (flag) => {
  return dispatch =>{
    dispatch({
      type:RE_UPLOAD_FROM_POSES,
      val : flag
    })
  }
}


export const storeInferredPoses = inferredPoses => {
  return dispatch => {
    dispatch(_storeInferredPoses(inferredPoses));
  };
};
const _storeInferredPoses = inferredPoses => {
  return {
    type: STORE_INFERRED_POSE,
    inferredPoses: inferredPoses
  };
};

export const reUpload = (name,val) => {
  return dispatch =>{
    dispatch({
      type:RE_UPLOAD,
      name: name,
      bool : val
    })
  }
}

export const addReportId = reportId =>{
  console.log("ACTIONS ADD REPORT ID");
  console.log(reportId);
  return dispatch =>{
    dispatch(_addReportId(reportId))
  }
}
const _addReportId = reportId =>{
  return{
    type:REPORT_ID,
    reportId : reportId
  }
}

export const isUnderwriting = ()=> {
  return dispatch => {
    dispatch(_isUnderwriting());
  };
};
const _isUnderwriting = () => {
  return {
    type: ISUNDERWRITING,
  };
};

const _storePictures = pictures => {
  return {
    type: STORE_PICTURES,
    pictures: pictures
  };
};

const _storePictureInfo = picture => {
  return {
    type: STORE_PICTURE_INFO,
    picture: picture
  };
};

const _totalImages = picture => {
  return {
    type: ADD_TOTAL_IMAGES,
    totalImages: picture
  };
};

const _removetotalImage = picture => {
  return {
    type: REMOVE_TOTAL_IMAGES,
    id: picture
  };
};



const _deletePictureInfo = index => {
  return {
    type: DELETE_PICTURE_INFO,
    index: index
  };
};

export const storePictures = pictures => {
  return dispatch => {
    dispatch(_storePictures(pictures));
  };
};

export const storePictureInfo = picture => {
  return dispatch => {
    console.log("storing picture info");
    dispatch(_storePictureInfo(picture));
  };
};

export const totalImagesStore = picture => {
  return dispatch => {
    console.log("storing picture info");
    dispatch(_totalImages(picture));
  };
};

export const removetotalImage = picture => {
  return dispatch => {
    console.log("Removing picture info");
    dispatch(_removetotalImage(picture));
  };
};

export const deletePictureInfo = index => {
  return dispatch => {
    console.log("removing pic with index " + index);
    dispatch(_deletePictureInfo(index));
  };
};

const _storeResults = (incidents, appraisals) => {
  return {
    type: STORE_RESULTS,
    incidents,
    appraisals
  };
};

export const storeResults = (incidents, appraisals) => {
  return dispatch => {
    console.log("STORING RESULTS");
    dispatch(_storeResults(incidents, appraisals));
  };
};

const _storeEstimate = estimate => {
  return {
    type: STORE_ESTIMATE,
    estimate
  };
};

export const storeEstimate = estimate => {
  return dispatch => {
    dispatch(_storeEstimate(estimate));
  };
};

const _storeAppraisal = appraisal => {
  return {
    type: STORE_APPRAISAL,
    appraisal
  };
};

export const storeAppraisal = appraisal => {
  return dispatch => {
    dispatch(_storeAppraisal(appraisal));
  };
};

const _cloneAppraisal = appraisal => {
  return {
    type: CLONE_APPRAISAL,
    appraisal
  };
};

export const cloneAppraisal = appraisal => {
  return dispatch => {
    dispatch(_cloneAppraisal(appraisal));
    dispatch(_resetModiedFlag());
  };
};

const _clearClonedAppraisal = () => {
  return {
    type: CLEAR_CLONED_APPRAISAL
  };
};

export const clearClonedAppraisal = () => {
  return dispatch => {
    // which will reset modified flag when new appraisal is cloned
    dispatch(_clearClonedAppraisal());
  };
};

const _clearAppraisal = () => {
  return {
    type: CLEAR_APPRAISAL
  };
};

export const clearAppraisal = () => {
  return dispatch => {
    // which will reset modified flag when new appraisal is cloned
    dispatch(_clearAppraisal());
  };
};

const _updateDamageSize = damageSizeOutput => {
  return {
    type: UPDATE_DAMAGE_SIZE,
    damageSizeOutput
  };
};

export const updateDamageSize = damageSizeOutput => {
  return dispatch => {
    dispatch(_updateDamageSize(damageSizeOutput));
  };
};

const _updateAppraisalPart = part => {
  return {
    type: UPDATE_APPRAISAL,
    part
  };
};

export const updateAppraisalPart = part => {
  return dispatch => {
    dispatch(_updateAppraisalPart(part));
  };
};

const _addAppraisalPart = part => {
  return {
    type: ADD_APPRAISAL_PART,
    part
  };
};

export const addAppraisalPart = part => {
  return dispatch => {
    dispatch(_addAppraisalPart(part));
  };
};

const _addAppraisalDamage = (partId, damage) => {
  return {
    type: ADD_APPRAISAL_DAMAGE,
    partId,
    damage
  };
};

export const addAppraisalDamage = (partId, damage) => {
  return dispatch => {
    dispatch(_addAppraisalDamage(partId, damage));
  };
};

const _removeAppraisalDamage = (partId, damageId) => {
  return {
    type: REMOVE_APPRAISAL_DAMAGE,
    partId,
    damageId
  };
};

export const removeAppraisalDamage = (partId, damageId) => {
  return dispatch => {
    dispatch(_removeAppraisalDamage(partId, damageId));
  };
};

const _storeImages = images => {
  return {
    type: STORE_IMAGES,
    images
  };
};

export const storeImages = images => {
  return dispatch => {
    dispatch(_storeImages(images));
  };
};

const _removeImage = imageId => {
  return {
    type: REMOVE_IMAGE,
    imageId
  };
};

export const removeImage = imageId => {
  return dispatch => {
    dispatch(_removeImage(imageId));
  };
};

const _storeIncidentState = idtState => {
  return {
    type: STORE_INCIDENT_STATE,
    idtState
  };
};

export const storeIncidentState = idtState => {
  return dispatch => {
    dispatch(_storeIncidentState(idtState));
  };
};

const _clearCustomerInfo = () => {
  return {
    type: CLEAR_CUSTOMER_INFO
  };
};

const _clearUserInfo = () => {
  return {
    type: CLEAR_USER_INFO
  };
};

const _clearApplicationId = () => {
  return {
    type: CLEAR_APPLICATION_ID
  };
};

const _clearPictures = () => {
  return {
    type: CLEAR_PICTURES
  };
};

const _clearPoseImages =()=>{
  return{
    type:CLEAR_POSE_IMAGES
  }
}

const _clearMorePoseImages =()=>{
  return{
    type:CLEAR_SELECT_MORE_POSES
  }
}

const _clearReportId =() =>{
  return{
    type : CLEAR_REPORT_ID
  }
}


const _clearSelectedCarAngles =()=>{
  return{
    type : CLEAR_CHOOSE_ANGLE_INFO
  }
}

export const clearPictures = () => {
  return dispatch => {
    dispatch(_clearPictures());
  };
};

const _clearResults = () => {
  return {
    type: CLEAR_RESULTS
  };
};

export const clearAllStateData = () => {
  return dispatch => {
    dispatch(_clearPictures());
    dispatch(_clearResults());
    dispatch(_clearCurrentIncident());
    dispatch(_clearIncidents());
    dispatch(_clearUserInfo());
    dispatch(_clearCustomerInfo());
    dispatch(_clearApplicationId());
    dispatch(_reedit(false));
    dispatch(_clearDamages());
  };
};

export const clearStateButUser = () => {
  return dispatch => {
    dispatch(_clearPictures());
    dispatch(_clearResults());
    dispatch(_clearCurrentIncident());
    dispatch(_clearIncidents());
    dispatch(_reedit(false));
    dispatch(_clearCustomerInfo());
    // dispatch(_clearUserInfo());
    dispatch(_clearDamages());
    dispatch(_clearSelectedCarAngles());
    dispatch(_clearPoseImages());
    dispatch(_clearMorePoseImages());
  };
};

export const clearPhotosAndResults = () => {
  return dispatch => {
    dispatch(_clearPictures());
    dispatch(_clearResults());
  };
};

// PARTS

const _storeParts = parts => {
  return {
    type: STORE_PARTS,
    parts
  };
};

export const storeParts = parts => {
  // create index for searching for parts
  const partsWithID = parts.map((item, index) => {
    return {
      ...item,
      id: index
    };
  });
  return dispatch => {
    dispatch(_storeParts(partsWithID));
  };
};

const _addPart = part => {
  return {
    type: ADD_PART,
    part
  };
};

export const addPart = part => {
  return dispatch => {
    dispatch(_addPart(part));
  };
};

const _updatePart = part => {
  return {
    type: UPDATE_PART,
    part
  };
};

export const updatePart = part => {
  return dispatch => {
    dispatch(_updatePart(part));
  };
};

const _clearParts = () => {
  return {
    type: CLEAR_PARTS
  };
};

export const clearParts = () => {
  return dispatch => {
    dispatch(_clearParts());
  };
};

const _removePart = id => {
  return {
    type: REMOVE_PART,
    id
  };
};

export const removePart = id => {
  return dispatch => {
    dispatch(_removePart(id));
  };
};

const _removePartsByImageId = id => {
  return {
    type: REMOVE_PARTS_BY_IMAGE_ID,
    id
  };
};

// DAMAGES

const _storeDamages = damages => {
  return {
    type: STORE_DAMAGES,
    damages
  };
};

export const storeDamages = damages => {
  // create index for searching for damages
  const damagesWithID = damages.map((item, index) => {
    return {
      ...item,
      id: index
    };
  });
  return dispatch => {
    dispatch(_storeDamages(damagesWithID));
  };
};

const _addDamage = damage => {
  return {
    type: ADD_DAMAGE,
    damage
  };
};

export const addDamage = damage => {
  return dispatch => {
    dispatch(_addDamage(damage));
  };
};

const _updateDamage = damage => {
  return {
    type: UPDATE_DAMAGE,
    damage
  };
};

export const updateDamage = damage => {
  return dispatch => {
    dispatch(_updateDamage(damage));
  };
};

const _clearDamages = () => {
  return {
    type: CLEAR_DAMAGES
  };
};

export const clearDamages = () => {
  return dispatch => {
    dispatch(_clearDamages());
  };
};

const _removeDamage = damage => {
  return {
    type: REMOVE_DAMAGE,
    damage
  };
};

export const removeDamage = damage => {
  return dispatch => {
    dispatch(_removeDamage(damage));
  };
};

const _resetModiedFlag = () => {
  return {
    type: RESET_MODIFIED_FLAG
  };
};

export const resetModifiedFlag = () => {
  return dispatch => {
    dispatch(_resetModiedFlag());
  };
};

const _removeDamagesByImageId = id => {
  return {
    type: REMOVE_DAMAGES_BY_IMAGE_ID,
    id
  };
};

const _showDeleteAlert = showAlert => {
  return {
    type: SHOW_DELETE_ALERT,
    showAlert
  };
};

export const showDeleteAlert = showAlert => {
  return dispatch => {
    dispatch(_showDeleteAlert(showAlert));
  };
};

const _removePictureById = id => {
  return {
    type: REMOVE_PICTURE_BY_ID,
    id
  };
};

export const removePictureById = id => {
  console.log("action remove pic by id");
  return dispatch => {
    dispatch(_removePictureById(id));
    dispatch(_removeDamagesByImageId(id));
    dispatch(_removePartsByImageId(id));
  };
};

const _storeIncidents = incidents => {
  return {
    type: STORE_INCIDENTS,
    incidents
  };
};

export const storeIncidents = incidents => {
  return dispatch => {
    dispatch(_storeIncidents(incidents));
  };
};

const _dirtyCurrentIncident = dirty => {
  return {
    type: DIRTY_CURRENT_INCIDENT,
    dirty
  };
};

export const dirtyCurrentIncident = dirty => {
  console.log("actions dirty incident");
  console.log(dirty);
  return dispatch => {
    dispatch(_dirtyCurrentIncident(dirty));
  };
};

const _storeCurrentIncident = incident => {
  return {
    type: STORE_CURRENT_INCIDENT,
    incident
  };
};

export const storeCurrentIncident = incident => {
  console.log("actions current incident");
  console.log(incident);
  return dispatch => {
    dispatch(_storeCurrentIncident(incident));
  };
};

const _deleteImageInCurrentIncident = name => {
  return {
    type : DELETE_IMAGES,
    name : name,
  }
}

export const deleteImageInCurrentIncident = name =>{
  return dispatch =>{
    dispatch(_deleteImageInCurrentIncident(name))
  }
}

const _clearIncidents = () => {
  return {
    type: CLEAR_INCIDENTS
  };
};

export const clearIncidents = () => {
  return dispatch => {
    dispatch(_clearIncidents());
  };
};

const _clearCurrentIncident = () => {
  return {
    type: CLEAR_CURRENT_INCIDENT
  };
};

export const clearCurrentIncident = () => {
  return dispatch => {
    dispatch(_clearCurrentIncident());
  };
};

const _storeGrades = grades => {
  return {
    type: STORE_GRADES,
    grades
  };
};

export const storeGrades = grades => {
  return dispatch => {
    dispatch(_storeGrades(grades));
  };
};

const _clearGrades = () => {
  return {
    type: CLEAR_GRADES
  };
};

export const clearGrades = () => {
  return dispatch => {
    dispatch(_clearGrades());
  };
};
// const _updateShape = shape => {
//   return {
//     type: UPDATE_SHAPE,
//     shape: shape
//   };
// };

// export const updateShape = shape => {
//   return dispatch => {
//     dispatch(_updateShape(shape));
//   };
// };

export const poseImage = (pictures,title) => {
  return dispatch => {
    dispatch(_poseImage(pictures , title));
  };
};
const _poseImage = (pictures , title) => {
  return {
    type: POSE_IMAGES,
    pictures: pictures,
    title : title
  };
};

export const morePoseImage = (pictures,title) => {
  return dispatch => {
    dispatch(_morePoseImage(pictures , title));
  };
};
const _morePoseImage = (pictures , title) => {
  return {
    type: SELECT_MORE_POSES,
    pictures: pictures,
    title : title
  };
};

export const deleteposeImage = (index,title) => {
  return dispatch => {
    dispatch(_deleteposeImage(index , title));
  };
};
const _deleteposeImage = (index , title) => {
  return {
    type: DELETE_POSE_IMAGES,
    index: index,
    title : title
  };
};

export const deletemoreposeImage = (index,title) => {
  return dispatch => {
    dispatch(_deletemoreposeImage(index , title));
  };
};
const _deletemoreposeImage = (index , title) => {
  return {
    type: DELETE_SELECT_MORE_POSES,
    index: index,
    title : title
  };
};



export const fetchVinInfo = (url, token) =>{
  return (dispatch) => {
      return fetch(url, {
          method: 'GET',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': token

          }
      })
          .then((response) => response.json())
          .then((response) => {
              dispatch(vinSuccess(response))
          }
          )
          .catch(error => dispatch(vinFailure(error.data)));
  }
}

const vinSuccess = data =>{
  return{
    type:VIN_SUCCESS,
    data : data
  }
}

const vinFailure = data =>{
  return{
    type : VIN_FAILURE,
    data : data
  }
}