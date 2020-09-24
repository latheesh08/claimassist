// export const getShapeRect = (shapes, image, boxWidth, boxHeight) => {
//   //   const { boxWidth, boxHeight } = this.state;

//   return shapes
//     .filter(item => item.imageId === image.imageId && item.damageId !== null)
//     .map(item => {
//       const [_left, _top, _right, _bottom] = item.vectors;
//       // typeof item.vectors === "string"
//       //   ? item.vectors.split(",").map(item => parseInt(item))
//       //   : item.vectors;

//       const [_width, _height] = item.imageResize;
//       const xRatio = boxWidth / _width;
//       const yRatio = boxHeight / _height;

//       return {
//         left: _left * xRatio,
//         top: _top * yRatio,
//         width: (_right - _left) * xRatio,
//         height: (_bottom - _top) * yRatio,
//         damageId: item.damageId,
//         partId: item.partId,
//         xRatio: xRatio,
//         yRatio: yRatio
//       };
//     });
// };

export const resizeBox = (box, oldContainer, newContainer) => {
  return {
    left: Math.round((box.left * newContainer.width) / oldContainer.width),
    top: Math.round((box.top * newContainer.height) / oldContainer.height),
    right: Math.round((box.right * newContainer.width) / oldContainer.width),
    bottom: Math.round((box.bottom * newContainer.height) / oldContainer.height)
    // width: ((box.right - box.left) * newContainer.width) / oldContainer.width,
    // height: ((box.bottom - box.top) * newContainer.height) / oldContainer.height
  };
};

// export const getDamagesInfo = (shapes, image) => {
//   const out = shapes.filter(item => item.imageId === image.imageId && item.damageId !== null)
// }

// export const getShapeFromRect = (shape, box) => {
//   console.log("====================================");
//   console.log("INSIDE GETSHAPEFROMRECT");
//   console.log("BOX");
//   console.log(shape);
//   console.log(box);
//   console.log("====================================");
//   // const [_left, _top, _right, _bottom] = this.shape[0].vectors;
//   const { left, top, width, height, xRatio, yRatio } = box;
//   const _left = left / xRatio;
//   const _top = top / yRatio;
//   const _right = width / xRatio + _left;
//   const _bottom = height / yRatio + _top;

//   return { ...shape, vectors: [_left, _top, _right, _bottom] };
// };
