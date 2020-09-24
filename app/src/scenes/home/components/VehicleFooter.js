import React, { Fragment } from "react";
import { Grid, Divider, Typography, Icon, Button } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { Redirect } from "react-router-dom";
import Link from "@material-ui/core/Link";
import BubbleChartIcon from '@material-ui/icons/BubbleChart';
import { withNamespaces } from "react-i18next";
import { SmartImage } from ".";

const styles = theme => ({
  root: {
    flexGrow: 1,
    // maxWidth: 600,
    margin: "auto"
  },
  icon: {
    opacity: 0.3
  },
  vehicleName: {
    textTransform: "none",
    fontWeight: "bold"
  },
  claimInfo: {
    fontWeight: "bold"
  },
  idInfo: {
    fontSize: 12
  },
  vehicleSummaryData: {
    lineHeight: "30px"
  },
  innerRow: {
    marginBottom: "10px",
  },
  footer: {
    marginTop: theme.spacing(4)
  },
  link: {
    color: "#0fafef",
    textDecoration: "none"
  }
});

class VehicleFooter extends React.Component {
  constructor() {
    super();

    this.state = {
      navigateTo : ''
    };
  }
  render() {
    const { t, classes, currentIncident, userInfo } = this.props;
    console.log("FOOTER PROPS");
    console.log(this.props);
    const make = currentIncident && currentIncident.hasOwnProperty("vehicles") && currentIncident.vehicles[0].make !== undefined ? currentIncident.vehicles[0].make : null;
    const model = currentIncident && currentIncident.hasOwnProperty("vehicles") && currentIncident.vehicles[0].model !== undefined ? currentIncident.vehicles[0].model : null;
    const year = currentIncident && currentIncident.hasOwnProperty("vehicles") && currentIncident.vehicles[0].year !== undefined ? currentIncident.vehicles[0].year : null;

    if (this.state.navigateTo) {
      return <Redirect push to={this.state.navigateTo} />;
    }

    const StyledButton = withStyles({
      text: {
        padding: 0,
        margin: 0
      },
      label: {
        textTransform: "none",
        color: "#0fafef",
        fontSize: "1rem"
      }
    })(Button);

    return (
      <Grid container className={classes.footer}>
        <Grid container spacing={2}>

          <Grid
            item
            xs={12}
            container
            direction="row"
            // justify="space-between"
            alignContent="center"
          >
            <Grid item xs={2}>
              <Icon className={classes.icon}></Icon>
            </Grid>

            <Grid item xs={12}>
              <Divider variant="fullWidth" />
            </Grid>
          </Grid>
          <Grid
            item
            xs={12}
            container
            direction="row"
            // justify="space-between"
            alignContent="center"
          >
            <Grid item xs={2}>
              <Icon className={classes.icon}>directions_car</Icon>
            </Grid>
            <Grid item xs={9} className={classes.vehicleSummaryData} container alignContent="center">
              {this.props.odometerInfo ? (
                <Grid item xs={12} className={classes.innerRow}>
                  <Typography
                    variant="button"
                    component="div"
                    className={classes.vehicleName}
                  >
                    {t("home.odometer.title")} : {this.props.odometerInfo}
                  </Typography>
                  {this.props.odometerImage ? (
                    <div style={{ width: "150px" }}>
                      <SmartImage image={this.props.odometerImage} />
                    </div>
                  ) : null
                  }
                </Grid>
              ) : null}
              {this.props.licenseInfo ? (
                <Grid item xs={12} className={classes.innerRow}>
                  <Typography
                    variant="button"
                    component="div"
                    className={classes.vehicleName}
                  >
                    {t("home.license.title")} : {this.props.licenseInfo ? this.props.licenseInfo : "(not provided)"}
                  </Typography>
                  {this.props.licenseImage ? (
                    <div style={{ width: "150px" }}>
                      <SmartImage image={this.props.licenseImage} />
                    </div>
                  ) : null
                  }
                </Grid>
              ) : null}
              {this.props.registrationImage ? (
                <Grid item xs={12} className={classes.innerRow}>
                  <Typography
                    variant="button"
                    component="div"
                    className={classes.vehicleName}
                  >
                    {t("home.register.title")} :
                  </Typography>
                  {this.props.licenseImage ? (
                    <div style={{ width: "150px" }}>
                      <SmartImage image={this.props.registrationImage} />
                    </div>
                  ) : null
                  }
                </Grid>
              ) : null}
              {this.props.drivingLicenseInfo ? (
                <Grid item xs={12} className={classes.innerRow}>
                  <Typography
                    variant="button"
                    component="div"
                    className={classes.vehicleName}
                  >
                    {t("home.drivers-license.title")} : {this.props.drivingLicenseInfo}
                  </Typography>
                  {this.props.licenseImage ? (
                    <div style={{ width: "150px" }}>
                      <SmartImage image={this.props.drivingLicenseImage} />
                    </div>
                  ) : null
                  }
                </Grid>
              ) : null}
              {this.props.accidentInfo ? (
                <Grid item xs={12} className={classes.innerRow}>
                  <Typography
                    variant="button"
                    component="div"
                    className={classes.vehicleName}
                  >
                    {t("home.accident.title")} : {this.props.accidentInfo}
                  </Typography>
                </Grid>
              ) : null}
            </Grid>
            {/* <Grid item>
              {this.props.editInfo ? (
                <Icon className={classes.icon} onClick={this.props.editInfo}>
                  edit
                </Icon>
              ) : null}
            </Grid> */}
          </Grid>

          {(userInfo.isSupervisor || userInfo.isReviewer) && this.props.modified ? (
            <Fragment>
              <Grid item xs={12}>
                <Divider variant="fullWidth" />
              </Grid>
              <Grid
                item
                xs={12}
                container
                direction="row"
                alignContent="center"
                className={classes.footerRow}
                onClick={() => this.props.uploadAppraisal(null)}
              >
                <Grid item xs={2}>
                  <Icon className={classes.icon}>save</Icon>
                </Grid>
                <Grid item xs={10} container alignContent="center">
                  <Link
                    variant="body2"
                    className={classes.vehicleName}
                    component="button"
                  >
                    {t("incident-detail.save-appraisal")}
                  </Link>
                  <Grid item xs={12}>
                    <Typography variant="caption">
                    {t("incident-detail.save-appraisal-description")}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Fragment>
          ) : null}
          {userInfo.isUnderwriting === false ? (
            <Fragment>
              <Grid item xs={12}>
                <Divider variant="fullWidth" />
              </Grid>
              <Grid
                item
                xs={12}
                container
                direction="row"
                alignContent="center"
                className={classes.footerRow}
                onClick={() => this.setState({ navigateTo : '/analysis'})}
              >
                <Grid item xs={2}>
                  <Icon className={classes.icon}>build</Icon>
                </Grid>
                <Grid item xs={10} container alignContent="center">
                  <Link
                    variant="body2"
                    className={classes.vehicleName}
                    component="button"
                  >
                    {t("incident-detail.view-butterfly")}
                  </Link>
                  <Grid item xs={12}>
                    <Typography variant="caption">
                    {t("incident-detail.view-butterfly-description")}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Fragment>
          ) : null}
          <Grid item xs={12}>
            <Divider variant="fullWidth" />
          </Grid>
          {(userInfo.isUnderwriting && this.props.loaded) || (this.props.damages && this.props.loaded) ? (
            <Grid
              item
              xs={12}
              container
              direction="row"
              //   justify="space-between"
              alignContent="center"
            >
              <Grid item xs={2}>
                <Icon className={classes.icon}>assignment</Icon>
              </Grid>
              <Grid item xs={9} container alignContent="center">
                <Grid item xs={12}>
                  <Typography
                    variant="button"
                    component="div"
                    className={classes.vehicleName}
                  >
                    {t("home.review.generate-report")}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption">
                    {t("home.item-detail.footer-description")}
                  </Typography>
                </Grid>
                <Grid item xs={12} style={{ marginBottom: "10px" }}>
                  {this.props.loaded ? (
                    <StyledButton onClick={this.props.generateReport}>
                      {t("incident-detail.view-report")}
                    </StyledButton>
                  ) : null}
                </Grid>
              </Grid>
            </Grid>
          ) : null}
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(withNamespaces("common")(VehicleFooter));
