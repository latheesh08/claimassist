import React, { Component } from "react";
// import PropTypes from "prop-types";
// import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";
import TopMenu from "../topmenu/TopMenu";
import Popup from "../Alert/Alert";
import "./styles.scss";
import { withNamespaces } from "react-i18next";
import MoreButton from "../MoreButton/MoreButton";
import { connect } from "react-redux";

class TopNav extends Component {
  state = {
    showMenu: false,
    showPopup: false,
    hideAppTitle: false
  };

  onClickMore = () => {
    this.setState({
      showMenu: !this.state.showMenu
    });
  };

  handleGoBack = () => {
    console.log("top nav handle go back");
    const modified = this.props.modified ? this.props.modified : null;
    console.log(modified);
    if (modified === null || modified === false) {
      this.props.goBack();
    } else {
      console.log("modified is true");
      this.setState({
        showPopup: true
      });
    }
  }

  render() {
    // const hideAppTitle = this.props.hideAppTitle || false;
    const { userInfo, t } = this.props;
    const modified = this.props.modified ? this.props.modified : null;
    const popMessage = userInfo.isUnderwriting ? t("top-nav.unsaved-policy") : t("top-nav.unsaved-claim");

    // const role = userInfo && typeof (userInfo.role) !== "undefined" ? userInfo.role.replace("policy", "").replace("claim", "") : "";
    let role = userInfo && typeof (userInfo.role) !== "undefined" ? userInfo.role.replace("policy", "").replace("claim", "") : "";
    if(role && role.length > 0) {
      role = t("top-nav."+role)
    }

    return (
      <div className="topnav-wrapper">
        <Popup
          open={this.state.showPopup}
          message={popMessage}
          noText={t("top-nav.alert-no-text")}
          yesText={t("top-nav.alert-yes-text")}
          handleYes={() => this.props.uploadAppraisal("/home")}
          handleNo={this.props.goBack}
        />
        <div className="topnav-toprow">
          {this.props.goBack ? (
            <Icon onClick={this.handleGoBack}>arrow_back</Icon>
          ) : null}
          <div className="center-content">
            {this.props.hideAppTitle === true ? (
              <span className="title">{this.props.title}</span>
            ) : (
                <span className="fake-title">Title</span>
              )}
            {this.props.hideUserRole ? null : (
              <span className="user-role">{role}</span>
            )}
          </div>

          {this.props.children}
          {this.props.hasMore ? (
            <MoreButton onClick={this.onClickMore} />
          ) : null}
        </div>

        {this.state.showMenu ? (
          <div className="topnav-toprow">
            <TopMenu modified={modified} uploadAppraisal={this.props.uploadAppraisal} handleCollapse={this.onClickMore} />
          </div>
        ) : null}
        {this.props.iconName ? (
          <div className="topnav-bottomrow">
            <div className="icon-wrapper">
              <Icon fontSize="large" className="profile-icon">
                {this.props.iconName}
              </Icon>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

// TopNav.propTypes = {
//   goBack: PropTypes.func.isRequired
// };

const mapStateToProps = state => {
  return {
    userInfo: state.userReducer.userInfo,
  };
};

export default withNamespaces("common")(
  connect(
    mapStateToProps, null)(TopNav)
);
