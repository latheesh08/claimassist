import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { TopNav, Title, ArrowButton ,
  UploadButton,
  PictureButton,
  DeleteButton,
} from "../../../../components";
import {
  Analyzing
} from "./components";
import { Grid } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import "./styles.scss";
import CRC32 from "crc-32";
import { post, get, put } from "../../../../api/http_proxy";
import { withNamespaces } from "react-i18next";
import { connect } from "react-redux";
import {
  deletePictureInfo,
  storePictureInfo,
  storeImages,
  storeDamages,
  storeGrades,
  storeResults,
  clearPhotosAndResults,
  cloneAppraisal
} from "../../../../actions";
import { withSnackbar } from "notistack";
import { withStyles } from "@material-ui/core/styles";
import TipModal from "../photo-tips/components/TipModal";
import { VehicleFooter } from "../../components";
import { buildDamageList, buildAppraisal, getImage, buildImage, putImage, putImagePartial } from "../../components/Utils";
import uuid from "uuid";
// import { buildDamageList } from "./Utils";

const styles = theme => ({
  root: {
    flexGrow: 1,
    // maxWidth: 600,
    margin: "auto"
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
    opacity: 0.3
    // position: "relative",
    // bottom: 20,
    // right: 20
  },
  vehicleName: {
    fontWeight: "bold"
  },
  footer: {
    marginTop: theme.spacing(4)
  }
  // vehicleInfo: {
  //   display: "flex",
  //   flexDirection: "row",
  //   justifyContent: "space-between"
  // }
});

class PhotoUpload extends Component {
  constructor() {
    super();

    this.state = {
      isLoading: false,
      isCompleted: false,
      photoSrcList: [], // array of {imgData, crcVal, name},
      gradingInfo: [],
      takingPhoto: false,
      noVehicleInfo: false,
      noUserInfo: false,
      // pictureList: [], // keep uploaded pics in local state till data is posted
      showTips: false,
      goToVehicleInfo: false
      // selectedOption: null
    };
  }

  componentDidMount() {
    if (
      this.props.location.state &&
      this.props.location.state.showTips &&
      this.props.location.state.showTips === true
    ) {
      this.setState({ showTips: true });
    }
    // this.props.clearData(); // Clear pictures and results
    const incidentId = uuid.v4();
    const vehicleId = uuid.v4();

    console.log("incidentId");
    console.log(incidentId);
    console.log("VEHICLE_ID");
    console.log(vehicleId);
    this.setState({ incidentId: incidentId, vehicleId: vehicleId });
    const { make, model, year } = this.props.vehicleInfo;
    if (!make || !model || !year) {
      this.setState({ noVehicleInfo: true });
    }

    const {
      userId,
      logonName,
      email,
      firstName,
      lastName
    } = this.props.userInfo;
    if (!userId || !logonName || !email || !firstName || !lastName) {
      this.setState({ noUserInfo: true });
    }
  }

  getDataUrl = imgData => `data:image/png;base64,${imgData}`;
  getRawData = dataUri => dataUri.substring(dataUri.indexOf(",") + 1);

  lpad = (s, len, chr) => {
    const L = len - s.length;
    const C = chr || " ";
    if (L <= 0) {
      return s;
    }
    return new Array(L + 1).join(C) + s;
  };

  onChangeImage = e => {
    const files = e.target.files;

    console.log("FILES");
    console.log(files);

    for (var i = 0; i < files.length; i++) {
      let reader = new FileReader();
      let fileName = files[i].name;
      let file = files[i];
      let fileType = fileName.split('.').slice(-1)[0];
      // reader.readAsDataURL(files[0]);
      reader.readAsBinaryString(files[i]);
      reader.onload = ev => {
        const data = ev.target.result;
        const base64 = btoa(data);
        // this.processImage(base64, files[0].name);
        const crcVal = CRC32.bstr(data);
        const hexVal = this.lpad((crcVal >>> 0).toString(16), 8, "0");
        // console.log("HEX VAL");
        // console.log(hexVal);

        // // const { photoSrcList } = this.state;
        const picture = {
          file : file,
          imageId : uuid.v4(),
          name: fileName,
          type: fileType,
          checksum: hexVal,
          base64: base64
        };
        console.log("PICTURE");
        console.log(picture);
        // this.storePicture(picture);
        this.props.storePicture(picture);
      };
    }
  };

  getImages = async (incidentId, grades) => {
    ///////////////////////
    // get image urls
    ///////////////////////
    const url = `/services.xsodata/images/?$filter=incidentId eq '${incidentId}'`;
    // let images = [];
    const resp = await get(url);
    const images = await Promise.all(resp.data.d.results.map(item => getImage(item)));

    console.log("====================================");
    console.log("IMAGES FROM GETIMAGE");
    console.log(images);
    console.log("====================================");

    const photoInfo = images.map((item, index) => {
      const picGrades = grades.filter(g => g.imageId === item.imageId);
      const gradeFound = picGrades.filter(gItem => gItem.typeCode === 655)[0]
        .found;

      const passed = gradeFound === 1 ? true : false;
      return { ...item, passed: passed, grades: picGrades };
    });

    this.props.savePictures(photoInfo);

    ///////////////////////
  };

  startUpload = async () => {
    this.setState({ isLoading: true });
    const images = await Promise.all(this.props.pictureList.map(item => buildImage(this.state.incidentId, item)));
    await Promise.all(images.map(item => putImage(item)));
    // console.log("IMAGES");
    // console.log(images);
    // const images = [];
    this.postApi(images);
  };

  postApi = async images => {
    
    const { make, model, year } = this.props.vehicleInfo;
    const { userInfo } = this.props;
    console.log("IN POST API");
    // const apiImages = images.map((item, index) => {
    //   return {
    //     ...item,
    //     id: index
    //   };
    // });

    const apiImages = images.map(item => {
      
      return {
        ...item.dataStore,
        contentType: 'damage',
        incidentId: this.state.incidentId,
        vehicleId: this.state.vehicleId
      };
    });
    console.log("API IMAGES");
    console.log(apiImages);

    const settings = {
      images_save: true,
      data_save: true,
      display_elements: true,
      display_imageLevelResults: true
    };

    const incidents = {
      incidentId: this.state.incidentId,
      system: "claimassist"
    };

    const vehicles = {
      vehicleId: this.state.vehicleId,
      make: make,
      model: model,
      year: year
    };

    const user = {
      user_id: userInfo.userId,
      usr_login: userInfo.logonName,
      usr_email: userInfo.email,
      usr_firstName: userInfo.firstName,
      usr_lastName: userInfo.lastName
    };

    const payload = {
      user: user,
      settings: settings,
      incidents: incidents,
      vehicles: vehicles,
      images: apiImages
      // images: this.props.pictures
    };
    // const res1 = get("services.xsodata/events(1)");
    // console.log(res1);
    console.log("payload");
    console.log("---------------------------------------------------------");
    console.log(payload);
    console.log("---------------------------------------------------------");

    try {
      const response = await post("/oshot/incidents", payload);
      console.log("RESPONSE FROM BACKEND");
      console.log(response);

      let isValid = true;
      let snackType = "success";
      let snackMessage = "";

      if (!response.ok) {
        isValid = false;
        snackType = "error";
        snackMessage =
          typeof response.error === "string"
            ? response.error
            : response.error.hasOwnProperty("message")
              ? response.error.message
              : "Error while attempting to upload the images. Please try again.";
      } else if (typeof response.data === "string") {
        isValid = false;
        snackType = "error";
        snackMessage = response.data;
      } else if (
        response.data.hasOwnProperty("logs") &&
        (response.data.logs.hasOwnProperty("error") ||
          response.data.logs.hasOwnProperty("fatal"))
      ) {
        const errorSize = Object.keys(response.data.logs.error.errors).length;
        const fatalSize = Object.keys(response.data.logs.fatal.fatals).length;

        if (fatalSize > 0) {
          isValid = false;
          snackType = "error";
          snackMessage = response.data.logs.fatal.message;
        } else if (errorSize > 0) {
          isValid = false;
          snackType = "error";
          snackMessage = response.data.logs.error.message;
        }

      }

      if (snackMessage.includes("Please open the SAP Web IDE") && !this.props.userInfo.isSupervisor) {
        snackMessage = this.props.t("home.photo-upload.snack-message")
      }

      if (!isValid) {
        console.log("SOME SORT OF ERROR OCCURED LOADING THE RESPONSE DATA");
        console.log(response);
        this.props.enqueueSnackbar(
          snackMessage
            ? snackMessage
            : this.props.t("home.photo-upload.upload-failure"),
          { variant: snackType, autoHideDuration: 2000 }
        );
        this.setState({ isLoading: false });
      } else {
        const {
          grades,
          incidents,
          damages,
          shapes,
          parts,
          appraisals
        } = response.data;

        // save appraisal
        //TODO: If there are multiple appraisals, figure out the one to clone
        let appraisalClone = null;
        if (appraisals.length > 0) {
          appraisalClone = buildAppraisal(appraisals[0], userInfo.userId);
          this.props.saveAppraisal(appraisalClone);
          // console.log("CLONED APPRAISAL");
          // console.log(appraisalClone);
        }

        // get image data
        await this.getImages(incidents.incidentId, grades);
        console.log("====================================");
        console.log("SAVED PICTURES");
        console.log("====================================");

        const damageList = buildDamageList(appraisalClone);
        // build list of damages
        // const damageList = buildDamageList(shapes, parts, damages);
        // console.log("====================================");
        // console.log("BUILT DAMAGE LIST");
        // console.log("====================================");
        // console.log(damageList);
        this.props.saveDamages(damageList);

        // console.log("====================================");
        // console.log("SAVED DAMAGES");
        // console.log("====================================");

        this.props.saveGrades(grades);
        this.props.storeResults(
          // grades,
          // elementsImages,
          incidents,
          // damages,
          // shapes,
          // parts,
          // scores,
          // scoresImages,
          appraisals
          // elements
        );
        console.log("====================================");
        console.log("SAVED RESULTS");
        console.log("====================================");
        this.props.enqueueSnackbar(
          this.props.t("home.photo-upload.upload-successful"),
          {
            variant: snackType,
            autoHideDuration: 2000
          }
        );

        // Get
        this.setState({ isLoading: false, isCompleted: true });
      }
    } catch (pErr) {
      console.log("POST RESPONSE ERROR");
      console.log(pErr);
      console.log(typeof pErr);
      console.log(pErr.message);

      // if(process.env.NODE_ENV === "production" && typeof error === 'object' && error.hasOwnProperty('message') && error.message.includes('X-CSRF-Token')){
      //   console.log("Must be a session timeout");
      //   window.location.reload();
      // }

      this.props.enqueueSnackbar(
        typeof pErr === "string"
          ? pErr
          : pErr !== null && pErr.hasOwnProperty("message")
            ? pErr.message
            : this.props.t("home.photo-upload.upload-error"),
        { variant: "error", autoHideDuration: 2000 }
      );
      this.setState({ isLoading: false });
    }
  };

  onDelete = idx => {
    this.props.deletePicture(idx);
  };

  render() {
    if (this.state.noVehicleInfo === true) {
      return <Redirect push to="/vehicle-info" />;
    }

    const { t, classes, vehicleInfo, pictureList, userInfo } = this.props;

    const firstImage =
      pictureList.length > 0
        ? this.getDataUrl(pictureList[0].base64)
        : null;

    if (this.state.isCompleted && !this.state.isLoading) {
      return <Redirect push to="/analysis-results" />;
    }
    if (this.state.isLoading && !this.state.isCompleted) {
      return <Analyzing image_src={firstImage} />;
    }
    if (this.state.goToVehicleInfo === true) {
      return (
        <Redirect
          push
          to={{
            pathname: "/vehicle-info",
            state: { redirect: "/photo-upload", prevPage: "/photo-upload" }
          }}
        />
      );
    }

    return (
      <div className={classes.root}>
        {pictureList.length === 0 && (
          <div className="content">
            <Grid container>
              <Grid item xs={12}>
                <TopNav
                  iconName="camera_alt"
                  hasMore
                  goBack={() => this.props.history.goBack()}
                />
              </Grid>
              <Grid item xs={12}>
                <Title
                  title={t("home.photo-upload.title")}
                  subtitle={t("home.photo-upload.subtitle")}
                />
              </Grid>
              <Grid item xs={12}>
                <input
                  accept="image/*;capture=camera"
                  className={classes.input}
                  id="contained-button-file"
                  type="file"
                  multiple
                  onChange={e => this.onChangeImage(e)}
                />
                <label htmlFor="contained-button-file">
                  <UploadButton>
                    <AddIcon />
                  </UploadButton>
                </label>
              </Grid>
            </Grid>
            <TipModal
              open={this.state.showTips}
              cancel={() => this.setState({ showTips: false })}
            />
          </div>
        )}
        {pictureList.length > 0 && (
          <div className="content">
            <Grid container>
              <Grid item xs={12}>
                <TopNav
                  backType="backward"
                  narrow
                  goBack={() => this.props.history.goBack()}
                />
              </Grid>
              <Grid item xs={12}>
                <Title title={t("home.photo-upload.title")} />
              </Grid>
              <Grid
                item
                xs={12}
                container
                // spacing={8}
                className={classes.container}
              >
                {pictureList.map((ph, index) => (
                  <Grid item xs={4} sm={3} lg={2} key={index} container>
                    <Grid item className={classes.imageContainer}>
                      <img
                        className={classes.image}
                        src={this.getDataUrl(ph.base64)}
                        alt=""
                      />
                      <DeleteButton index={index} onClick={this.onDelete} />
                    </Grid>
                  </Grid>
                ))}
                <Grid item xs={4} sm={3} lg={2}>
                  <PictureButton
                    onChangeImage={this.onChangeImage}
                    text={t("general.add-more")}
                  />
                </Grid>
              </Grid>
              <Grid item>
                <ArrowButton onClick={this.startUpload} />
              </Grid>
            </Grid>
          </div>
        )}
        <VehicleFooter
          vehicleInfo={vehicleInfo}
          userInfo={userInfo}
          editInfo={() => this.setState({ goToVehicleInfo: true })}
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    vehicleInfo: state.vehicleReducer.vehicleInfo,
    userInfo: state.userReducer.userInfo,
    pictureList: state.pictureReducer.pictures,
    grades: state.resultReducer.grades
  };
};

const mapDispatchToProps = dispatch => {
  return {
    saveGrades: grades => dispatch(storeGrades(grades)),
    savePictures: pictures => dispatch(storeImages(pictures)),
    storePicture: picture => dispatch(storePictureInfo(picture)),
    saveDamages: damages => dispatch(storeDamages(damages)),
    deletePicture: index => dispatch(deletePictureInfo(index)),
    clearData: () => dispatch(clearPhotosAndResults()),
    storeResults: (grades, incidents, damages, shapes, parts, appraisals) =>
      dispatch(
        storeResults(grades, incidents, damages, shapes, parts, appraisals)
      ),
    saveAppraisal: appraisal => dispatch(cloneAppraisal(appraisal))
  };
};

export default withNamespaces("common")(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(withSnackbar(PhotoUpload)))
);
