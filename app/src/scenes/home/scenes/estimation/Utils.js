export const getDamageReport = damages => {
  console.log("damage report");
  const report = damages.map(item => {
    return {
      part: item.hasOwnProperty("partSource") ? item.partSource.type : item.partType.name,
      damage: typeof item.damageType !== "string" ? item.damageType.name : item.damageType,
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

    const _todoList = _report
      .filter(item => item.decision)
      .map(item => item.decision);

    // Just take one, hopefully we won't have different decisions for same part
    const _todo = _todoList[0];
    out.push({
      part: _part,
      damages: _damages,
      todo: _todo
    });
  }
  return out;
};
