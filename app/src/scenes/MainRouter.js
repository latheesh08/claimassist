import React, { Component } from "react";
import { connect } from "react-redux";
// Router
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

// Scenes
import Register from "./Register/Register";
import Login from "./Login/Login";
import Page404 from "./Page404/Page404";
import Home from "./home/Home";
import TermsandPrivacy from "../components/Terms and Privacy/TermsandPrivacy";
import { Alert } from "reactstrap";

import { withNamespaces } from "react-i18next";
import {
  storeApplicationId,
  storeUserInfo,
  isUnderwriting,
  clearAllStateData,
  dirtyCurrentIncident,
  storeCurrentIncident,
} from "../actions";
import { withStyles } from "@material-ui/core/styles";
import { getUser } from "../components/UserUtils";
import { checkQueryStrings } from "../components/GlobalUtils";
import { get } from "../api/http_proxy";

import { AuthProvider } from "./Auth";
import PrivateRoute from "./PrivateRoute";
import firebaseapp from "./base.js";
import { Grid } from "@material-ui/core";
const styles = (theme) => ({
  root: {
    flexGrow: 1,
  },
});

class MainRouter extends React.Component {
  state = {
    loading: true,
    view: false,
    error: false,
    errorOnEmailCheck: false,
    errorOnExpiredLink: false,
    isSignInWithEmailLink: false,
  };

  setDocumentTitle = (userInfo) => {
    const { t } = this.props;
    const incidentType = userInfo.isUnderwriting
      ? t("auth.policy")
      : t("auth.claim");
    const clientName = process.env.REACT_APP_CLIENT_NAME
      ? process.env.REACT_APP_CLIENT_NAME
      : "Galaxy";
    document.title = t("auth.app-title", {
      clientName: clientName,
      incidentType: incidentType,
    });
  };

  async componentDidMount() {
    console.log("---------------------------------------");
    console.log("MAIN ROUTER REACHED");
    console.log("---------------------------------------");
    const { userInfo, currentIncident } = this.props;

    this.setState({ view: false, loading: true, error: false });

    const emailSignInSuccess = await this.handleEmailLinkSignIn();

    if (emailSignInSuccess) {
      const queryParams = checkQueryStrings();
      const queryParamsLength =
        Object.keys(queryParams).length > 0
          ? Object.keys(queryParams).length
          : 0;
      console.log(process.env.REACT_APP_LANGUAGE);

      if (
        queryParamsLength > 0 &&
        typeof queryParams.adminLanguage !== "undefined"
      ) {
        console.log("ADMIN LANGUAGE QUERY PARAM FOUND!!");
        console.log(queryParams.adminLanguage);
        this.props.i18n.changeLanguage(queryParams.adminLanguage);
      } else if (process.env.REACT_APP_LANGUAGE) {
        console.log("REACT_APP_LANGUAGE FOUND!!");
        console.log(process.env.REACT_APP_LANGUAGE);
        this.props.i18n.changeLanguage(process.env.REACT_APP_LANGUAGE);
      }

      this.setDocumentTitle(this.props.userInfo);
      let applicationId =
        queryParams && typeof queryParams.applicationId !== "undefined"
          ? queryParams.applicationId
          : null;
      if (applicationId) {
        //console.log('setting applicationId :: ' + applicationId);
        await this.props.storeApplicationId(applicationId);
      }

      // If the env is configured for frictionless and if its not a signinwithemail trigger...
      if (
        process.env.REACT_APP_FRICTIONLESS === "true" &&
        !this.state.isSignInWithEmailLink
      ) {
        console.log("---------------------------------------");
        console.log("frictionless option setup for this project");
        console.log(process.env.REACT_APP_FIREBASE_PROJECT_ID);
        try {
          const customTokenResp = await get(
            `${process.env.REACT_APP_TOKEN_API_ENDPOINT}?key=${process.env.REACT_APP_API_KEY}`,
            { role: "frictionless" }
          );
          if (
            customTokenResp &&
            typeof customTokenResp.data !== "undefined" &&
            customTokenResp.data &&
            typeof customTokenResp.data.token !== "undefined"
          ) {
            console.log("retrieved custom token successfully");
            const token = await this.handleFrictionlessLogin(
              customTokenResp.data.token
            );

            // frictionless signing in for the first time
            if (token.length > 0 && queryParamsLength > 0) {
              console.log(process.env.REACT_APP_CLIENT_NAME);
              if (
                (process.env.REACT_APP_FIREBASE_PROJECT_ID ===
                  "triglav-us-demo" &&
                  queryParams.userId &&
                  queryParams.userId.length > 0) ||
                (process.env.REACT_APP_FIREBASE_PROJECT_ID !==
                  "triglav-us-demo" &&
                  queryParams.emailId &&
                  queryParams.emailId.length > 0) ||
                (queryParams.userId && queryParams.userId.length > 0)
              ) {
                this.props.clearData();
                if (
                  process.env.REACT_APP_FIREBASE_PROJECT_ID ===
                    "elaguila-mx-beta" &&
                  typeof queryParams.applicationId === "undefined"
                ) {
                  this.setState({ view: false, loading: false, error: true });
                } else {
                  try {
                    const user = queryParams.userId
                      ? await getUser("userId", queryParams.userId, token)
                      : await getUser("emailId", queryParams.emailId, token);
                    await this.props.storeUserInfo(user);
                    if (user.isUnderwriting) {
                      this.props.isUnderwriting();
                    }

                    this.setState({ view: true, loading: false });
                  } catch (usrErr) {
                    this.setState({ view: false, loading: false, error: true });
                  }
                }
              } else {
                this.setState({ view: false, loading: false, error: true });
              }
            } else if (token.length > 0) {
              console.log(
                "frictionless page refresh is happening because a 401 api call was made"
              );
              if (
                userInfo &&
                typeof userInfo.userId !== "undefined" &&
                typeof userInfo.token !== "undefined"
              ) {
                userInfo.token = token;
                await this.props.storeUserInfo(userInfo);
                this.setState({ view: true, loading: false, error: false });
              } else {
                console.log(
                  "no userInfo found in local storage after page refresh"
                );
                this.setState({ view: false, loading: false, error: true });
                this.props.clearData();
              }
            } else {
              console.log("no token or queryParams");
              // To Do: go to failure page saying no credentials found
              if (userInfo && currentIncident) {
                this.setState({ view: true, loading: false, error: false });
              } else {
                this.setState({ view: false, loading: false, error: true });
                this.props.clearData();
              }
            }
          } else {
            console.log(
              "custom token was not retrieved so the frictionless login could not be complete"
            );
            this.setState({ view: false, loading: false, error: true });
          }
        } catch (error) {
          console.log("---------------------------------------");
          console.log("FRICTIONLESS USER ERROR");
          console.log(error);
          this.setState({ view: false, loading: false, error: true });
        }
      } else {
        this.setState({ view: true, loading: false });
      }
    } else {
      this.setState({ view: false, loading: false, error: false });
    }
  }

  handleFrictionlessLogin = async (customToken) => {
    console.log("in handle frictionless login");
    let fbaseUserResult = null;
    try {
      fbaseUserResult = await firebaseapp
        .auth()
        .signInWithCustomToken(customToken);
    } catch (error) {
      throw error;
    }

    if (fbaseUserResult && typeof fbaseUserResult.user !== "undefined") {
      try {
        return await fbaseUserResult.user.getIdToken();
      } catch (tokenError) {
        console.log(tokenError);
        console.log("USER TOKEN ERROR");
        console.log(tokenError);
        throw tokenError;
      }
    } else {
      throw "Could not log user in";
    }
  };

  handleEmailLinkSignIn = async () => {
    if (firebaseapp.auth().isSignInWithEmailLink(window.location.href)) {
      this.setState({ isSignInWithEmailLink: true });

      this.props.clearData();

      this.setState({ view: false, loading: true, error: false });
      const { t } = this.props;
      const promptText = t("home.main-router.email-prompt-text");
      //console.log('isSignInWithEmailLink triggered!')
      var email = window.localStorage.getItem("emailForSignIn");
      if (!email) {
        email = window.prompt(promptText);
      }
      // The client SDK will parse the code from the link for you.
      try {
        const result = await firebaseapp
          .auth()
          .signInWithEmailLink(email, window.location.href);

        window.localStorage.removeItem("emailForSignIn");
        //console.log('Response from signInWithEmailLink :: ' + JSON.stringify(result.user))

        const token = await result.user.getIdToken();
        //console.log('Response-Token from signInWithEmailLink :: ' + JSON.stringify(token))

        const user = await getUser("emailId", result.user.email, token);
        await this.props.storeUserInfo(user);
        this.setState({ view: true, loading: false, error: false });
        return true;
      } catch (error) {
        // Some error occurred, you can inspect the code: error.code
        // Common errors could be invalid email and invalid or expired OTPs.
        // console.log('Error on signInWithEmailLink call :: ' + error)
        if (error.message) {
          if (error.message.indexOf("expired") > 0) {
            this.setState({
              view: false,
              loading: false,
              error: false,
              errorOnEmailCheck: false,
              errorOnExpiredLink: true,
            });
          } else {
            this.setState({
              view: false,
              loading: false,
              error: false,
              errorOnEmailCheck: true,
              errorOnExpiredLink: false,
            });
          }
        }

        return false;
      }
    } else {
      console.log("Not an email link sign in invocation!");
      return true;
    }
  };

  render() {
    const { t } = this.props;
    const errorMessage =
      process.env.REACT_APP_FIREBASE_PROJECT_ID !== "triglav-us-demo"
        ? t("home.main-router.error-message")
        : t("home.main-router.error-triglav");
    const errorMessageOnEmailMismatch = t(
      "home.main-router.error-email-id-mismatch"
    );
    const errorMessageOnExpiredLink = t("home.main-router.error-expired-link");

    return (
      <div className="app">
        <div class="mobile-first-wrapper">
          <div class="header">
            <Grid>
              {process.env.REACT_APP_CLIENT_NAME === "El Aguila" && (
                <img
                  src={require("../Images/logo.png")}
                  alt=""
                  className={"logo"}
                />
              )}
            </Grid>
          </div>
          <div class="content-container">
            <AuthProvider>
              <Router>
                <Switch>
                  <Route
                    path="/login"
                    exact
                    render={(props) => <Login {...props} />}
                  />
                  <Route
                    path="/register"
                    exact
                    render={(props) => <Register {...props} />}
                  />
                  <Route
                    path="/404"
                    exact
                    render={(props) => <Page404 {...props} />}
                  />
                  <PrivateRoute path="/" component={Home} />
                  {/* <PrivateRoute 
              exact 
              path="/" 
              render={props => <Home {...props} />}
            /> */}
                  {/* <Route path="/" render={props => <Home {...props} />} /> */}
                </Switch>
              </Router>
            </AuthProvider>
          </div>
          <div class="footer">
            <TermsandPrivacy />
          </div>
        </div>
        {this.state.loading ? (
          <div className="mobile-first-wrapper">
            <div className="content-container">
              <Alert color="info" style={{ fontSize: "16px" }}>
                {t("home.main-router.loading-message")}
                <span className="loader__dot">.</span>
                <span className="loader__dot">.</span>
                <span className="loader__dot">.</span>
              </Alert>
            </div>
          </div>
        ) : null}

        {this.state.errorOnEmailCheck ? (
          <div className="mobile-first-wrapper">
            <div className="content-container">
              <Alert className="alert-error" style={{ fontSize: "16px" }}>
                {errorMessageOnEmailMismatch}
              </Alert>
            </div>
          </div>
        ) : null}

        {this.state.errorOnExpiredLink ? (
          <div className="mobile-first-wrapper">
            <div className="content-container">
              <Alert className="alert-error" style={{ fontSize: "16px" }}>
                {errorMessageOnExpiredLink}
              </Alert>
            </div>
          </div>
        ) : null}

        {this.state.error ? (
          <div className="mobile-first-wrapper">
            <div className="content-container">
              <Alert className="alert-error" style={{ fontSize: "16px" }}>
                {errorMessage}
              </Alert>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userInfo: state.userReducer.userInfo,
    currentIncident: state.incidentReducer.currentIncident,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    clearData: () => dispatch(clearAllStateData()),
    storeUserInfo: (value) => dispatch(storeUserInfo(value)),
    storeIncident: (value) => dispatch(storeCurrentIncident(value)),
    dirtyCurrentIncident: (value) => dispatch(dirtyCurrentIncident(value)),
    storeApplicationId: (value) => dispatch(storeApplicationId(value)),
    isUnderwriting: () => dispatch(isUnderwriting()),
  };
};

export default withNamespaces("common")(
  connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MainRouter))
);
