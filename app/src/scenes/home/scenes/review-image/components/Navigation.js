import React from "react";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
  root: {
    flexGrow: 1,
    flexDirection: "row"
  }
});
class Navigation extends React.Component {
  render() {
    return (
      <div>
        <Button
          onClick={this.props.movePrev}
          disabled={this.props.boxIndex === 0}
        >
          <KeyboardArrowLeft />
        </Button>
        <span>
          {this.props.boxIndex + 1}/{this.props.boxCount}
        </span>
        <Button
          onClick={this.props.moveNext}
          disabled={this.props.boxIndex === this.props.boxCount - 1}
        >
          <KeyboardArrowRight />
        </Button>
      </div>
    );
  }
}

export default withStyles(styles)(Navigation);
