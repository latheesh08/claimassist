import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { Grid, IconButton, Icon, CircularProgress } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { SmartImage } from ".";
import { get } from "../../../api/http_proxy";
import { withNamespaces } from "react-i18next";

const styles = theme => ({
  root: {
    flexGrow: 1,
    // minHeight: 120,
    justifyContent: "center",
    alignItems: "center"
  },
  poseHeader: {
    padding: "0 0 0 0",
    margin: "5px",
    textTransform: "capitalize",
    color: "#666"
  },
  rejectHeader: {
    padding: "0 0 0 0",
    margin: "5px",
    color: "red"
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    margin: theme.spacing(0.2),
    background: "#f7f7f7"
    // padding: 10
  },
  // imgContainer: {
  //   padding: theme.spacing(1)
  // },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 5
  },
  hidden: {
    display: "none"
  },
  icon: {
    color: "#ccc"
  },
  gradesProgress: {
    position: "absolute",
    background: "transparent",
    zIndex: 104
  },
  editButton: {
    position: "absolute",
    top: 35,
    right: 5,
    zIndex: 100,
    backgroundColor: "black",
    padding: 5,
    // paddingBottom: 1,
    // paddingLeft: 7,
    // paddingRight: 7,
    color: "white"
  },
  editButtonNoPose: {
    position: "absolute",
    top: 8,
    right: 5,
    zIndex: 100,
    backgroundColor: "black",
    padding: 5,
    color: "white"
  },
  helpButton: {
    position: "absolute",
    top: 35,
    left: 5,
    zIndex: 101,
    backgroundColor: "red",
    color: "white",
    padding: 5
    // fontSize: "default"
  },
  helpButtonNoPose: {
    position: "absolute",
    top: 8,
    left: 5,
    zIndex: 101,
    backgroundColor: "red",
    color: "white",
    padding: 5
    // fontSize: "default"
  },
  helpIcon: {
    fontSize: "large"
  },
  editIcon: {
    fontSize: "large"
  },
  rejectedSpan: {
    float: "right",
    color: "red"
  }
});

class ClaimImage extends Component {
  state = {
    loaded: false,
    gradesLoading: true,
    editDamages: false,
    imageData: undefined,
    toWhy: false,
    grades: [],
    showGradeButton: false
  };

  imageLoaded = e => {
    this.setState({ loaded: true });
  };

  getGrades = async (imageId, userInfo) => {
    console.log("Get grades by imageId, ", imageId);
    const url =
      process.env.REACT_APP_GRADES_API_ENDPOINT +
      `?imageId=${imageId}`;
    const response = await get(url, userInfo);
    console.log("GET GRADES BY IMAGE RESPONSE");
    console.log(response);

    if (response.error) {
      console.log("ERROR GETTING GRADES BY IMAGE");
      console.log(response.error);
      return []
    } else {
      // const output = response.data && response.data.hasOwnProperty("claimSeverity") ? JSON.parse(response.data) : null;
      return response.data
    }

  }

  goToWhy = () => {
    // console.log("STATE");
    // console.log(this.state);
    // console.log("PROPS");
    // console.log(this.props);
    // const grades = this.props.grades.filter(
    //   item => item.imageId === this.props.image.imageId
    // );
    // const imageData = { ...this.props.image };
    this.setState({ toWhy: true });
  };


  componentDidMount = async () => {
    const { classes, image, userInfo } = this.props;

    const grades = typeof (image.grades) !== 'undefined' && image.grades && image.grades.length > 0 ? image.grades : await this.getGrades(image.imageId, userInfo);
    const passFailGrade = grades ? grades.filter(grade => grade.typeCode === 655) : [];
    this.setState({ grades: grades, gradesLoading: false });
    if (passFailGrade.length > 0 && passFailGrade[0].hasOwnProperty("found") && passFailGrade[0].found === 0) {
      this.setState({ showGradeButton: true });
    }
  };

  render() {

    const { t, classes, image, userInfo, showEditInfoIcon } = this.props;
    const { isSupervisor, isReviewer, isSubmitter } = userInfo;
    // const imagePose = this.props.image.imagePose ? this.props.image.imagePose.replace("_", " ") : null;
    // const imagePoseReview = this.props.image.hasOwnProperty("imagePoseReview") ? this.props.image.imagePoseReview : null;
    const imageUserPose = image.userPose ? t("home.common-pose."+ image.userPose) : "";
    // const passFailGrade = image.hasOwnProperty("grades") && image.grades.length > 0 ? image.grades.filter(grade => grade.typeCode === 655) : [];
    // const showGradeButton = passFailGrade.length > 0 && passFailGrade[0].hasOwnProperty("found") && passFailGrade[0].found === 0 ? true : false;
    let showEditIcon = true;
    if (process.env.REACT_APP_FIREBASE_PROJECT_ID === 'triglav-us-demo' && isSubmitter === true) {
      showEditIcon = false;
    } else if (typeof(showEditInfoIcon) !== "undefined") {
      showEditIcon = showEditInfoIcon;
    }

    if (this.state.editDamages === true) {
      return (
        <Redirect
          push
          to={{
            pathname: "/review-image",
            state: {
              image: image,
              boxIndex: 0,
              returnPath: this.props.currentPath
            }
          }}
        />
      );
    }

    if (this.state.toWhy === true) {
      return (
        <Redirect
          push
          to={{
            pathname: "/analysis-results/why/2",
            state: {
              image: image,
              grades: this.state.grades
            }
          }}
        />
      );
    }

    return (
      <Grid item className={classes.imageContainer}>
        <Grid item container className={classes.root}>
          <Grid item xs={12}>
            {this.props.parent === 'imageSummary' && this.state.showGradeButton ? (
              <h4 className={classes.rejectHeader}>{t("incident-detail.image-rejected")}</h4>
            ) :
              <h4 className=
                {classes.poseHeader}>{ imageUserPose }
                {
                  this.state.showGradeButton ? (
                    <span className={classes.rejectedSpan}>{t("incident-detail.failed")}</span>
                  ) : null
                }
                <span></span>
              </h4>
            }
            {/* {imagePoseReview === 0 ? (
              <h4 className={classes.poseHeader}>{imagePose ? imagePose.replace("_", " ") : ""}</h4>
            ) : imagePoseReview !== null ? (
              <h4 className={classes.poseHeader}>Review pose</h4>
            ) : null} */}
          </Grid>
          {this.state.gradesLoading ? (
            <CircularProgress id={`gradesProgress_${this.props.image.imageId}`} className={classes.gradesProgress} />
          ) : null}
          <SmartImage image={this.props.image} />
          {/* <ImageViewer src={this.props.image.url} orientation={this.props.image.orientation} /> */}
          {showEditIcon ? (
            <IconButton
              className={imageUserPose !== null ? classes.editButton : classes.editButtonNoPose}
              color="primary"
              size="small"
              onClick={() => this.setState({ editDamages: true })}
            >
              <Icon className={classes.editIcon}>{isSupervisor || isReviewer ? "edit" : "info"}</Icon>
            </IconButton>
          ) : null}
          {this.state.showGradeButton ? (
            <IconButton
              // className={imageUserPose !== null ? classes.helpButton : classes.helpButtonNoPose}
              className={this.props.parent === 'imageSummary' ? classes.helpButton : imageUserPose !== null ? classes.helpButton : classes.helpButtonNoPose}
              color="primary"
              size="small"
              onClick={this.goToWhy}
            >
              <Icon className={classes.helpIcon}>help</Icon>
            </IconButton>
          ) : null}
        </Grid>
      </Grid>

    );
  }
}

export default withNamespaces("common")(
  withStyles(styles)(ClaimImage)
);
