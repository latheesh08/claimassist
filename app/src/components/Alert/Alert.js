import React from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions
} from "@material-ui/core";

class Popup extends React.Component {
  render() {
    return (
      <div>
        <Dialog open={this.props.open} onClose={this.props.handleClose}>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {this.props.message}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            {this.props.noText ? (
              <Button onClick={this.props.handleNo} color="primary">
                {this.props.noText}
              </Button>
            ) : null}

            <Button onClick={this.props.handleYes} color="primary" autoFocus>
              {this.props.yesText}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default Popup;
