import React, { Component } from "react";
import { Title, TopNav, ArrowButton } from "../../../../components";
import {
  deletePictureInfo,
  storeDamages,
  storeResults,
  cloneAppraisal,
  poseImage,
  totalImagesStore,
  uploadedPoses,
  morePoseImage,
  reEdit,
  reEditPoseName,
  inferredPoses,
  storeInferredPoses,
} from "../../../../actions";
import { Loading } from "../../components";
import { connect } from "react-redux";
import { withNamespaces } from "react-i18next";
import { Redirect, Link } from "react-router-dom";
import { withSnackbar } from "notistack";
import { Grid } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import Pose from "./Pose_helper";
import { postPose } from "./PoseUtils";
import {
  buildDamageList,
  buildAppraisal,
  getImage,
  buildImage,
  buildImagePartial,
  putImage,
  putImagePartial,
} from "../../components/Utils";
import TipModal from "../photo-tips/components/TipModal";

const styles = (theme) => ({
  imageContainer: {
    position: "relative",
    width: "100%",
    margin: theme.spacing(0.2),
    background: "#f7f7f7",
  },
  image: {
    height: "auto",
    width: "100%",
  },
});

class CommonPoses extends Component {
  constructor(props) {
    super(props);
    this.state = {
      navigateTo: null,
      i: 0,
      element: {},
      isLoading: false,
      poseLoading: false,
      showTips: false,
      finalLoad: false,
      Uploaded: false,
      Upload_intermediate: false,
      Partial_upload: [],
      pose: "",
      data: "",
    };
  }

  async componentDidMount() {
    console.log("COMMON POSE PROPS");
    console.log(this.props);
    this.getdata();
    if (
      this.props.location.state &&
      this.props.location.state.showTips &&
      this.props.location.state.showTips === true
    ) {
      this.setState({ showTips: true });
    }
  }

  onNext = async (images, moreImages) => {
    if (
      this.props.finished_poses[this.state.element.storage_name] !== true ||
      this.props.re_upload
    ) {
      this.setState({
        isLoading: true,
      });

      if (process.env.REACT_APP_PARTIAL_UPLOAD === "true") {
        await this.uploadImagePartial(images, moreImages);
        this.moveNext();
      } else {
        await this.uploadImage(images, moreImages);
      }
    } else {
      this.moveNext();
    }
  };

  getdata() {
    if (this.props.reEdit_val && this.props.reEditPoseName !== "") {
      let index = this.props.poses
        .map((it) => it.storage_name === this.props.reEditPoseName)
        .findIndex((itm) => itm === true);
      console.log(this.props.reEditPoseName);
      this.setState({
        element: this.props.poses[index],
      });
    } else {
      this.setState({
        element: this.props.poses[this.state.i],
      });
    }
  }

  uploadImage = async (pose_image, more_pose_images) => {
    console.log("UPLOAD IMAGE");
    console.log("more", pose_image);
    console.log(this.state.element);
    const images = await Promise.all(
      pose_image.map((item) =>
        buildImage(
          this.props.userInfo,
          this.props.currentIncident.incidentId,
          item,
          this.state.element.storage_name
        )
      )
    );
    const individual_images = await Promise.all(
      more_pose_images.map((item) =>
        buildImage(
          this.props.userInfo,
          this.props.currentIncident.incidentId,
          item,
          this.state.element.storage_name
        )
      )
    );
    console.log(images);
    console.log(individual_images);
    const total_images = images.concat(individual_images);
    console.log("Total_images");
    console.log(total_images);
    var uploaded = await Promise.all(
      total_images.map((item) => putImage(item))
    );
    console.log(uploaded);
    var poseResults = await Promise.all(
      total_images.map((item) => postPose(item, this.props.userInfo))
    );
    console.log("POSE RESULTS ARRAY");
    console.log(poseResults);
    if (poseResults.length > 0) {
      var check =
        poseResults[0].inferredPose != total_images[0].dataStore.userPose;
      console.log("check", check);
      var data = {
        poseResults: poseResults,
        uploaded: uploaded,
        images: images,
        individual_images: individual_images,
      };

      if (this.props.reEdit_val && pose_image.length === 0) {
        this.storeData(data);
      } else {
        if (check) {
          this.setState({
            pose: poseResults[0].inferredPose,
            data,
          });
        } else {
          this.storeData(data);
        }
      }
    }
    else{
      this.moveNext();
    }
    this.setState({
      isLoading: false,
    });
  };
  moveNext() {
    console.log(
      "next ",
      this.props.finished_poses[this.state.element.storage_name],
      this.state.i
    );
    if (this.props.finished_poses[this.state.element.storage_name]) {
      if (this.state.i < this.props.poses.length - 1) {
        this.setState({ i: ++this.state.i, Uploaded: false });
        this.getdata();
      } else {
        this.setState({
          isLoading: true,
          finalLoad: true,
        });
        console.log(this.props.poses);
        this.setState({
          navigateTo: "/summary-screen",
        });
      }
    }
  }
  async storeData(data) {
    var { poseResults, uploaded, images, individual_images } = data;
    await this.props.storeInferredPoses(poseResults);

    var upload_statuses = uploaded.map((item) => item.ok);
    if (upload_statuses.find((it) => it === false) !== false) {
      this.props.uploadedPoses(this.state.element.storage_name);
      images.map((it) => {
        it.base64 = "";
        it.file = {};
        this.props.storePicture(it, this.state.element.storage_name);
      });
      individual_images.map((it) => {
        it.base64 = "";
        it.file = {};
        this.props.storemorePictures(it, this.state.element.storage_name);
      });

      this.setState({
        Uploaded: true,
      });
      this.moveNext();
    }
  }
  uploadImagePartial = async (pose_image, more_pose_images) => {
    console.log("UPLOAD IMAGE PARTIAL");
    if (!this.state.Upload_intermediate) {
      var images = await Promise.all(
        pose_image.map((item) =>
          buildImage(
            this.props.userInfo,
            this.props.currentIncident.incidentId,
            item,
            this.state.element.storage_name
          )
        )
      );
      var individual_images = await Promise.all(
        more_pose_images.map((item) =>
          buildImage(
            this.props.userInfo,
            this.props.currentIncident.incidentId,
            item,
            this.state.element.storage_name
          )
        )
      );
      console.log(images);
      console.log(individual_images);
      var total_images = images.concat(individual_images);
      console.log("Total_images");
    } else {
      total_images = this.state.Partial_upload;
    }
    var uploaded = await Promise.all(
      total_images.map((item) => putImagePartial(item))
    );
    console.log(uploaded);
    var upload_statuses = uploaded.map((item) => item.ok);
    if (upload_statuses.find((it) => it === false) !== false) {
      this.props.uploadedPoses(this.state.element.storage_name);
      images.map((it) => {
        it.base64 = "";
        it.file = {};
        this.props.storePicture(it, this.state.element.storage_name);
      });
      individual_images.map((it) => {
        it.base64 = "";
        it.file = {};
        this.props.storemorePictures(it, this.state.element.storage_name);
      });
      this.setState({
        Uploaded: true,
        Upload_intermediate: false,
      });
    } else {
      for (let i = 0; i < upload_statuses.length; i++) {
        if (upload_statuses[i] === false) {
          total_images[i].re_upload = true;
        }
      }
      this.setState({
        Upload_intermediate: true,
        Partial_upload: total_images,
      });
      this.props.enqueueSnackbar(
        this.props.t("home.common-pose.notification"),
        {
          variant: "warning",
          autoHideDuration: 2000,
        }
      );
    }
    this.setState({
      isLoading: false,
    });
  };

  render() {
    if (this.state.navigateTo) {
      return <Redirect push to={this.state.navigateTo} />;
    }
    if (this.state.finalLoad) {
      return (
        <Loading
          notification={
            this.props.userInfo.isUnderwriting
              ? this.props.t("home.common-pose.loading-policy")
              : this.props.t("home.common-pose.loading-claim")
          }
        />
      );
    }
    if (this.state.isCompleted && !this.state.isLoading) {
      return <Redirect push to="/analysis-results" />;
    }
    const { t, classes, pictureList = [], userInfo = {} } = this.props;
    return (
      <div>
        {this.props.reEdit_val ? null : (
          <TopNav
            backType="backward"
            hasMore={userInfo.role === "policysubmitter" ? false : true}
            goBack={() => {
              if (this.state.i == 0) {
                this.props.history.goBack();
              } else {
                this.setState({ i: --this.state.i, Uploaded: true });
                this.getdata();
              }
            }}
          />
        )}
        <div style={{ margin: "10px" }}>
          <Pose
            title={this.state.element.title}
            description={this.state.element.description}
            source={this.state.element.image}
            storage_name={this.state.element.storage_name}
            sentImage={this.onNext}
            intial_state={[]}
            isLoading={this.state.isLoading}
            deleteImg={() => {
              this.setState({
                pose: "",
              });
            }}
            movetoStore={() => {
              this.setState({
                pose: "",
              });
              this.storeData(this.state.data);
            }}
            pose={this.state.pose}
          />
        </div>
        {this.props.reEdit_val || userInfo.role === "policysubmitter" ? null : (
          <Grid item xs={12} className="skip-wrapper">
            <div
              onClick={() => {
                if (this.state.i !== this.props.poses.length - 1) {
                  this.setState({ i: ++this.state.i });
                  this.getdata();
                } else {
                  if (
                    this.props.poses
                      .map((it) => it.storage_name)
                      .filter((itm) => this.props.finished_poses[itm]).length >
                    0
                  ) {
                    this.setState({
                      navigateTo: "/summary-screen",
                    });
                  } else {
                    this.props.enqueueSnackbar(
                      this.props.t("general.empty-image"),
                      {
                        variant: "warning",
                        autoHideDuration: 3000,
                      }
                    );
                  }
                }
              }}
              className="odometer-skip"
            >
              {t("home.common-pose.skip")}
            </div>
          </Grid>
        )}
        <TipModal
          open={this.state.showTips}
          cancel={() => this.setState({ showTips: false })}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    finished_poses: state.posesReducer.uploaded_poses,
    poses: state.posesReducer.poses,
    inferredPoses: state.posesReducer.inferredPoses,
    pictureList: state.posesReducer.poseimages,
    moreImages: state.posesReducer.more_pose_images,
    currentIncident: state.incidentReducer.currentIncident,
    userInfo: state.userReducer.userInfo,
    reEditPoseName: state.posesReducer.re_edit_name,
    reEdit_val: state.incidentReducer.reEdit,
    re_upload: state.posesReducer.re_upload,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    uploadedPoses: (title) => dispatch(uploadedPoses(title)),
    reEdit: (val) => dispatch(reEdit(val)),
    storePicture: (picture, title) => dispatch(poseImage(picture, title)),
    storemorePictures: (picture, title) =>
      dispatch(morePoseImage(picture, title)),
    storeInferredPoses: (inferredPoses) =>
      dispatch(storeInferredPoses(inferredPoses)),
    saveDamages: (damages) => dispatch(storeDamages(damages)),
    deletePicture: (index) => dispatch(deletePictureInfo(index)),
    storeResults: (grades, incidents, damages, shapes, parts, appraisals) =>
      dispatch(
        storeResults(grades, incidents, damages, shapes, parts, appraisals)
      ),
    saveAppraisal: (appraisal) => dispatch(cloneAppraisal(appraisal)),
    reEdit_PoseName: (name) => dispatch(reEditPoseName(name)),
  };
};

export default withNamespaces("common")(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(withSnackbar(CommonPoses)))
);
