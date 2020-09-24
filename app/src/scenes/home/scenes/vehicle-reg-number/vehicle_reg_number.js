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
    deleteImageInCurrentIncident

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

class Vehicle_Reg_number extends Component {
    state = {
        navigateTo: null,
        // register_number: '',
        removedImage: [],
        registrationImage: [],
        Uploaded: false,
        Upload_intermediate: false,
        isLoading: false
    }
    componentDidMount() {
        const { currentIncident } = this.props;
        if (currentIncident.hasOwnProperty("vehicles") && currentIncident.vehicles.length === 1 && currentIncident.vehicles[0].hasOwnProperty("regnImageId")) {
            this.setState({
                // register_number: currentIncident.vehicles[0].registration,
                registrationImage: currentIncident.images !== undefined ? currentIncident.images.filter((it) => it.contentType === 'registration') : []
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
    pathname = () => {
        if (this.props.userInfo.isUnderwriting) {
            return "/drivers-license"
            // return "/vehicle-info-summary-screen"
        } else {
            return "/accident-description"
        }
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
            this.setState({ registrationImage: [picture] });
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
                this.setState({ registrationImage: [picture] });
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
            removedImage: this.state.registrationImage,
            registrationImage: []
        })
        if (this.props.currentIncident.images !== undefined && this.props.currentIncident.images.map(it => it.contentType === 'registration')) {
            // this.props.deleteImage('registration')
            this.props.upload_done(true)
        }
    };
    uploadImage = async () => {
        console.log("UPLOAD IMAGE");
        this.setState({ isLoading: true });
        const image = await buildImage(this.props.userInfo, this.props.currentIncident.incidentId, this.state.registrationImage[0]);
        console.log(image);
        if (image.hasOwnProperty("error")) {
            this.setState({ isLoading: false });
            this.props.enqueueSnackbar(
                this.props.t("home.register.upload-failed"),
                {
                    variant: "warning",
                    autoHideDuration: 2000
                }
            );
        } else {
            await putImage(image);
            this.setState({ registrationImage: [image] });
        }
    };

    uploadImagePartial = async () => {
        console.log("UPLOAD IMAGE PARTIAL");
        this.setState({ isLoading: true });
        if (!this.state.Upload_intermediate) {
            var image = await buildImagePartial(this.props.userInfo, this.props.currentIncident.incidentId, this.state.registrationImage[0]);
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
                this.props.t("home.register.upload-failed"),
                {
                    variant: "warning",
                    autoHideDuration: 3000
                }
            );
        }
        this.setState({
            isLoading: false
        })
        this.setState({ registrationImage: [image] });
    };
    addUpdateIncident = async () => {
        // const vehicleParams = {
        //     registration: this.state.register_number
        // }
        let vehicleParams = {};
        let images = [];
        console.log("Registration IMAGE STATE");
        console.log(this.state.registrationImage);
        if (this.props.re_upload && this.state.registrationImage.length > 0) {
            const image = this.state.registrationImage[0];
            vehicleParams.regnImageId = image.imageId;
            const imageParams = {
                imageId: image.imageId,
                name: image.name,
                checksum: image.checksum,
                contentType: "registration",
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
        const { t, classes, pictureList, userInfo } = this.props;
        return (
            <div className="veh-register-container">
                {this.props.reEdit_val ? null : <TopNav backType="backward" hasMore={userInfo.role === 'policysubmitter' ? false : true} goBack={() => this.props.history.goBack()} />}
                <div className="content">
                    <Title
                        title={t("home.register.title")}
                        subtitle={t("home.register.Enter_number")}
                    />
                    <Grid container style={{ marginTop: 20 }}>
                        {/* <Input
                            className="register-input"
                            placeholder={t("home.register.place-holder")}
                            fullWidth
                            value={this.state.register_number}
                            onChange={(evt) => {
                                this.setState({ register_number: evt.target.value })
                            }}
                        /> */}
                        {
                            this.state.registrationImage !== null && this.state.registrationImage.length > 0 ?
                                (this.state.registrationImage.map((ph, index) => (
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
                                        </Grid> :
                                        <Grid item style={{ width: '200px' }} key={index} className={classes.imageContainer}>
                                            <SmartImage image={ph} />
                                            <DeleteButton index={index} onClick={this.onDelete} />
                                        </Grid>
                                )))
                                :
                                <Grid item xs={12} sm={6} lg={4} className="register-picture-upload">
                                    <PictureButton
                                        onChangeImage={this.onChangeImage}
                                        text={t("home.register.upload-photo")}
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

                                            if(this.state.removedImage.length > 0){
                                                console.log("deleting removed image");
                                                console.log(this.state.removedImage)
                                                await this.props.deleteImage('registration')
                                            }
                                            if (userInfo.role === 'policysubmitter') {
                                                if (this.state.registrationImage.length === 0) {
                                                    this.props.enqueueSnackbar(
                                                        this.props.t("home.register.warn-message"),
                                                        {
                                                            variant: "warning",
                                                            autoHideDuration: 2000
                                                        }
                                                    );

                                                } else {
                                                    
                                                    if (this.props.re_upload && this.state.registrationImage.length > 0) {
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
                                            } else {
                                                if (this.props.re_upload && this.state.registrationImage.length > 0) {
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
                                        }} />}
                                <a style={{ color: '#41bcf2', marginTop: '20px', cursor: 'pointer' }}
                                    onClick={() => {
                                        this.props.reEdit(false)
                                        this.setState({ navigateTo: '/vehicle-info-summary-screen' })
                                    }}
                                >{t("general.cancel")}</a>
                            </Grid>
                            : <Grid>
                                {
                                    this.state.isLoading ?
                                        <CircularProgress />
                                        :
                                        <ArrowButton
                                            onClick={async () => {
                                                if (this.state.registrationImage.length > 0) {
                                                    process.env.REACT_APP_PARTIAL_UPLOAD === 'true' ? await this.uploadImagePartial() : await this.uploadImage();
                                                }
                                                if (!this.state.Upload_intermediate) {
                                                    await this.addUpdateIncident();
                                                    if (this.props.userInfo.isUnderwriting) {
                                                        this.setState({ navigateTo: "/drivers-license" });
                                                        // this.setState({ navigateTo: "/vehicle-info-summary-screen" });
                                                    } else {
                                                        this.setState({ navigateTo: "/accident-description" });

                                                    }
                                                }
                                            }}
                                            icon="arrow_forward"
                                            disabled={
                                                this.state.registrationImage.length > 0 ? false : true
                                            }
                                        />
                                }
                                {
                                    userInfo.role !== 'policysubmitter' ? (
                                        <Grid item xs={12} className="skip-wrapper" >
                                            <Link
                                                to={{
                                                    pathname: this.pathname(),
                                                }}
                                                className="register-skip"
                                            >
                                                {t("home.register.skip-link")}
                                            </Link>
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
        userInfo: state.userReducer.userInfo,
        currentIncident: state.incidentReducer.currentIncident,
        reEdit_val: state.incidentReducer.reEdit,
        re_upload: state.incidentReducer.reUpload.registration,
        dirtyIncident: state.incidentReducer.dirtyIncident,
    };
};
const mapDispatchToProps = dispatch => {
    return {
        dirtyCurrentIncident: (value) => dispatch(dirtyCurrentIncident(value)),
        storeIncident: (value) => dispatch(storeCurrentIncident(value)),
        reEdit: val => dispatch(reEdit(val)),
        upload_done: (val) => dispatch(reUpload('registration', val)),
        deleteImage: (name) => dispatch(deleteImageInCurrentIncident(name)),
    }
}

export default withNamespaces("common")(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(withStyles(styles)(withSnackbar(Vehicle_Reg_number)))
);
