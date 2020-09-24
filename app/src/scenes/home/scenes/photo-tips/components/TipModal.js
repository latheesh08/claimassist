import React, { Component } from "react";
import {
  Grid,
  // Card,
  // CardMedia,
  // CardContent,
  // CardActions,
  Typography,
  Button,
  Modal,
  IconButton,
  Icon
  // ButtonBase
} from "@material-ui/core";
import Stepper from "./Stepper";
import { withStyles } from "@material-ui/core/styles";
import { withNamespaces } from "react-i18next";
import tips from "../tips";

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
    justifyContent: "center",
    outline: "none"
  },
  paper: {
    // position: "absolute",
    // width: theme.spacing(50),
    width: "90%",
    // height: "100%",
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

class TipModal extends Component {
  state = {
    count: 5,
    current: 1
    // start: false,
    // goBack: false
  };
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

  render() {
    // if (this.state.start === true) {
    //   return <Redirect to="/photo-upload" />;
    // }

    // if (this.state.goBack === true) {
    //   return <Redirect to="/instruction" />;
    // }

    const { t } = this.props;
    const { classes } = this.props;
    const currentTip = tips.filter(item => item.id === this.state.current)[0];

    return (
      <Modal
        open={this.props.open}
        disableEnforceFocus={true}
        disableAutoFocus={true}
        className={classes.modal}
      >
        <div className={classes.modal}>
          <div className={classes.close}>
            <span className={classes.close}>
              <IconButton onClick={this.props.cancel}>
                <Icon className={classes.closeIcon}>close-circle</Icon>
              </IconButton>
            </span>
          </div>
          <Grid item xs={12} container className={classes.paper}>
            <Grid item xs={12} className={classes.stepper}>
              <Stepper activeStep={this.state.current - 1} />
            </Grid>
            <Grid item xs={6}>
              <div className={classes.image}>
                <img
                  className={classes.image}
                  alt="complex"
                  src={currentTip.goodImage}
                />
                <span className={classes.icon}>
                  <Icon className={classes.goodImage}>check-circle</Icon>
                </span>
              </div>
            </Grid>
            <Grid item xs={6}>
              <div className={classes.image}>
                <img
                  className={classes.image}
                  alt="complex"
                  src={currentTip.badImage}
                />
                <span className={classes.icon}>
                  <Icon className={classes.badImage}>close-circle</Icon>
                </span>
              </div>
            </Grid>
            <Grid item xs={12} container className={classes.container}>
              <Grid item xs={12}>
                <Typography
                  gutterBottom
                  variant="h5"
                  component="h4"
                  className={classes.title}
                >
                  {t(currentTip.title)}
                </Typography>
              </Grid>
              <Grid item>
                <Typography
                  gutterBottom
                  variant="body1"
                  className={classes.body}
                >
                  {t(currentTip.content)}
                </Typography>
              </Grid>
              <Grid
                item
                className="tips.actions"
                justify="space-between"
                xs={12}
                container
              >
                <Button
                  size="small"
                  onClick={this.movePrev}
                  className={classes.actions}
                  disabled={this.state.current === 1}
                >
                  {t("home.photo-tips.previous-tip")}
                </Button>
                {this.state.current < tips.length ? (
                  <Button
                    size="small"
                    onClick={this.moveNext}
                    className={classes.actions}
                  >
                    {t("home.photo-tips.next-tip")}
                  </Button>
                ) : (
                  <Button
                    size="small"
                    onClick={this.props.cancel}
                    className={classes.actions}
                  >
                    {t("general.start")}
                  </Button>
                )}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} className={classes.skip}>
            <Button size="small" onClick={this.props.cancel}>
              Skip Tips
            </Button>
          </Grid>
        </div>
      </Modal>
    );
  }
}

export default withNamespaces("common")(withStyles(styles)(TipModal));
