import React, { Component } from 'react'
import {
    Title,
    TopNav,
    ArrowButton,
    PictureButton,
    DeleteButton
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
    reEdit,
    reUpload,
    storeCurrentIncident,
    dirtyCurrentIncident,
    deleteImageInCurrentIncident,

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

class DriversLicense extends Component {
    state = {
        navigateTo: null,
        drivers_license_number: '',
        removedImage: [],
        drivingLicenseImage: [],
        Uploaded: false,
        Upload_intermediate: false,
        isLoading: false
    }
    componentDidMount() {
        const { currentIncident } = this.props;
        if (currentIncident.hasOwnProperty("vehicles") && currentIncident.vehicles.length === 1 && currentIncident.hasOwnProperty("firstPartyLicenseNumber")) {
            this.setState({
                drivers_license_number: currentIncident.firstPartyLicenseNumber,
                drivingLicenseImage: currentIncident.images !== undefined ? currentIncident.images.filter((it) => it.contentType === 'drivingLicense') : []
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
    loadFromUrl = (url, id) => {
        loadImage(
            url,
            function (img) {
                if (img.type !== 'error' && document.getElementById(id) !== null) {
                    img.style.width = '200px';
                    document.getElementById(id).appendChild(img);
                } else {
                    console.log('drivers license url :', url)
                }
            },
            {
                orientation: true,
            }
        );
    }

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
            this.setState({ drivingLicenseImage: [picture] });
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
                this.setState({ drivingLicenseImage: [picture] });
            };
        }, {
            meta: true,
            orientation: true
        });
    }
    onChangeImage = e => {
        const files = e.target.files;
        this.showImage(files[0]);
    };
    onDelete = idx => {
        this.setState({
            removedImage: this.state.drivingLicenseImage,
            drivingLicenseImage: []
        })
        if (this.props.currentIncident.images !== undefined && this.props.currentIncident.images.map(it => it.contentType === 'drivingLicense')) {
            // this.props.deleteImage('drivingLicense')
            this.props.upload_done(true)
        }

    };
    uploadImage = async () => {
        console.log("UPLOAD IMAGE");
        this.setState({ isLoading: true });
        const image = await buildImage(this.props.userInfo, this.props.currentIncident.incidentId, this.state.drivingLicenseImage[0]);
        console.log(image);
        if (image.hasOwnProperty("error")) {
            this.setState({ isLoading: false });
            this.props.enqueueSnackbar(
                this.props.t("home.drivers-license.upload-failed"),
                {
                    variant: "warning",
                    autoHideDuration: 2000
                }
            );
        } else {
            await putImage(image);
            this.setState({ drivingLicenseImage: [image] });
        }
    };

    uploadImagePartial = async () => {
        console.log("UPLOAD IMAGE PARTIAL");
        this.setState({ isLoading: true });
        if (!this.state.Upload_intermediate) {
            var image = await buildImagePartial(this.props.userInfo, this.props.currentIncident.incidentId, this.state.drivingLicenseImage[0]);
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
                this.props.t("home.drivers-license.upload-failed"),
                {
                    variant: "warning",
                    autoHideDuration: 3000
                }
            );
        }
        this.setState({
            isLoading: false
        })
        this.setState({ drivingLicenseImage: [image] });
    };

    addUpdateIncident = async () => {
        // const vehicleParams = {
        //     drivingLicense: this.state.drivers_license_number
        // }
        let images = [];
        console.log("ODOMETER IMAGE STATE");
        console.log(this.state.drivingLicenseImage);
        if (this.props.re_upload && this.state.drivingLicenseImage.length > 0) {
            const image = this.state.drivingLicenseImage[0];
            this.props.currentIncident.firstPartyLicenseImageId = image.imageId;
            const imageParams = {
                imageId: image.imageId,
                name: image.name,
                checksum: image.checksum,
                contentType: "drivingLicense",
                url: image.dataStore.url,
                orientation: image.orientation,
                location: image.location,
                incidentId: this.props.currentIncident.incidentId
            }
            images.push(imageParams);
            this.props.upload_done(false)
        }
        this.props.currentIncident.firstPartyLicenseNumber = this.state.drivers_license_number;
        const newIncident = await buildIncident(this.props.currentIncident, {}, images);
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
            <div className="license-container">
                {this.props.reEdit_val ? null : <TopNav backType="backward" hasMore={userInfo.role === 'policysubmitter' ? false : true} goBack={() => this.props.history.goBack()} />}
                <div className="content">
                    <Title
                        title={t("home.drivers-license.title")}
                        subtitle={t("home.drivers-license.Enter_number")}
                    />
                    <Grid container>
                        <Input
                            className="license-input"
                            placeholder={t("home.drivers-license.place-holder")}
                            fullWidth
                            value={this.state.drivers_license_number}
                            onChange={(evt) => {
                                this.setState({ drivers_license_number: evt.target.value })
                            }}
                        />
                        {
                            this.state.drivingLicenseImage !== null && this.state.drivingLicenseImage.length > 0 ?
                                (this.state.drivingLicenseImage.map((ph, index) => (
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
                                        </Grid>
                                        :
                                        <Grid item style={{ width: '200px' }} key={index} className={classes.imageContainer}>
                                            <SmartImage image={ph} />
                                            <DeleteButton index={index} onClick={this.onDelete} />
                                        </Grid>
                                    // </Grid>:
                                    //     <Grid item  key={index} style={{ width: 'auto' }} className={classes.imageContainer} id='driver_license_from_url'>
                                    //         {this.loadFromUrl(ph.url , 'driver_license_from_url')}
                                    //         <DeleteButton index={index} onClick={this.onDelete} />
                                    //     </Grid>
                                )))
                                :
                                <Grid item xs={12} sm={6} lg={4} className="license-picture-upload">
                                    <PictureButton
                                        onChangeImage={this.onChangeImage}
                                        text={t("home.drivers-license.upload-photo")}
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
                                            if (userInfo.role === 'policysubmitter' && (!this.state.drivers_license_number || this.state.drivers_license_number.length === 0)) {
                                                this.props.enqueueSnackbar(
                                                    this.props.t("home.drivers-license.warn-message"),
                                                    {
                                                        variant: "warning",
                                                        autoHideDuration: 2000
                                                    }
                                                );
                                            } else {
                                                if (this.state.removedImage.length > 0) {
                                                    console.log("deleting removed image");
                                                    console.log(this.state.removedImage)
                                                    await this.props.deleteImage('drivingLicense')
                                                }
                                                if (this.props.re_upload && (this.state.drivingLicenseImage !== null && this.state.drivingLicenseImage.length > 0)) {
                                                    process.env.REACT_APP_PARTIAL_UPLOAD === 'true' ? await this.uploadImagePartial() : await this.uploadImage();
                                                }
                                                if (!this.state.Upload_intermediate) {
                                                    await this.addUpdateIncident();
                                                    this.props.reEdit(false)
                                                    this.setState({
                                                        navigateTo: "/vehicle-info-summary-screen"
                                                    })
                                                }
                                            }
                                        }} />}
                                <a style={{ color: '#41bcf2', marginTop: '20px', cursor: 'pointer' }}
                                    onClick={() => {
                                        this.props.reEdit(false)
                                        this.setState({
                                            navigateTo: "/vehicle-info-summary-screen"
                                        })
                                    }}
                                >cancel</a>
                            </Grid>
                            : <Grid>
                                {
                                    this.state.isLoading ?
                                        <CircularProgress />
                                        :
                                        <ArrowButton
                                            onClick={async () => {
                                                if (this.state.drivingLicenseImage.length > 0) {
                                                    process.env.REACT_APP_PARTIAL_UPLOAD === 'true' ? await this.uploadImagePartial() : await this.uploadImage();
                                                }
                                                if (!this.state.Upload_intermediate) {
                                                    await this.addUpdateIncident();
                                                    this.setState({ navigateTo: this.props.userInfo.isUnderwriting ? "/vehicle-info-summary-screen" : "/accident-description" });
                                                }
                                            }}
                                            icon="arrow_forward"
                                            disabled={
                                                this.state.drivers_license_number.length > 0 ? false : true
                                            }
                                        />
                                }
                                {
                                    userInfo.role !== 'policysubmitter' ? (
                                        <Grid item xs={12} className="skip-wrapper" >
                                            <Link
                                                to={{
                                                    pathname: this.props.userInfo.isUnderwriting ? "/vehicle-info-summary-screen" : "/accident-description",
                                                }}
                                                className="license-skip"
                                            >
                                                {t("home.license.skip-link")}
                                            </Link>
                                        </Grid>
                                    ) : null
                                }
                            </Grid>
                    }
                </div>
            </div >
        )
    }
}

const mapStateToProps = state => {
    return {
        userInfo: state.userReducer.userInfo,
        currentIncident: state.incidentReducer.currentIncident,
        dirtyIncident: state.incidentReducer.dirtyIncident,
        reEdit_val: state.incidentReducer.reEdit,
        re_upload: state.incidentReducer.reUpload.driving,
    };
};
const mapDispatchToProps = dispatch => {
    return {
        reEdit: val => dispatch(reEdit(val)),
        dirtyCurrentIncident: (value) => dispatch(dirtyCurrentIncident(value)),
        storeIncident: (value) => dispatch(storeCurrentIncident(value)),
        deleteImage: (name) => dispatch(deleteImageInCurrentIncident(name)),
        upload_done: (val) => dispatch(reUpload('driving', val))

    }
}

export default withNamespaces("common")(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(withStyles(styles)(withSnackbar(DriversLicense)))
);
