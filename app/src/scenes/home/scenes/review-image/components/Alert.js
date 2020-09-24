import React from "react";
import Checkbox from "@material-ui/core/Checkbox";
import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions
} from "@material-ui/core";
import { FormControl, FormControlLabel } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
  root: {
    color: "primary",
    "&$checked": {
      color: "primary"
    }
  },
  checked: {},
  formControl: {
    // margin: theme.spacing(1),
    minWidth: 120,
    width: "100%"
  }
});

class Alert extends React.Component {
  state = {
    showAgain: false
  };

  onClickShowAgain = () => {
    this.setState(prev => {
      return { showAgain: !prev.showAgain };
    });
  };

  render() {
    console.log("====================================");
    console.log("STATE");
    console.log(this.state);
    console.log("PROPS");
    console.log(this.props);
    console.log("====================================");
    const { classes } = this.props;
    return (
      <div>
        <Dialog open={this.props.open} onClose={this.props.handleClose}>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {this.props.message}
            </DialogContentText>
            <FormControl className={classes.formControl}>
              <FormControlLabel
                value="disabled"
                color="#19D752"
                control={
                  <Checkbox
                    classes={{ root: classes.root, checked: classes.checked }}
                    checked={!this.state.showAgain}
                    onChange={this.onClickShowAgain}
                    value="priorDamage"
                  />
                }
                label="Don't show me this again"
              />
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.props.handleNo} color="primary">
              {this.props.noText}
            </Button>

            <Button
              onClick={() =>
                this.props.handleYes(this.state.showAgain, this.props.damage)
              }
              color="primary"
              autoFocus
            >
              {this.props.yesText}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default withStyles(styles)(Alert);
