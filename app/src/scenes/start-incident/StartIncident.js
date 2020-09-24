import React, { Component } from "react";
import Title from "../../components/title/Title";
import "./styles.scss";
import StartIncidentNavigation from "./components/start-incident-nav/StartIncidentNavigation";
import TopNav from "../../components/topnav/TopNav";
import { withNamespaces } from "react-i18next";
import { connect } from "react-redux";
import { get } from "../../api/http_proxy";
import { storeUserInfo } from "../../actions";
import { clearAllStateData } from "../../actions";

class StartIncident extends Component {
  constructor() {
    super();

    this.state = {
      user: {}
    };

    this.getUser();
  }
  componentDidMount() {
    console.log("Home screen");
    this.props.clearData();
  }

  getUser = async () => {
    console.log("getUser async function");
    try {
      const resp = await get("/oshot/user");
      console.log("GET RESPONSE SUCCESS");
      console.log("====================================");
      console.log(resp);
      console.log("====================================");
      this.setState({ user: resp.data });
      await this.props.storeInfo(this.state.user.userId, this.state.user.logonName, this.state.user.email, this.state.user.firstName, this.state.user.lastName);
    } catch(error) {
      console.log("GET RESPONSE ERROR");
      console.error(error);
    }
  };

  render() {
    const { t } = this.props;
    console.log("====================================");
    console.log(this.props.vehicleInfo);
    console.log(this.props.userInfo);
    console.log("====================================");

    // if (this.state.user.firstName === true) {
    //   return <Redirect push to="/vehicle-info" />;
    // }
    
    const title = t("general.welcome") + " " + this.state.user.firstName + "! " + t("start-incident.lets-start");

    return (
      <div className="start-incident-wrapper">
        <div className="menu">
          <TopNav
            iconName="person_pin"
            disabled={this.props.hasMore && this.props.goBack}
            // goBack={() => this.props.history.goBack()}
          />
        </div>
        <div className="content">
          <Title title={title} subtitle={t("start-incident.tell-vehicle")} />
          <StartIncidentNavigation />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    vehicleInfo: state.vehicleReducer.vehicleInfo,
    userInfo: state.userReducer.userInfo
  };
};

const mapDispatchToProps = dispatch => {
  return {
    clearData: () => dispatch(clearAllStateData()),
    storeInfo: (userId, logonName, email, firstName, lastName) =>
      dispatch(storeUserInfo(userId, logonName, email, firstName, lastName))
  };
};

export default withNamespaces("common")(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(StartIncident)
);
