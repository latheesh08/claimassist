import React, { Component, Fragment } from "react";
import { Grid, Icon } from "@material-ui/core";
import { withNamespaces } from "react-i18next";
import { withStyles } from "@material-ui/core/styles";
import SmartImage from "../../../components/SmartImage";
import { withSnackbar } from "notistack";
import { connect } from 'react-redux';

var temp;
const styles = theme => ({
  root: {
    flexGrow: 1
  },
  image: {
    // width: "100%",
    maxWidth: 400,
    height: "auto",
    padding: theme.spacing(0.2),
    position: "relative"
  },
  poseHeader: {
    padding: "0 0 0 0",
    margin: "5px",
    textTransform: "capitalize",
    color: "#666"
  },
  iconButton: {
    position: "absolute",
    top: 5,
    left: 5,
    zIndex: 100,
    backgroundColor: "black",
    padding: 5,
    color: "white"
  },
  icon: {
    fontSize: "default",
    color: "black",
    backgroundColor: "white",
    borderRadius: 50,
    position: "absolute",
    top: 40,
    left: 5,
    zIndex: 100
    // padding: 5,
    // // backgroundColor: "black",
    // color: "white"
  },
  iconNoPose: {
    fontSize: "default",
    color: "black",
    backgroundColor: "white",
    borderRadius: 50,
    position: "absolute",
    top: 10,
    left: 5,
    zIndex: 100
    // padding: 5,
    // // backgroundColor: "black",
    // color: "white"
  }
});
class UploadGroup extends Component {
  state = {};

  getDataUrl = imgData => `data:image/png;base64,${imgData}`;

  render() {
    console.log("====================================");
    console.log("INSIDE UPLOAD GROUP");
    console.log(this.props);
    console.log("====================================");
    const { t, classes } = this.props;

    return (
      <div className="result-block">
        {this.props.pictureList.length > 0 ? (
          <Fragment>
            <label>{this.props.header}</label>
            <Grid container className={classes.root}>
              {this.props.pictureList.map((ph, index) => (
                <Grid
                  item
                  xs={6}
                  sm={4}
                  lg={2}
                  className={classes.image}
                  key={index}
                >
                  <Grid item xs={12}>
                    {/* <h4 className={classes.poseHeader}>{ this.props.totalImages.map(item =>  (item.imageId == ph.imageId ? item.dataStore.userPose ? item.dataStore.userPose.replace("_", " ") : ""  : null) )}</h4> */}
                    <h4 className={classes.poseHeader}>{ph.hasOwnProperty("imageUserPose") ? ph.imageUserPose.replace("_", " ") : ""}</h4>
                    {/* { ph.imagePoseReview === 0 ? (
                      <h4 className={classes.poseHeader}>{ph.imagePose ? ph.imagePose.replace("_", " ") : ""}</h4>
                    ) : ph.imagePoseReview !== null ? (
                      <h4 className={classes.poseHeader}>Review pose</h4>
                    ) : null} */}
                  </Grid>

                  <SmartImage image={ph} />
                  {/* <IconButton
                    className={classes.iconButton}
                    // color="primary"
                    size="small"
                    // onClick={() => this._editDamage(image.imageId)}
                  > */}
                  {
                    ph.passed === false ? (
                      <Icon
                        className={classes.icon}
                        onClick={() => this.props.onClick(ph)}
                      >
                        help
                    </Icon>
                    ) : null
                  }
                  {/* <HelpIcon className={classes.icon} /> */}
                  {/* </IconButton> */}
                </Grid>
              ))}
            </Grid>
            {/* <GridList className="grid-list reject" cellHeight={125} cols={3}>
              {this.props.pictureList.map((ph, index) => (
                <GridListTile key={index}>
                  <SmartImage image={ph} />

                  <div
                    className="icon-container"
                    onClick={() => this.props.onClick(ph)}
                  >
                    <Icon>help</Icon>
                  </div>
                </GridListTile>
              ))}
            </GridList> */}
          </Fragment>
        ) : (
            <Fragment>
              <label>{this.props.header}</label>
              <span>
                <Icon>mood_bad</Icon> {t("general.empty")}
              </span>
            </Fragment>
          )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    totalImages: state.posesReducer.totalImages
  };
};

export default withNamespaces("common")(
  connect(
    mapStateToProps,
    null
  )(withStyles(styles)(withSnackbar(UploadGroup)))
);