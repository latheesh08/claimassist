import React from "react";
import { Grid, Icon, Fab } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import greenTheme from "./theme";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { Redirect } from "react-router-dom";
import { withNamespaces } from "react-i18next";

const styles = theme => ({
  root: {
    flexGrow: 1,
    justifyContent: "space-evenly"
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginHorizontal: 10
  },
  button: {
    color: "white"
  },
  buttonText: {
    fontSize: 10,
    // color: "#666",
    marginTop: 10
  },
  circle: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#ccc",
    color: "#000",
    borderRadius: "50%",
    // backgroundColor: "#eee",
    height: 26,
    width: 26,
    textAlign: "center",
    verticalAlign: "middle",
    lineHeight: 2.1,
    marginBottom: 10
  },
  deleteIcon: {
    fontSize: 17
  }
});
class Footer extends React.Component {
  state = {
    goBack: false
  };

  render() {
    const { t, classes, boxIndex, boxCount, userInfo } = this.props;
    // console.log("BOX INDEX");
    // console.log(boxIndex);
    // console.log(boxCount);
    const returnPath = this.props.returnPath || "/review/intro";
    console.log("RETURN PATH");
    console.log(returnPath);
    if (this.state.goBack === true) {
      return <Redirect to={returnPath} />;
    }
    const incidentType = this.props.userInfo.isUnderwriting ? t("home.review-footer.policy") : t("home.review-footer.claim")
    const returnText = t("home.review-footer.return-text", {incidentType : incidentType});
    return (
      <Grid container className={classes.root}>
        <Grid item xs={2} />
        <Grid item xs={4} className={classes.buttonGroup}>
          {/* <Button primary={true} label="Label" icon={<Icon>arrow_back</Icon>} /> */}
          <Fab onClick={this.props.movePrev} disabled={boxIndex === 0}>
            <Icon className={classes.check}>arrow_back</Icon>
          </Fab>
          <span className={classes.buttonText}>{t("home.review-footer.previous-damage")}</span>
        </Grid>
        <Grid item xs={4} className={classes.buttonGroup}>
          {boxIndex < boxCount - 1 ? (
            <MuiThemeProvider theme={greenTheme}>
              <Fab
                // classes={{ primary: "#19D752" }}
                color="secondary"
                // backgroundColor="#19D752"
                className={classes.button}
                onClick={this.props.moveNext}
              >
                <Icon className={classes.check}>arrow_forward</Icon>
              </Fab>
            </MuiThemeProvider>
          ) : (
            <Fab
              // classes={{ primary: "#19D752" }}
              color="primary"
              // backgroundColor="#19D752"
              className={classes.button}
              onClick={() => this.setState({ goBack: true })}
            >
              <Icon className={classes.check}>check</Icon>
            </Fab>
          )}

          <span className={classes.buttonText}>
            {boxIndex < boxCount - 1 ? t("home.review-footer.next-damage") :  returnText}
          </span>
        </Grid>
        <Grid
          item
          container
          xs={2}
          direction="column"
          alignItems="center"
          justify="flex-end"
        >
          {/* <div className={classes.circle}>
            <Icon
              className={classes.deleteIcon}
              onClick={this.props.removePicture}
            >
              delete
            </Icon>
          </div> */}
        </Grid>
      </Grid>
    );
  }
}

export default withNamespaces("common")(withStyles(styles)(Footer));
