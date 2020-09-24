import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
// import "./styles.scss";
import { withStyles } from "@material-ui/core/styles";
// import classes from "*.module.css";

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  newTitle: {
    fontSize: "24px",
    color: "#999"
  },
  subtitle: {
    // color: "#666"
    fontWeight: "bold"
  }
});

class Title extends Component {
  render() {
    const { classes } = this.props;
    // return (
    //   <div className="title-container">
    //     <h1>{this.props.title}</h1>
    //     {this.props.subtitle ? <h3>{this.props.subtitle}</h3> : null}
    //   </div>
    // );
    return (
      <div className={classes.root}>
        <Typography variant="h4" className={classes.newTitle} gutterBottom align="left">
          {this.props.title}
        </Typography>
        {this.props.subtitle ? (
          <Typography
            variant="subtitle1"
            align="left"
            className={classes.subtitle}
          >
            {this.props.subtitle}
          </Typography>
        ) : null}
      </div>
    );
  }
}

export default withStyles(styles)(Title);
