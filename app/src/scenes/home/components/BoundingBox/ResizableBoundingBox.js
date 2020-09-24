import React, { Component } from "react";
import { Rnd } from "react-rnd";
import { withStyles } from "@material-ui/core/styles";

const styles = {
  box: {
    borderWidth: 2,
    borderStyle: "solid"
    // borderColor: "#19D752"
  },
  resizer: {
    width: 4,
    height: 4,
    borderRadius: "50%" /*magic to turn square into circle*/,
    // backgroundColor: "#19D752",
    borderStyle: "solid",
    // borderColor: "#19D752",
    borderWidth: 2,
    position: "absolute"
  }
};

class ResizableBoundingBox extends Component {
  render() {
    // console.log("STATE");
    // console.log(this.state);
    // console.log("BB PROPS");
    // console.log(this.props);
    const { top, left, bottom, right } = this.props;
    const width = right - left;
    const height = bottom - top;
    // console.log("====================================");
    // console.log("WIDTH");
    // console.log(width);
    // console.log("HEIGHT");
    // console.log(height);
    // console.log("====================================");

    const { classes } = this.props;
    const color = this.props.color || "#19D752";
    // const opacity = this.props.active === true ? 1 : 0.5;
    return (
      <Rnd
        size={{ width: width, height: height }}
        position={{ x: left, y: top }}
        onDragStop={(e, d) => {
          this.props.moveBox(d.x, d.y);
          // this.setState({ left: d.x, top: d.y });
        }}
        onResize={(e, direction, ref, delta, position) => {
          // this.setState({
          //   width: parseFloat(ref.style.width),
          //   height: parseFloat(ref.style.height),
          //   left: position.x,
          //   top: position.y
          // });
          this.props.resizeBox(
            parseFloat(ref.style.width),
            parseFloat(ref.style.height),
            position.x,
            position.y
          );
        }}
        className={classes.box}
        style={{ borderColor: color }}
        enableResizing={{
          top: false,
          right: false,
          bottom: false,
          left: false,
          topRight: true,
          bottomRight: false,
          bottomLeft: true,
          topLeft: false
        }}
      >
        <div
          className={classes.resizer}
          style={{
            top: -4,
            left: width - 8,
            backgroundColor: color,
            borderColor: color
          }}
        />
        <div
          className={classes.resizer}
          style={{
            top: height - 8,
            left: -4,
            backgroundColor: color,
            borderColor: color
          }}
        />
      </Rnd>
    );
  }
}

export default withStyles(styles)(ResizableBoundingBox);
