import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { withNamespaces } from "react-i18next";
import { withStyles } from "@material-ui/core/styles";
import "./styles.scss";
import tips from "./tips";
import { Grid } from "@material-ui/core";
import TipModal from "./components/TipModal";

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  image: {
    margin: "auto",
    display: "block",
    maxWidth: "100%",
    maxHeight: "100%",
    position: "relative",
    borderWidth: 1,
    borderColor: "black"
  },
  container: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "row"
  },
  modal: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  paper: {
    // position: "absolute",
    // width: theme.spacing(50),
    width: "90%",
    height: "100%",
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    paddingTop: theme.spacing(4),
    outline: "none",
    borderRadius: 5
  },
  close: {
    display: "flex",
    marginBottom: 20,
    width: "90%"
  },
  card: {
    minWidth: 275,
    maxWidth: 400
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center"
  },
  body: {
    fontSize: 14,
    textAlign: "center"
  },
  skip: {
    marginTop: 40,
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  pos: {
    marginBottom: 12
  },
  media: {
    height: 0,
    paddingTop: "56.25%" // 16:9
  },
  actions: {
    // display: "flex",
    color: "#0fafef"
    // fontWeight: 400
    // backgroundColor: "#0fafef"
  },
  stepper: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center"
  },
  closeIcon: {
    position: "absolute",
    top: 5,
    left: 5,
    backgroundColor: "#666",
    padding: 1,
    color: "white",
    borderRadius: 20
  },
  icon: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "white",
    padding: 1,
    borderColor: "white",
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  goodImage: {
    color: "white",
    margin: 3,
    backgroundColor: "#7DD181",
    fontSize: 12,
    fontWeight: "bold",
    borderRadius: 20
  },
  badImage: {
    color: "white",
    margin: 3,
    backgroundColor: "red",
    fontSize: 12,
    fontWeight: "bold",
    borderRadius: 20
  }
});

class PhotoTips extends Component {
  constructor() {
    super();

    this.state = {
      count: 5,
      current: 1,
      start: false,
      goBack: false
    };
  }

  moveNext = () => {
    this.setState(prevState => {
      return { current: prevState.current + 1 };
    });
  };

  movePrev = () => {
    this.setState(prevState => {
      return { current: prevState.current - 1 };
    });
  };

  moveToStart = () => {
    this.setState({ start: true });
  };

  cancel = () => {
    this.setState({ goBack: true });
  };

  render() {
    if (this.state.start === true) {
      return <Redirect to="/photo-upload" />;
    }

    if (this.state.goBack === true) {
      return <Redirect to="/instruction" />;
    }

    console.log(tips);
    // const { t } = this.props;
    const { classes } = this.props;
    // const currentTip = tips.filter(item => item.id === this.state.current)[0];

    return (
      <div className={classes.root}>
        <Grid container>
          <Grid>
            <TipModal open={true} />
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withNamespaces("common")(withStyles(styles)(PhotoTips));
// export default withStyles(styles)(PhotoTips);
