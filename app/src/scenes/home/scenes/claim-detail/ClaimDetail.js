import React, { Component } from "react";
import { TopNav } from "../../../../components";
import { Link, Redirect } from "react-router-dom";

import { Grid, Divider, Typography } from "@material-ui/core";
import { Alert } from "reactstrap";
import { get, sendData } from "../../../../api/http_proxy";
import { withNamespaces } from "react-i18next";
import { connect } from "react-redux";
import {
  storeParts,
  storeDamages,
  storeImages,
  storeGrades,
  storeAppraisal,
  cloneAppraisal,
  resetModifiedFlag,
  addReportId
} from "../../../../actions";
import { withSnackbar } from "notistack";
import { withStyles } from "@material-ui/core/styles";
import { ClaimImage, VehicleFooter, Loading } from "../../components";
import {
  buildDamageList,
  buildAppraisal,
  randomInteger
} from "../../components/Utils";
import { AuthContext } from "../../../Auth"

import "./styles.scss";

const styles = theme => ({
  root: {
    flexGrow: 1,
    // maxWidth: 600,
    margin: "auto"
  },
  container: {
    flexGrow: 1
  },
  idContainer: {
    display: "flex",
    flexGrow: 0.3
  },
  idContent: {
    flex: "auto",
    fontSize: 12
  },
  input: {
    display: "none"
  },
  claimInfo: {
    fontWeight: "bold",
    fontSize: 12
  },
  image: {
    height: "auto",
    width: "100%"
    // height: "100%"
    // maxWidth: 120
  },
  editIcon: {
    fontSize: "18px",
    paddingRight: "10px"
    // bottom: 20,
    // right: 20
  }
});

class ClaimDetail extends Component {
  constructor() {
    super();

    this.state = {
      error: false,
      isLoading: true,
      navigateTo: null,
      isPostReport: false,
      damagesLoaded: false,
      newReport: true,
      reportId: ""
    };
  }

  static contextType = AuthContext

  componentDidMount = async () => {

    window.removeEventListener("resize", (resize) => {});
    console.log("PROPS");
    console.log(this.props);

    const user = this.context
    // Check if claim info already exists (as a clone)
    const { clone, userInfo, currentIncident, t } = this.props;

    // this.setState({ pictureList: this.props.pictures });
    // if (this.props.damages.length > 0) {
    //   return;
    // }
    this.setState({
      currentIncident: currentIncident
    });

    // console.log(clone.incident_id);
    console.log("USER INFO");
    console.log(userInfo);

    if (clone && clone.incidentId === currentIncident.incidentId) {
      console.log("claim already exists, rebuild it");
      // this.rebuildAppraisal();
      //TO DO: get below working
      const appraisalId = this.props.modified ? clone.appraisalId : clone.clonedFrom;
      const estimateData = await this.getAlgoEstimationData(appraisalId, userInfo);
      console.log("REPORT DATA");
      console.log(estimateData);
      if (estimateData && typeof (estimateData.claimSeverity) !== "undefined") {
        console.log("REPORT FOUND SO NEWREPORT FALSE");
        this.setState({ newReport: false });
      }

      this.setState({
        isLoading: false,
        isPostReport: false,
        damagesLoaded: true
      });
    } else {
      if (
        currentIncident.hasOwnProperty("vehicles") &&
        currentIncident.hasOwnProperty("images")
      ) {

        this.props.saveImages(currentIncident.images);
        console.log("====================================");
        console.log("CURRENT INCIDENT");
        console.log(currentIncident);
        console.log("====================================");

        const headers = {
          "x-galaxyai-role": this.props.userInfo.isSubmitter ? "submitter" : "admin"
        };
        const aprResp = await get(
          `${process.env.REACT_APP_APPRAISAL_API_ENDPOINT}?incidentId=${currentIncident.incidentId}`,
          userInfo,
          headers
        );
        console.log("APPRAISAL RESPONSE");
        // MERGE FLAG: get vehicle data and set these values some other way... or just store the vehicle
        // this.props.licenseReading(result.idtVehicle.veh_registration)
        // this.props.odometerReading(result.idtVehicle.veh_odometer)
        // this.props.storeIncident({ incident_id: id });
        console.log("====================================");
        console.log(aprResp);
        if (aprResp.error) {
          this.props.enqueueSnackbar(t("incident-detail.appraisal-error"), {
            variant: "info",
            autoHideDuration: 3000
          });
          this.setState({
            isLoading: false,
            damagesLoaded: false
          });
        } else {
          const appraisal = !aprResp.error && aprResp.data ? aprResp.data : {};
          if (!appraisal) {
            throw t("incident-detail.appraisal-error");
          }

          await this.props.saveAppraisal(appraisal);
          const clone = await buildAppraisal(appraisal, userInfo.userId);
          this.props.saveClone(clone);

          const estimateData = await this.getAlgoEstimationData(
            appraisal.appraisalId,
            userInfo
          );
          console.log("REPORT DATA");
          console.log(estimateData);
          if (estimateData && typeof (estimateData.claimSeverity) !== "undefined") {
            console.log("REPORT FOUND SO NEWREPORT FALSE");
            this.setState({ newReport: false });
          }

          const damageList = await buildDamageList(clone);
          console.log("DAMAGE LIST");
          console.log(damageList);
          await this.props.saveDamages(damageList);

          this.setState({
            isLoading: false,
            damagesLoaded: true
          });
        }

      } else {
        this.props.enqueueSnackbar(t("incident-detail.missing-data-error"), {
          variant: "error",
          autoHideDuration: 3000
        });
        this.setState({
          isLoading: false,
          damagesLoaded: false
        });
      }
    }
  };

  getActiveAppraisal = async url => {
    console.log("getting active appraisal");
    let headers = {
      "x-galaxyai-role": this.props.userInfo.isSubmitter ? "submitter" : "admin"
    };

    try {
      const resp = await get(url, this.props.userInfo, headers);
      console.log("====================================");
      console.log("ACTIVE APPRAISAL RESP");
      console.log(resp);

      if (resp.error) {
        this.props.enqueueSnackbar(
          this.props.t("incident-detail.appraisal-error"),
          { variant: "error", autoHideDuration: 3000 }
        );
        return {
          error: resp,
          data: null
        };
      } else {
        const appraisal = resp.data;
        console.log(appraisal);
        console.log("====================================");

        return {
          error: null,
          data: appraisal
        };
      }
    } catch (error) {
      console.log("COULD NOT GET APPRAISAL");
      console.log(error);

      this.props.enqueueSnackbar(
        this.props.t("incident-detail.appraisal-error"),
        { variant: "error", autoHideDuration: 3000 }
      );

      return {
        data: null,
        error: error
      };
    }
  };

  getAlgoEstimationData = async (appraisalId, userInfo) => {
    console.log("Get reports for the following appraisal, ", appraisalId);

    const url =
      process.env.REACT_APP_REPAIR_REPLACE_API_ENDPOINT +
      `?appraisalId=${appraisalId}`;
    try {
      const response = await get(url, userInfo);
      console.log("GET LATEST ESTIMATE RESPONSE");
      console.log(response);
      return response.data
    } catch (error) {
      console.log("ERROR GETTING LATEST ESTIMATE");
      console.log(error);
      return null
    }

  };

  uploadAppraisal = async (redirect) => {
    console.log("CLAIM DETAIL SAVE APPRAISAL CLICKED");
    this.setState({ isLoading: true });
    let headers = {
      "Content-Type": "application/json",
      "x-galaxyai-role": this.props.userInfo.isSubmitter ? "submitter" : "admin"
    };
    console.log(process.env.REACT_APP_APPRAISAL_API_ENDPOINT);
    console.log(this.props.clone);
    console.log(headers);
    // const data = JSON.stringify(this.props.clone);
    // const response = await axios.post(process.env.REACT_APP_APPRAISAL_API_ENDPOINT, data, config);

    var clone = this.props.clone;
    var parts = clone.parts.filter((item) => item.hasOwnProperty("damages") && item.damages.length>0);
    clone.parts = parts;
    console.log("saved val",clone);
    const response = await sendData(
      "POST",
      process.env.REACT_APP_APPRAISAL_API_ENDPOINT,
      clone,
      this.props.userInfo,
      headers
    );

    if (!response.error) {
      await this.props.saveAppraisal(clone);
      const newClone = await buildAppraisal(
        clone,
        this.props.userInfo.userId
      );
      console.log(newClone,clone)
      await this.props.saveClone(newClone);
      const damageList = await buildDamageList(newClone);
          console.log("DAMAGE LIST");
          console.log(damageList);
          await this.props.saveDamages(damageList);
      this.props.enqueueSnackbar(
        this.props.t("home.review-intro.upload-successful"),
        { variant: "success", autoHideDuration: 3000 }
      );
      if (redirect && redirect.length > 0) {
        this.setState({ navigateTo: redirect });
      }
    } else {
      console.log("SOME SORT OF ERROR OCCURED UPLOADING THE APPRAISAL DATA");
      console.log(response);
      this.props.enqueueSnackbar(
        this.props.t("home.review-intro.upload-failure"),
        { variant: "error", autoHideDuration: 3000 }
      );
    }
    this.setState({ isLoading: false });

  };

  postEstimateData = async (appraisal, images) => {

    let headers = {
      "Content-Type": "application/json",
      "x-galaxyai-role": "admin"
    };

    // const headers = {};
    const data = {
      userId: this.props.userInfo.userId,
      appraisal: appraisal,
      images: images.filter(image => image.contentType === 'damage')
    };
    console.log(data);
    console.log(process.env.REACT_APP_REPAIR_REPLACE_API_ENDPOINT);
    console.log(headers);
    const response = await sendData(
      "POST",
      process.env.REACT_APP_REPAIR_REPLACE_API_ENDPOINT,
      data,
      this.props.userInfo,
      headers
    );

    console.log("====================================");
    console.log("SAVE REPAIR/REPLACE ESTIMATION RESPONSE");
    console.log(response);
    console.log("====================================");
    return response

  };

  generateReport = async () => {
    console.log("In Generate Report");
    if (this.props.images.length > 0 || (this.props.userInfo.isUnderwriting === false && this.props.damages.length > 0) || this.props.isUnderwriting) {

      if (this.props.modified || this.state.newReport) {
        if(this.props.damages.length>0){
          const resp = await this.postEstimateData(this.props.appraisal, this.props.currentIncident.images);
          console.log("Estimate Response");
          console.log(resp);
  
          if (resp.error) {
            this.setState({ isPostReport: false });
            this.props.enqueueSnackbar(
              this.props.t("incident-detail.please-try-again"),
              { variant: "error", autoHideDuration: 3000 }
            );
          } else {
            console.log("redirect to estimation");
            this.setState({ isCompleted: true, isPostReport: false });
          }
        }
        else{
          console.log("redirect to estimation");
          this.setState({ isCompleted: true, isPostReport: false });
        }

        
      } else {
        console.log("NO CHANGES TO REPORT SO RETRIEVE PREVIOUS ONE");
        this.setState({ isCompleted: true, isPostReport: false });
      }
    } else {
      this.props.enqueueSnackbar(this.props.t("incident-detail.error"), {
        variant: "warning",
        autoHideDuration: 4000
      });
    }
  };

  render() {
    const { classes, userInfo, t, currentIncident } = this.props;
    const damageImages =
      currentIncident && typeof (currentIncident.images) !== "undefined"
        ? currentIncident.images.filter(image => image.contentType === "damage")
        : [];

    const incidentId = currentIncident && typeof (currentIncident.incidentId) !== "undefined" ? currentIncident.incidentId : "";
    const make = currentIncident && typeof (currentIncident.vehicles) !== "undefined" && currentIncident.vehicles[0].make !== undefined ? currentIncident.vehicles[0].make : null;
    const model = currentIncident && typeof (currentIncident.vehicles) !== "undefined" && currentIncident.vehicles[0].model !== undefined ? currentIncident.vehicles[0].model : null;
    const year = currentIncident && typeof (currentIncident.vehicles) !== "undefined" && currentIncident.vehicles[0].year !== undefined ? currentIncident.vehicles[0].year : null;


    if (this.state.navigateTo) {
      return <Redirect push to={this.state.navigateTo} />;
    }
    // const modified =
    //   this.props.damages.filter(damage => damage.modified === true).length > 0;
    if (this.state.isCompleted) {
      if (this.props.userInfo.isUnderwriting) {
        // return <Redirect push to="/analysis" />
        return <Redirect push to="/report" />;
      } else {
        return <Redirect push to="/estimation" />;
      }
    }

    const alertMessage =
      userInfo.isSupervisor || userInfo.isReviewer
        ? t("incident-detail.alert-message1")
        : t("incident-detail.alert-message2");

    if (this.state.error === true) {
      return (
        <div className={classes.root}>
          <div className={classes.content}>
            <Grid container justify="center" alignContent="center">
              <Grid item xs={12}>
                <TopNav
                  modified={this.props.modified}
                  uploadAppraisal={this.uploadAppraisal}
                  hasMore
                  goBack={() => this.props.history.goBack()}
                />
              </Grid>
              {/* <Grid item xs={12}>
              <Title title={"Claim Detail"} />
            </Grid> */}
              <Grid item xs={12} container className={classes.container}>
                <Typography variant="h5">
                  {t("incident-detail.message")}
                </Typography>
                <Grid xs={12} item className="link-navigation-container">
                  <Link className="link-button" to="/">
                    {t("incident-detail.go-back")}
                  </Link>
                </Grid>
              </Grid>
            </Grid>
          </div>
        </div>
      );
    }
    if (this.state.isLoading === true) {
      return (
        <Loading
          notification={
            this.props.userInfo.isUnderwriting
              ? t("general.loading-policy")
              : t("general.loading-claim")
          }
        />
      );
    }

    if (this.state.isPostReport === true) {
      return <Loading notification={t("general.creating-report")} />;
    }

    return (
      <div className={classes.root}>
        <div className={classes.content}>
          <Grid container>
            <Grid item xs={12}>
              <TopNav
                modified={this.props.modified}
                uploadAppraisal={this.uploadAppraisal}
                hasMore
                goBack={() => this.props.history.goBack()}
              />
            </Grid>
            <Grid item xs={12}>
              <div className="car-specs">
                <div className="info">
                  <label className="name">
                    {make +
                      " " +
                      model +
                      " " +
                      year}
                  </label>
                </div>
                <div className="claim">
                  {(this.props.userInfo.isUnderwriting) ? t("incident-detail.policy-id") : t("incident-detail.claim-id")}  : <label className="id">{incidentId}</label>
                </div>
              </div>
            </Grid>
            <Grid item xs={12} container className={classes.container} style={{ marginTop: "20px" }}>
              <Alert color="info">{alertMessage}</Alert>
            </Grid>
            <Grid item xs={12} container className={classes.container}>
              {damageImages.map((pic, index) => (
                <Grid item xs={6} sm={4} lg={2} key={index} container>
                  <ClaimImage
                    userInfo={userInfo}
                    image={pic}
                    currentPath={this.props.match.url}
                    damagesLoaded={this.state.damagesLoaded}
                    grades={this.props.grades}
                    parent="itemDetail"
                  />
                </Grid>
              ))}
            </Grid>

            <Grid item xs={12}>
              <VehicleFooter
                userInfo={userInfo}
                currentIncident={currentIncident}
                odometerInfo={
                  currentIncident && typeof(currentIncident.vehicles) !== "undefined" && currentIncident.vehicles[0].odometer !== undefined
                    ? currentIncident.vehicles[0].odometer
                    : null
                }
                odometerImage={
                  currentIncident && typeof(currentIncident.images) !== "undefined" && currentIncident.images.filter(image => image.contentType === 'odometer').length > 0
                    ? currentIncident.images.filter(image => image.contentType === 'odometer')[0]
                    : null
                }
                licenseInfo={
                  currentIncident && typeof(currentIncident.vehicles) !== "undefined" && currentIncident.vehicles[0].licensePlateNumber !== undefined
                    ? currentIncident.vehicles[0].licensePlateNumber
                    : null
                }
                licenseImage={
                  currentIncident && typeof(currentIncident.images) !== "undefined" && currentIncident.images.filter(image => image.contentType === 'license').length > 0
                    ? currentIncident.images.filter(image => image.contentType === 'license')[0]
                    : null
                }
                registrationImage={
                  currentIncident && typeof(currentIncident.images) !== "undefined" && currentIncident.images.filter(image => image.contentType === 'registration').length > 0
                    ? currentIncident.images.filter(image => image.contentType === 'registration')[0]
                    : null
                }
                drivingLicenseInfo={
                  currentIncident && typeof(currentIncident.vehicles) !== "undefined" && currentIncident.vehicles[0].firstPartyLicenseNumber !== undefined
                    ? currentIncident.vehicles[0].firstPartyLicenseNumber
                    : null
                }
                drivingLicenseImage={
                  currentIncident && typeof(currentIncident.images) !== "undefined" && currentIncident.images.filter(image => image.contentType === 'drivingLicense').length > 0
                    ? currentIncident.images.filter(image => image.contentType === 'drivingLicense')[0]
                    : null
                }
                accidentInfo={
                  currentIncident && typeof(currentIncident.description) !== "undefined" && currentIncident.description !== undefined
                    ? currentIncident.description
                    : null
                }
                damages
                generateReport={this.generateReport}
                loaded={this.state.damagesLoaded}
                newReport={this.state.newReport}
                modified={this.props.modified}
                uploadAppraisal={this.uploadAppraisal}
              />
              <Grid item xs={12}>
                <Divider variant="fullWidth" />
              </Grid>
              {/* <Grid>
                {(this.props.userInfo.isSupervisor ||
                  this.props.userInfo.isReviewer) &&
                  this.state.damagesLoaded ? (
                    <div className="btnWrapper">
                      <div className="link-navigation-container">
                        <Link to="/analysis" className="link-button">
                          {t("incident-detail.beta-butterfly")}
                        </Link>
                      </div>
                    </div>
                  ) : null}
              </Grid> */}
            </Grid>
          </Grid>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    // vehicleInfo: state.incidentReducer.currentIncident.vehicles[0],
    userInfo: state.userReducer.userInfo,
    parts: state.partReducer.parts,
    damages: state.damageReducer.damages,
    modified: state.damageReducer.modified,
    images: state.resultReducer.images,
    grades: state.gradeReducer.grades,
    currentIncident: state.incidentReducer.currentIncident,
    appraisal: state.resultReducer.appraisal,
    clone: state.resultReducer.clonedAppraisal,
    reportId: state.reportReducer.reportId
  };
};

const mapDispatchToProps = dispatch => {
  return {
    saveGrades: grades => dispatch(storeGrades(grades)),
    // saveClaimId: incidentId => dispatch(storeCurrentIncident(incident)),
    saveParts: parts => dispatch(storeParts(parts)),
    saveDamages: damages => dispatch(storeDamages(damages)),
    saveImages: images => dispatch(storeImages(images)),
    saveAppraisal: appraisal => dispatch(storeAppraisal(appraisal)),
    // storeIncident: incident => dispatch(storeIncident(incident)),
    saveClone: clone => dispatch(cloneAppraisal(clone)),
    resetModified: () => dispatch(resetModifiedFlag()),
    addReportId: reportId => dispatch(addReportId(reportId))
  };
};

export default withNamespaces("common")(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(withSnackbar(ClaimDetail)))
);
