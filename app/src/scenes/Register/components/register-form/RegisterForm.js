import React, { Component } from "react";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import { withNamespaces } from "react-i18next";

import "./styles.scss";
import { withStyles } from "@material-ui/core/styles";
import ArrowLink from "../../../../components/ArrowLink/ArrowLink";

const styles = theme => ({
  input: {
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5)
  }
});

class RegisterForm extends Component {
  state = {
    password: "",
    showPassword: false,
    emailValid: false,
    passwordValid: false,
    confirmValid: false
  };

  handleChange = name => event => {
    const isValid = event.target.value.length > 0 ? true : false;
    const validField = `${name}Valid`;
    // console.log(isValid);
    // console.log(validField);
    this.setState({
      [name]: event.target.value,
      [validField]: isValid
    });
  };

  handleClickShowPassword = () => {
    this.setState(state => ({ showPassword: !state.showPassword }));
  };

  render() {
    const { t } = this.props;
    return (
      <form className="register-form claim-form" noValidate autoComplete="off">
        <TextField
          id="email"
          label={t("auth.email")}
          onChange={this.handleChange("email")}
          // margin="normal"
          fullWidth
          className={this.props.classes.input}
        />
        <div className="passwords-containter">
          <FormControl className={this.props.classes.input} margin="normal">
            <InputLabel htmlFor="password">{t("auth.password")}</InputLabel>
            <Input
              id="password"
              type={this.state.showPassword ? "text" : "password"}
              value={this.state.password}
              onChange={this.handleChange("password")}
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

          <TextField
            id="confirm"
            label={t("auth.confirm")}
            onChange={this.handleChange("confirm")}
            type="password"
            className={this.props.classes.input}
            margin="normal"
          />
        </div>
        <ArrowLink
          to="/start-incident"
          icon="arrow_forward"
          disabled={
            !this.state.emailValid ||
            !this.state.passwordValid ||
            !this.state.confirmValid
          }
        />
      </form>
    );
  }
}

export default withNamespaces("common")(withStyles(styles)(RegisterForm));
