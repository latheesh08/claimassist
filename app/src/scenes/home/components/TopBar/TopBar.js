import React from "react";
import { Grid, Icon } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

const styles = {
  root: {
    flexGrow: 1
  },
  nav: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20
    // paddingBottom: 20
  },
  title: {
    fontWeight: 700,
    fontSize: 15
  },
  active: {
    color: "#19D752"
  }
};

class TopBar extends React.Component {
  render() {
    // console.log("====================================");
    // console.log("TOPBAR PROPS");
    // console.log(this.props);
    // console.log("====================================");
    const { classes } = this.props;
    return (
      <Grid item xs={12} container className={classes.nav}>
        <Icon onClick={this.props.handleReject}>close</Icon>
        <span className={classes.title}>{this.props.title}</span>
        <Icon
          onClick={this.props.handleAccept}
          className={this.props.disableAccept ? null : classes.active}
        >
          check
        </Icon>
      </Grid>
    );
  }
}

export default withStyles(styles)(TopBar);
