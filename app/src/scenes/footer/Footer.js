import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { Button } from "@material-ui/core";
import { withNamespaces } from "react-i18next";
import Popup from "../../components/Alert/Alert";
import "./styles.scss";

class Footer extends Component {
    state = { logout: false, showAlert: false };

    handleYes = () => {
        window.location.href = process.env.REACT_APP_LOGOUT_URL;
        this.setState({ logout: true, showAlert: false });
    };

    handleNo = () => {
        this.setState({ showAlert: false });
    };

    componentDidMount = async () => {
        console.log("footer loading");
        // const { t, i18n } = useTranslation("common");
    };

    render() {
        const { classes } = this.props;
        const { t } = this.props;

        return (
            <div className="mainfooter-wrapper">
                <Alert
                    open={this.state.showAlert}
                    message={t("main-footer.logout-message")}
                    noText={t("main-footer.alert-no-logout")}
                    yesText={t("main-footer.alert-yes-logout")}
                    handleYes={this.handleYes}
                    handleNo={this.handleNo}
                />
                <Button className="button-link" onClick={() => {this.setState({ showAlert: true })} }>Logout</Button>
            </div>
        );
    }
}

export default withNamespaces("common")(Footer);