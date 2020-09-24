import React, { Component } from "react";
import { Link } from "react-router-dom";
import TopNav from "../../../../components/topnav/TopNav";
import { TermsandPrivacy } from '../../../../components'
import Title from "../../../../components/title/Title";
import "./styles.scss";
import { withNamespaces } from "react-i18next";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { Divider } from "@material-ui/core";
import { connect } from 'react-redux';
import { withSnackbar } from "notistack";
import {
  selectedPoses
} from "../../../../actions";

const styles = theme => ({
  root: {
    flexGrow: 1
  }
});



class Instruction extends Component {

  componentWillMount() {
    if (this.props.userInfo.isUnderwriting) {
      // if(true){
      this.props.selectedPoses(this.props.details)
      // this.setState({navigateTo : "/individual-angle"})
    }
  }

  render() {
    // let model = this.props.model || "Mercedes";
    const { t } = this.props;
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <Grid
          container
          direction="column"
          alignItems="stretch"
          justify="space-around"
        >
          <Grid item xs={12}>
            <TopNav
              iconName="local_taxi"
              hasMore
              goBack={() => this.props.history.goBack()}
            />
          </Grid>
          <Grid item xs container spacing={5}>
            <Grid item xs={12}>
              <Title
                title={t("home.instructions.title")}
                subtitle={
                  <div>
                    {t("home.instructions.take-photos")} <br />
                    <br />
                    {t("home.instructions.photo-notice")}
                  </div>
                }
              />
            </Grid>
            <Grid
              item
              xs={12}
              container
              alignItems="flex-start"
              justify="flex-start"
              direction="row"
            >
              <Grid className="link-navigation-container" xs={12} container direction="column" spacing={2}>
                <Grid item xs={12}>
                  <Link
                    to={{
                      pathname: (this.props.userInfo.isUnderwriting) ? "/individual-angle" : "/choose-angle",
                      state: {
                        showTips: true
                      }
                    }}
                    className="link-button"
                  >
                    {t("home.instructions.continue-link")}
                  </Link>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={12}>
                  <Link
                    to={{
                      pathname: (this.props.userInfo.isUnderwriting) ? "/individual-angle" : "/choose-angle",
                      state: {
                        showTips: false
                      }
                    }}
                    className="link-button"
                  >
                    {t("home.instructions.skip-link")}
                  </Link>{" "}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    userInfo: state.userReducer.userInfo,
    details: state.chooseAngleReducer.selected_poses
  };
};
const mapDispatchToProps = dispatch => {
  return {
    selectedPoses: poses => dispatch(selectedPoses(poses)),
  }
}

export default withNamespaces('common')(
  connect(
    mapStateToProps, mapDispatchToProps
  )(withStyles(styles)(withSnackbar(Instruction)))
)