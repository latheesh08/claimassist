import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { withNamespaces } from "react-i18next";
import { Grid, Icon } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import uuid from "uuid";
import { dirtyCurrentIncident, clearStateButUser, storeCurrentIncident } from "../../../../../actions";

const styles = theme => ({
  root: {
    flexGrow: 1,
    borderBottom: 1,
    borderBottomColor: "#eee",
    borderBottomStyle: "solid",
    paddingTop: 5,
    paddingBottom: 5
  },
  imgContainer: {
    // padding: theme.spacing(1),
    // margin: theme.spacing(1),
    backgroundColor: "#eee",
    width: "100%",
    height: 75,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    display: "flex"
  },
  image: {
    width: "100%",
    height: 75,
    borderRadius: 5
  },
  textContainer: {
    padding: theme.spacing(1),
    justifyContent: "flex-start",
    alignContent: "center"
  },
  vehicleInfo: {
    fontWeight: 700,
    fontSize: 14,
    marginBottom: -10
  },
  claimInfo: {
    fontWeight: 400,
    fontSize: 12,
    color: "#666"
  },
  reportInfo: {
    fontWeight: 700,
    fontSize: 12
  },
  link: {
    textDecoration: "none",
    color: "#0fafef"
  },
  icon: {
    color: "#ccc"
  }
});

class NewClaim extends Component {
  state = {
    goToVehInfo: false
  };

  handleClick = async () => {
    this.props.clearState();
    this.setState({ goToVehInfo: true });
    this.props.dirtyCurrentIncident(true);
    const incident = {
      incidentId: uuid.v4(),
      sourceSystem: this.props.userInfo.isUnderwriting ? "policyassist" : "claimassist",
      externalId: this.props.applicationId,
      type: this.props.userInfo.isUnderwriting ? "policy" : "claim",
      createdBy: this.props.userInfo.userId,
      status: "submitted",
      state: "in progress"
    }
    console.log("NEW INCIDENT");
    console.log(incident)
    this.props.storeIncident(incident);
  };

  render() {
    const { t, classes } = this.props;

    if (this.state.goToVehInfo === true) {
      return <Redirect to={{
        pathname: "/collect-vehicle-details",
        state: { prevPage: '/home' }
      }} />;
    }

    return (
      <Grid container className={classes.root}>
        <Grid container item xs={4}>
          <Grid item className={classes.imgContainer}>
            {/* <div className={classes.image}> */}
            <Icon className={classes.icon} onClick={this.handleClick}>
              add_circle
            </Icon>
            {/* </div> */}
          </Grid>
        </Grid>
        <Grid container item xs={8} className={classes.textContainer}>
          <div onClick={this.handleClick} className={classes.link}>
            {(this.props.userInfo.isUnderwriting) ? t('home.claim-list.new-policy') : t("home.claim-list.new-claim")}
          </div>
        </Grid>
      </Grid>
      // <div className="claim-item">
      //   <div className="main-text">
      //     <span className="model">
      //       {make} {model}, {item.year}
      //     </span>
      //     {/* <br />
      //     <span className="model">
      //       {model}, {item.year}
      //     </span> */}
      //   </div>

      //   <div className="sub-text">
      //     <span>
      //       {this.props.vin} {status}
      //     </span>
      //   </div>
      // </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    userInfo: state.userReducer.userInfo,
    applicationId: state.userReducer.applicationId
  };
};

const mapDispatchToProps = dispatch => {
  return {
    clearState: () => dispatch(clearStateButUser()),
    storeIncident: (value) => dispatch(storeCurrentIncident(value)),
    dirtyCurrentIncident: (value) => dispatch(dirtyCurrentIncident(value)),
  };
};

export default withNamespaces("common")(
  withStyles(styles)(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(NewClaim)
  )
);
