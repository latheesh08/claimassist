import React, { Component } from 'react'
import {
    Title,
    TopNav,
    ArrowButton,
} from "../../../../components";
import { ClaimImage } from "../../components";
import { Grid, Icon } from '@material-ui/core'
import { Redirect, Link } from "react-router-dom";
import { withNamespaces } from "react-i18next";
import { connect } from "react-redux";
import { withSnackbar } from "notistack";
import { withStyles } from "@material-ui/core/styles";
import { Loading } from '../../components';
import "./styles.scss";
import {
    reEdit,
    storeCurrentIncident,
    cloneAppraisal,
    storeDamages,
    storeGrades,
    storeImages,
    reEditPoseName,
    reEdit_pose_picture,
    storeResults,
    reEdit_from_poses,
} from "../../../../actions";
import loadImage from 'blueimp-load-image';
import { sendData, post, get, put } from "../../../../api/http_proxy";
import { buildIncident } from "../../components/Utils";
import uuid from 'uuid';


const styles = theme => ({
    imageContainer: {
        position: "relative",
        width: "100%",
        margin: theme.spacing(0.2),
        background: "#f7f7f7"
    },
    image: {
        height: "auto",
        width: "95%",
        maxHeight: "250px"
    },
    header: {
        borderBottom: '2px solid #8080804d', borderTop: '2px solid #8080804d', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'
    },
    subHeader: {
        padding: 10, borderBottom: '2px solid #f9e4c9', marginTop: 10, marginBottom: 10, display: 'flex'
    },
    title: { flex: 1, display: 'flex', marginLeft: 10, paddingTop: 10, paddingBottom: 10, fontWeight: 'bold', fontSize: 20 }
});


class SummaryScreen extends Component {

    state = {
        uploaded_pose_names: [],
        navigateTo: null,
        isCompleted: false,
        isLoading: false,
        incidentId: null,
        vehicleId: null,
        noError: true
    }

    componentDidMount() {
        console.log('SUMMARY SCREEN PROPS');
        console.log(this.props)
        const { userInfo, currentIncident, uploaded_poses, selected_poses } = this.props
        console.log('CURRENT INCIDENT');
        console.log(this.props.currentIncident);
        var imaged_poses = Object.keys(uploaded_poses).filter(it => uploaded_poses[it] === true)
        let selectedPoses = [];
        if(userInfo.isUnderwriting){
            selectedPoses = selected_poses.map(i => i.storage_name)
        } else {
            selectedPoses = selected_poses.filter(itm => itm.select === true).map(i => i.storage_name)
        }
        var uploaded_pose_names = imaged_poses.filter(it => selectedPoses.includes(it));
        console.log('IMAGE POSES, SELECTED POSES AND UPLOADED POSE NAMES');
        console.log(imaged_poses);
        console.log(selectedPoses);
        console.log(uploaded_pose_names);
        this.setState({
            uploaded_pose_names: uploaded_pose_names,
        })
        
        this.props.reUpload_from_poses(false);
    }

    getDataUrl = imgData => `data:image/png;base64,${imgData}`;
    postApi = async images => {
        this.setState({ isLoading: true });
        const { userInfo } = this.props;
        console.log("IN POST API");

        if (this.state.noError) {
            var apiImages = images.map(item => {

                return {
                    ...item.dataStore,
                    contentType: 'damage',
                    incidentId: this.props.currentIncident.incidentId,
                    vehicleId: this.props.currentIncident.vehicles[0].vehicleId
                };
            }).filter(i => typeof(i.imageId) !== "undefined" && typeof(i.url) !== "undefined");
            
            console.log("API IMAGES");
            console.log(apiImages);
        }

        const headers = {
            "Content-Type": "application/json",
        };

        const newIncident = await buildIncident(this.props.currentIncident, [], apiImages);
        await this.props.storeIncident(newIncident);
        console.log("NEW INCIDENT");
        console.log(newIncident);

        let response = {};
        const damagedImages = newIncident.images.filter(i => i.contentType === 'damage');
        if(damagedImages.length <= 0){

            console.log("MISSING DAMAGE IMAGES");
            this.props.enqueueSnackbar(
                this.props.t("pose-summary.missing-images"),
                { variant: "error", autoHideDuration: 6000 }
            );
            this.setState({
                noError: false, isLoading: false
            })
        }else{

            response = await sendData('POST', process.env.REACT_APP_INCIDENT_API_ENDPOINT, newIncident, userInfo, headers);
            console.log("RESPONSE FROM BACKEND");
            console.log(response);

            this.setState({ isLoading: false, isCompleted: true, noError: true, navigateTo: "/analysis-results" });
            if (response.error) {
                this.setState({
                    noError: false
                })
                this.props.enqueueSnackbar(
                    this.props.t("pose-summary.submit-error"),
                    { variant: "error", autoHideDuration: 3000 }
                );
                this.setState({ isLoading: false });
            } else {
                this.props.enqueueSnackbar(
                    this.props.t("pose-summary.submit-success"),
                    { variant: "success", autoHideDuration: 3000 }
                );
                this.setState({ isLoading: false, navigateTo: "/analysis-results" });
            }
        }

        // this.props.enqueueSnackbar(
        //     "Success while submitting info",
        //     { variant: "success", autoHideDuration: 3000 }
        // );
        // this.setState({ isLoading: false });


    }

    render() {
        const { t, classes, pictureList, userInfo } = this.props;
        if (this.state.navigateTo) {
            return <Redirect push to={this.state.navigateTo} />;
        }
        if (this.state.finalLoad) {
            return <Loading notification={t("pose-summary.summary-notification")} />
        }
        if (this.state.isCompleted) {
            return <Redirect push to="/analysis-results" />;
        }
        return (
            <div className="license-container">
                <TopNav backType="backward" hasMore={userInfo.role === 'policysubmitter' ? false : true} goBack={() => this.props.history.goBack()} />
                <div className="content">
                    <Title
                        title={t("pose-summary.title")}
                    // subtitle={t("home.license.Enter_number")}
                    />
                    <Grid container>
                        <Grid item xs={12}>
                            <Grid className={classes.header}>
                                <div className={classes.title}><Icon style={{ marginRight: '20px' }}>photo_library</Icon><div>{t("pose-summary.uploaded-poses")}</div></div>
                                {
                                    userInfo.isUnderwriting ? null : (
                                        <Icon style={{}} onClick={() => {
                                            this.props.reEdit_pose_picture()
                                            this.props.reUpload_from_poses(true);
                                            this.props.reEdit(false)
                                            this.props.reEditPoseName('')
                                            this.setState({
                                                navigateTo: '/choose-angle'
                                            })
                                        }}>
                                            edit
                                        </Icon>
                                    )
                                }
                            </Grid>
                            <Grid>
                                {this.state.uploaded_pose_names.map((it, idx) => {
                                    return (
                                        <Grid key={idx}>
                                            <Grid className={classes.subHeader}>
                                                <div style={{
                                                    flex: 1, display: 'flex', fontWeight: 'bold'
                                                }}>{t("home.common-pose." + it)} </div><Icon style={{ alignSelf: 'center' }} onClick={() => {
                                                    this.props.reEdit_pose_picture()
                                                    this.props.reEditPoseName(it)
                                                    this.props.reEdit(true)
                                                    this.setState({
                                                        navigateTo: '/individual-angle'
                                                    })
                                                }}>
                                                    edit
                                            </Icon>
                                            </Grid>

                                            <Grid container spacing={1} >
                                                {this.props.pose_pictures[it].length > 0 ?
                                                    (this.props.pose_pictures[it].map((pic, idy) => (
                                                        <Grid key={idy} item xs={6} sm={3} >
                                                            <ClaimImage
                                                                userInfo={userInfo}
                                                                image={pic}
                                                                currentPath={this.props.match.url}
                                                                showEditInfoIcon={false}
                                                                grades={null}
                                                                parent="imageSummary"
                                                            />
                                                        </Grid>
                                                    )))
                                                    :
                                                    null
                                                }
                                                {this.props.moreImages[it].length > 0 ?
                                                    (this.props.moreImages[it].map((pic, idz) => (
                                                        <Grid key={idz} item xs={6} sm={3} >
                                                            <ClaimImage
                                                                userInfo={userInfo}
                                                                image={pic}
                                                                currentPath={this.props.match.url}
                                                                showEditInfoIcon={false}
                                                                grades={null}
                                                                parent="imageSummary"
                                                            />
                                                        </Grid>
                                                    )))
                                                    :
                                                    null

                                                }
                                            </Grid>
                                        </Grid>
                                    )
                                })
                                }
                            </Grid>

                        </Grid>

                    </Grid>
                    <div style={{ marginBottom: '40px' }}>
                        <ArrowButton
                            onClick={() => {
                                let final_sending_images = []
                                let final_send = []
                                // console.log(this.props.totalImages)
                                console.log(this.props.poses)
                                for (let i = 0; i < this.state.uploaded_pose_names.length; i++) {
                                    final_sending_images = final_sending_images.concat(this.props.pose_pictures[this.state.uploaded_pose_names[i]])
                                }
                                for (let i = 0; i < this.state.uploaded_pose_names.length; i++) {
                                    if (this.props.moreImages[this.state.uploaded_pose_names[i]] !== 0) {
                                        final_sending_images = final_sending_images.concat(this.props.moreImages[this.state.uploaded_pose_names[i]])
                                    }

                                }

                                this.setState({
                                    finalLoad: true
                                })
                                console.log("FINAL SENDING IMAGES");
                                console.log(final_sending_images)
                                this.postApi(final_sending_images)
                            }}
                            icon="arrow_forward"
                        /></div>

                </div>

            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        incidentId: state.incidentReducer.currentIncident.incidentId,
        currentIncident: state.incidentReducer.currentIncident,
        userInfo: state.userReducer.userInfo,
        pose_pictures: state.posesReducer.poseimages,
        moreImages: state.posesReducer.more_pose_images,
        uploaded_poses: state.posesReducer.uploaded_poses,
        grades: state.gradeReducer.grades,
        // vehicleInfo: state.incidentReducer.currentIncident.vehicles[0],
        // description: state.accidentinfoReducer.description,
        poses: state.posesReducer.poses,
        selected_poses: state.chooseAngleReducer.selected_poses,
    };
}

const mapDispatchToProps = dispatch => {
    return {
        reEdit: val => dispatch(reEdit(val)),
        saveAppraisal: appraisal => dispatch(cloneAppraisal(appraisal)),
        savePictures: pictures => dispatch(storeImages(pictures)),
        storeIncident: (value) => dispatch(storeCurrentIncident(value)),
        storeResults: (grades, incidents, damages, shapes, parts, appraisals) =>
            dispatch(
                storeResults(grades, incidents, damages, shapes, parts, appraisals)
            ),
        saveGrades: grades => dispatch(storeGrades(grades)),
        saveDamages: damages => dispatch(storeDamages(damages)),
        reEditPoseName: name => dispatch(reEditPoseName(name)),
        reEdit_pose_picture: () => dispatch(reEdit_pose_picture()),
        reUpload_from_poses: (val) => dispatch(reEdit_from_poses(val))
    }
}

export default withNamespaces("common")(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(withStyles(styles)(withSnackbar(SummaryScreen)))
);