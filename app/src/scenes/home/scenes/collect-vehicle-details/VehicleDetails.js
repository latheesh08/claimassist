import React, { Component } from 'react';
import {
    Title,
    TopNav,
    ArrowButton,
    TermsandPrivacy
} from "../../../../components";
import { withNamespaces } from 'react-i18next';
import { Redirect, Link } from "react-router-dom";
import { connect } from "react-redux";
import { withSnackbar } from "notistack";
import { Grid, Input, Divider } from "@material-ui/core";
import Icon from '@material-ui/core/Icon';
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import KeyboardIcon from '@material-ui/icons/Keyboard';
import uuid from "uuid";
import { dirtyCurrentIncident, storeCurrentIncident } from "../../../../actions";
import "./styles.scss";

class CollectDetails extends Component {
    state = {}
    componentDidMount() {
        const { userInfo } = this.props;
        console.log("VEHICLE DETAILS PROPS");
        console.log(this.props);
        if (!this.props.currentIncident) {
            // create new incident if the user comes directly to this page in the frictionless setting
            this.props.dirtyCurrentIncident(true);
            const incident = {
                incidentId: uuid.v4(),
                sourceSystem: userInfo.isUnderwriting ? "policyassist" : "claimassist",
                externalId: this.props.applicationId,
                type: this.props.userInfo.isUnderwriting ? "policy" : "claim",
                createdBy: userInfo.userId,
                status: "submitted",
                state: "in progress"
            }
            console.log("NEW INCIDENT");
            console.log(incident)
            this.props.storeIncident(incident);
        }
    }
    render() {
        if (this.state.navigateTo) {
            return <Redirect push to={this.state.navigateTo} />;
        }
        const { t, userInfo } = this.props;
        return (
            <div className="details-container">
                <TopNav backType="backward" hasMore={userInfo.role === 'policysubmitter' ? false : true} goBack={() => this.setState({ navigateTo: "/home" })} />
                <div className="content">
                    {
                        this.props.applicationId ? (
                            <Title
                                title={`Hola, ${userInfo.firstName}`} subtitle={t("home.vehicle-details.subtitle")}
                            />
                        ) : (
                                <Title
                                    title={t("home.vehicle-details.title")}
                                />
                            )
                    }

                    <Grid item xs={12} style={{ margin: '60px 20px 20px 0' }}>
                        {/* <PhotoCameraIcon color="primary" />  Commented til we are ready to start scanning through camera */}
                        <FormatListNumberedIcon color="primary" />
                        {/* <Icon color="primary" /> */}
                        <Link
                            to={{ pathname: "/enter-vin" }}
                            className="details-link"
                        >
                            {t("home.vehicle-details.enter-vin")}
                        </Link>
                    </Grid>
                    <Divider variant="middle" style={{ borderTop: '1px solid #18aeef', margin: '20px 20px 20px 0' }} />
                    <Grid item xs={12} style={{ margin: '20px 20px 20px 0' }}>
                        <KeyboardIcon color="primary" />
                        <Link
                            to={{ pathname: "/vehicle-info" }}
                            className="details-link"
                        >
                            {t("home.vehicle-details.enter-manually")}
                        </Link>
                    </Grid>
                    {/* <ArrowButton
                        onClick={() => this.setState({ navigateTo: "/enter-vin" })}
                        icon="arrow_forward"
                        disabled={
                            this.state.license_number.length > 0 ? false : true
                        }
                    /> */}
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        currentIncident: state.incidentReducer.currentIncident,
        userInfo: state.userReducer.userInfo,
        applicationId: state.userReducer.applicationId
    };
}

const mapDispatchToProps = dispatch => {
    return {
        storeIncident: (value) => dispatch(storeCurrentIncident(value)),
        dirtyCurrentIncident: (value) => dispatch(dirtyCurrentIncident(value))
    };
};

export default withNamespaces('common')(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(withSnackbar(CollectDetails))
)