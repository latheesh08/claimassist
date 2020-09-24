import React from "react";
import { Grid, Icon } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

const styles = {
  root: {
    flexGrow: 1
  },
  nav: {
    position: "relative",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
    // paddingBottom: 20
  },
  title: {
    fontWeight: 700,
    fontSize: 15,
    textAlign: 'center',
    width: '100%'
  },
  role: {
    position: "absolute",
    right: 0,
    textTransform: "capitalize",
    fontWeight: 700,
    fontSize: 15,
    textAlign: 'right',
    color: "#0fafef"
  },
  active: {
    color: "#19D752"
  }
};

class TopBar extends React.Component {
  render() {
    console.log("====================================");
    console.log("TOPBAR PROPS");
    console.log(this.props);
    console.log("====================================");
    const { classes } = this.props;
    return (
      <Grid item xs={12} container className={classes.nav}>
        {/* <Icon onClick={this.props.goBack}>arrow_back</Icon> */}

        {/* <Icon onClick={this.props.handleReject}>close</Icon> */}
        <span className={classes.title}>{this.props.title}</span>
        <span className={classes.role}>{this.props.role}</span>
        {/* <Icon
          className={this.props.disableAccept ? null : classes.active}
        >
          more_vert
        </Icon> */}
      </Grid>
    );
  }
}

export default withStyles(styles)(TopBar);
