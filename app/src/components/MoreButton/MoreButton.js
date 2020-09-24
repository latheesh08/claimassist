import React, { PureComponent } from "react";
// import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";
import "./styles.scss";

class MoreButton extends PureComponent {
  render() {
    return (
      // <IconButton
      //   // className="more-button"
      //   color="primary"
      //   onClick={this.props.onClick}
      // >
      <Icon color="primary" className="more-button" onClick={this.props.onClick}>
        more_vert
      </Icon>
      // </IconButton>
    );
  }
}

export default MoreButton;
