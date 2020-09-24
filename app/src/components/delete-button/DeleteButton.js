import React, { Component } from "react";
import Icon from "@material-ui/core/Icon";
import "./styles.scss";

class DeleteButton extends Component {
  onClick = () => {
    console.log(this.props.index);
    this.props.onClick(this.props.index);
  };

  render() {
    return (
      <div className="icon-container" onClick={this.onClick}>
        <Icon>delete</Icon>
      </div>
    );
  }
}


export default   DeleteButton

