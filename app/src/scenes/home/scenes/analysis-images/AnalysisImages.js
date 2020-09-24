import React from 'react'
import {
  Title,
  TopNav,
} from "../../../../components";
import { Loading } from "../../components";
import { connect } from 'react-redux';
import { Alert } from 'reactstrap';
import { withNamespaces } from "react-i18next";
import { withSnackbar } from "notistack";
import { CircularProgress } from '@material-ui/core';
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import "./styles.scss";
import { ClaimImage, VehicleFooter } from "../../components";
import { Button } from '@material-ui/core';
import { DropDown } from "../../../../components";
import { cloneAppraisal, addReportId, storeDamages, resetModifiedFlag } from "../../../../actions";
import { buildDamageList, buildAppraisal, getReportInput } from "../../components/Utils";
import { get, post, put } from "../../../../api/http_proxy";
import uuid from "uuid";
import { Redirect, Link } from "react-router-dom";

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    height: 140,
    width: 100,
  },
  container: {
    flexGrow: 1
  },
  input: {
    display: "none"
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    margin: theme.spacing(0.2),
    background: "#f7f7f7"
    // padding: 10
  },
  image: {
    height: "auto",
    width: "100%"
    // height: "100%"
    // maxWidth: 120
  },
  icon: {
    position: "relative",
    bottom: 20,
    right: 20
  }
});

class AnalysisImages extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selected_images: [],
      isLoading: false,
      navigateTo: null,
      newReport: false,
      isPostReport: false,
      decisionList: ["repair", "replace"],
      currentDecisionValue: ""
    }
  }
  componentDidMount() {
    console.log("LOCATION STATE");
    console.log(this.props.location.state);
    var res = this.props.results;
    var imgs = this.props.images;
    console.log("ANALYSIS IMAGES PROPS, RESULTS AND IMAGES");
    console.log(this.props);
    var final_image_ids = []
    for (let i = 0; i < res.id.length; i++) {
      var temp = res.id[i]
      for (let j = 0; j < imgs.length; j++) {
        if (imgs[j].imageId === temp) {
          final_image_ids = final_image_ids.concat(imgs[j])
        }
      }
    }
    console.log("RENDERED DECISION FROM ESTIMATION SCREEN");
    console.log(res.decision.length);
    console.log(typeof res.decision);
    this.setState({
      newReport: res.decision.length > 0 ? true : false,
      selected_images: final_image_ids,
      currentDecisionValue: res.decision
    })
    console.log(this.state.selected_images)
  }

  uploadAppraisal = async (navigateTo = null) => {
    console.log("ANALYSIS IMAGES SAVE APPRAISAL CLICKED");
    this.setState({ isLoading: true });
    console.log(this.props.clone);

    const url = "/oshot/appraisal";
    try {
      const response = await post(url, this.props.clone);
      if (
        response &&
        response.data &&
        response.data.hasOwnProperty("appraisal_id")
      ) {

        console.log("====================================");
        console.log("RESPONSE");
        console.log(response);
        console.log("====================================");
        const newClone = buildAppraisal(this.props.clone);
        await this.props.saveAppraisal(newClone);
        this.props.enqueueSnackbar(
          this.props.t("home.review-intro.upload-successful"),
          { variant: "success", autoHideDuration: 2000 }
        );
        const damageList = buildDamageList(newClone);
        console.log("DAMAGE LIST");
        console.log(damageList);
        this.props.saveDamages(damageList);
        this.setState({ isLoading: false });
      } else {
        this.setState({ isLoading: false });
        console.log("SOME SORT OF ERROR OCCURED UPLOADING THE APPRAISAL DATA");
        console.log(response);
        this.props.enqueueSnackbar(
          this.props.t("home.review-intro.upload-failure"),
          { variant: "error", autoHideDuration: 2000 }
        );
      }

    } catch (uploadErr) {
      this.setState({ isLoading: false });
      console.log("SOME SORT OF ERROR OCCURED UPLOADING THE APPRAISAL DATA");
      console.log(uploadErr);
      this.props.enqueueSnackbar(
        this.props.t("home.review-intro.upload-failure"),
        { variant: "error", autoHideDuration: 2000 }
      );
    }

    if(navigateTo === 'goBack'){
      this.handleGoBack();
    }else if(navigateTo){
      this.setState({ navigateTo: navigateTo });
    }
  };

  postEstimateData = async (reportInput) => {

    // this.setState({ isLoading: true });
    const url = "/oshot/repairreplaceestimates";
    let appraisalId = null;
    if (this.props.modified) {
      appraisalId = this.props.clone.appraisal_id
    } else {
      appraisalId = this.props.clone.apr_clonedFrom
    }
    const reportId = uuid.v4()
    this.props.addReportId(reportId)
    const payload = {
      report_id: reportId,
      appraisal_id: appraisalId,
      user_id: this.props.userInfo.userId,
      report_input: {
        "allDamages": reportInput
      }
    }
    console.log("====================================");
    console.log("CLAIM DETAIL REPORT ID ", reportId);
    console.log("====================================");

    const response = await post(url, payload);
    return response;

  };
  generateReport = async () => {

    this.setState({ isPostReport: true });
    console.log("In Generate Report Analysis Image");
    const reportInput = getReportInput(this.props.clone, this.props.images, this.props.results, this.state.currentDecisionValue);
    console.log("Report Input");
    console.log(reportInput);
    if (reportInput && reportInput.length > 0) {
      const resp = await this.postEstimateData(reportInput);
      console.log("Estimate Response");
      console.log(resp);

      if ((typeof resp.data === 'string' && resp.data.includes("Internal server error")) || (resp.hasOwnProperty("ok") && resp.ok === false)) {
        this.setState({ isPostReport: false });
        this.props.enqueueSnackbar(
          this.props.t("home.analysis-images.try-again"),
          { variant: "error", autoHideDuration: 3000 }
        );
      } else {
        console.log("redirect to estimation");
        this.setState({ isPostReport: false, navigateTo: "/estimation" });
      }
    } else {
      this.props.enqueueSnackbar(
        this.props.t("home.analysis-images.error1"),
        { variant: "warning", autoHideDuration: 4000 }
      );
      this.setState({ isPostReport: false });
    }

  };

  handleDecisionChange = evt => {
    console.log("HANDLE DECISION CHANGE");
    if (evt.target.value === "" || evt.target.value === null) {
      console.log("No change in decision was made, so stick with the decision that was passed through");
      console.log(this.props.results.decision);
      this.setState({ newReport: false });
    } else {
      console.log("Decision changed");
      console.log(evt.target.value);
      this.setState({ currentDecisionValue: evt.target.value, newReport: true });
    }
  };

  handleGoBack = () => {
    const locationState = this.props.location.state !== "undefined" ? this.props.location.state : null;
    console.log(locationState);
    if (locationState && locationState.hasOwnProperty("returnPath") && locationState.returnPath === "/estimation") {
      console.log("generateReport kicked off");
      this.generateReport();
    } else {
      this.props.history.goBack();
    }
  }

  render() {
    const { t, classes, pictureList, userInfo, results } = this.props;
    const StyledButton = withStyles({
      text: {
        padding: 0,
        margin: 0
      },
      label: {
        textTransform: 'capitalize',
        color: "#0fafef",
        fontSize: "1rem"
      }
    })(Button);
    if (this.state.navigateTo) {
      return <Redirect push to={this.state.navigateTo} />;
    }
    if (this.state.isPostReport === true) {
      return <Loading notification={t("general.creating-report")} />;
    }
    if (this.state.isLoading === true) {
      return <Loading notification={(this.props.userInfo.isUnderwriting) ? t("home.analysis-images.saving-policy") : t("home.analysis-images.saving-claim")} />;
    }

    return (
      <Grid container className='odometer-container'>
        <TopNav modified={this.props.modified} uploadAppraisal={this.uploadAppraisal} backType="backward" hasMore goBack={() => this.handleGoBack()} />
        <div className="content">
          <Title className={classes.aiTitle}
            title={this.props.results.damage.replace(/_/g, " ")}
            subtitle={` ${t("home.analysis-images.sub-title-1")} ${this.props.results.damage.replace(/_/g, " ")} ${t("home.analysis-images.sub-title-2")}`}
          />
          <Grid item xs={12} container className={classes.container}>
            {this.state.selected_images.map((pic, index) => (
              <Grid item xs={6} sm={4} lg={2} key={index} container>
                <Grid item className={classes.imageContainer}>
                  <ClaimImage
                    userInfo={this.props.userInfo}
                    image={pic}
                    currentPath={this.props.match.url}
                    damagesLoaded={true}
                    gradesLoaded={true}
                    grades={this.props.grades}
                  />
                </Grid>
              </Grid>
            ))}
          </Grid>
          {(userInfo.isSupervisor || userInfo.isReviewer) && !userInfo.isUnderwriting ? (
            <Grid item xs={12}>
              <Alert style={{marginTop: "20px"}} color="warning">To edit the repair/replace decision for this part change the value in the dropdown below and generate the report again.</Alert>
              <DropDown
                options={this.state.decisionList.map(item => {
                  return { label: item, value: item };
                })}
                onChange={this.handleDecisionChange}
                currentValue={this.state.currentDecisionValue}
                id="id-decision"
                name="decision"
                placeholder={t("home.analysis-images.placeholder")}
              />
            </Grid>
          ) : null}
          <VehicleFooter
            userInfo={this.props.userInfo}
            currentIncident={this.props.currentIncident}
            licenseInfo={this.props.license_Reading}
            registration_number={this.props.regsitration_number}
            accidentInfo={this.props.accidentInfo}
            odometerInfo={this.props.odometer_Reading}
            damages
            generateReport={this.generateReport}
            loaded={true}
            newReport={this.state.newReport}
            inAnalysisImage={true}
            modified={this.props.modified}

            uploadAppraisal={this.uploadAppraisal}
          />
        </div>
      </Grid>
    )
  }
}
const mapStateToProps = state => {
  return {
    results: state.analysisResultReducer.result,
    images: state.resultReducer.images,
    grades: state.gradeReducer.grades,
    clone: state.resultReducer.clonedAppraisal,
    damages: state.damageReducer.damages,
    modified: state.damageReducer.modified,
    userInfo: state.userReducer.userInfo,
    currentIncident: state.incidentReducer.currentIncident,
    odometer_Reading: state.odometerReducer.odometer_reading,
    license_Reading: state.licenseReducer.license_reading,
    regsitration_number: state.vehicleRegisterReducer.register_reading,
    accidentInfo: state.accidentinfoReducer.description
  };
};

const mapDispatchToProps = dispatch => {
  return {
    saveAppraisal: appraisal => dispatch(cloneAppraisal(appraisal)),
    addReportId: reportId => dispatch(addReportId(reportId)),
    saveDamages: damages => dispatch(storeDamages(damages)),
    resetModified: () => dispatch(resetModifiedFlag())
  }
}

export default withNamespaces("common")(
  connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withSnackbar(AnalysisImages)))
);
