import React from "react";
import MobileStepper from "@material-ui/core/MobileStepper";
import { withStyles } from "@material-ui/core/styles";

const styles = {
  root: {
    maxWidth: 400,
    flexGrow: 1,
    justifyContent: "center"
  }
};

class Stepper extends React.Component {
  render() {
    const { classes } = this.props;
    return (
      <MobileStepper
        variant="dots"
        steps={5}
        position="static"
        activeStep={this.props.activeStep}
        className={classes.root}
      />
    );
  }
}

export default withStyles(styles)(Stepper);
