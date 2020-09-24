import React, { Component } from "react";
// import { Redirect } from "react-router-dom";
import Title from "../../../../../../components/title/Title";
// import TopNav from "../../../../components/topnav/TopNav";
import "./styles.scss";
import { CircularProgress } from "@material-ui/core";
import { withNamespaces } from "react-i18next";

class Analyzing extends Component {
  render() {
    const { t } = this.props;

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
              subtitle={t("home.photo-upload.photos-uploaded")}
            />
            <div className="state-text">{t("home.photo-upload.uploading")}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default withNamespaces("common")(Analyzing);
