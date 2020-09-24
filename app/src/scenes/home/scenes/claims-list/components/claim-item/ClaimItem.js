import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import "./styles.scss";
import { withNamespaces } from "react-i18next";
import { Grid } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { SmartImage } from "../../../../components";
import { ImageViewer } from "../../../../../../components";
import { connect } from "react-redux";
import { storeCurrentIncident } from "../../../../../../actions";
import { get } from "../../../../../../api/http_proxy";

const styles = theme => ({
  root: {
    flexGrow: 1,
    borderBottom: 1,
    borderBottomColor: "#eee",
    borderBottomStyle: "solid",
    paddingTop: 5,
    paddingBottom: 5
  },

  textContainer: {
    padding: theme.spacing(1),
    justifyContent: "center"
  },
  vehicleInfo: {
    fontWeight: 700,
    fontSize: 16,
    marginBottom: -10
  },
  inActive: {
    color: "#666"
  },
  claimInfo: {
    fontWeight: 400,
    fontSize: 12,
    color: "#666",
    textTransform: "capitalize"
  },
  dateInfo: {
    fontWeight: 400,
    fontSize: 10,
    color: "#666"
  },
  reportInfo: {
    fontWeight: 700,
    fontSize: 12,
    color: "#0fafef"
  },
  hidden: {
    display: "none"
  }
});

const titleCase = text => {
  return text
    .split(" ")
    .map(item => item[0] !== undefined ? (item[0].toUpperCase() + item.substr(1, item.length)) : '')
    .join(" ");
};

class ClaimItem extends Component {
  state = {
    loaded: false,
    goToDetail: false
  };

  imageLoaded = e => {
    this.setState({ loaded: true });
  };

  handleClick = async(incident) => {

    console.log(this.props.item);

    // const iurl = process.env.REACT_APP_INCIDENT_API_ENDPOINT + this.props.item.incidentId
    // const selectedIncident = await get(
    //   iurl,
    //   this.props.userInfo
    // );
    //console.log("Returned incident detail from API call: " + JSON.stringify(selectedIncident.data));
    this.props.storeCurrentIncident(this.props.item);
    this.setState({ goToDetail: true });
  };

  render() {
    const { t, classes, item, user } = this.props;
    const { isSupervisor, isReviewer, isUnderwriting, isSubmitter } = user;
    if (this.state.goToDetail === true) {
      return <Redirect push to={`/item-detail`} />;
    }
    const damageImages = item.hasOwnProperty("images") && item.images.length > 0 ? item.images.filter((it) => it.contentType === 'damage') : [];
    const make = item.hasOwnProperty("vehicles") && item.vehicles.length > 0 ? titleCase(item.vehicles[0].make) : null;
    const model = item.hasOwnProperty("vehicles") && item.vehicles.length > 0 ? titleCase(item.vehicles[0].model) : null;
    const year = item.hasOwnProperty("vehicles") && item.vehicles.length > 0 ? item.vehicles[0].year : null;

    const firstImage = damageImages.length > 0 ? damageImages[0] : null;
    const date = new Date(item.createdAt).toLocaleDateString();

    let reportStatus = null;
    let system = isUnderwriting ? t("home.claim-list.policy") : t("home.claim-list.claim");
    let state = t("home.claim-list.state-" + item.state.replace(" ", "-"));
    // supervisor
    if (isSubmitter && item.state === 'appraised'){
      reportStatus = <div onClick={this.handleClick}>{t("home.claim-list.view")} {system}</div>
    } else if (isSubmitter && item.state !== 'appraised') {
      reportStatus = <div className={classes.inActive}> {isUnderwriting ? t("home.claim-list.policy-is-being-analyzed") : t("home.claim-list.claim-is-being-analyzed")} </div>
    } else if (isSupervisor && item.state === 'reviewed') {
      reportStatus = <div onClick={this.handleClick}>{t("home.claim-list.approve")} {system}</div>
    } else if (isSupervisor && item.state === 'appraised') {
      reportStatus = <div onClick={this.handleClick}>{t("home.claim-list.view")} {system}</div>
    } else if (isSupervisor) {
      // reportStatus = <div className={classes.inActive}>{system} is being reviewed</div>
      reportStatus = "";
      // reviewer
    } else if (isReviewer && item.state === 'in progress') {
      // reportStatus = <div className={classes.inActive}>{system} is {item.state}</div>
      reportStatus = "";
    } else if (isReviewer && item.state === 'pending review') {
      reportStatus = <div onClick={this.handleClick}>review {system}</div>
    } else if (isReviewer) {
      reportStatus = <div onClick={this.handleClick}>{t("home.claim-list.view")} {system}</div>
      // claimaint
    } else if (isSupervisor === false && isReviewer === false && state === 'appraised') {
      reportStatus = <div onClick={this.handleClick}>{t("home.claim-list.view")} {system}</div>
    } else {
      // reportStatus = <div className={classes.inActive}>{system} is {item.state}</div>
      reportStatus = <div className={classes.inActive}>{system} {t("home.claim-list.is")} {state}</div>
    }

    return (
      <Grid container className={classes.root}>
        <Grid container className={classes.imageContainer} item xs={4}>
          {/* <ImageViewer src={firstImage.url} orientation={firstImage.orientation} /> */}
          <SmartImage image={firstImage} />
        </Grid>
        <Grid container item xs={8} className={classes.textContainer}>
          <Grid item xs={12} className={classes.vehicleInfo}>
            {make} {model}, {year}
          </Grid>
          <Grid item xs={12} className={classes.claimInfo}>
          </Grid>
          <Grid item xs={12} className={classes.dateInfo}>
            {t("home.claim-list.submitted-on")}:  {date}
          </Grid>
          {
            isSupervisor || isReviewer ? (
              <Grid item xs={12} className={classes.claimInfo}>
                {t("home.claim-list.state")}: {state}
              </Grid>
            ) : null
          }
          <Grid item xs={12} className={classes.reportInfo}>
            {reportStatus}
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = state => {
  return {
    userInfo: state.userReducer.userInfo,
    currentIncident: state.incidentReducer.currentIncident,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    storeCurrentIncident: incident => dispatch(storeCurrentIncident(incident))
  };
};

export default withNamespaces("common")(
  connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ClaimItem))
)

