import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';
import { Redirect, Link } from "react-router-dom";
import { connect } from "react-redux";
import { withSnackbar } from "notistack";
import { Grid, Input, Button } from "@material-ui/core";
import {
    Title,
    TopNav,
    ArrowButton,
} from "../../../../components";
import "./styles.scss";
import {
    storeCurrentIncident,
    dirtyCurrentIncident,
    reEdit
} from "../../../../actions";
import { sendData } from "../../../../api/http_proxy";
import { buildIncident } from "../../components/Utils";


class Accident extends Component {
    state = { navigateTo: null, description: '' }
    componentDidMount() {
        const { currentIncident } = this.props;
        if (currentIncident.hasOwnProperty("description")) {
            this.setState({
                description: currentIncident.description
            });
        }
    }
    saveData = async () => {
        await this.addUpdateIncident();
        this.setState({ navigateTo: "/vehicle-info-summary-screen" })
    }

    addUpdateIncident = async () => {

        const newIncident = {
            ...this.props.currentIncident,
            description: this.state.description
        }
        // const newIncident = await buildIncident(this.props.currentIncident, vehicleParams);
        await this.props.storeIncident(newIncident);

        console.log("CURRENT INCIDENT TO POST/PUT");
        console.log(newIncident);

        this.setState({ isLoading: false });
    }
    render() {
        if (this.state.navigateTo) {
            return <Redirect push to={this.state.navigateTo} />;
        }
        const { t } = this.props;
        return (
            <div className="accident-container">
                {this.props.reEdit_val ? null : <TopNav backType="backward" hasMore goBack={() => this.props.history.goBack()} />}
                <div className="content">
                    <Title
                        title={t("home.accident.title")}
                    />
                    <Input
                        multiline
                        rows='4'
                        style={{ flexWrap: 'wrap', }}
                        placeholder={t("home.accident.place_holder")}
                        value={this.state.description}
                        fullWidth
                        onChange={(evt) => {
                            this.setState({ description: evt.target.value })
                        }}
                    />
                    {
                        this.props.reEdit_val ?
                            <Grid style={{ marginTop: 20, width: '10%', display: 'flex', flexDirection: 'column' }}>
                                <ArrowButton
                                    icon='save'
                                    onClick={async () => {
                                        this.props.reEdit(false)
                                        this.saveData()
                                    }} />
                                <a style={{ color: '#41bcf2', marginTop: '20px', cursor: 'pointer' }}
                                    onClick={() => {
                                        this.props.reEdit(false)
                                        this.setState({
                                            navigateTo: "/vehicle-info-summary-screen"
                                        })
                                    }}
                                >{t("general.cancel")}</a>
                            </Grid>
                            :
                            <Grid>
                                <ArrowButton
                                    onClick={this.saveData}
                                    icon="arrow_forward"
                                    disabled={
                                        this.state.description.length > 0 ? false : true
                                    }
                                />
                                <Grid item xs={12} className="skip-wrapper" >
                                    <Link
                                        to={{ pathname: "/vehicle-info-summary-screen" }}
                                        className="accident-skip"
                                    >
                                        {t("home.accident.skip-link")}
                                    </Link>
                                </Grid>
                            </Grid>
                    }
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        currentIncident: state.incidentReducer.currentIncident,
        reEdit_val: state.incidentReducer.reEdit,
    };
};
const mapDispatchToProps = dispatch => {
    return {
        reEdit: val => dispatch(reEdit(val)),
        dirtyCurrentIncident: (value) => dispatch(dirtyCurrentIncident(value)),
        storeIncident: (value) => dispatch(storeCurrentIncident(value)),
    }
}

export default withNamespaces('common')(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(withSnackbar(Accident))
)