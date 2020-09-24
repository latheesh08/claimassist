import React, { Component, useContext } from "react";
import { connect } from 'react-redux'
import { withRouter, Redirect } from "react-router";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import { withNamespaces } from "react-i18next";
import { checkQueryStrings } from "../../../../components/GlobalUtils"
import { withSnackbar } from "notistack";
import "./styles.scss";
import Grid from "@material-ui/core/Grid";
import { withStyles } from "@material-ui/core/styles";
import ArrowButton from "../../../../components/ArrowButton/ArrowButton";
import { getUser } from "../../../../components/UserUtils"
import { CircularProgress } from "@material-ui/core";

import {
  storeUserInfo,
  clearAllStateData,
  isUnderwriting
} from '../../../../actions';

import firebaseapp from "../../../base.js";
import { AuthContext } from "../../../Auth.js";

const styles = theme => ({
  root: {
    flexGrow: 1,
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 20,
    marginBottom: 20
  },
  input: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  form: {
    padding: 10
  },
  loginProgress: {
    marginTop: theme.spacing(2)
  }
});

class LoginForm extends Component {
  state = {
    email: null,
    password: "",
    showPassword: false,
    emailValid: false,
    passwordValid: false,
    login: false,
    loading: false
  };

  //   handleChange = name => event => {
  //     this.setState({
  //       [name]: event.target.value
  //     });
  //   };

  setDocumentTitle = userInfo => {
    const { t } = this.props;
    const incidentType = userInfo.isUnderwriting ? t("auth.policy") : t("auth.claim");
    const clientName = process.env.REACT_APP_CLIENT_NAME ? process.env.REACT_APP_CLIENT_NAME : "Galaxy";
    document.title = t("auth.app-title", { clientName : clientName, incidentType : incidentType });
  }

  handleLogin = async event => {
    event.preventDefault();
    this.setState({ loading: true })

    let fbaseResponse = null
    try {
      if (firebaseapp.auth().isSignInWithEmailLink(window.location.href)) {
        console.log('LoginForm.isSignInWithEmailLink triggered!')
        var email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          email = window.prompt('Please provide your email for confirmation');
        }
        fbaseResponse = await firebaseapp.auth().signInWithEmailLink(email, window.location.href)
          
      } else {
        fbaseResponse = await firebaseapp
                          .auth()
                          .signInWithEmailAndPassword(this.state.email, this.state.password);
      }

      
    } catch (loginErr) {
      console.log("ERROR IN HANDLE LOGIN");
      console.log(loginErr);
      const message = typeof (loginErr.message) === "undefined" ?
      this.props.t("auth.login-error") :
        loginErr.message;

      this.props.enqueueSnackbar(
        message,
        { variant: "error", autoHideDuration: 5000 }
      );
    }

    let idToken = null
    if (fbaseResponse && typeof(fbaseResponse.user) !== "undefined") {
      try {
        idToken = await fbaseResponse.user.getIdToken();
      } catch (tokenError) {
        console.log("USER TOKEN ERROR");
        console.log(tokenError);
        this.props.enqueueSnackbar(
          this.props.t("auth.user-credentials-problem"),
          { variant: "error", autoHideDuration: 5000 }
        );
      }
    }

    if (idToken) {
      try {
        const user = await getUser('emailId', this.state.email, idToken);
        await this.props.storeUserInfo(user);
        if (user.isUnderwriting) {
          this.props.isUnderwriting();
        }
        this.setState({ login: true })

      } catch (userDbErr) {
        console.log(userDbErr)
        this.props.enqueueSnackbar(
          this.props.t("auth.user-credentials-problem"),
          { variant: "error", autoHideDuration: 5000 }
        );
      }
    }
    this.setState({ loading: false })
  };

  handleEmail = event => {
    const isValid = event.target.value.length > 0 ? true : false;
    this.setState({
      email: event.target.value,
      emailValid: isValid
    });
  };

  handlePassword = event => {
    const isValid = event.target.value.length > 0 ? true : false;
    this.setState({
      password: event.target.value,
      passwordValid: isValid
    });
  };

  handleClickShowPassword = () => {
    this.setState(state => ({ showPassword: !state.showPassword }));
  };

  responseGoogle = (response) => {
    console.log(response);
  }

  static contextType = AuthContext

  async componentDidMount() {

    const currentUser = this.context.currentUser

    if( currentUser && 
        typeof(currentUser.email) !== "undefined" && 
        this.props.userInfo && 
        typeof(this.props.userInfo) !== "undefined" &&
        typeof(this.props.userInfo.token) !== "undefined" &&
        this.props.userInfo.token.length > 0    
    ){
        console.log("User Already Logged In");
        console.log(this.props.userInfo);
        this.setState({ login : true });
    }

    const queryParams = checkQueryStrings();
    const queryParamsLength = Object.keys(queryParams).length > 0 ? Object.keys(queryParams).length : 0;
    console.log("QUERY PARAMS LENGTH");
    console.log(queryParamsLength);
    console.log(process.env.REACT_APP_LANGUAGE);

    if(queryParamsLength > 0 && queryParams.adminLanguage !== "undefined"){
      console.log("ADMIN LANGUAGE QUERY PARAM FOUND!!");
      console.log(queryParams.adminLanguage);
      this.props.i18n.changeLanguage(queryParams.adminLanguage);
    } else if(process.env.REACT_APP_LANGUAGE) {
      console.log("REACT_APP_LANGUAGE FOUND!!");
      console.log(process.env.REACT_APP_LANGUAGE);
      this.props.i18n.changeLanguage(process.env.REACT_APP_LANGUAGE);
    }
  }

  render() {
    const { t } = this.props;
    const { classes } = this.props;

    if (this.state.login) {
      return <Redirect to="/home" />
    }

    return (
      <form className={classes.root} noValidate autoComplete="off">
        <Grid
          container
          direction="column"
          alignItems="stretch"
          justify="space-between"
        >
          <Grid item xs={12}>
            <TextField
              id="email"
              label={t("auth.email")}
              // onChange={this.handleChange("email")}
              onChange={this.handleEmail}
              className={classes.input}
              margin="normal"
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl className={classes.input} margin="normal" fullWidth>
              <InputLabel htmlFor="password">{t("auth.password")}</InputLabel>
              <Input
                id="password"
                type={this.state.showPassword ? "text" : "password"}
                value={this.state.password}
                //   onChange={this.handleChange("password")}
                onChange={this.handlePassword}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Toggle password visibility"
                      onClick={this.handleClickShowPassword}
                    >
                      {this.state.showPassword ? (
                        <Visibility />
                      ) : (
                          <VisibilityOff />
                        )}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} container justify="flex-start">
            {
              this.state.loading ? (
                <CircularProgress
                  className={classes.loginProgress}
                  // color="secondary"
                  // size={140}
                  // thickness={0.6}
                />
              ) : (
                  <ArrowButton
                    icon="arrow_forward"
                    onClick={this.handleLogin}
                    disabled={!this.state.emailValid || !this.state.passwordValid}
                  />
                )
            }

          </Grid>
          {/* <Grid >
            <GoogleLogin
              clientId="365020797442-r3jq40isa5rq8uhg7bf8dkfl66njfdb5.apps.googleusercontent.com"
              buttonText="Login"
              onSuccess={this.responseGoogle}
              onFailure={this.responseGoogle}
              cookiePolicy={'single_host_origin'}
            />
          </Grid> */}
        </Grid>
      </form>
    );
  }
}

const mapStateToProps = state => {
  return {
    userInfo: state.userReducer.userInfo
  };
};

const mapDispatchToProps = dispatch => {
  return {
    clearData: () => dispatch(clearAllStateData()),
    storeUserInfo: (value) => dispatch(storeUserInfo(value)),
    isUnderwriting: () => dispatch(isUnderwriting())
  };
};

export default withNamespaces("common")(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(withSnackbar(LoginForm)))
);

// (withStyles(styles)(LoginForm));
