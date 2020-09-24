import React, { Component } from "react";
// import { Link } from "react-router-dom";
import Fab from "@material-ui/core/Fab";
// import Icon from "@material-ui/core/Icon";
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
  fab: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(1),
    height: 48,
    width: 48
    // marginLeft: theme.spacing(1)
  },
  container: {
    flexDirection: "column"
  }
});

class UploadButton extends Component {
  render() {
    return (
      <Fab
        component="span"
        color={this.props.color || "secondary"}
        aria-label="Add"
        size="medium"
        className={this.props.classes.fab}
        disabled={this.props.disabled}
        // onClick={this.props.onClick}
      >
        {this.props.children}
      </Fab>
    );
  }
}

export default withStyles(styles)(UploadButton);
