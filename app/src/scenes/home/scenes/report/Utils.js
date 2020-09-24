import { createUsaPartDisplay } from "../../components/Utils";

export const getDamageReport = (damages , images) => {
  console.log("damage report");
  console.log(damages);
  console.log(images);
  const report = damages.map(item => {
    return {
      // pose : item.imageId === images.map( item => item.imageId) ,
      poses : images.map(img => img.imageId === item.shape[0].imageId ? img.userPose : "").filter(Boolean),
      part: item.hasOwnProperty("partSource") ? item.partSource.type : item.partType.name,
      damage: item.type,
      decision: item.partDecision
    };
  });
  console.log(report);

  const parts = report.map(item => item.part);
  const uniqueParts = parts.filter((item, idx) => parts.indexOf(item) === idx);
  console.log("UNIQUE PARTS");
  console.log(uniqueParts);

  // Get damages for each part
  let out = [];
  for (let i = 0; i < uniqueParts.length; i++) {
    const _part = uniqueParts[i];
    const _report = report.filter(item => item.part === _part);
    const _damageList = _report.map(item => item.damage);
    const _damages = _damageList.filter(
      (item, idx) => _damageList.indexOf(item) === idx
    );
    const pose = _report[0].poses[0]
    const _todoList = _report
      .filter(item => item.decision)
      .map(item => item.decision);
    
    const partDisplay = createUsaPartDisplay(_part, pose);
    console.log("createUsaPartDisplay");
    console.log(partDisplay);
    // Just take one, hopefully we won't have different decisions for same part
    const _todo = _todoList[0];
    out.push({
      // pose : pose.replace("_", " "),
      part: _part,
      damages: _damages,
      todo: _todo
    });
  }
  return out;
};
