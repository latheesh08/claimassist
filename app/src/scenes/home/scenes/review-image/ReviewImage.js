import React, { Component } from "react";
import { Redirect } from "react-router-dom";

import { Grid } from "@material-ui/core";

import { withStyles } from "@material-ui/core/styles";

import { withNamespaces } from "react-i18next";
import { connect } from "react-redux";

import { EditImage, Footer } from "./components";
import { TopNav, Alert } from "../../../../components";
import "./styles.scss";
import { removeImage } from "../../../../actions";

const styles = (theme) => ({
  root: {
    flexGrow: 1,
    justifyContent: "space-between",
    position: "relative",
  },
  container: {
    display: "flex",
    justifyContent: "center"
  },
  top: {
    display: "flex",
    flexShrink: "1",
    justifyContent: "center",
    alignItems: "flex-start",
    alignSelf: "flex-start",
  },
  topnav: {},
  poseHeader: {
    padding: "0 0 0 0",
    margin: "5px",
    textTransform: "capitalize",
    color: "#666",
  },
  imageContainer: {
    display: "flex",
    justifyContent: "center",
   //position: "relative"
  },
  image: {
    height: "auto",
    width: "100%",
    padding: 0
  },
  body: {
    marginBottom: 20,
  },
  footer: {
    marginTop: 50,
    justifyContent: "center",
    alignItems: "center",
    bottom: 0,
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginHorizontal: 10,
  },
  button: {
    borderWidth: 1,
    borderColor: "red",
    margin: 10,
    padding: 5,
    borderRadius: 250,
  },
  buttonText: {
    fontSize: 10,
    color: "#666",
  },
  title: {
    fontWeight: 700,
    fontSize: 15,
  },
  titleCounter: {
    fontWeight: 500,
    fontSize: 11,
    opacity: 0.7,
    marginLeft: 10,
  },
  line: {
    textAlign: "center",
  },
  topCenterContent: {
    color: "#f0f",
  },
});
class ReviewImage extends Component {
  constructor() {
    super();

    this.state = {
      image: null,
      returnPath: null,
      goBack: false,
      hideAppTitle: true,
      boxIndex: 0,
      showDeleteAlert: false,
    };
  }

  handleOnClickDamage(index) {
    this.setState({
      damage: index,
    });
  }

  deleteImage = (id) => {
    this.setState({ showDeleteAlert: false });
    this.setState({ goBack: true });
    this.props.removePicture(id);
  };

  componentDidMount() {
    this.getData()
  }
  getData(){
    try {
      console.log("INSIDE REVIEW IMAGE");
      console.log(this.props);

      const { image, boxIndex, returnPath } = this.props.location.state;
      const { imageDamages } = this.props;
      const boxCount =
        imageDamages && image
          ? imageDamages.filter(
              (item) => item.shape[0].imageId === image.imageId
            ).length
          : 0;
      const currentIndex = boxIndex === null ? boxCount - 1 : boxIndex;
      this.setState({
        boxIndex: currentIndex,
        boxCount,
        hideAppTitle: true,
        image,
        returnPath,
      });
    } catch (error) {
      console.log("errors");
      console.log(error);
      this.setState({ goBack: true });
    }}

  moveNext = () => {
    this.setState((prev) => {
      return { boxIndex: prev.boxIndex + 1 };
    });
  };

  movePrev = () => {
    this.setState((prev) => {
      return { boxIndex: prev.boxIndex - 1 };
    });
  };

  moveStart = () => {
    this.setState({ boxIndex: 0 });
  };

  render() {
    if (this.state.goBack === true) {
      return <Redirect to="/review/intro" />;
    }
    if (this.state.hideAppTitle === true) {
      console.log("HIDE CLAIM ASSIST TITLE");
      // this.setState({ hideAppTitle: true });
    }

    const { image, boxIndex } = this.state;
    const { t, classes } = this.props;

    const boxCount =
      this.props.imageDamages && image
        ? this.props.imageDamages.filter(
            (item) => item.shape[0].imageId === image.imageId
          ).length
        : 0;

    console.log("====================================");
    console.log("IMAGE");
    console.log(this.state.image);
    console.log("====================================");
    const imageUserPose =
      this.state.image && this.state.image.userPose
        ? t("home.common-pose." + this.state.image.userPose)
        : null;

    const title = t("home.edit-damage.title");
    const titleCounter = boxCount ? `${boxIndex + 1}/${boxCount}` : "0/0";

    return (
      <Grid container className={classes.container}>
        <Alert
          open={this.state.showDeleteAlert}
          message={t("top-nav.delete-image-message")}
          yesText={t("top-nav.alert-yes-text")}
          noText={t("top-nav.alert-no-text")}
          handleYes={() => this.deleteImage(image.imageId)}
          handleNo={() => this.setState({ showDeleteAlert: false })}
        />
        <Grid container className={classes.top}>
          <TopNav
            backType="backward"
            hasMore
            narrow
            hideAppTitle={this.state.hideAppTitle}
            hideUserRole={true}
            goBack={() => this.props.history.goBack()}
          >
            <div className={classes.line}>
              <span className={classes.title}>{title} </span>
              <span className={classes.titleCounter}>{titleCounter} </span>
            </div>
          </TopNav>
          <Grid item xs={12}>
            <h4 className={classes.poseHeader}>{imageUserPose}</h4>
          </Grid>
          <Grid item xs={12} className={classes.imageContainer}>
            {image ? (
                <EditImage
                  image={image}
                  boxIndex={boxIndex}
                  start={this.moveStart}
                  returnPath={this.state.returnPath}
                />
            ) : null}
          </Grid>
        </Grid>
        <Grid item xs={12} className={classes.footer} container>
          <Grid container lg={6} item>
            <Footer
              userInfo={this.props.userInfo}
              moveNext={this.moveNext}
              movePrev={this.movePrev}
              boxIndex={boxIndex}
              boxCount={boxCount}
              returnPath={this.props.location.state.returnPath}
              removePicture={() => this.setState({ showDeleteAlert: true })}
            />
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    images: state.resultReducer.images,
    imageDamages: state.damageReducer.damages,
    clonedAppraisal: state.resultReducer.clonedAppraisal,
    userInfo: state.userReducer.userInfo,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    removePicture: (imageId) => dispatch(removeImage(imageId)),
  };
};

export default withStyles(styles)(
  withNamespaces("common")(
    connect(mapStateToProps, mapDispatchToProps)(ReviewImage)
  )
);
