import React, { Component } from "react";
import { withNamespaces } from "react-i18next";
import TopNav from "../../components/topnav/TopNav";
import Title from "../../components/title/Title";
import LoginForm from "./components/login-form/LoginForm";
import "./styles.scss";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";

const styles = theme => ({
  root: {
    flexGrow: 1,
    height: "100%"
  }
});

class Login extends Component {
  componentDidMount = async () => {
    console.log("loading Login.js");
    // const { t, i18n } = useTranslation("common");
  };
  responseGoogle = (response) => {
    console.log(response);
  }

  render() {
    const { classes } = this.props;
    const { t } = this.props;

    return (
      <div className={classes.root}>
        <Grid
          container
          direction="column"
          // spacing={4}
          alignItems="stretch"
          justify="space-between"
        >
          <Grid item xs={12} container justify="flex-start">
            <TopNav hideUserRole />
          </Grid>
          <Grid
            item
            xs={12}
            container
            direction="column"
            justify="space-between"
          >
            <Grid item xs>
              <Title title={t("auth.title")} />
            </Grid>
            <Grid item xs>
              <LoginForm />
            </Grid>
            {/* <Grid item xs>
              <Footer navTitle={t("auth.forgot-password")} navLink="/forgot" />
            </Grid> */}
          </Grid>
          {/* <Grid item xs={12} container justify="flex-end">
            <LanguageSelect text="Language Select" />
          </Grid> */}
        </Grid>
      </div>
    );
  }
}

// export default withTranslation("common")(Login);
export default withNamespaces("common")(withStyles(styles)(Login));
// export default withStyles(styles)(Login);
