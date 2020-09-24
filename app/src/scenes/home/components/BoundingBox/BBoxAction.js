import React from "react";
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
  circle: {
    color: "#000",
    borderRadius: "50%",
    backgroundColor: "#19D752",
    height: 26,
    width: 26,
    textAlign: "center",
    verticalAlign: "middle",
    lineHeight: 3.1,
    marginBottom: 10
  }
});
class BBoxAction extends React.Component {
  render() {
    const { classes } = this.props;
    return <div className={classes.circle}>{this.props.children}</div>;
  }
}

export default withStyles(styles)(BBoxAction);
