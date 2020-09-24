import React, { Component } from 'react'
import {
    Title,
    TopNav,
    ArrowButton,
    InputDropdown
} from "../../../../components";
import { storeCustomerInfo } from "../../../../actions";
import { Input, Grid, Button, CircularProgress } from '@material-ui/core';
import { Redirect, Link } from "react-router-dom";
import { withNamespaces } from "react-i18next";
import { connect } from "react-redux";
import { withSnackbar } from "notistack";
import { withStyles } from "@material-ui/core/styles";
import "./styles.scss";
import { post } from "../../../../api/http_proxy";
import { grey } from '@material-ui/core/colors';

const styles = theme => ({

});

class BasicInfo extends Component {
    state = {
        navigateTo: null,
        name: '',
        phone_number: '',
        email_address: '',
    }

    componentDidMount() {
        console.log("BASIC INFO PROPS");
        console.log(this.props)
    }

    onSubmit = async () => {
        const incident_id = this.props.incidents.hasOwnProperty("incident_id") ? this.props.incidents.incident_id : "";
        const customerInfo = {
            customerName: this.state.name,
            customerPhoneNumber: this.state.phone_number,
            customerEmailAddress: this.state.email_address,
            claimId: incident_id
        }
        await this.props.storeCustomerInfo(customerInfo);

        try {
            const response = await post("/oshot/notify", customerInfo);
            console.log("POST CUSTOMER SUCCESS");
            console.log(response);
            this.setState({
                name: '',
                phone_number: '',
                email_address: '',
            })
            this.props.enqueueSnackbar(
                this.props.t("home.basic-info.success-message"),
                {
                    variant: "success",
                    autoHideDuration: 4000
                }
            );
        } catch (pErr) {
            console.log("POST CUSTOMER ERROR");
            console.log(pErr);
            this.props.enqueueSnackbar(
                this.props.t("home.basic-info.try-again"),
                {
                    variant: "warning",
                    autoHideDuration: 2000
                }
            );
        }
    };

    render() {
        if (this.state.navigateTo) {
            return <Redirect push to={this.state.navigateTo} />;
        }
        const { classes, t, userInfo } = this.props;
        return (
            <div className="basicform-container">
                <TopNav backType="backward" hasMore goBack={() => this.props.history.goBack()} />
                <div className="content">
                    <Title
                        title={t("home.basic-info.title")}
                    />
                    <Grid container>
                        <form style={{ width: '100%' }}>
                            <Input
                                placeholder={t("home.basic-info.name")}
                                fullWidth
                                className="basicform-input"
                                value={this.state.name}
                                onChange={(evt) => {
                                    this.setState({ name: evt.target.value })
                                }}
                            />
                            <Input
                                placeholder={t("home.basic-info.number")}
                                fullWidth
                                className="basicform-input"
                                value={this.state.phone_number}
                                type="number"
                                onChange={(evt) => {
                                    this.setState({ phone_number: evt.target.value })
                                }}
                            />
                            <Input
                                placeholder={t("home.basic-info.email")}
                                fullWidth
                                className="basicform-input"
                                value={this.state.email_address}
                                onChange={(evt) => {
                                    this.setState({ email_address: evt.target.value })
                                }}
                            />
                        </form>
                    </Grid>
                    <ArrowButton
                        onClick={async () => {
                            if (this.state.name !== '' && this.state.phone_number !== '' && this.state.email_address !== '') {
                                console.log(this.state)
                                this.onSubmit();
                            } else {
                                this.props.enqueueSnackbar(
                                    t("home.basic-info.warning"),
                                    {
                                        variant: "warning",
                                        autoHideDuration: 2000
                                    }
                                );
                            }
                        }}
                    />
                    {/* <div>
                        <br />  <h3>Thank you for submitting the information for your claim </h3>
                        <div style={{ color: 'grey' }}><h3>A HialPro representative will contact you shortly </h3></div>
                    </div> */}
                    <br></br>
                    <br></br>
                    <div className="link-navigation-container">
                        <Link to='/home' className="link-button">{ userInfo.isUnderwriting ?  t("home.basic-info.return-to-policies") : t("home.basic-info.return-to-claims")}</Link>
                    </div>
                </div>
            </div>

        )
    }
}

const mapStateToProps = state => {
    return {
        incidents: state.resultReducer.incidents,
        userInfo: state.userReducer.userInfo
    }
}

const mapDispatchToProps = dispatch => {

    return {
        storeCustomerInfo: val => dispatch(storeCustomerInfo(val))
    }
}

export default withNamespaces("common")(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(withStyles(styles)(withSnackbar(BasicInfo)))
);
