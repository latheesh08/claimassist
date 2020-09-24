import React, { Component } from "react";

class BoundingBox extends Component {
  click = () => {
    // alert("Please click on edit on the upper right corner of the screen and use the arrows below the image to navigate between the damage classification boxes.");
    console.log("bounding box clicked!!!");
  };
  handleMouseDown = e => {
    console.log("mouse is down!!!");
  };

  handleMouseUp = e => {
    console.log("mouse is back up!");
  };

  render() {
    const borderColor = this.props.active === true ? "#19D752" : "white";
    const opacity = this.props.active === true ? 1 : 0.5;
    const width = this.props.right - this.props.left;
    const height = this.props.bottom - this.props.top;
    return (
      <div
        style={{
          position: "absolute",
          width: width,
          height: height,
          // backgroundColor: "red",
          borderColor: borderColor,
          borderWidth: 2,
          borderStyle: "solid",
          opacity: opacity,
          left: this.props.left,
          top: this.props.top
        }}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onClick={this.click}
        draggable={true}
      />
      // <svg
      //   onMouseDown={this.handleMouseDown}
      //   onMouseUp={this.handleMouseUp}
      //   onClick={this.click}
      //   // width={this.props.containerWidth}
      //   // height={this.props.containerHeight}
      //   x={this.props.left}
      //   y={this.props.top}
      //   // fill="red"
      //   // onClick={this.onClick}
      // >
      //   <rect
      //     width={this.props.width}
      //     height={this.props.height}
      //     x={this.props.left}
      //     y={this.props.top}
      //     fill="none"
      //     stroke={this.props.active === true ? "#19D752" : "white"}
      //     strokeWidth={this.props.active === true ? 2 : 1}
      //     opacity={this.props.active === true ? 1 : 0.5}
      //     onMouseDown={this.handleMouseDown}
      //     onMouseUp={this.handleMouseUp}
      //     onClick={this.click}
      //   />
      // </svg>
    );
  }
}

export default BoundingBox;
