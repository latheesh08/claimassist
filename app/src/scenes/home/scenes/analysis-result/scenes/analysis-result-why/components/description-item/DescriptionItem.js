import React, { Component } from "react";
// import Icon from "@material-ui/core/Icon";
import "./styles.scss";

class DescriptionItem extends Component {
  cleanText = text => {
    let _text = text.replace("_", " ");

    return _text[0].toUpperCase() + _text.substr(1, _text.length - 1);
  };

  render() {
    const { title, desc } = this.props;

    return (
      <div className="desc-item">
        {/* <div className="icon-container">
          <Icon>{iconName}</Icon>
        </div> */}
        <div className="main">
          <div className="title">{this.cleanText(title)}</div>
          <div className="desc">{desc}</div>
        </div>
      </div>
    );
  }
}

export default DescriptionItem;
