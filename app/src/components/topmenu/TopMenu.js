import React, { Component } from "react";
// import { NavLink } from "react-router-dom";
import { Redirect } from "react-router-dom";
import "./styles.scss";
// import TopMenuItem from "../TopMenuItem/TopMenuItem";
import { MenuList, MenuItem, Divider } from "@material-ui/core";
import { withNamespaces } from "react-i18next";
import Popup from "../Alert/Alert";
import { connect } from "react-redux";
import { dirtyCurrentIncident, clearAllStateData, clearStateButUser, storeCurrentIncident } from "../../actions";
import uuid from "uuid";
import firebaseapp from "../../../src/scenes/base"

class TopMenu extends Component {
  state = {
    anchorEl: null,
    showAlert: false,
    showLogOutAlert: false,
    // startClaim: false,
    // goToClaims: false,
    redirect: false,
    redirectValue: ''
  };

  handleMyClaims = () => {
    this.setState({ redirectValue: '/home' })
    if (this.props.modified === true) {
      this.setState({ showAlert: true })
    } else {
      this.setState({ redirect: true })
    }
  }

  handleYes = async () => {
    console.log("handle yes!");
    console.log(this.state.redirectValue);
    if (this.props.modified === true) {
      await this.props.uploadAppraisal(this.state.redirectValue)
    }
    if (this.state.redirectValue === '/collect-vehicle-details') {
      this.props.clearState();
      const incident = {
        incidentId: uuid.v4(),
        sourceSystem: this.props.userInfo.isUnderwriting ? "policyassist" : "claimassist",
        externalId: this.props.applicationId,
        type: this.props.userInfo.isUnderwriting ? "policy" : "claim",
        createdBy: this.props.userInfo.userId,
        status: "submitted",
        state: "in progress"
      }
      this.props.storeIncident(incident);
    }
    this.setState({ showAlert: false, redirect: true });
  };

  handleNo = () => {
    if (this.props.modified === true) {
      this.setState({ showAlert: false, redirect: true });
    } else {
      this.setState({ showAlert: false });
      this.props.handleCollapse();
    }
  };

  render() {
    console.log("TOP MENU PROPS AND STATE");
    console.log(this.props);
    console.log(this.state);
    const { t, userInfo } = this.props;
    const incidentType = userInfo.isUnderwriting ? t("top-nav.policy") : t("top-nav.claim");

    if (this.state.redirect === true) {
      return <Redirect push to={this.state.redirectValue} />;
    }
    return (
      <div className="topmenu-wrapper">
        {
          this.props.modified === true ? (
            <Popup
              open={this.state.showAlert}
              message={t("top-nav.unsaved-message", incidentType)}
              noText={t("top-nav.alert-cancel")}
              yesText={t("top-nav.alert-save")}
              handleYes={this.handleYes}
              handleNo={this.handleNo}
            />
          ) : (
              <Popup
                open={this.state.showAlert}
                message={(userInfo.isUnderwriting) ? t("top-nav.policy-alert-message") : t("top-nav.alert-message")}
                noText={t("top-nav.alert-no-text")}
                yesText={t("top-nav.alert-yes-text")}
                handleYes={this.handleYes}
                handleNo={this.handleNo}
              />
            )
        }

        {
          this.state.showLogoutAlert === true ? (
            <Popup
              open={this.state.showLogoutAlert}
              message={t("main-footer.logout-message")}
              noText={t("main-footer.alert-no-logout")}
              yesText={t("main-footer.alert-yes-logout")}
              handleYes={() => {
                this.props.clearAllStateData()
                firebaseapp.auth().signOut()
              }}
              handleNo={() => { this.setState({ showLogoutAlert: false }) }}
            />
          ) : null}

        <MenuList>
          {/* <MenuItem onClick={this.handleClose}>hello@me.com</MenuItem>
          <Divider variant="middle" /> */}
          <MenuItem onClick={() => {
            this.setState({ showAlert: true, redirectValue: "/collect-vehicle-details" })
          }

          }>
            {/* <NavLink to="/">{t("top-nav.start-incident")}</NavLink> */}
            {(this.props.userInfo.isUnderwriting) ? t("top-nav.start-policy") : t("top-nav.start-incident")}
          </MenuItem>
          <Divider variant="middle" />
          <MenuItem onClick={this.handleMyClaims}>
            {(this.props.userInfo.isUnderwriting) ? t("top-nav.my-policies") : t("top-nav.my-claims")}
          </MenuItem>
          {
            (process.env.REACT_APP_FRICTIONLESS === 'true') ? null : (
              <div>
                <Divider variant="middle" />
                <MenuItem onClick={() => { this.setState({ showLogoutAlert: true }) }}>{t("top-nav.logout")}</MenuItem>
              </div>
            )
          }
        </MenuList>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    userInfo: state.userReducer.userInfo,
    applicationId: state.userReducer.applicationId
  };
};

const mapDispatchToProps = dispatch => {
  return {
    clearAllStateData: () => dispatch(clearAllStateData()),
    clearState: () => dispatch(clearStateButUser()),
    storeIncident: (incident) => dispatch(storeCurrentIncident(incident)),
    dirtyCurrentIncident: (value) => dispatch(dirtyCurrentIncident(value))
  };
};

export default withNamespaces("common")(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(TopMenu)
);
