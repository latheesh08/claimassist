import React, { Component } from "react";
// import { Link } from "react-router-dom";
import Fab from "@material-ui/core/Fab";
import Icon from "@material-ui/core/Icon";
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
  fab: {
    marginTop: theme.spacing(2),
    height: 48,
    width: 48
    // marginLeft: theme.spacing(1)
  }
});

class ArrowButton extends Component {
  render() {
    const icon = this.props.icon ? this.props.icon : "arrow_forward";
    return (
      <Fab
        component="button"
        onClick={this.props.onClick}
        color={this.props.color || "secondary"}
        aria-label="Add"
        size="medium"
        className={this.props.classes.fab}
        disabled={this.props.disabled}
      >
        <Icon>{icon}</Icon>
        {this.props.children}
      </Fab>
    );
  }
}

export default withStyles(styles)(ArrowButton);
