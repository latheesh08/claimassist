import React, { Component } from 'react'
import {
    Title,
    TopNav,
    ArrowButton,
    TermsandPrivacy,
    ImageViewer
} from "../../../../components";
import { Grid, Icon } from '@material-ui/core'
import { Redirect, Link } from "react-router-dom";
import { withNamespaces } from "react-i18next";
import { withSnackbar } from "notistack";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import { reEdit } from "../../../../actions";
import loadImage from 'blueimp-load-image';
import { SmartImage } from "../../components";
import "./styles.scss";


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
    heading: {
        marginTop: '20px'
    },
    header: {
        borderBottom: '2px solid #8080804d', borderTop: '2px solid #8080804d', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'
    },
    subHeader: {
        width: '25%', padding: 10, borderBottom: '2px solid #f9e4c9', marginTop: 10, marginBottom: 10, display: 'flex'
    },
    title: { flex: 1, display: 'flex', marginLeft: 10, paddingTop: 10, paddingBottom: 10, fontWeight: 'bold', fontSize: 20 }
});

class VehicleSummaryScreen extends Component {
    state = {
        navigateTo: null,

    }
    render() {
        const { t, classes, userInfo } = this.props;
        if (this.state.navigateTo) {
            return <Redirect push to={this.state.navigateTo} />;
        }
        return (
            <div className="license-container">
                <TopNav backType="backward" hasMore={userInfo.role === 'policysubmitter' ? false : true} goBack={() => this.props.history.goBack()} />
                <div className="content">
                    <Title
                        title={t("vehicle-info-summary.title")}
                    />
                    <Grid container>
                        <Grid item xs={12} className={classes.heading}>
                            <Grid className={classes.header}>
                                <div className={classes.title}><Icon style={{ marginRight: '20px' }}>directions_car</Icon><div>{t("vehicle-info-summary.vehicle-details")}</div></div>
                                <Icon style={{}} onClick={() => {
                                    this.props.reEdit(true)
                                    this.setState({
                                        navigateTo: "/vehicle-info"
                                    })
                                }}>
                                    edit </Icon></Grid>
                            <Grid style={{ margin: 20 }}>
                                {t("vehicle-info-summary.make")}: {this.props.vehicleInfo.make} <br />
                                {t("vehicle-info-summary.model")} : {this.props.vehicleInfo.model} <br />
                                {t("vehicle-info-summary.year")} : {this.props.vehicleInfo.year}
                            </Grid>
                        </Grid>
                        {
                            (this.props.userInfo.hasOwnProperty("org") && this.props.userInfo.org === 'elaguila') ? null :

                                <Grid item xs={12} className={classes.heading}>
                                    <Grid className={classes.header}>
                                        <div className={classes.title}><Icon style={{ marginRight: '20px' }}>access_time</Icon><div>{t("vehicle-info-summary.odometer")}</div></div>
                                        <Icon style={{}} onClick={() => {
                                            this.props.reEdit(true)
                                            this.setState({
                                                navigateTo: '/odometer'
                                            })
                                        }}>edit</Icon></Grid>
                                    <Grid style={{ margin: 20 }}>
                                        <div>{t("vehicle-info-summary.reading")} : {this.props.vehicleInfo.odometer}</div>
                                    </Grid>
                                    <Grid item xs={4} sm={3}>
                                        {this.props.images !== undefined && this.props.images.length > 0 ?
                                            (this.props.images.map((pic, id) => {
                                                if (pic.contentType === "odometer") {
                                                    // return <img style={{ borderRadius: 20 }} className={classes.image} src={pic.contentType === "odometer" ? pic.url : null} alt={t("general.not-found")} key={id} />
                                                    return <SmartImage image={pic} />
                                                }
                                                else {
                                                    return null
                                                }

                                            }))
                                            :
                                            null
                                        }
                                    </Grid>
                                </Grid>

                        }
                        <Grid item xs={12} className={classes.heading}>
                            <Grid className={classes.header}>
                                <div className={classes.title}><Icon style={{ marginRight: '20px' }}>assignment</Icon><div>{t("vehicle-info-summary.license-plate")}</div></div>
                                <Icon style={{}} onClick={() => {
                                    this.props.reEdit(true)
                                    this.setState({
                                        navigateTo: '/license-plate'
                                    })
                                }}>
                                    edit </Icon></Grid>
                            <Grid style={{ margin: 20 }}>
                                <div>{t("vehicle-info-summary.license-number")} : {this.props.vehicleInfo.licensePlateNumber}</div>
                            </Grid>
                            <Grid item xs={4} sm={3} >
                                {this.props.images !== undefined && this.props.images.length > 0 ?
                                    (this.props.images.map((pic, id) => {
                                        if (pic.contentType === "license") {
                                            return <SmartImage image={pic} />
                                        } else {
                                            return null
                                        }

                                    }))
                                    :
                                    null
                                }
                            </Grid>
                        </Grid>
                        {
                            (process.env.REACT_APP_FIREBASE_PROJECT_ID === 'elaguila-mx-beta') ?
                                <Grid item xs={12} className={classes.heading}>
                                    <Grid className={classes.header}>
                                        <div className={classes.title}><Icon style={{ marginRight: '20px' }}>contacts</Icon><div>{t("vehicle-info-summary.registration-card")}</div></div>
                                        <Icon style={{}} onClick={() => {
                                            this.props.reEdit(true)
                                            this.setState({
                                                navigateTo: "/register-card"
                                            })
                                        }}>
                                            edit </Icon></Grid>
                                    {/* <Grid style={{ margin: 20 }}>
                                        {t("vehicle-info-summary.registration-card-number")} : {this.props.vehicleInfo.registration}
                                    </Grid> */}
                                    <Grid item xs={4} sm={3} >
                                    </Grid>
                                    <Grid item xs={4} sm={3} style={{ marginTop: '10px' }}>
                                        {this.props.images !== undefined && this.props.images.length > 0 ?
                                            (this.props.images.map((pic, id) => {
                                                if (pic.contentType === "registration") {
                                                    return <SmartImage image={pic} />
                                                } else {
                                                    return null
                                                }
                                            }))
                                            :
                                            null
                                        }
                                    </Grid>
                                </Grid>
                                : null
                        }
                        {
                            this.props.userInfo.isUnderwriting && process.env.REACT_APP_FIREBASE_PROJECT_ID !== 'triglav-us-demo' ?
                                <Grid item xs={12} className={classes.heading}>
                                    <Grid className={classes.header}>
                                        <div className={classes.title}><Icon style={{ marginRight: '20px' }}>credit_card</Icon><div>{t("vehicle-info-summary.drivers-license")}</div></div>
                                        <Icon style={{}} onClick={() => {
                                            this.props.reEdit(true)
                                            this.setState({
                                                navigateTo: "/drivers-license"
                                            })
                                        }}>
                                            edit </Icon></Grid>
                                    <Grid style={{ margin: 20 }}>
                                        {t("vehicle-info-summary.drivers-license-number")} : {this.props.currentIncident.firstPartyLicenseNumber}
                                    </Grid>
                                    <Grid item xs={4} sm={3} id='driver_from_summary'>
                                        {this.props.images !== undefined && this.props.images.length > 0 ?
                                            (this.props.images.map((pic, id) => {
                                                if (pic.contentType === "drivingLicense") {
                                                    return <SmartImage image={pic} />
                                                } else {
                                                    return null
                                                }

                                            }))
                                            :
                                            null
                                        }
                                    </Grid>
                                </Grid>
                                : null
                        }
                        {
                            (!this.props.userInfo.isUnderwriting) ?
                                <Grid item xs={12} className={classes.heading}>
                                    <Grid className={classes.header}>
                                        <div className={classes.title}><Icon style={{ marginRight: '20px' }}>description</Icon><div>{t("vehicle-info-summary.accident-description")}</div></div>
                                        <Icon style={{}} onClick={() => {
                                            this.props.reEdit(true)
                                            this.setState({
                                                navigateTo: '/accident-description'
                                            })
                                        }}>
                                            edit </Icon></Grid>
                                    <Grid style={{ margin: 20 }}>
                                        {t("vehicle-info-summary.description")} : {this.props.description}
                                    </Grid>
                                </Grid>
                                : null
                        }
                    </Grid>
                    <div style={{ marginBottom: '40px' }}>
                        <ArrowButton
                            onClick={() => {
                                this.setState({
                                    navigateTo: "/instruction"
                                })
                            }}
                        /></div>
                </div>
            </div>
        )

    }

}

const mapStateToProps = state => {
    return {
        images: state.incidentReducer.currentIncident.hasOwnProperty("images") ? state.incidentReducer.currentIncident.images : [],
        userInfo: state.userReducer.userInfo,
        currentIncident: state.incidentReducer.currentIncident,
        description: state.incidentReducer.currentIncident.hasOwnProperty("description") ? state.incidentReducer.currentIncident.description : '',
        vehicleInfo: state.incidentReducer.currentIncident.hasOwnProperty("vehicles") ? state.incidentReducer.currentIncident.vehicles[0] : {},
        vehicleId: state.incidentReducer.vehicle_id,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        reEdit: val => dispatch(reEdit(val)),
    }
}

export default withNamespaces("common")(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(withStyles(styles)(withSnackbar(VehicleSummaryScreen)))
);