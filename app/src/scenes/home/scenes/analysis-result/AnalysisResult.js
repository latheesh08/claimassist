import React, { Component } from "react";
import { Redirect, Link } from "react-router-dom";
import "./styles.scss";
import { withNamespaces } from "react-i18next";
import UploadGroup from "./components/UploadGroup";
import { TopNav, Title, ArrowLink, Alert, TermsandPrivacy } from "../../../../components";
import { connect } from "react-redux";
import { clearPhotosAndResults, clearPictures } from "../../../../actions";

class AnalysisResult extends Component {
  constructor() {
    super();

    this.state = {
      redirectData: undefined,
      photoInfo: [],
      showAlert: false,
      goBack: false,
      noVehicleInfo: false,
      showRejectAlert: false
    };
  }

  componentDidMount = async () => {

    const { userInfo } = this.props;

    // Check if there are any rejected images and the action was push (from photo-upload) and check if underwriting
  };

  handleOnHelp = photoInfo => {
    // console.log(photoInfo);
    this.setState({
      redirectData: photoInfo
    });
  };

  handleAlert = () => {
    this.setState({ showAlert: true });
  };

  handleYes = () => {
    this.props.clearData();
    this.setState({ goBack: true });
  };

  handleNo = () => {
    this.setState({ showAlert: false });
  };

  handleCloseRejectAlert = () => {
    this.setState({ showRejectAlert: false });
  };

  render() {
    console.log("====================================");
    console.log("ANALYSIS RESULTS PROPS");
    console.log(this.props);
    console.log("====================================");
    // First check if there is the vehicle info
    // if (this.state.noVehicleInfo === true) {
    //   return <Redirect push to="/vehicle-info" />;
    // }

    const { userInfo } = this.props;
    // console.log("PHOTO INFO");
    // console.log(photoInfo);
    // const passed = (this.props.userInfo.isUnderwriting) ? 0 : photoInfo.filter(item => item.passed === true);
    // const rejected = (this.props.userInfo.isUnderwriting) ? 0 : photoInfo.filter(item => item.passed === false);
    const { t } = this.props;

    let title = t("home.analysis-result.title");
    const incidentType = userInfo.isUnderwriting ? t("home.analysis-result.policy") : t("home.analysis-result.claim");
    const clientName = process.env.REACT_APP_CLIENT_NAME ? process.env.REACT_APP_CLIENT_NAME : "Galaxy";
    // let subtitle = `An email with the link will be sent to ${userInfo.email} shortly, when the initial estimate is ready for review`;
    let subtitle = t("home.analysis-result.subtitle", { incidentType : incidentType, clientName : clientName });

    if (this.state.redirectData) {
      return (
        <Redirect
          push
          to={{
            pathname: "/analysis-results/why/2",
            state: {
              imageId: this.state.redirectData.imageId
            }
          }}
        />
      );
    }
    if (this.state.goBack === true) {
      if (this.props.userInfo.isUnderwriting) {
        return <Redirect to="/collect-vehicle-details" />;
      }
      return <Redirect to="/choose-angle" />;
    }

    return (
      <div className="analysis-result-wrapper">
        <Alert
          open={this.state.showRejectAlert}
          message={t("home.analysis-result.rejected-alert-message")}
          yesText={t("top-nav.alert-ok-text")}
          handleYes={this.handleCloseRejectAlert}
        />
        <Alert
          open={this.state.showAlert}
          message={t("home.analysis-result.alert-message")}
          noText={t("top-nav.alert-no-text")}
          yesText={t("top-nav.alert-yes-text")}
          handleYes={this.handleYes}
          handleNo={this.handleNo}
        />
        <div className="content">
          <TopNav
            backType="backward"
            hasMore
            narrow
          />
          <div className="analysis-result-container">
            <Title title={title}
              subtitle={subtitle}
            />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    userInfo: state.userReducer.userInfo,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    clearData: () => dispatch(clearPhotosAndResults()),
    clearPictures: () => dispatch(clearPictures())
  };
};

export default withNamespaces("common")(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AnalysisResult)
);
