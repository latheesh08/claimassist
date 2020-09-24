import uuid from "uuid";

const newUUID = () => {
  return uuid.v4();
};

export const cloneAppraisal = appraisal => {
  const oldId = appraisal.appraisalId;
  const newId = newUUID();
  const newAppraisal = JSON.parse(JSON.stringify(appraisal));
  const clone = { ...newAppraisal, appraisalId: newId, clonedFrom: oldId };
  generateUUIDs(clone, { appraisalId: newId });
  return clone;
};

const generateUUIDs = (obj, refIds) => {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    switch (keys[i]) {
      case "parts":
        const parts = obj.parts.map(item => {
          const newId = newUUID();
          // recurse with the accumulated ids
          generateUUIDs(item, { ...refIds, partId: newId });
          return { ...item, partId: newId, appraisalId: refIds.appraisalId };
        });
        obj.parts = parts;
        break;
      case "shape":
        obj.shape = { ...obj.shape, shapeId: newUUID() };
        break;
      case "damages":
        const damages = obj.damages.map(item => {
          const damageId = newUUID();
          generateUUIDs(item, { ...refIds, damageId: damageId });
          return {
            ...item,
            damageId: damageId,
            partId: refIds.partId,
            appraisalId: refIds.appraisalId
          };
        });
        obj.damages = damages;
        break;

      default:
        break;
    }
  }
  console.log(obj);
};
