import React, { Component } from 'react'
import {
  Title,
  TopNav,
  ArrowButton,
  PictureButton,
  DeleteButton
} from "../../../../components";
import { SmartImage } from "../../components";
import {
  storeCurrentIncident,
  dirtyCurrentIncident,
  reEdit,
  deleteImageInCurrentIncident,
  reUpload
} from "../../../../actions";
import CRC32 from "crc-32";
import { Input, Grid, CircularProgress } from '@material-ui/core';
import { Redirect, Link } from "react-router-dom";
import { withNamespaces } from "react-i18next";
import { connect } from "react-redux";
import { withSnackbar } from "notistack";
import { withStyles } from "@material-ui/core/styles";
import "./styles.scss";
import uuid from "uuid";
import { sendData } from "../../../../api/http_proxy";
import { buildIncident, buildImage, buildImagePartial, putImage, putImagePartial } from "../../components/Utils";
import loadImage from 'blueimp-load-image';

const styles = theme => ({
  imageContainer: {
    position: "relative",
    width: "100%",
    margin: theme.spacing(0.2),
    background: "#f7f7f7"
  },
  image: {
    height: "auto",
    width: "100%"
  },
});

class Odometer extends Component {

  state = {
    navigateTo: null,
    removedImage: [],
    odometerImage: [],
    odometer_number: '',
    Uploaded: false,
    Upload_intermediate: false,
    isLoading: false
  }

  componentDidMount() {

    console.log("ODEOMETER PROPS");
    console.log(this.props)
    const { currentIncident } = this.props;
    if (currentIncident.hasOwnProperty("vehicles") && currentIncident.vehicles.length === 1 && currentIncident.vehicles[0].hasOwnProperty("odometer")) {
      this.setState({
        odometer_number: currentIncident.vehicles[0].odometer,
        odometerImage: currentIncident.images !== undefined ? currentIncident.images.filter((it) => it.contentType === 'odometer') : []
      });
    }
  }

  getDataUrl = imgData => `data:image/png;base64,${imgData}`;
  lpad = (s, len, chr) => {
    const L = len - s.length;
    const C = chr || " ";
    if (L <= 0) {
      return s;
    }
    return new Array(L + 1).join(C) + s;
  };

  showImage = file => {
    console.log("SHOW FILE");
    console.log(file);
    let reader = new FileReader();
    let fileName = file.name;
    let fileType = fileName.split('.').slice(-1)[0];
    reader.readAsBinaryString(file);
    reader.onload = ev => {
      const data = ev.target.result;
      const base64 = btoa(data);
      const crcVal = CRC32.bstr(data);
      const hexVal = this.lpad((crcVal >>> 0).toString(16), 8, "0");
      const picture = {
        file: file,
        imageId: uuid.v4(),
        name: fileName,
        type: fileType,
        checksum: hexVal,
        base64: base64
      };
      console.log("PICTURE");
      console.log(picture);
      this.setState({ odometerImage: [picture] });
    };
  }

  rotateImage = (file) => {
    console.log("ROTATE FILE");
    console.log(file);
    loadImage(file, (canvas, dataimp) => {
      let orientation = '';
      let location = '';
      let metadata = {};
      if (dataimp.exif) {
        metadata = dataimp.exif.getAll();
        console.log('EXIF metadata: ' + JSON.stringify(metadata));
        orientation = dataimp.exif.get('Orientation');
        location = dataimp.exif.get('GPS Position');
        console.log('...Orientation: ' + JSON.stringify(orientation));
        console.log('...Location: ' + JSON.stringify(location));
      }
      var base64;

      // if (canvas) {
      //   console.log('...Canvas: ');
      //   console.log(canvas);
      //   console.log(file);
      //   const base64Full = canvas.toDataURL(file.type);
      //   const [baseType, base64parsed] = base64Full.split(",");
      //   base64 = base64parsed;
      // }
      let fileName = file.name;
      let fileType = fileName.split('.').slice(-1)[0];
      let reader = new FileReader();
      reader.readAsBinaryString(file);
      reader.onload = ev => {
        const data = ev.target.result;
        if (!base64)
          base64 = btoa(data);
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
          metadata: metadata
        }
        this.setState({ odometerImage: [picture] });
      };
    }, {
      meta: true,
      orientation: true
    });
  }

  onChangeImage = e => {
    const files = e.target.files;
    this.rotateImage(files[0]);
  };
  onDelete = idx => {
    this.setState({
      removedImage: this.state.odometerImage,
      odometerImage: []
    })
    if (this.props.currentIncident.images !== undefined && this.props.currentIncident.images.map(it => it.contentType === 'odometer')) {
      // this.props.deleteImage('odometer')
      this.props.upload_done(true)
    }
  };

  uploadSingleImage = async () => {
    console.log("UPLOAD SINGLE IMAGE");
    console.log(this.state.odometerImage[0]);
    console.log(this.props.currentIncident.incidentId);
    console.log(this.props.userInfo);
    this.setState({ isLoading: true });
    const image = await buildImage(this.props.userInfo, this.props.currentIncident.incidentId, this.state.odometerImage[0]);
    console.log(image);
    if (image.hasOwnProperty("error")) {
      this.setState({ isLoading: false });
      this.props.enqueueSnackbar(
        this.props.t("home.odometer.upload-failed"),
        {
          variant: "warning",
          autoHideDuration: 2000
        }
      );
    } else {
      await putImage(image);
      this.setState({ odometerImage: [image] });
    }
  };

  uploadImagePartial = async () => {
    console.log("UPLOAD IMAGE PARTIAL");
    this.setState({ isLoading: true });
    if (!this.state.Upload_intermediate) {
      var image = await buildImagePartial(this.props.userInfo, this.props.currentIncident.incidentId, this.state.odometerImage[0]);
      console.log(image)
    } else {
      image = this.state.Partial_upload
    }
    var uploaded = await putImagePartial(image);
    console.log(uploaded);
    if (uploaded.ok) {
      this.setState({
        Uploaded: true,
        Upload_intermediate: false,
      })
    } else {
      image.re_upload = true
      this.setState({
        Upload_intermediate: true,
        Partial_upload: image
      })
      this.props.enqueueSnackbar(
        this.props.t("home.odometer.upload-failed"),
        {
          variant: "warning",
          autoHideDuration: 3000
        }
      );
    }
    this.setState({
      isLoading: false
    })
    this.setState({ odometerImage: [image] });
  };

  addUpdateIncident = async () => {
    const vehicleParams = {
      odometer: parseInt(this.state.odometer_number)
    }
    let images = [];
    console.log("ODOMETER IMAGE STATE");
    console.log(this.state.odometerImage);
    if (this.state.odometerImage.length > 0 && this.props.re_upload) {
      const image = this.state.odometerImage[0];
      vehicleParams.odometerImageId = image.imageId;
      const imageParams = {
        imageId: image.imageId,
        name: image.name,
        checksum: image.checksum,
        contentType: "odometer",
        url: image.dataStore.url,
        orientation: image.orientation,
        location: image.location,
        incidentId: this.props.currentIncident.incidentId
      }
      images.push(imageParams);
      this.props.upload_done(false)
    }
    const newIncident = await buildIncident(this.props.currentIncident, vehicleParams, images);
    await this.props.storeIncident(newIncident);

    console.log("CURRENT INCIDENT TO POST/PUT");
    console.log(newIncident);

    this.setState({ isLoading: false });
  }


  render() {
    if (this.state.navigateTo) {
      return <Redirect push to={this.state.navigateTo} />;
    }
    const { t, classes, userInfo } = this.props;
    return (
      <div className="odometer-container">
        {this.props.reEdit_val ? null : <TopNav backType="backward" hasMore goBack={() => this.props.history.goBack()} />

        }

        <div className="content">
          <Title
            title={t("home.odometer.title")}
            subtitle={
              <div>
                {t("home.odometer.Enter_reading")} <br />
                <br />
                {t("home.odometer.Where-to-find")}
              </div>
            }
          />
          <Grid container>
            <Input
              placeholder={t("home.odometer.place-holder")}
              fullWidth
              className="odometer-input"
              value={this.state.odometer_number}
              type="number"
              onChange={(evt) => {
                this.setState({ odometer_number: evt.target.value })
              }}
            />
            {
              this.state.odometerImage !== null && this.state.odometerImage.length > 0 ?
                (this.state.odometerImage.map((ph, index) => (
                  ph.base64 ?
                    <Grid item xs={4} sm={3} lg={2} key={index} container>
                      <Grid item className={classes.imageContainer}>
                        <img
                          className={classes.image}
                          src={ph.base64 ? this.getDataUrl(ph.base64) : ph.url}
                          alt=""
                        />
                        <DeleteButton index={index} onClick={this.onDelete} />
                      </Grid>
                    </Grid> :
                    <Grid item style={{ width: '200px' }} key={index} className={classes.imageContainer}>
                      <SmartImage image={ph} />
                      <DeleteButton index={index} onClick={this.onDelete} />
                    </Grid>
                )))
                :
                <Grid item xs={12} sm={6} lg={4} className="odometer-picture-upload">
                  <PictureButton
                    onChangeImage={this.onChangeImage}
                    text={t("home.odometer.upload-photo")}
                  />
                </Grid>
            }
          </Grid>
          {
            this.props.reEdit_val ?
              <Grid style={{ marginTop: 20, width: '10%', display: 'flex', flexDirection: 'column' }}>
                {this.state.isLoading ?
                  <CircularProgress /> :

                  <ArrowButton
                    icon='save'
                    onClick={async () => {
                      console.log(this.state.odometer_number);
                      if (userInfo.role === 'policysubmitter' && (!this.state.odometer_number || this.state.odometer_number.length === 0)) {
                        this.props.enqueueSnackbar(
                          this.props.t("home.odometer.warn-message"),
                          {
                            variant: "warning",
                            autoHideDuration: 2000
                          }
                        );
                      } else {
                        if (this.state.removedImage.length > 0) {
                          console.log("deleting removed image");
                          console.log(this.state.removedImage)
                          await this.props.deleteImage('odometer')
                        }
                        if (this.props.re_upload && this.state.odometerImage.length > 0) {
                          process.env.REACT_APP_PARTIAL_UPLOAD === 'true' ? await this.uploadImagePartial() : await this.uploadSingleImage();
                        }
                        if (!this.state.Upload_intermediate) {
                          await this.addUpdateIncident();
                          this.props.reEdit(false)
                          this.setState({
                            navigateTo: '/vehicle-info-summary-screen'
                          })
                        }
                      }

                    }} />
                }
                <a style={{ color: '#41bcf2', marginTop: '20px', cursor: 'pointer' }}
                  onClick={() => {
                    this.props.reEdit(false)
                    this.setState({
                      navigateTo: '/vehicle-info-summary-screen'
                    })
                  }}
                >{t("general.cancel")}</a>
              </Grid>
              :
              <Grid>
                {
                  this.state.isLoading ?
                    <CircularProgress />
                    :
                    <ArrowButton
                      onClick={async () => {
                        if (this.state.odometerImage.length > 0) {
                          process.env.REACT_APP_PARTIAL_UPLOAD === 'true' ? await this.uploadImagePartial() : await this.uploadSingleImage();
                        }
                        if (!this.state.Upload_intermediate) {
                          await this.addUpdateIncident();
                          this.setState({
                            navigateTo: '/license-plate'
                          })
                        }

                      }}
                      icon="arrow_forward"
                      disabled={
                        this.state.odometer_number.length > 0 ? false : true
                      }
                    />
                }
                {
                  userInfo.role !== 'policysubmitter' ? (
                    <Grid item xs={12} className="skip-wrapper">
                      <Link
                        to={{ pathname: "/license-plate" }}
                        className="odometer-skip"
                      >{t("home.odometer.skip-link")} </Link>
                    </Grid>
                  ) : null
                }
              </Grid>
          }


        </div>
      </div>

    )
  }
}

const mapStateToProps = state => {
  return {
    reEdit_val: state.incidentReducer.reEdit,
    re_upload: state.incidentReducer.reUpload.odometer,
    currentIncident: state.incidentReducer.currentIncident,
    dirtyIncident: state.incidentReducer.dirtyIncident,
    userInfo: state.userReducer.userInfo

  };
};
const mapDispatchToProps = dispatch => {
  return {
    dirtyCurrentIncident: (value) => dispatch(dirtyCurrentIncident(value)),
    storeIncident: (value) => dispatch(storeCurrentIncident(value)),
    reEdit: val => dispatch(reEdit(val)),
    deleteImage: (name) => dispatch(deleteImageInCurrentIncident(name)),
    upload_done: (val) => dispatch(reUpload('odometer', val))
  }
}

export default withNamespaces("common")(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(withSnackbar(Odometer)))
);
