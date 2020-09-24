import React from "react";
import { withStyles } from "@material-ui/core/styles";
import BBoxAction from "./BBoxAction";
import { Icon } from "@material-ui/core";

const styles = {
  boxDescription: {
    position: "absolute",
    backgroundColor: "#19D752",
    // height: 50,
    marginBottom: 10,
    borderRadius: 5,
    marginRight: 5,
    padding: 5,
    fontSize: 12,
    fontWeight: 700,
    color: "black"
  },
  left: {
    position: "absolute",
    // top: -30,
    right: 33
  },
  right: {
    position: "absolute",
    // top: -30,
    right: 3
  },
  icon: {
    fontSize: 18
  }
};
class BBoxDescription extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.state = { height: 0 };
  }
  componentDidMount() {

    window.addEventListener("resize", (resize) => {
      this.forceUpdate();
    });
    // console.log(this.myRef.current.clientHeight);
    // console.log(this.myRef.current);
    this.setState({ height: this.myRef.current.clientHeight });
    // console.log(this.props.self.current.clientHeight);
  }
  render() {
    console.log("INSIDE PROPS OF BBOXDESCRIPTION");
    console.log(this.props);

    const { classes, top, bottom, reverse, userInfo } = this.props;
    const _top = reverse ? bottom + 10 : top - (10 + this.state.height);
    // console.log("TOP");
    // console.log(top);

    return (
      <div
        ref={this.myRef}
        className={classes.boxDescription}
        style={{ top: _top, left: this.props.left }}
      >
        {userInfo.isSupervisor || userInfo.isReviewer ? (
          <div>
            <div
              className={classes.left}
              style={{ top: reverse ? this.state.height + 7 : -30 }}
            >
              <BBoxAction>
                <Icon className={classes.icon} onClick={this.props.onClickDelete}>
                  delete_outline
                </Icon>
              </BBoxAction>
            </div>
            <div
              className={classes.right}
              style={{ top: reverse ? this.state.height + 7 : -30 }}
            >
              <BBoxAction>
                <Icon className={classes.icon} onClick={this.props.onClickEdit}>
                  edit
                </Icon>
              </BBoxAction>
            </div>
          </div>
        ) : null
        }

        {this.props.text}
      </div>
    );
  }
}

export default withStyles(styles)(BBoxDescription);
