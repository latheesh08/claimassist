import React, { Component, Fragment } from "react";
import { Title, TopNav } from "../../../../components";
import Image from "./components/Image";
import { Link, Redirect } from "react-router-dom";
import { Grid, Icon, Typography, Divider, Button } from "@material-ui/core";
import "./styles.scss";
import { withNamespaces } from "react-i18next";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
// import { cyan } from "@material-ui/core/colors";
import { Loading } from "../../components";
import { post, put } from "../../../../api/http_proxy";
import { buildAppraisalData, buildAppraisal, getReportInput } from "../../components/Utils";
import { cloneAppraisal, storeEstimate, addReportId } from "../../../../actions";
import { withSnackbar } from "notistack";
import uuid from "uuid";

const styles = theme => ({
  root: {
    flexGrow: 1,
    // maxWidth: 600,
    margin: "auto"
  },
  label: {
    textTransform: "normal"
  },
  container: {
    flexGrow: 1,
    margin: 5
  },
  poseHeader: {
    padding: "0 0 0 0",
    margin: "5px",
    textTransform: "capitalize",
    width: "100%",
    marginTop: theme.spacing(2),
    color: "#666"
  },
  imageContainer: {
    position: "relative",
    margin: theme.spacing(0.2),
    marginBottom: theme.spacing(2)
    // padding: 10
  },
  image: {
    height: "auto",
    width: "100%"
    // height: "100%"
    // maxWidth: 120
  },
  subtitle: {
    fontSize: 18,
    //color: "#b5b5b5",
    color: "darkGrey",
    marginBottom: 10
  },
  icon: {
    opacity: 0.3
  },
  description: {
    fontWeight: "bold"
  },
  footer: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(1)
  },
  footerRow: {
    margin: theme.spacing(1)
  },
  reportLink: {
    color: "#0fafef;",
    cursor: "pointer",
    alignContent: "normal"
  },
  MuiButtonLabel176: {
    textTransform: "normal!important"
  }
});

class ReviewIntro extends Component {
  state = {
    reportId: "",
    isLoading: false,
    isPostAppraisal: false,
    isPostReport: false
  };

  // postAppraisal = async () => {
  //   this.setState({ isLoading: true });
  //   const { appraisals, userInfo, damages } = this.props;
  //   const appraisalData = buildAppraisalData(
  //     appraisals[0],
  //     userInfo.userId,
  //     damages
  //   );

  //   const url = "/oshot/appraisal";
  //   const response = await post(url, appraisalData);

  //   this.setState({ isLoading: false });
  //   console.log("====================================");
  //   console.log("RESPONSE");
  //   console.log(response);
  //   console.log("====================================");
  // };

  uploadAppraisal = async () => {
    console.log("SAVE APPRAISAL BUTTON CLICKED");
    const { userInfo } = this.props;
    this.setState({ isLoading: true, isPostAppraisal: true });
    console.log(this.props.clone);
    // return;

    const url = "/oshot/appraisal";
    console.log("post call hit");
    const response = await post(url, this.props.clone);

    if (
      response &&
      response.data &&
      response.data.hasOwnProperty("appraisalId")
    ) {
      const newClone = buildAppraisal(this.props.clone, userInfo.userId);
      console.log("NEW CLONE GETTING SAVED");
      console.log(newClone);

      this.props.saveAppraisal(newClone);
      this.props.enqueueSnackbar(
        this.props.t("home.review-intro.upload-successful"),
        { variant: "success", autoHideDuration: 2000 }
      );
    } else {
      console.log("SOME SORT OF ERROR OCCURED UPLOADING THE APPRAISAL DATA");
      console.log(response);
      this.props.enqueueSnackbar(
        this.props.t("home.review-intro.upload-failure"),
        { variant: "error", autoHideDuration: 2000 }
      );
    }

    this.setState({ isLoading: false, isPostAppraisal: false });
    console.log("====================================");
    console.log("RESPONSE");
    console.log(response);
    console.log("====================================");
  };

  postEstimateData = async (reportInput) => {

    // this.setState({ isLoading: true });
    const url = process.env.REACT_APP_REPAIR_REPLACE_API_ENDPOINT;
    let appraisalId = null;
    if (this.props.modified) {
      appraisalId = this.props.clone.appraisalId
    } else {
      appraisalId = this.props.clone.clonedFrom
    }
    const reportId = uuid.v4();
    //this.setState({ reportId: reportId });
    this.props.addReportId(reportId)
    const payload = {
      report_id: reportId,
      appraisalId: appraisalId,
      user_id: this.props.userInfo.userId,
      report_input: {
        "allDamages": reportInput
      }
    }
    console.log("====================================");
    console.log("REVIEW INTRO REPORT ID ", reportId);
    console.log("====================================");

    const response = await post(url, payload);
    return response;

  };

  generateReport = async () => {

    if (this.props.damages.length > 0 && this.props.images.length > 0) {
      this.setState({ isLoading: true, isPostReport: true });
      console.log("In Generate Report");
      const reportInput = getReportInput(this.props.clone, this.props.images);
      console.log("Report Input");
      console.log(reportInput);
      if (reportInput && reportInput.length > 0) {
        const resp = await this.postEstimateData(reportInput);
        console.log("Post Estimate Resp");
        console.log(resp);

        if ((typeof resp.data === 'string' && resp.data.includes("Internal server error")) || (resp.hasOwnProperty("ok") && resp.ok === false)) {
          this.setState({ isLoading: false, isPostReport: false });
          this.props.enqueueSnackbar(
            this.props.t("home.review-intro.error-estimating"),
            { variant: "error", autoHideDuration: 3000 }
          );
        } else {
          console.log("redirect to estimation");
          this.setState({ isCompleted: true, isLoading: false, isPostReport: false });
        }
      } else {
        this.props.enqueueSnackbar(
          this.props.t("home.review-intro.no-damage"),
          { variant: "warning", autoHideDuration: 4000 }
        );
        this.setState({ isPostReport: false });
      }
    } else {
      this.props.enqueueSnackbar(
        this.props.t("home.review-intro.no-damage"),
        { variant: "warning", autoHideDuration: 4000 }
      );
    }

  };

  componentDidMount() {
    const { appraisals, userInfo, damages } = this.props;
    // const appraisalData = buildAppraisalData(
    //   appraisals[0],
    //   userInfo.userId,
    //   damages
    // );
    // console.log("====================================");
    // console.log("APPRAISAL");
    // console.log(appraisalData);
    // console.log("====================================");

    console.log("====================================");
    console.log("CLONED APPRAISAL");
    console.log(this.props.clone);
    console.log("====================================");
  }

  render() {
    console.log("====================================");
    console.log("PROPS");
    console.log(this.props);
    console.log("====================================");
    // TO DO: turn this back on once weve got the right images loading
    // if (this.props.pictures.length === 0) {
    //   return <Redirect push to="/photo-upload" />;
    // }
    if (this.state.isCompleted && !(this.props.userInfo.isUnderwriting)) {
      return <Redirect push to="/estimation" />;
      // return <Redirect push to="/analysis" />;
    }

    if (this.state.isCompleted && this.props.userInfo.isUnderwriting) {
      return <Redirect push to="/report" />;
    }

    const StyledButton = withStyles({
      text: {
        padding: 0,
        margin: 0
      },
      label: {
        textTransform: 'capitalize',
        color: "#0fafef",
        fontSize: "1rem"
      },
    })(Button);

    if (this.state.isLoading === true && this.state.isPostAppraisal === true) {
      return <Loading notification= {t("home.review-intro.save-notification")} />;
    }

    if (this.state.isLoading === true && this.state.isPostReport === true) {
      return <Loading notification={t("general.creating-report")} />;
    }

    const { t, classes, images, userInfo, estimates } = this.props;
    console.log("====================================");
    console.log("PROPS");
    console.log(this.props);
    console.log("====================================");
    // const imagePose = this.props.image && this.state.image.imagePose ? this.state.image.imagePose.replace("_", " ") : null;
    // const modified =
    //   this.props.damages.filter(item => item.modified === true).length > 0;
    // const modified = false;

    return (
      <div className={classes.root}>
        <div className="content">
          <Grid container>
            <Grid item xs={12}>
              <TopNav
                backType="backward"
                hasMore
                narrow
                goBack={() => this.props.history.goBack()}
              />
            </Grid>
            <Grid item xs={12}>
              {/* <Title title={t("home.review-intro.title")} subtitle={subtitle} /> */}
              <Title
                title={t("home.review-intro.title")}
                subtitle={t("home.review-intro.footer")}
              />
            </Grid>
            {/* <Grid item xs={12} className={classes.subtitle}>
              {t("home.review-intro.footer")}
            </Grid> */}
            <Grid item xs={12} container className={classes.container}>
              {images.map((img, index) => (
                <Grid item xs={12} key={index} container>
                  <h4 className={classes.poseHeader}> {this.props.totalImages.map(item => (item.imageId == img.imageId ? item.dataStore.userPose ? item.dataStore.userPose.replace("_", " ") : "" : null))}</h4>
                  {/* {img.imagePoseReview === 0 ? (
                    { img.imagePose ? img.imagePose.replace("_", " ") : ""}
                  ) : img.imagePoseReview !== null ? (
                    <h4 className={classes.poseHeader}>Review pose</h4>
                  ) : null} */}
                  <Image image={img} index={index} />
                </Grid>
              ))}
            </Grid>
            <Grid container className={classes.footer}>
              {this.props.modified && this.props.clone ? (
                <Grid
                  item
                  xs={12}
                  container
                  direction="row"
                  alignContent="center"
                  className={classes.footerRow}
                  onClick={this.uploadAppraisal}
                >
                  <Grid item xs={2}>
                    <Icon className={classes.icon}>save</Icon>
                  </Grid>
                  <Grid item xs={10} container alignContent="center">
                    <Typography
                      variant="subtitle1"
                      component="div"
                      className={classes.reportLink}
                    >
                     {t("home.review-intro.save")}
                    </Typography>
                  </Grid>
                </Grid>
              ) : null}
              <Grid
                item
                xs={12}
                container
                direction="row"
                alignContent="center"
                className={classes.footerRow}
              >
                <Grid item xs={2}>
                  <Icon className={classes.icon}>assignment</Icon>
                </Grid>
                <Grid
                  item
                  xs={10}
                  container
                  className="link-navigation-container"
                >
                  {
                    (this.props.userInfo.isUnderwriting) ?
                      <Grid item xs={12}>
                        <Link className="link-button" to={"/report"} >{t("home.review.generate-report")}</Link>
                      </Grid> :

                      <StyledButton onClick={this.generateReport}>
                        {t("home.review.generate-report")}
                      </StyledButton>
                  }


                  {/* <Typography variant="subtitle1" component="div">
                    {t("home.review.generate-report")}
                  </Typography> */}
                </Grid>
              </Grid>
            </Grid>
            {/* <Grid item xs={12}>
              <Link className="report-link" to={"/report"} />
            </Grid> */}
          </Grid>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    pictures: state.pictureReducer.pictures,
    parts: state.resultReducer.parts,
    images: state.resultReducer.images,
    damages: state.damageReducer.damages,
    modified: state.damageReducer.modified,
    appraisals: state.resultReducer.appraisals,
    userInfo: state.userReducer.userInfo,
    clone: state.resultReducer.clonedAppraisal,
    estimates: state.resultReducer.estimates,
    totalImages: state.posesReducer.totalImages,
    reportId: state.reportReducer.reportId
  };
};

const mapDispatchToProps = dispatch => {
  return {
    saveAppraisal: appraisal => dispatch(cloneAppraisal(appraisal)),
    saveEstimate: estimate => dispatch(storeEstimate(estimate)),
    addReportId: reportId => dispatch(addReportId(reportId))
  };
};

export default withNamespaces("common")(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(withSnackbar(ReviewIntro)))
);
