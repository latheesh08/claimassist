import React, { Component } from "react";
import {
  Title,
  TopNav,
  ArrowButton,
  PictureButton,
  DeleteButton
} from "../../../../components";
import { SmartImage } from "../../components";
import TextField from "@material-ui/core/TextField";
import "./styles.scss";
import ArrowLink from "../../../../components/ArrowLink/ArrowLink";
import { withNamespaces } from "react-i18next";
import CRC32 from "crc-32";
import { Redirect, Link } from "react-router-dom";
import { connect } from "react-redux";
import { withSnackbar } from "notistack";
import { Grid, Input, CircularProgress } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { buildIncident, buildImage, buildImagePartial, putImage, putImagePartial } from "../../components/Utils";
import { storeCurrentIncident, deleteImageInCurrentIncident, reUpload } from "../../../../actions";
import "./styles.scss";
import uuid from "uuid";
import { get } from "../../../../api/http_proxy"
import { Loading } from "../../components";
import loadImage from 'blueimp-load-image';
import { Alert } from "reactstrap";
// import { userInfo } from "os";

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


;
class EnterVin extends Component {
  state = {
    vin: "",
    navigateTo: "",
    load: false,
    imageLoading: false,
    removedImage: [],
    vinImage: [],
    showWarning: false
  };
  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  componentDidMount() {

    console.log("COMPONENT DID MOUNT ENTER VIN PROPS");
    console.log(this.props)
    const { currentIncident } = this.props;
    if(currentIncident.images !== undefined && currentIncident.images.filter((it) => it.contentType === 'vin').length > 0){
      this.setState({ vinImage : currentIncident.images.filter((it) => it.contentType === 'vin') })
    }
    if (typeof (currentIncident.vehicles) !== "undefined" && typeof (currentIncident.vehicles[0].vin) !== "undefined") {
      this.setState({
        vin: currentIncident.vehicles[0].vin
      });
    }
  }

  /* ALL IMAGE RELATED FUNCTIONS THAT TO DO: CAN BE PUT INTO UPLOAD-IMAGE COMPONENT */

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
      this.setState({ vinImage: [picture] });
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
        this.setState({ vinImage: [picture] });

        if (typeof (picture.base64) !== "undefined" && picture.base64.length > 0) {
          process.env.REACT_APP_PARTIAL_UPLOAD === 'true' ? this.uploadImagePartial() : this.uploadSingleImage(picture);
        }
      };
    }, {
      meta: true,
      orientation: true
    });
  }

  onChangeImage = async e => {
    const files = e.target.files;
    await this.rotateImage(files[0]);
  };
  onDelete = idx => {
    this.setState({
      removedImage: this.state.vinImage,
      vinImage: []
    })
    if (this.props.currentIncident.images !== undefined && this.props.currentIncident.images.map(it => it.contentType === 'vin')) {
      // this.props.deleteImage('odometer')
      this.props.upload_done(true)
    }
  };

  uploadSingleImage = async picture => {
    console.log("UPLOAD SINGLE IMAGE");
    console.log(picture);
    console.log(this.props.currentIncident.incidentId);
    console.log(this.props.userInfo);
    this.setState({ imageLoading: true });
    const image = await buildImage(this.props.userInfo, this.props.currentIncident.incidentId, this.state.vinImage[0]);
    console.log(image);
    if (image.hasOwnProperty("error")) {
      this.setState({ imageLoading: false });
      this.props.enqueueSnackbar(
        'Image failed to upload, please try to reupload',
        {
          variant: "warning",
          autoHideDuration: 2000
        }
      );
    } else {
      await putImage(image);
      this.setState({ vinImage: [image] });
      await this.scanImage()
    }
  };

  uploadImagePartial = async () => {
    console.log("UPLOAD IMAGE PARTIAL");
    this.setState({ isLoading: true });
    if (!this.state.Upload_intermediate) {
      var image = await buildImagePartial(this.props.userInfo, this.props.currentIncident.incidentId, this.state.vinImage[0]);
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
    this.setState({ vinImage: [image] });
  };

  addUpdateIncident = async vehicleParams => {
    const currentIncident = this.props.currentIncident;

    let images = [];
    let image = null;

    if (this.state.vinImage.length > 0) {
      let vehicleParams = {};
      image = this.state.vinImage[0];

      if(image && (typeof(image.url) !== "undefined" || typeof(image.dataStore.url) !== "undefined")){
        const url = typeof(image.url) !== "undefined" ? image.url : image.dataStore.url;
        const imageParams = {
          imageId: image.imageId,
          name: image.name,
          checksum: image.checksum,
          contentType: "vin",
          url: url,
          orientation: image.orientation,
          location: image.location,
          incidentId: this.props.currentIncident.incidentId
        }
        vehicleParams.vinImageId = image.imageId
        vehicleParams.createdBy = this.props.userInfo.userId
        images.push(imageParams);
      }
    }

    if(vehicleParams){
      const newIncident = await buildIncident(currentIncident, vehicleParams, images);
      await this.props.storeIncident(newIncident);
      console.log("CURRENT INCIDENT TO POST/PUT");
      console.log(newIncident);
    }

    this.setState({ navigateTo: "/vehicle-info" })
  }

  scanImage = async () => {
    console.log("VIN IMAGE STATE");
    console.log(this.state.vinImage);
    if (this.state.vinImage.length > 0) {
      const image = this.state.vinImage[0];
      let vehicleParams = {};
      console.log("VIN DECODER API CALL WITH IMAGE DETAILS");
      const headers = { "Accept": "application/json" };
      const url = `${process.env.REACT_APP_VIN_DECODER_API_ENDPOINT}?incidentId=${this.props.currentIncident.incidentId}&imageId=${image.imageId}&contentType=vin&imageType=${image.type}`
      console.log(url);
      const resp = await get(url, this.props.userInfo, headers);
      // if (resp) {
      //   clearTimeout(simple_delay_msg);
      // }
      console.log("ENTER VIN RESPONSE");
      console.log(resp);
      if (resp.error) {
        this.props.enqueueSnackbar(
          this.props.t("home.enter-vin.imagenotfound"),
          {
            variant: "error",
            autoHideDuration: 4000
          }
        );
        this.setState({ imageLoading: false })
      } else {

        if (resp.data.make != "" || resp.data.model != "") {

          vehicleParams = {
            ...vehicleParams,
            make: resp.data.make,
            model: resp.data.model,
            year: resp.data.year,
            trim: resp.data.trim,
            vin: resp.data.inferredVin
          }

          console.log("VEHICLE PARAMS SET");
          console.log(vehicleParams);

          this.props.enqueueSnackbar(
            this.props.t("home.enter-vin.success"),
            {
              variant: "success",
              autoHideDuration: 3000
            }
          )
          this.setState({ imageLoading: false })
          console.log("addUpdateIncident called");
          console.log(vehicleParams);
          await this.addUpdateIncident(vehicleParams);
        } else if (resp.data.inferredVin && resp.data.inferredVin.length > 0) {
          console.log("GOT INFERRED VIN");
          this.setState({ imageLoading: false, showWarning: true, vin: resp.data.inferredVin })
        } else {
          console.log("MISSING VEHICLE DATA");
          this.props.enqueueSnackbar(
            this.props.t("home.enter-vin.imagenotfound"),
            {
              variant: "error",
              autoHideDuration: 6000
            }
          )
          this.setState({ imageLoading: false })
          console.log("addUpdateIncident called");
          console.log(vehicleParams);
          await this.addUpdateIncident(vehicleParams);
        }
      }

    }

  }

  /* ALL IMAGE RELATED FUNCTIONS THAT TO DO: CAN BE PUT INTO UPLOAD-IMAGE COMPONENT */

  handleClick = async () => {
    var simple_delay_msg = setTimeout(() => {
      this.props.enqueueSnackbar(
        this.props.t("home.enter-vin.getting-info"),
        {
          variant: "warning",
          autoHideDuration: 4000
        }
      )
    }, 6000)
    this.setState({
      load: true
    })

    let vehicleParams = {
      vin: this.state.vin
    }
    const headers = { "Accept": "application/json" };
    const resp = await get(`${process.env.REACT_APP_VIN_DECODER_API_ENDPOINT}?vin=${this.state.vin}`, this.props.userInfo, headers);
    // if (resp) {
    //   clearTimeout(simple_delay_msg);
    // }
    console.log("ENTER VIN RESPONSE");
    console.log(resp);
    if (resp.error) {
      clearTimeout(simple_delay_msg);
      this.props.enqueueSnackbar(
        this.props.t("home.enter-vin.notfound"),
        {
          variant: "error",
          autoHideDuration: 4000
        }
      );
      this.setState({ load: false, navigateTo: "/vehicle-info" })
    } else {
      if (resp.data.make != "" || resp.data.model != "") {

        vehicleParams = {
          ...vehicleParams,
          make: resp.data.make,
          model: resp.data.model,
          year: resp.data.year,
          trim: resp.data.trim
        }

        this.props.enqueueSnackbar(
          this.props.t("home.enter-vin.success"),
          {
            variant: "success",
            autoHideDuration: 3000
          }
        )

      } else {
        console.log("MISSING VEHICLE DATA");
        this.props.enqueueSnackbar(
          this.props.t("home.enter-vin.notfound"),
          {
            variant: "error",
            autoHideDuration: 6000
          }
        )
        this.setState({ navigateTo: "/vehicle-info" })
      }
      this.setState({ load: false })
      clearTimeout(simple_delay_msg);
      await this.addUpdateIncident(vehicleParams);
    }

  }

  render() {

    const { t, classes, userInfo } = this.props;
    const warningMessage = t('home.enter-vin.inferred-vin-warning');

    if (this.state.navigateTo) {
      return <Redirect push to={this.state.navigateTo} />;
    }
    if (this.state.imageLoading) {
      return <Loading notification={t('home.enter-vin.image-loading-message')} />;
    }
    console.log("ENTER VIN PROPS");
    console.log(this.props);
    console.log(process.env.REACT_APP_VIN_DECODER_API_ENDPOINT);
    return (
      <div className="enter-vin-container">
        <TopNav
          backType="backward"
          goBack={() => this.props.history.goBack()}
        />

        <div className="content">
          <Title title={t("home.enter-vin.title")} subtitle={t("home.enter-vin.subtitle")} />
          {
            this.state.showWarning ?
              <Grid item xs={12} container className={classes.container} style={{ marginTop: "20px" }}>
                <Alert color="warning">{warningMessage}</Alert>
              </Grid>
              : ""}
          <form className="vin-form claim-form" noValidate autoComplete="off">
            <TextField
              id="vin"
              label={t("home.enter-vin.placeholder")}
              value={this.state.vin}
              onChange={this.handleChange("vin")}
              margin="normal"
              fullWidth
            />
          </form>
          {
            this.state.load ? <CircularProgress /> :

              <ArrowButton
                onClick={this.handleClick}
                icon="arrow_forward"
                disabled={
                  this.state.vin && this.state.vin.length === 17 ? false : true
                }
              />
          }
          <Grid container spacing={2} style={{ marginTop: "20px" }}>
            {
              this.state.vinImage !== null && this.state.vinImage.length > 0 ?
                (this.state.vinImage.map((ph, index) => (
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
                    text={t("home.enter-vin.upload-photo")}
                  />
                </Grid>
            }
            <Grid item xs={12} className="skip-wrapper">
              <Link
                to={{ pathname: "/vehicle-info" }}
                className="odometer-skip"
              >{t("home.enter-vin.skip-link")} </Link>
            </Grid>
          </Grid>
        </div>

      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    currentIncident: state.incidentReducer.currentIncident,
    userInfo: state.userReducer.userInfo
  };
};
const mapDispatchToProps = dispatch => {
  return {
    storeIncident: (value) => dispatch(storeCurrentIncident(value)),
    deleteImage: (name) => dispatch(deleteImageInCurrentIncident(name)),
    upload_done: (val) => dispatch(reUpload('vin', val))
  }
}

export default withNamespaces("common")(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(withSnackbar(EnterVin)))
);

