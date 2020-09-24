import React, { Component } from "react";
import { withNamespaces } from "react-i18next";
// import Title from "../../../../components/title/Title";
import ClaimItem from "./components/claim-item/ClaimItem";
import {
  clearAllStateData,
  storeIncidents,
  clearClonedAppraisal,
} from "../../../../actions";
import { connect } from "react-redux";
// import Loading from "./components/loading/Loading";
import { Loading } from "../../components";
import { withStyles } from "@material-ui/core/styles";
import { Grid, CircularProgress, Button, InputLabel } from "@material-ui/core";
import { get } from "../../../../api/http_proxy";

import { TopNav } from "../../../../components";
import NewClaim from "./components/NewClaim";
import { withSnackbar } from "notistack";
var headers = {};
var incidentURL = "";
const styles = (theme) => ({
  root: {
    flexGrow: 1,
  },
  link: {
    textDecoration: "none",
    color: "#0fafef",
    fontSize: "80%",
  },
});

class ClaimsList extends Component {
  constructor() {
    super();

    this.state = {
      initialized: false,
      notification: "",
      createClaim: true,
      incidents: [],
      rawIncidents: [],
      currentPage: 1,
      totalPage: 1,
      Loading: null,
    };
  }

  componentDidMount = async () => {
    const { t } = this.props;
    console.log("====================================");
    console.log("CLAIM LIST PROPS");
    console.log(this.props);
    console.log("====================================");
    const { userInfo } = this.props;
    // clear any cached cloned appraisal
    this.props.clearClone();
    // if (userInfo.userId === null || claims.length === 0) {


    if (
      process.env.REACT_APP_SUPERVISOR_CREATE === "false" &&
      userInfo.isSupervisor
    ) {
      this.setState({ createClaim: false });
    }
    this.setState({ notification: t("home.claim-list.waking") });
    this.setState({
      notification: this.props.userInfo.isUnderwriting
        ? t("home.claim-list.retrieve-policies")
        : t("home.claim-list.retrieve-claims"),
      user: userInfo,
    });
    await this.getRecentIncidents(
      process.env.REACT_APP_INCIDENT_API_ENDPOINT,
      this.props.userInfo
    );
  };

  getIncidents = async (val) => {
    this.setState({
      Loading: true,
    });

    const url = process.env.REACT_APP_INCIDENT_API_ENDPOINT;
    let lite = true;
    if (process.env.REACT_APP_INCIDENT_LITE === "false") {
        lite = false; 
    }

    let updatedUrl = url;
    if(this.props.userInfo.role.includes("reviewer")) {
      updatedUrl = `${url}?isReviewer=true`
    } else if(this.props.userInfo.role.includes("supervisor")) {
      updatedUrl = `${url}?isApprover=true`
    } 

    let urlWithParams = this.props.userInfo.isSubmitter
    ? url + "?createdBy=" + this.props.userInfo.userId + `&lite=${lite}&pageNumber=${val}`
    : updatedUrl + `&lite=${lite}&pageNumber=${val}`;


    const incResp = await get(
      urlWithParams,
      this.props.userInfo
    );
    const { t } = this.props;
    if (incResp.error) {
      this.props.enqueueSnackbar(
        this.props.userInfo.isUnderwriting
          ? t("home.claim-list.error-policies")
          : t("home.claim-list.error-claims"),
        { variant: "error", autoHideDuration: 3000 }
      );
      return [];
    } else {
      let incidents =
        incResp.data && incResp.data.length > 0 ? incResp.data : [];
      //incidents = incidents.filter((i) => i.status === "submitted");
      this.props.storeIncidents(incidents);
      this.setState({
        notification: "",
        initialized: true,
        incidents: incidents,
        currentPage: val,
        Loading: false,
      });
    }
  };

  getRecentIncidents = async (url, userInfo) => {

    let updatedUrl = url;
    if(userInfo.role.includes("reviewer")) {
      updatedUrl = `${url}?pagingInfoOnly=true&isReviewer=true`
    } else if(userInfo.role.includes("supervisor")) {
      updatedUrl = `${url}?pagingInfoOnly=true&isApprover=true`
    } else {
      updatedUrl = `${url}?createdBy=${this.props.userInfo.userId}`;
    }
    if(userInfo.role.includes("reviewer") || userInfo.role.includes("supervisor")) {
      const incidentsInfo = await get(
        updatedUrl,
        userInfo
      );
      if (incidentsInfo.data) {
        this.setState({
          totalRecords: incidentsInfo.data.totalRecords,
          recordsPerPage: incidentsInfo.data.recordsPerPage,
          totalPage: incidentsInfo.data.pageCount,
          currentPage: 1,
        });
        this.getIncidents(this.state.currentPage);
  
      }
    } else {
      this.getIncidents(1);
    }
  };

  handleCloseRejectAlert = () => {
    this.setState({ showRejectAlert: false });
  };
  render() {
    console.log("CLAIM LIST RENDERED");
    if (this.state.initialized === false) {
      return <Loading notification={this.state.notification} />;
    }

    const { t, classes, userInfo } = this.props;
    return (
      <Grid container className={classes.root}>
        <Grid item xs={12} className={classes.topnav}>
          <TopNav
            hasMore={
              process.env.REACT_APP_FIREBASE_PROJECT_ID === "galaxy-us-demo" ||
              process.env.REACT_APP_FIREBASE_PROJECT_ID === "elaguila-mx-beta"
                ? false
                : true
            }
          />
        </Grid>
        <Grid item container className={classes.list}>
          {this.state.createClaim ? <NewClaim /> : null}
          <Grid
            item
            xs={12}
            style={{
              flexDirection: "row",
              display: "flex",
              borderBottom: 1,
              borderBottomColor: "#eee",
              borderBottomStyle: "solid",
              paddingTop: 5,
              paddingBottom: 5,
            }}
          >
            <Grid item xs={3}>
              <div style={{ marginTop: "10px" }} className={classes.link}>
                {this.props.userInfo.isUnderwriting
                  ? t("home.claim-list.my-policies")
                  : t("home.claim-list.my-claims")}
              </div>
            </Grid>
            <Grid item xs={9}>
              <div
                style={{
                  float: "right",
                  flexDirection: "row",
                  display: "flex",
                }}
              >
                <Button
                  disabled={this.state.currentPage <= 1}
                  className={classes.link}
                  onClick={() => this.getIncidents(this.state.currentPage - 1)}
                >
                  {"<Prev"}
                </Button>
                <Button disabled={true} style={{ fontSize: "80%" }}>
                  {this.state.currentPage}/{this.state.totalPage}
                </Button>
                <Button
                  disabled={this.state.currentPage >= this.state.totalPage}
                  className={classes.link}
                  onClick={() => this.getIncidents(this.state.currentPage + 1)}
                >
                  {"Next>"}
                </Button>
              </div>
            </Grid>
          </Grid>
          {this.state.Loading ? (
            <Grid item xs={12}>
              <Loading notification={this.state.Loading} />
            </Grid>
          ) : (
            this.state.incidents.map((item, index) => (
              <ClaimItem
                key={index}
                item={item}
                user={userInfo}
                claim_status={1}
              />
            ))
          )}
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userInfo: state.userReducer.userInfo,
    incidents: state.incidentReducer.incidents,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    clearData: () => dispatch(clearAllStateData()),
    storeIncidents: (incidents) => dispatch(storeIncidents(incidents)),
    clearClone: () => dispatch(clearClonedAppraisal()),
  };
};

export default withNamespaces("common")(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(withSnackbar(ClaimsList)))
);
