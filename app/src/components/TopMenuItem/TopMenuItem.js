import React, { Component } from "react";
import "./styles.scss";

class TopMenuItem extends Component {
  render() {
    return <div className="menuitem-wrapper">{this.props.item}</div>;
  }
}

export default TopMenuItem;
