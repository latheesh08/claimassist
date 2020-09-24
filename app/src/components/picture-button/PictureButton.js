import React, { Component } from "react";
// import { Link } from "react-router-dom";
// import Fab from "@material-ui/core/Fab";
import Icon from "@material-ui/core/Icon";
// import { withStyles } from "@material-ui/core/styles";
import "./styles.scss";

class PictureButton extends Component {
  render() {
    return (
      <div className="add-more-container" color="primary">
        <input
          accept="image/*" 
          capture=""
          className="input"
          id="add-more-button-file"
          type="file"
          multiple
          onChange={e => this.props.onChangeImage(e)}
        />
        <label htmlFor="add-more-button-file" className='picture_label'>
          <div className="container column" >
            <Icon className="icon">camera_alt</Icon>
            <div className="text">{this.props.text}</div>
          </div>
        </label>
      </div>
    );
  }
}

export default PictureButton;
