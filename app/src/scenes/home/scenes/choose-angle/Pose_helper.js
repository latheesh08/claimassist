import React, { Component } from "react";
import {
  Title,
  TopNav,
  ArrowButton,
  PictureButton,
  MorePictureButton,
  ImageViewer,
} from "../../../../components";
import { SmartImage } from "../../components";
import { connect } from "react-redux";
import { withNamespaces } from "react-i18next";
import { Redirect, Link } from "react-router-dom";
import { withSnackbar } from "notistack";
import {
  Grid,
  GridListTile,
  GridList,
  Icon,
  CircularProgress,
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import CRC32 from "crc-32";
import Switch from "@material-ui/core/Switch";
import {
  poseImage,
  deleteposeImage,
  morePoseImage,
  deletemoreposeImage,
  intact_damaged,
  reEdit,
} from "../../../../actions";
import "./styles.scss";
import loadImage from "blueimp-load-image";
import uuid from "uuid";

const styles = (theme) => ({
  imageContainer: {
    position: "relative",
    width: "20%",
    margin: theme.spacing(0.2),
    background: "#f7f7f7",
    flexShrink: 0,
    maxHeight: "150px",
    maxWidth: "150px",
  },
  singleImage: {
    position: "relative",
    width: "20%",
    maxHeight: "150px",
    maxWidth: "150px",
    margin: theme.spacing(0.2),
    flexShrink: 0,
  },
  single_image: {
    height: "100%",
    width: "100%",
  },
  image: {
    height: "100%",
    width: "100%",
  },
  switchBase: {
    color: "#FFF !important",
  },
  icon: {
    width: "12px",
    height: "12px",
  },
  bar: {
    top: "46%",
    left: "53%",
    width: "30px",
    height: "14px",
    backgroundColor: "green",
  },
  checked: {
    color: "#fff",
  },
  checked: {},
  track: {},
});

class Pose extends Component {
  state = {
    check: this.props.damaged[this.props.storage_name],
    poseimage: [],
    poseimages: [],
    show: false,
    showIndex: "",
  };
  componentWillReceiveProps() {
    if (
      this.props.pictureList[this.props.storage_name] !== undefined &&
      this.props.pictureList[this.props.storage_name].length > 0 &&
      !this.props.re_upload
    ) {
      this.setState({
        poseimage: this.props.intial_state,
        poseimages: this.props.intial_state,
      });
    }
    if (
      this.props.re_upload &&
      this.state.poseimages !== undefined &&
      !this.state.poseimages
        .map((it) => (it.base64 !== "" ? true : false))
        .includes(true) &&
      !this.props.isReuploadFromPoses
    ) {
      this.setState({
        poseimage: this.props.pictureList[this.props.reEditPoseName],
        poseimages: this.props.moreImages[this.props.reEditPoseName],
      });
    }
    this.setState({
      isLoading: this.props.isLoading,
    });

    this.setState({ check: this.props.damaged[this.props.storage_name] });
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.storage_name !== this.props.storage_name) {
      this.setState({
        poseimage: this.props.pictureList[this.props.storage_name],
        poseimages: this.props.moreImages[this.props.storage_name],
      });
    }
  }
  getDataUrl = (imgData) => `data:image/png;base64,${imgData}`;
  lpad = (s, len, chr) => {
    const L = len - s.length;
    const C = chr || " ";
    if (L <= 0) {
      return s;
    }
    return new Array(L + 1).join(C) + s;
  };
  rotateImage = (file, multiple) => {
    console.log("ROTATE FILE");
    console.log(file);
    loadImage(
      file,
      (canvas, dataimp) => {
        let orientation = "";
        let location = "";
        let metadata = {};
        if (dataimp.exif) {
          metadata = dataimp.exif.getAll();
          console.log("EXIF metadata: " + JSON.stringify(metadata));
          orientation = dataimp.exif.get("Orientation");
          location = dataimp.exif.get("GPS Position");
          console.log("...Orientation: " + JSON.stringify(orientation));
          console.log("...Location: " + JSON.stringify(location));
        }
        var base64;

        // if (canvas) {
        //     const base64Full = canvas.toDataURL(file.type);
        //     const [baseType, base64parsed] = base64Full.split(",");
        //     base64 = base64parsed;
        // }
        let fileName = file.name;
        let fileType = fileName.split(".").slice(-1)[0];
        let reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = (ev) => {
          const data = ev.target.result;
          if (!base64) base64 = btoa(data);
          const crcVal = CRC32.bstr(data);
          const hexVal = this.lpad((crcVal >>> 0).toString(16), 8, "0");
          const picture = {
            file: file,
            imageId: uuid.v4(),
            name: fileName,
            type: fileType,
            checksum: hexVal,
            base64: base64,
            orientation: orientation,
            location: location,
            metadata: metadata,
          };
          if (multiple) {
            var poseimages = this.state.poseimages;
            this.setState({
              poseimages:
                poseimages !== undefined
                  ? this.state.poseimages.concat(picture)
                  : [picture],
            });
          } else {
            this.setState({
              poseimage: [picture],
            });
          }
        };
      },
      {
        meta: true,
        orientation: true,
      }
    );
  };
  onChangeImage = (e) => {
    const files = e.target.files;

    console.log("onChangeImage.FILES");
    console.log(files);
    this.rotateImage(files[0], false);
  };
  onChangeImages = (e) => {
    const files = e.target.files;

    console.log("onChangeImages.FILES");
    console.log(files);
    for (var i = 0; i < files.length; i++) {
      let file = files[i];
      this.rotateImage(file, true);
    }
  };
  onDelete = (idx, title) => {
    this.setState({
      poseimage: [],
    });
    this.props.deleteImg();
    this.props.deletePicture(idx, title);
  };
  onDeletes = (idx, title) => {
    this.setState({
      poseimages: this.state.poseimages.filter((item, index) => index !== idx),
    });
    this.props.deletemorePictures(idx, title);
  };
  handleYes = () => {
    this.setState({
      show: false,
    });
    this.props.movetoStore();
  };
  handleNo = () => {
    this.onDelete(this.state.showIndex, this.props.storage_name);
    this.setState({
      show: false,
      showIndex: "",
    });
  };
  render() {
    console.log("POSE HELPER PROPS AND STATE");
    console.log(this.props);
    console.log(this.state);
    if (this.state.navigateTo) {
      return <Redirect push to={this.state.navigateTo} />;
    }
    const { t, classes, pictureList, moreImages, userInfo = {} } = this.props;
    var check =
      this.props.damaged[this.props.storage_name] === undefined
        ? false
        : this.props.damaged[this.props.storage_name];
    return (
      <div>
        <div className="content">
          <Title
            title={t("home.common-pose." + this.props.storage_name)}
            subtitle={
              t("home.common-pose.subtitle") +
              " " +
              t("home.common-pose." + this.props.storage_name)
            }
          />

          <Grid item xs={12} sm={6} lg={4}>
            <img
              src={this.props.source}
              alt={t("general.not-found")}
              style={{ width: "100%", height: "auto" }}
            />
            {/* <div style={{ display: 'flex', flexDirection: 'row', margin: '2%' }}>
                            <p style={{ color: this.props.damaged[this.props.storage_name] ? 'black' : 'green', fontWeight: 'bold' }}>{t("general.intact")}</p>
                            <Switch
                                checked={check}
                                onChange={() => {
                                    this.props.intact_damaged(this.props.storage_name)
                                    this.setState({ check: this.props.damaged[this.props.storage_name] })
                                }}
                                classes={{ switchBase: classes.switchBase, checked: classes.checked }} />

                            <p style={{ color: this.props.damaged[this.props.storage_name] ? 'red' : 'black', fontWeight: 'bold' }}>{t("general.damaged")}</p>
                        </div> */}
          </Grid>

          <div className="Pictures_handler">
            {this.state.poseimage !== undefined &&
            this.state.poseimage.length > 0 ? (
              <>
                {this.state.poseimage.map((ph, index) => (
                  <div className={classes.singleImage} key={index}>
                    {ph.base64.length > 0 ? (
                      <img
                        className={classes.single_image}
                        src={
                          ph.base64.length === 0
                            ? null
                            : this.getDataUrl(ph.base64)
                        }
                        alt={t("general.not-found")}
                        key={index}
                      />
                    ) : (
                      <SmartImage image={ph} />
                    )}
                    <div
                      className="icon-container"
                      onClick={() => {
                        this.onDelete(index, this.props.storage_name);
                      }}
                    >
                      <Icon>delete</Icon>
                    </div>
                    {this.props.pose != "" &&
                      this.props.pose != this.props.storage_name && (
                        <div
                          className="pose-mismatch"
                          onClick={() => {
                            this.setState({ show: true, showIndex: index });
                          }}
                        >
                          <Icon>help</Icon>
                        </div>
                      )}
                    <div>
                      <Dialog
                        open={this.state.show}
                        onClose={() =>
                          this.setState({
                            show: false,
                          })
                        }
                      >
                        <DialogContent>
                          <img
                            src={this.props.source}
                            alt={t("general.not-found")}
                            style={{ width: "100%", height: "auto" }}
                          />
                          <DialogContentText id="alert-dialog-description">
                            {t("general.mismatch-prompt").replace("xxxx", `${this.props.storage_name}`).replace("_", " ")}
                          </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={this.handleNo} color="primary">
                            {"No"}
                          </Button>
                          <Button
                            onClick={this.handleYes}
                            color="primary"
                            autoFocus
                          >
                            {"Yes"}
                          </Button>
                        </DialogActions>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <Grid item xs={4} sm={2} lg={2} style={{ height: "150px" }}>
                <PictureButton
                  onChangeImage={this.onChangeImage}
                  text={t("general.whole-vehicle")}
                />
              </Grid>
            )}

            {this.state.poseimages !== undefined &&
            this.state.poseimages.length > 0 ? (
              <div className="More_Images_wrap">
                {this.state.poseimages.map((ph, index) => (
                  <Grid item className={classes.imageContainer} key={index}>
                    {ph.base64.length === 0 ? (
                      <SmartImage image={ph} />
                    ) : (
                      <img
                        className={classes.image}
                        src={
                          ph.base64.length === 0
                            ? ph.dataStore.url
                            : this.getDataUrl(ph.base64)
                        }
                        alt={t("general.not-found")}
                        key={index}
                      />
                    )}
                    <div
                      className="icon-container"
                      onClick={() => {
                        this.onDeletes(index, this.props.storage_name);
                      }}
                    >
                      <Icon>delete</Icon>
                    </div>
                  </Grid>
                ))}
                <Grid item xs={4} sm={2} lg={2}>
                  <MorePictureButton
                    onChangeImages={this.onChangeImages}
                    text={t("general.add-more")}
                  />
                </Grid>
              </div>
            ) : (
              <Grid item xs={4} sm={2} lg={2}>
                <MorePictureButton
                  onChangeImages={this.onChangeImages}
                  text={t("general.Individual-damage")}
                />
              </Grid>
            )}
          </div>
          {this.props.reEdit_val ? (
            <Grid
              style={{
                marginTop: 20,
                width: "10%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {this.props.isLoading ? (
                <CircularProgress />
              ) : (
                <ArrowButton
                  icon="save"
                  onClick={async () => {
                    if (userInfo.role === "policysubmitter") {
                      if (
                        this.state.poseimage.length > 0 ||
                        this.state.poseimages.length > 0
                      ) {
                        if (
                          !this.props.finished_poses[this.props.storage_name] ||
                          this.props.re_upload
                        ) {
                          this.setState({ isLoading: true });
                          await this.props.sentImage(
                            this.state.poseimage.filter(
                              (it) => it.base64 !== ""
                            ),
                            this.state.poseimages.filter(
                              (it) => it.base64 !== ""
                            )
                          );
                        }
                        this.props.reEdit(false);
                        this.setState({ navigateTo: "/summary-screen" });
                      } else {
                        this.props.enqueueSnackbar(
                          this.props.t("general.empty-image"),
                          {
                            variant: "warning",
                            autoHideDuration: 5000,
                          }
                        );
                      }
                    } else {
                      if (
                        !this.props.finished_poses[this.props.storage_name] ||
                        this.props.re_upload
                      ) {
                        this.setState({ isLoading: true });
                        await this.props.sentImage(
                          this.state.poseimage.filter((it) => it.base64 !== ""),
                          this.state.poseimages.filter((it) => it.base64 !== "")
                        );
                      }
                      this.props.reEdit(false);
                      this.setState({ navigateTo: "/summary-screen" });
                    }
                  }}
                />
              )}
              <a
                style={{
                  color: "#41bcf2",
                  marginTop: "20px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (userInfo.role === "policysubmitter") {
                    if (
                      this.state.poseimage.length > 0 ||
                      this.state.poseimages.length > 0
                    ) {
                      this.props.reEdit(false);
                      this.setState({ navigateTo: "/summary-screen" });
                    } else {
                      this.props.enqueueSnackbar(
                        this.props.t("general.empty-image"),
                        {
                          variant: "warning",
                          autoHideDuration: 5000,
                        }
                      );
                    }
                  } else {
                    this.props.reEdit(false);
                    this.setState({ navigateTo: "/summary-screen" });
                  }
                }}
              >
                {t("general.cancel")}
              </a>
            </Grid>
          ) : this.props.isLoading ? (
            <CircularProgress />
          ) : (
            <ArrowButton
              onClick={() => {
                if (
                  this.state.poseimage !== undefined ||
                  this.state.poseimages !== undefined
                ) {
                  this.props.sentImage(
                    this.state.poseimage !== undefined &&
                      this.state.poseimage.length > 0
                      ? this.state.poseimage.filter((it) => it.base64 !== "")
                      : [],
                    this.state.poseimages !== undefined &&
                      this.state.poseimages.length > 0
                      ? this.state.poseimages.filter((it) => it.base64 !== "")
                      : []
                  );
                } else {
                  this.props.enqueueSnackbar(
                    this.props.t("general.empty-image"),
                    {
                      variant: "warning",
                      autoHideDuration: 5000,
                    }
                  );
                }
              }}
              icon="arrow_forward"
              disabled={
                this.props.pose != "" &&
                this.props.pose != this.props.storage_name
              }
            />
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    damaged: state.posesReducer.intact_damaged,
    poses: state.posesReducer.poses,
    pictureList: state.posesReducer.poseimages,
    moreImages: state.posesReducer.more_pose_images,
    reEdit_val: state.incidentReducer.reEdit,
    finished_poses: state.posesReducer.uploaded_poses,
    re_upload: state.posesReducer.re_upload,
    reEditPoseName: state.posesReducer.re_edit_name,
    isReuploadFromPoses: state.posesReducer.isReUploadFromPoses,
    userInfo: state.userReducer.userInfo,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    intact_damaged: (title) => dispatch(intact_damaged(title)),
    deletePicture: (index, title) => dispatch(deleteposeImage(index, title)),
    storemorePictures: (picture, title) =>
      dispatch(morePoseImage(picture, title)),
    deletemorePictures: (index, title) =>
      dispatch(deletemoreposeImage(index, title)),
    reEdit: (val) => dispatch(reEdit(val)),
  };
};
export default withNamespaces("common")(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(withSnackbar(Pose)))
);
