import React, { Component } from 'react'
import {
    Title,
    TopNav,
    ArrowButton,
    PictureButton,
    DeleteButton,
    ImageViewer
} from "../../../../components";
import { SmartImage } from "../../components";
import loadImage from 'blueimp-load-image';
import CRC32 from "crc-32";
import { Redirect, Link } from "react-router-dom";
import { withNamespaces } from "react-i18next";
import { connect } from "react-redux";
import { withSnackbar } from "notistack";
import { Grid, Input, CircularProgress } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import {
    dirtyCurrentIncident,
    reEdit,
    storeCurrentIncident,
    deleteImageInCurrentIncident,
    reUpload

} from "../../../../actions";
import "./styles.scss";
import uuid from "uuid";
import { sendData } from "../../../../api/http_proxy";
import { buildIncident, buildImage, buildImagePartial, putImage, putImagePartial } from "../../components/Utils";

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

class License extends Component {
    state = {
        navigateTo: null,
        license_number: '',
        removedImage: [],
        licenseImage: [],
        Uploaded: false,
        Upload_intermediate: false,
        isLoading: false
    }
    componentDidMount() {
        const { currentIncident } = this.props;
        console.log("license plate props");
        console.log(this.props);
        if (currentIncident.hasOwnProperty("vehicles") && currentIncident.vehicles.length === 1 && currentIncident.vehicles[0].hasOwnProperty("licensePlateNumber")) {
            this.setState({
                license_number: currentIncident.vehicles[0].licensePlateNumber,
                licenseImage: currentIncident.images !== undefined ? currentIncident.images.filter((it) => it.contentType === 'license') : []
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
            this.setState({ licenseImage: [picture] });
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
            //     const base64Full = canvas.toDataURL(file.type);
            //     const [baseType, base64parsed] = base64Full.split(",");
            //     base64 = base64parsed;
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
                this.setState({ licenseImage: [picture] });
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
            removedImage: this.state.licenseImage,
            licenseImage: []
        })
        if (this.props.currentIncident.images !== undefined && this.props.currentIncident.images.map(it => it.contentType === 'license')) {
            // this.props.deleteImage('license')
            this.props.upload_done(true)
        }
    };

    uploadImage = async () => {
        console.log("UPLOAD IMAGE");
        console.log( this.state.licenseImage);
        this.setState({ isLoading: true });
        const image = await buildImage(this.props.userInfo, this.props.currentIncident.incidentId, this.state.licenseImage[0]);
        console.log(image)
        if (image.hasOwnProperty("error")) {
            this.setState({ isLoading: false });
            this.props.enqueueSnackbar(
                'Image failed to upload, please try to reupload',
                {
                    variant: "warning",
                    autoHideDuration: 2000
                }
            );
        } else {
            await putImage(image);
            this.setState({ licenseImage: [image] });
        }

    };

    uploadImagePartial = async () => {
        console.log("UPLOAD IMAGE PARTIAL");
        this.setState({ isLoading: true });
        if (!this.state.Upload_intermediate) {
            var image = await buildImagePartial(this.props.userInfo, this.props.currentIncident.incidentId, this.state.licenseImage[0]);
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
                this.props.t("home.license.upload-failed"),
                {
                    variant: "warning",
                    autoHideDuration: 3000
                }
            );
        }
        this.setState({
            isLoading: false
        })
        this.setState({ licenseImage: [image] });
    };

    addUpdateIncident = async () => {
        const vehicleParams = {
            licensePlateNumber: this.state.license_number
        }
        let images = [];
        console.log("LICENSE IMAGE STATE");
        console.log(this.state.licenseImage);
        if (this.state.licenseImage.length > 0 && this.props.re_upload) {
            const image = this.state.licenseImage[0];
            vehicleParams.licensePlateImageId = image.imageId;
            const imageParams = {
                imageId: image.imageId,
                name: image.name,
                checksum: image.checksum,
                contentType: "license",
                url: image.dataStore.url,
                orientation: image.orientation,
                location: image.location,
                incidentId: this.props.currentIncident.incidentId
            }
            images.push(imageParams);
            this.props.upload_done(false)
        }
        // const removeImageContentType = 'license'
        const newIncident = await buildIncident(this.props.currentIncident, vehicleParams, images);
        await this.props.storeIncident(newIncident);

        this.setState({ isLoading: false, });
    }

    render() {
        if (this.state.navigateTo) {
            return <Redirect push to={this.state.navigateTo} />;
        }
        const { t, classes, userInfo } = this.props;

        let navigateToValue = '';
        if(process.env.REACT_APP_FIREBASE_PROJECT_ID === 'elaguila-mx-beta'){
            navigateToValue = '/register-card'
        } else if (process.env.REACT_APP_FIREBASE_PROJECT_ID === 'triglav-us-demo') {
            navigateToValue = '/vehicle-info-summary-screen'
        } else if (userInfo.isUnderwriting) {
            navigateToValue = '/drivers-license'
        } else {
            navigateToValue = '/accident-description'
        }
        return (
            <div className="license-container">
                {this.props.reEdit_val ? null : <TopNav backType="backward" hasMore={userInfo.role === 'policysubmitter' ? false : true} goBack={() => this.props.history.goBack()} />}
                <div className="content">
                    <Title
                        title={t("home.license.title")}
                        subtitle={t("home.license.Enter_number")}
                    />
                    <Grid container>
                        <Input
                            className="license-input"
                            placeholder={t("home.license.place-holder")}
                            fullWidth
                            value={this.state.license_number}
                            onChange={(evt) => {
                                this.setState({ license_number: evt.target.value })
                            }}
                        />
                        {
                            this.state.licenseImage !== null && this.state.licenseImage.length > 0 ?
                                (this.state.licenseImage.map((ph, index) => (
                                    ph.base64 ?
                                        <Grid item xs={4} sm={3} lg={2} key={index} container>
                                            <Grid item className={classes.imageContainer}>
                                                <img
                                                    className={classes.image}
                                                    src={ph.base64 ? this.getDataUrl(ph.base64) : null}
                                                    alt=""
                                                />
                                                <DeleteButton index={index} onClick={this.onDelete} />
                                            </Grid>
                                        </Grid>
                                        :
                                        <Grid item style={{ width: '200px' }} key={index} className={classes.imageContainer}>
                                            <SmartImage image={ph} />
                                            <DeleteButton index={index} onClick={this.onDelete} />
                                        </Grid>
                                )))
                                :
                                <Grid item xs={12} sm={6} lg={4} className="license-picture-upload">
                                    <PictureButton
                                        onChangeImage={this.onChangeImage}
                                        text={t("home.license.upload-photo")}
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
                                            if (userInfo.role === 'policysubmitter' && (!this.state.license_number || this.state.license_number.length === 0)) {
                                                this.props.enqueueSnackbar(
                                                    this.props.t("home.license.warn-message"),
                                                    {
                                                        variant: "warning",
                                                        autoHideDuration: 2000
                                                    }
                                                );
                                            } else {
                                                if (this.state.removedImage.length > 0) {
                                                    console.log("deleting removed image");
                                                    console.log(this.state.removedImage)
                                                    await this.props.deleteImage('license')
                                                }
                                                if (this.props.re_upload && this.state.licenseImage.length > 0) {
                                                    process.env.REACT_APP_PARTIAL_UPLOAD === 'true' ? await this.uploadImagePartial() : await this.uploadImage();
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
                                                if (this.state.licenseImage.length > 0) {
                                                    process.env.REACT_APP_PARTIAL_UPLOAD === 'true' ? await this.uploadImagePartial() : await this.uploadImage();
                                                }
                                                if (!this.state.Upload_intermediate) {
                                                    await this.addUpdateIncident();
                                                    this.setState({ navigateTo: navigateToValue })
                                                }
                                            }}
                                            icon="arrow_forward"
                                            disabled={
                                                this.state.license_number.length > 0 ? false : true
                                            }
                                        />
                                }
                                {
                                    userInfo.role !== 'policysubmitter' ? (
                                        <Grid item xs={12} className="skip-wrapper" >
                                            <Link
                                                to={{
                                                    pathname: navigateToValue,
                                                }}
                                                className="license-skip"
                                            >
                                                {t("home.license.skip-link")}
                                            </Link>
                                        </Grid>
                                    ) : null
                                }
                            </Grid>}
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        userInfo: state.userReducer.userInfo,
        re_upload: state.incidentReducer.reUpload.license,
        currentIncident: state.incidentReducer.currentIncident,
        reEdit_val: state.incidentReducer.reEdit,
    };
};
const mapDispatchToProps = dispatch => {
    return {
        reEdit: val => dispatch(reEdit(val)),
        dirtyCurrentIncident: (value) => dispatch(dirtyCurrentIncident(value)),
        storeIncident: (value) => dispatch(storeCurrentIncident(value)),
        deleteImage: (name) => dispatch(deleteImageInCurrentIncident(name)),
        upload_done: (val) => dispatch(reUpload('license', val))
    }
}

export default withNamespaces("common")(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(withStyles(styles)(withSnackbar(License)))
);
