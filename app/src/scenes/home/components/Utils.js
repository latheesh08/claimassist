import uuid from "uuid";
import { sendData, post, get, put, upload_image } from "../../../api/http_proxy";
import { damageList, fullPartList } from "../../../constants";
const newUUID = () => {
  return uuid.v4();
};

const boxToArray = box => {
  const { left, top, right, bottom } = box;
  return [left, top, right, bottom];
};

const generateUUIDs = (obj, refIds) => {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    switch (keys[i]) {
      case "parts":
        const parts = obj.parts.map(item => {
          const partId = newUUID();
          // recurse with the accumulated ids
          generateUUIDs(item, { ...refIds, partId: partId });
          const part = {
            ...item,
            partId: partId,
            appraisalId: refIds.appraisalId,
            createdBy: refIds.user_id
          };
          if (item.hasOwnProperty("shape") && item.shape.length > 0) {
            part.shape = [{
              ...item.shape[0],
              shapeId: newUUID(),
              shapePartId: partId
            }]
          }
          return part;
        });
        obj.parts = parts;
        break;
      // case "shape":
      //   obj.shape = [{
      //     ...obj.shape[0],
      //     shapeId: newUUID()
      //   }];
      //   break;
      case "damages":
        const damages = obj.hasOwnProperty("damages") && obj.damages && obj.damages.length > 0 ? obj.damages.map(item => {
          const damageId = newUUID();
          generateUUIDs(item, { ...refIds, damageId: damageId });
          const damage = {
            ...item,
            damageId: damageId,
            partId: refIds.partId,
            appraisalId: refIds.appraisalId,
            createdBy: refIds.user_id,
          };
          if (item.hasOwnProperty("shape") && item.shape.length > 0) {
            damage.shape = [{
              ...item.shape[0],
              shapeId: newUUID(),
              shapeDamageId: damageId
            }]
          }
          return damage;
        }) : [];
        obj.damages = damages;
        break;

      default:
        break;
    }
  }
  // console.log(refIds);
};

export const randomInteger = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const manuallySetDamageSizeOutput = damageSizeInput => {

  return {
    damage: {
      damageId: damageSizeInput.damage.damageId,
      size: randomInteger(20, 30),
      imageId: damageSizeInput.image.imageId
    },
    part: {
      partId: damageSizeInput.part.partId,
    }
  }
}

export const createDamageSizeOutput = async damageSizeInput => {

  let damageSizeOutput = {};
  if (damageSizeInput.hasOwnProperty("part") && damageSizeInput.part.vectors !== null) {

    try {
      const resp = await postDamageSize(damageSizeInput);

      if (typeof resp === "string" && resp.includes("error")) {

        console.log("ERROR RUNNING DAMAGE SIZE ALGORITHM, MANUALLY SETTING DAMAGE SIZE");
        damageSizeOutput = manuallySetDamageSizeOutput(damageSizeInput);
        // this.props._updateDamageSize(damageSizeOutput);
      } else {
        console.log("DAMAGE SIZE RESPONSE")
        console.log(resp);
        if (resp.hasOwnProperty("damage") && resp.damage.hasOwnProperty("dmg_size")) {
          if (resp.damage.dmg_size <= 0) {
            console.log("DAMAGE SIZE WAS FOUND TO BE 0, SO WE SET IT TO A RANDOM INTEGER BETWEEN 20 AND 30");
            damageSizeOutput = manuallySetDamageSizeOutput(damageSizeInput);
          } else {
            console.log("DAMAGE SIZE SUCCESS, VALUE RETURNED FROM ALGO");
            damageSizeOutput = resp;
          }
        } else {
          console.log("RESPONSE DID NOT CONTAIN DAMAGE OBJECT WITH DAMAGE SIZE VALUE");
          damageSizeOutput = manuallySetDamageSizeOutput(damageSizeInput);
        }
      }
    } catch (dsErr) {

      console.log("TRY CATCH ERROR RUNNING DAMAGE SIZE ALGORITHM, MANUALLY SETTING DAMAGE SIZE");
      console.log(dsErr);
      damageSizeOutput = manuallySetDamageSizeOutput(damageSizeInput);
    }

  } else {
    //TO DO: temporary fix until we get the user to draw the part bounding box when a part has not been found by the algorithm
    console.log("NO POST BECAUSE PART VECTOR WAS EMPTY, MANUALLY SETTING DAMAGE SIZE");
    damageSizeOutput = manuallySetDamageSizeOutput(damageSizeInput);
  }

  return damageSizeOutput;
};

export const getReportInput = (appraisal, images, results = {}, decision = "") => {
  console.log("GET REPORT INPUT");
  let damages = buildDamageList(appraisal);
  console.log("DAMAGES");
  console.log(damages);
  // damages = damages.filter(item => item.damageType !== "panel separation");
  // console.log(damages);

  const report = damages.map(item => {
    let pose = images.map(img => img.imageId === item.imageId ? img.imageUserPose : "").filter(Boolean)[0];
    let part = item.hasOwnProperty("partSource") ? item.partSource.prt_type.replace(/ /g, "_") : item.partType.name.replace(/ /g, "_");
    console.log("PART");
    console.log("---------------")
    console.log(part);
    console.log("POSE");
    console.log("---------------")
    console.log(pose);
    // send all parts to repair/replace algorithm and handle error response
    // if (part !== 'door_handle' || part !== 'emblem' || part !== 'license_plate') {
    let userDecision = "";
    if (results && results.hasOwnProperty("damage") && decision && results.damage === part && results.poses[0] === pose) {
      userDecision = decision;
    } else if (results.hasOwnProperty("partsAndDecisions") && results.partsAndDecisions.length > 0) {
      const matchingPart = results.partsAndDecisions.filter(item => item.part === part && item.pose === pose);
      console.log("MATCHING PART");
      console.log(matchingPart);
      console.log(typeof matchingPart);
      userDecision = matchingPart.length > 0 && matchingPart[0].hasOwnProperty("decision") ? matchingPart[0].decision : "";
    }
    console.log("USER DECISION");
    console.log("---------------")
    console.log(userDecision);
    return {
      // pose : item.imageId === images.map( item => item.imageId),
      imageId: item.imageId,
      userDecision: userDecision,
      pose: pose,
      part: part,
      damage: typeof item.damageType !== "string" ? item.damageType.name.replace(/ /g, "_") : item.damageType.replace(/ /g, "_"),
      damageSize: item.damageSource.hasOwnProperty("dmg_size") ? parseInt(item.damageSource.dmg_size) : 0
    };
    // }
  });
  console.log("REPORT INPUT");
  console.log("---------------")
  console.log(report);
  return report;
};

export const createUsaPartDisplay = (part, pose) => {

  let partDisplay = part;
  switch (part) {
    // just produce the parts name, no pose
    case "front_bumper":
    case "rear_bumper":
    case "grille":
    case "lower_bumper_grille":
    case "windshield":
      partDisplay = part;
      break;
    // no pose but change name
    case "bonnet_hood":
      partDisplay = "hood";
      break;
    case "boot_trunk":
      partDisplay = "trunk";
      break;
    case "rear_back_glass":
      partDisplay = "rear_glass";
      break;
    // pose of left and right
    case "rear_tail_skirt":
    case "head_light":
    case "tail_light":
    case "fog_light":
      if (pose.includes("left")) {
        partDisplay = "left_" + part;
      } else if (pose.includes("right")) {
        partDisplay = "right_" + part;
      } else {
        partDisplay = partDisplay;
      }
      break;
    case "side_mirror":
      if (pose.includes("left")) {
        partDisplay = "left_mirror";
      } else if (pose.includes("right")) {
        partDisplay = "right_mirror";
      } else {
        partDisplay = partDisplay;
      }
      break;
    case "front_fender_wing_panel":
      if (pose.includes("left")) {
        partDisplay = "left_fender";
      } else if (pose.includes("right")) {
        partDisplay = "right_fender";
      } else {
        partDisplay = "front_fender";
      }
      break;
    case "rear_quarter_panel":
      if (pose.includes("left")) {
        partDisplay = "left_quarter_panel";
      } else if (pose.includes("right")) {
        partDisplay = "right_quarter_panel";
      } else {
        partDisplay = partDisplay;
      }
      break;
    case "front_door_panel":
    case "rear_door_panel":
      if (pose.includes("left")) {
        partDisplay = "left_" + part;
      } else if (pose.includes("right")) {
        partDisplay = "right_" + part;
      } else {
        partDisplay = partDisplay
      }
      break;
    case "rocker_panel":
    case "emblem":
    case "license_plate":
      if (pose.includes("front")) {
        partDisplay = "front_" + part;
      } else if (pose.includes("rear")) {
        partDisplay = "rear_" + part;
      } else {
        partDisplay = partDisplay
      }
      break;
    case "wheel":
    case "glass":
    case "door_handle":
    case "window_glass":
      partDisplay = pose + '_' + part;
    default:
      partDisplay = pose + '_' + part;
  }

  partDisplay = partDisplay.replace(/_/g, " ");
  return partDisplay;

};

export const getEstimateData = async (reportInput, appraisalId) => {

  // this.setState({ isLoading: true });
  const url = process.env.REACT_APP_REPAIR_REPLACE_API_ENDPOINT;
  // const report_id = uuid.v4();
  const payload = {
    report_id: uuid.v4(),
    appraisalId: appraisalId,
    rep_input: reportInput
  }
  const response = await post(url, payload);
  return response;

};



export const getImage = async item => {
  return {
    imageName: item.origName,
    imageId: item.imageId,
    imageUrl: `${item.url}`,
    imageUserPose: item.userPose,
    imagePose: item.pose,
    imagePoseCode: item.poseCode,
    imagePoseReview: item.poseReview,
  };
};

export const putImage = async (item) => {
  const response = await sendData('PUT', item.putUrl, item.file, null, { "Content-Type": "image/" + item.type });
  console.log("putImage response");
  console.log(response);
  return response;
}

export const putImagePartial = async item => {
  const response = await upload_image(item.putUrl, item);
  console.log("putImagePartial response");
  console.log(response);
  return response;
}

export const buildImage = async (userInfo, incidentId, item, pose_name) => {
  const imageEndpoint = `${process.env.REACT_APP_SIGNEDURL_API_ENDPOINT}?incidentId=${incidentId}&imageId=${item.imageId}&getUrl=true&imageType=${item.type}&putUrl=true`;
  console.log("imageEndpoint");
  console.log(imageEndpoint);
  const resp = await get(imageEndpoint, userInfo);
  console.log("GET RESPONSE");
  console.log(resp);
  let output = null;

  if (resp.data) {
    item.putUrl = resp.data.putUrl;
    item.incidentId = incidentId;
    item.dataStore = {
      imageId: item.imageId,
      name: item.name,
      checksum: item.checksum,
      url: resp.data.getUrl,
      userPose: pose_name,
      orientation: item.orientation,
      location: item.location,
      metadata: item.metadata
    };
    output = item;
  } else {
    output = { error: item.imageId };
  }

  return output;
};

export const buildImagePartial = async (userInfo, incidentId, item, pose_name) => {
  const server_url = 'https://storage.googleapis.com/galaxyai-data-in/'
  const imageEndpoint = `${process.env.REACT_APP_SIGNEDURL_API_ENDPOINT}?incidentId=${incidentId}&imageId=${item.imageId}&getUrl=true&imageType=${item.type}&putUrl=true`;
  console.log("imageEndpoint");
  console.log(imageEndpoint);
  // const url = `https://galaxyai-data-in.storage.googleapis.com/${item.name}`;
  const response = await get(imageEndpoint, userInfo);
  if (response.data !== null) {
    var name = response.data.getUrl.slice(0, response.data.getUrl.indexOf('?')).slice(server_url.length)
  }

  let output = null;
  await fetch('https://galaxyai-data-in.storage.googleapis.com/' + name, {
    method: 'POST',
    headers: {
      'Content-Length': 0,
      'Content-Type': 'image/' + item.type,
      'x-goog-resumable': 'start'
    },

  }).then(res => {
    console.log('IN Success call')
    console.log(res)
    console.log(res.headers.get("location"))
    // let resp = JSON.stringify(res)
    if (res.ok) {
      item.putUrl = res.headers.get("location");
      item.dataStore = {
        imageId: item.imageId,
        name: item.name,
        checksum: item.checksum,
        url: response.data.getUrl,
        userPose: pose_name
      };
      output = item;
    } else {
      output = { error: item.imageId };
    }
  }).catch(error => {
    console.log('error in post');
    console.log(error)
  });

  return output;
};

export const buildIncident = (currentIncident, vehicleParams, images = [], removeImageContentType = null) => {
  console.log("build incident");
  console.log("currentIncident images");
  let vehicle = {};
  if (currentIncident.hasOwnProperty("vehicles") && currentIncident.vehicles.length > 0) {
    vehicle = {
      ...currentIncident.vehicles[0],
      ...vehicleParams
    }
    currentIncident.vehicles[0] = vehicle;
  } else {
    vehicle = {
      vehicleId: uuid.v4(),
      ...vehicleParams
    }
    currentIncident = {
      ...currentIncident,
      vehicles: [vehicle]
    };
  }
  if (images && images.length > 0) {
    if (!currentIncident.hasOwnProperty("images")) {
      currentIncident.images = []
    }
    const contentType = images[0].contentType;
    const buildImages = removeImageContentType ?
      currentIncident.images.filter(item => item.hasOwnProperty("contentType") && item.contentType !== removeImageContentType)
      : currentIncident.images.filter(item => item.hasOwnProperty("contentType") && item.contentType !== contentType).concat(images)
    currentIncident = {
      ...currentIncident,
      images: buildImages
    }
  }
  return currentIncident;
}

export const buildAppraisal = (appraisal, userId) => {
  const oldId = appraisal.appraisalId;
  const newId = newUUID();
  const newAppraisal = JSON.parse(JSON.stringify(appraisal));
  const clone = {
    ...newAppraisal,
    appraisalId: newId,
    clonedFrom: oldId,
    createdBy: userId,
    comment: "user created"
  };
  generateUUIDs(clone, { appraisalId: newId, user_id: userId });
  console.log("====================================");
  console.log("CLONE");
  console.log(clone);
  console.log("====================================");
  return clone;
};

export const cleanDamage = item => {
  return {
    damageId: item.damageId,
    appraisalId: item.appraisalId,
    partId: item.partId,
    type: item.type,
    typeCode: item.typeCode,
    confidence: item.confidence,
    vectors: item.vectors,
    size: item.size,
    sizeUnits: item.sizeUnits,
    state: item.state,
    createdBy: item.createdBy,
    createdAt: item.createdAt,
    shape: item.shape
  }
};

const buildDamage = (damage, part) => {
  // sometimes the dmg_vectors come as an array, sometimes as a string
  const vectors =
    damage.vectors.constructor === Array
      ? damage.vectors
      : damage.vectors.replace(/}/g, '').replace(/{/g, '').split(",").map(i => parseInt(i));

  const [_left, _top, _right, _bottom] = vectors;
  damage.vectors = vectors;

  const [_originalWidth, _originalHeight] = damage.shape[0].imageResize
    .split(",")
    .map(rItem => parseInt(rItem));
  return {
    ...damage,
    box: {
      left: _left,
      top: _top,
      right: _right,
      bottom: _bottom
    },
    originalSize: { width: _originalWidth, height: _originalHeight },
    partSource: part,
    modified: false
  };
};

export const buildDamageList = appraisal => {
  console.log("BUILDING DAMAGE LIST");
  console.log(appraisal);
  const parts = appraisal.parts
    .filter(item =>
      typeof item.damages !== "undefined" &&
      item.damages.length > 0
    )
    .map(part => {
      // get damages in this part
      const damages = part.damages.map(damage => {

        if (typeof damage.shape !== "undefined" && damage.shape.length > 0) {
          return buildDamage(damage, part)
        } else {
          console.log("ERROR IN API. DAMAGE WITH AN EMPTY DAMAGE SHAPE");
          console.log(damage);
          return {}
        }
      }).filter(d => typeof (d.box) !== "undefined");
      return damages;
    });
  // console.log("APPRAISAL DAMAGES");
  const out = [].concat(...parts);
  // console.log(out);
  return out;
};

export const buildNewDamage = (
  appraisal,
  imageId,
  box,
  partType,
  damageType,
  userId,
  originalSize
) => {
  const _box = boxToArray(box);
  // const _boxstr = `${box.left},${box.top},${box.right},${box.bottom}`;
  //TODO: see if part exists then just add the damage to it
  console.log("part type");
  console.log(partType);
  console.log("damage type");
  console.log(damageType);

  let isNewPart = false;
  let currentPart, selectedParts;

  const parts =
    appraisal.hasOwnProperty("parts") && appraisal.parts.length > 0
      ? appraisal.parts
      : null;
  console.log(parts);
  if (parts) {
    selectedParts = parts.filter(
      item =>
        item.typeCode === partType.code && item.category !== "incident"
    );
    console.log("SELECTED PARTS");
    console.log(selectedParts);

    if (selectedParts.length > 0) {
      currentPart = selectedParts[0];
      console.log("CURRENT PART");
      console.log(currentPart);
    } else {
      isNewPart = true;
      currentPart = makeNewPart(
        appraisal.appraisalId,
        partType,
        damageType,
        userId
      );
    }
  } else {
    isNewPart = true;
    currentPart = makeNewPart(
      appraisal.appraisalId,
      partType,
      damageType,
      userId
    );
  }

  console.log("CURRENT PART");
  console.log(currentPart);

  // const parts = appraisal.parts
  //   // .filter(part => part.hasOwnProperty("damages"))
  //   .filter(_part => _part.hasOwnProperty("shape"))
  //   .filter(__part => __part.shape[0].imageId === imageId);
  // .filter(___part => ___part.damages.length > 0);

  // if (parts.length > 0) {
  //   const partUUID = newUUID();
  //   const damageUUID = newUUID();
  //   let part = {
  //     ...parts[0],
  //     partId: partUUID,
  //     type: partType.name,
  //     typeCode: partType.code,
  //     decision: null,
  //     damageSummary: damageType.name
  //   };
  //   let partSource = JSON.parse(JSON.stringify(part)); // Kill and resurrect
  // let damages = partSource.damages.filter((item, idx) => idx === 0); // take the first damage
  // what if there are no damages at all?

  // let damage = {
  //   ...damages[0],
  //   typeCode: undefined,
  //   type: undefined,
  //   vectors: _box,
  //   damageId: damageUUID,
  //   shape: { ...damages[0].shape, vectors: _boxstr }
  // };

  let damage = makeNewDamage(
    appraisal.appraisalId,
    currentPart,
    _box,
    damageType,
    userId,
    imageId,
    originalSize
  );
  console.log("__damage");
  console.log(damage);
  console.log("part");
  console.log(currentPart);

  if (isNewPart) {
    if (currentPart.hasOwnProperty("damages")) {
      currentPart.damages.push(damage);
    } else {
      currentPart.damages = [damage];
    }
  }

  // console.log("====================================");
  // console.log("ORIGINAL PART SOURCE");
  // console.log(partSource);
  // console.log("====================================");
  // FLAG: commenting this out was a bug fix related to foreign key integretiy of the newly created part and damage objects
  // generateUUIDs(currentPart, {
  //   part_id: currentPart.part_id,
  //   appraisal_id: appraisal.appraisal_id
  // });

  // console.log("CURRENT PART AFTER UUID GENERATION");
  // console.log(currentPart);
  // console.log("====================================");
  // console.log("FINAL PART SOURCE");
  // console.log(partSource);
  // console.log("====================================");

  return {
    damage: buildDamage(damage, currentPart),
    isNewPart: isNewPart
  };
};

export const buildDamageSizeInput = damage => {

  let damageSizeInput = {};
  const partVectors = damage.partSource.hasOwnProperty("shape") && damage.partSource.shape > 0 ? damage.partSource.shape[0].vectors : null;
  if (damage && damage.hasOwnProperty("partSource")) {
    const damageVectors = damage.shape[0].vectors.split(",").map(item => Math.round(parseInt(item))).join();
    damageSizeInput = {
      "image": {
        "imageId": damage.shape[0].imageId,
        "originalSize": damage.originalSize
      },
      "part": {
        "partId": damage.partSource.partId,
        "type": damage.partSource.type,
        "vectors": partVectors
      },
      "damage": {
        "damageId": damage.damageId,
        "type": damage.type,
        "vectors": damageVectors
      }
    }
    console.log("DAMAGE SIZE INPUT");
    console.log(damageSizeInput);
  }
  return damageSizeInput;
}

export const postDamageSize = async damageSizeInput => {
  try {
    const response = await post("/oshot/damagesizeestimator", damageSizeInput);
    console.log("RESPONSE FROM POST TO DAMAGE SIZE SUCCESS");
    console.log(response);
    return response.hasOwnProperty("data") ? response.data : { error: "no data object found in response" };
  } catch (pErr) {
    console.log("RESPONSE FROM POST TO DAMAGE SIZE ERROR");
    console.log(pErr);
    return pErr
  }
}

export const makePartList = (imageId, parts) => {

  let partList = parts.filter(item => item.category === "image" && item.hasOwnProperty("shape") && item.shape[0].imageId === imageId).map(item => {
    return { name: item.type, code: item.typeCode };
  });
  console.log("Part List Length ", partList.length);
  // partList = partList.sort(item => item.name);
  partList = partList.length > 2 ? partList : fullPartList;
  console.log("MAKE PART LIST");
  console.log(partList);
  return partList;
};

export const makeNewPart = (appraisalId, partType, damageType, userId) => {
  console.log("making new parts");
  const dt = new Date();

  return {
    partId: newUUID(),
    appraisalId: appraisalId,
    element_id: null,
    type: partType.name,
    typeCode: partType.code,
    category: "image",
    subCategory: "damage",
    damageSummary: damageType.name,
    decision: null,
    vectors: "",
    state: "initialized",
    createdBy: userId
  };
};

export const makeNewDamage = (
  appraisalId,
  part,
  box,
  damageType,
  userId,
  imageId,
  originalSize
) => {
  const dt = new Date();
  const boxstr = `${box[0]},${box[1]},${box[2]},${box[3]}`;
  const damageId = newUUID();
  return {
    damageId: damageId,
    appraisalId: appraisalId, // would be updated from the part
    element_id: null,
    partId: part.partId,
    type: damageType.name,
    typeCode: damageType.code,
    confidence: 99.0, // should this be a number?
    vectors: box,
    size: 0, // should this be a number?
    sizeUnits: "%",
    state: "initialized",
    createdBy: userId,
    shape: [{
      shapeId: newUUID(),
      imageId: imageId,
      shapeDamageId: damageId,
      type: "damage",
      typeCode: 400,
      vectors: boxstr,
      imageResize: `${originalSize.width},${originalSize.height}`
    }]
  };
};

const getDateString = dt => dt.toISOString().split(".")[0];

// const getPartObject = (parts, partId) => {
//   const _parts = parts.filter(item => item.partId === partId);

//   if (_parts.length === 1) {
//     console.log("PART OBJECT");
//     console.log(_parts[0]);
//     return _parts[0];
//   }
// };

// const getDamageObject = (damages, shape) => {
//   const _damages = damages.filter(
//     item => item.damageId === shape[0].shape_type_id
//   );
//   if (_damages.length === 1) {
//     console.log("DAMAGE OBJECT");
//     console.log(_damages[0]);
//     return _damages[0];
//   }
// };

// For damages/parts of freshly uploaded images
// export const buildDamageList = (shapes, parts, damages) => {
//   console.log("====================================");
//   console.log("SHAPES");
//   console.log(shapes);
//   console.log("====================================");
//   if (!parts || !shapes || !damages) {
//     return [];
//   }
//   return shapes
//     .filter(item => item.typeCode === 400)
//     .map(item => {
//       const [_left, _top, _right, _bottom] = item.vectors
//         .split(",")
//         .map(vItem => parseInt(vItem));
//       // const _images = images.filter(img => img.imageId === item.imageId);
//       const [_originalWidth, _originalHeight] = item.imageResize
//         .split(",")
//         .map(rItem => parseInt(rItem));
//       // const {partType, partDecision}
//       //const _damageDetail = getDamageType(damages, item);
//       console.log("SHAPE ITEM");
//       console.log(item);
//       const _damageDetail = getDamageObject(damages, item);
//       console.log("DAMAGE DETAIL");
//       console.log(_damageDetail);

//       const _partDetail = getPartObject(parts, _damageDetail.partId);

//       return {
//         box: {
//           left: _left,
//           top: _top,
//           right: _right,
//           bottom: _bottom
//         },
//         // image: _images ? _images[0] : null,
//         imageId: item.imageId,
//         originalSize: { width: _originalWidth, height: _originalHeight },
//         shapeId: item.shapeId,
//         shapeTypeId: item.shape_type_id,
//         shpType: item.type,
//         shptypeCode: item.typeCode,
//         partDecision: _partDetail.hasOwnProperty("decision")
//           ? _partDetail.decision
//           : null,
//         partSource: _partDetail,
//         damageType: _damageDetail.type,
//         damagetypeCode: _damageDetail.typeCode,
//         damageSource: _damageDetail,
//         shapeSource: item,
//         modified: false
//       };
//     });
//   // console.log("IMAGE DAMAGES");
//   // console.log(imageDamages);
// };

// const EXCLUDE_KEYS = [
//   "shpDamage",
//   "shpImage",
//   "shpMasks",
//   "shpPart",
//   "dmgAppraisal",
//   "dmgCreator",
//   "dmgElement",
//   "dmgShape",
//   "dmgUpdater"
// ];

export const buildAppraisalData = (currentAppraisal, userId, damages) => {
  // const shapesInfo = extractShapes(damages);
  const partsInfo = extractParts(damages, userId);
  const damagesInfo = extractDamages(damages, userId);
  const appraisalInfo = {
    appraisalId: currentAppraisal.appraisalId,
    incidentId: currentAppraisal.incidentId,
    amtFileTot: currentAppraisal.amtFileTot,
    amtLaborTot: currentAppraisal.amtLaborTot,
    amtOther: currentAppraisal.amtOther,
    amtPaintTot: currentAppraisal.amtPaintTot,
    amtPartTot: currentAppraisal.amtPartTot,
    manifest: currentAppraisal.manifest,
    maxSeverity: currentAppraisal.maxSeverity,
    state: "created",
    clonedFrom: currentAppraisal.appraisalId,
    createdBy: userId,
    comment: "user created",
    parts: partsInfo,
    damages: damagesInfo
  };
  return appraisalInfo;
};

const extractShapes = damage => {
  const shape = damage.hasOwnProperty("shapeSource")
    ? damage.shapeSource
    : null;
  const { left, top, right, bottom } = damage.box;
  return {
    shapeId: shape ? shape[0].shapeId : damage.shapeId,
    imageId: shape ? shape[0].imageId : damage.shape[0].imageId,
    shapeDamageId: shape ? shape[0].shapeDamageId : null,
    type: shape ? shape[0].type : damage.damageType.name,
    typeCode: shape ? shape[0].typeCode : damage.damageType.code,
    vectors: `${left},${top},${right},${bottom}`,
    // imageSize: null,
    imageResize: shape ? shape[0].imageResize : null,
    comment: "user created"
  };
};

const extractDamages = (damages, userId) => {
  return damages.map(item => {
    const shape = extractShapes(item);
    const source = item.hasOwnProperty("damageSouce")
      ? item.damageSource
      : null;
    const { left, top, right, bottom } = item.box;
    return {
      damageId: item.damageId,
      element_id: source ? source.element_id : null,
      type: source ? source.type : item.damageType.name,
      typeCode: source ? source.typeCode : item.damageType.code,
      confidence: source ? source.confidence : null,
      category: source ? source.category : null,
      area: `${left},${top},${right},${bottom}`,
      size: source ? source.size : null,
      sizeUnits: source ? source.sizeUnits : null,
      status: source ? source.status : null,
      state: source ? source.state : null,
      dispType: source ? source.dispType : null,
      dispGroup: source ? source.dispGroup : null,
      dispOrder: source ? source.dispOrder : null,
      createdBy: userId,
      updatedBy: userId,
      updateDate: null,
      comment: null,
      shape: shape
    };
  });
};

const extractParts = (damages, userId) => {
  return damages.map(item => {
    //const shape = extractShapes("part", item);
    const source = item.hasOwnProperty("partSource") ? item.partSource : null;
    const { left, top, right, bottom } = item.box;
    return {
      partId: item.partId,
      element_id: source ? source.element_id : null,
      manufact_id: source ? source.manufact_id : null,
      type: source ? source.type : item.partType.name,
      typeCode: source ? source.typeCode : item.partType.code,
      category: source ? source.category : null,
      subCategory: source ? source.subCategory : null,
      subBundleId: source ? source.subBundleId : null,
      numPartOEM: source ? source.numPartOEM : null,
      numPartAlt: source ? source.numPartAlt : null,
      supplier: source ? source.supplier : null,
      supplierAlt: source ? source.supplierAlt : null,
      quantity: source ? source.quantity : null,
      material: source ? source.material : null,
      priceOEM: source ? source.priceOEM : null,
      priceALT: source ? source.priceALT : null,
      amtTot: source ? source.amtTot : null,
      amtLabor: source ? source.amtLabor : null,
      amtPaint: source ? source.amtPaint : null,
      amtDent: source ? source.amtDent : null,
      amtMisc: source ? source.amtMisc : null,
      amtSalvage: source ? source.amtSalvage : null,
      amtWaste: source ? source.amtWaste : null,
      wasteCode: source ? source.wasteCode : null,
      dispType: source ? source.dispType : null,
      dispGroup: source ? source.dispGroup : null,
      dispOrder: source ? source.dispOrder : null,
      damageSummary: source ? source.damageSummary : item.damageType.name,
      decision: source ? source.decision : null,
      recStatus: source ? source.recStatus : null,
      recSeq: source ? source.recSeq : null,
      area: `${left},${top},${right},${bottom}`,
      status: source ? source.status : null,
      state: source ? source.state : null,
      createdBy: userId,
      updatedBy: userId,
      updateDate: null,
      comment: "user created"
      //shape: shape
    };
  });
};
