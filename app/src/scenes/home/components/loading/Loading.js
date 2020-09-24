import React, { Component } from "react";
// import { Redirect } from "react-router-dom";
import Title from "../../../../components/title/Title";
// import TopNav from "../../../../components/topnav/TopNav";
import "./styles.scss";
import { CircularProgress } from "@material-ui/core";
import { withNamespaces } from "react-i18next";

class Loading extends Component {
  render() {
    const { t } = this.props;
    const notification = this.props.notification || "Hang on";

    return (
      <div className="analyzing-wrapper">
        <div className="content">
          <div className="analyzing-container">
            <div className="car-in-progress">
              <img src={this.props.image_src} alt="" />
              <CircularProgress
                className="car-outline-progress"
                color="secondary"
                size={140}
                thickness={0.6}
              />
            </div>
            <Title
              title={t("home.photo-upload.sit-tight")}
              subtitle={notification}
            />
            <div className="state-text">{t("home.photo-upload.initializing")}...</div>
          </div>
        </div>
      </div>
    );
  }
}

export default withNamespaces("common")(Loading);
