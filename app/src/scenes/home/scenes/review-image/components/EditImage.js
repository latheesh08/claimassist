import React from "react";
import { Redirect } from "react-router-dom";
import { Grid, LinearProgress } from "@material-ui/core";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import { withStyles } from "@material-ui/core/styles";
import { withNamespaces } from "react-i18next";
import { connect } from "react-redux";
import {
  BoundingBox,
  BBoxDescription,
  resizeBox,
  SmartImage
} from "../../../components";
import greenTheme from "./theme";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { removeDamage, removeAppraisalDamage, showDeleteAlert } from "../../../../../actions";
import Alert from "./Alert.js";

const styles = theme => ({
  root: {
    flexGrow: 1,
    margin: "auto"
  },
  container: {
    display: "flex",
    justifyContent: "center"
    // margin: theme.spacing(0.2),
    // marginTop: theme.spacing(2)
  },
  navigator: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  image: {
    height: "auto",
    width: "100%",
    padding: 0
  },
  imageContainer: {
    position: "relative"

    // padding: 10
  },
  overlay: {
    position: "absolute",
    top: 5,
    left: 5,
    zIndex: 100,
    backgroundColor: "black",
    borderRadius: 30,
    paddingTop: 1,
    paddingBottom: 1,
    paddingLeft: 7,
    paddingRight: 7,
    color: "white",
    fontWeight: "bold"
  },
  editButton: {
    position: "absolute",
    top: 5,
    right: 5,
    zIndex: 100,
    backgroundColor: "black",
    padding: 5,
    // paddingBottom: 1,
    // paddingLeft: 7,
    // paddingRight: 7,
    color: "white"
  },
  addButton: {
    display: "flex",
    alignItems: "center",
    marginTop: 10
  },
  addIcon: {
    color: "#19D752",
    fontSize: 20,
    marginRight: 5
  },
  addText: {
    fontSize: 13,
    // fontWeight: 200
    color: "#666"
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0
  },
  boxDescription: {
    position: "absolute",
    backgroundColor: "#40C9A2"
  },
  progress: {
    marginTop: -5,
    height: 7
  },
  linearColorPrimary: {
    backgroundColor: "#eee"
  },
  linearBarColorPrimary: {
    backgroundColor: "#19D752"
  },
  textP: {
    color: "rgba(0, 0, 0, 0.54)",
    fontSize: "14px",
    fontWeight: "400",
    display: "block"
    // lineHeight: "16px"
  }
});

class EditImage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      boxWidth: 0,
      boxHeight: 0,
      editDamage: false,
      addDamage: false,
      showDeleteAlert: false
    };
    this.imageRef = React.createRef();
    // this.descriptionRef = React.createRef();
  }

  descriptionRef = element => {
    if (element) {
      console.log("INSIDE REF CALLBACK");
    }
  };

  // getDataUrl = imgData => `data:image/png;base64,${imgData}`;

  onClickEditDamage = () => {
    console.log("edit damage");
    this.setState({ editDamage: true });
  };

  // onClickDeleteDamage(damage) {
  //   console.log(damage);
  //   console.log("delete damage");
  //   this.props.deleteDamage(damage);
  //   this.props.start();
  // }

  _deleteDamage = async (show, damage) => {
    console.log("IN DELETE DAMAGE");
    console.log(damage);
    console.log(show);
    // return;
    this.setState({ showDeleteAlert: false });
    await this.props.deleteDamage(damage);
    await this.props._removeDamageFromAppraisal(damage.partId, damage.damageId);
    this.props.showDeleteAlert(show);
    this.props.start();
  };

  _handleClickDelete = async damage => {
    console.log("IN HANDLE CLICK DELETE");
    console.log(damage);
    if (this.props.showRemoveDamageAlert === true) {
      this.setState({ showDeleteAlert: true });
    } else {
      await this.props.deleteDamage(damage);
      await this.props._removeDamageFromAppraisal(damage.partId, damage.damageId);
      this.props.start();
    }
  };

  onClickAddDamage = () => {
    console.log("add damage");
    this.setState({ addDamage: true });
  };

  imageLoad = imgInfo => {
    console.log("EDIT IMAGE LOAD INFO");
    console.log(imgInfo);
    this.setState({
      boxWidth: imgInfo.width,
      boxHeight: imgInfo.height
    });
  };

  getDefaultBox = (containerHeight, containerWidth) => {
    return {
      top: containerHeight / 4,
      left: containerWidth / 4,
      right: (containerWidth * 3) / 4,
      bottom: (containerHeight * 3) / 4
      // height: containerHeight / 2,
      // width: containerWidth / 2
    };
  };

  render() {
    // if (this.state.editDamage === true) {
    //   return <Redirect to="/edit-damage" />;
    // }

    console.log("====================================");
    console.log("EDIT IMAGE PROPS");
    console.log(this.props);
    console.log("====================================");
    // console.log("====================================");
    // console.log("EDIT IMAGE STATE");
    // console.log(this.state);
    // console.log("====================================");
    console.log("APPRAISAL DAMAGED PARTS");
    console.log(this.props.clonedAppraisal.parts.filter(item => item.hasOwnProperty("damages") && item.category === 'image'));
    const count = this.props.clonedAppraisal.parts
      .filter(item => item.hasOwnProperty("damages"))
      .map(item => item.damages)
      .reduce((agg, current) => [...agg, ...current], []).length;
    console.log("COUNT ALL DAMAGES?");
    console.log(count);

    const { image, classes, boxIndex } = this.props;

    const { boxWidth, boxHeight } = this.state;
    const { t } = this.props;
    // console.log("IMAGE");
    // console.log(image);

    const damages = this.props.imageDamages.filter(
      item => item.shape[0].imageId === image.imageId
    );

    // console.log("APPRAISAL");
    // console.log(this.props.clonedAppraisal);

    console.log("THIS IMAGES DAMAGES");
    console.log(damages);

    const newContainer = { width: boxWidth, height: boxHeight };
    console.log("newContainer");
    console.log(newContainer);
    const boxes =
      boxHeight && boxWidth
        ? damages.map(item =>
          resizeBox(item.box, item.originalSize, newContainer)
        )
        : [];
    console.log("BOXES");
    console.log(boxes);
    const currentBox = boxes[boxIndex];

    const reverseDescriptionBox =
      currentBox && boxHeight ? currentBox.top < boxHeight / 4 : false;

    const currentDamage = damages[boxIndex];
    console.log("CURRENT DAMAGE");
    console.log(currentDamage);
    console.log("====================================");
    const defaultBox = this.getDefaultBox(boxHeight, boxWidth);

    // const descriptionText = currentDamage ? `temp description` : ``;
    let descriptionText = currentDamage && currentDamage.hasOwnProperty("type") && currentDamage.hasOwnProperty("partSource") ? `${currentDamage.type} on ${currentDamage.partSource.type}` : ``;

    const progress =
      damages.length > 0 ? (100 * (boxIndex + 1)) / damages.length : 0;

    if (this.state.editDamage === true) {
      return (
        <Redirect
          push
          to={{
            pathname: "/edit-damage",
            state: {
              index: boxIndex,
              image: image,
              box: currentBox,
              damage: currentDamage,
              returnPath: this.props.returnPath
            }
          }}
        />
      );
    }
    if (this.state.addDamage === true) {
      return (
        <Redirect
          push
          to={{
            pathname: "/add-damage",
            state: {
              currentIndex: boxIndex,
              image: image,
              box: defaultBox,
              returnPath: this.props.returnPath
            }
          }}
        />
      );
    }

    return (
      <Grid container className={classes.container}>
        <Alert
          open={
            this.state.showDeleteAlert &&
            this.props.showRemoveDamageAlert === true
          }
          damage={currentDamage}
          message={t("top-nav.delete-damage-message")}
          yesText={t("top-nav.alert-yes-text")}
          noText={t("top-nav.alert-no-text")}
          handleYes={this._deleteDamage}
          handleNo={() => this.setState({ showDeleteAlert: false })}
        />
        {/* <Grid item xs={12} className={classes.navigator} /> */}
        <Grid item className={classes.imageContainer}>
          {/* <img
            src={this.getDataUrl(image.data.base64ByteStream)}
            alt=""
            className={classes.image}
            onLoad={this.imageLoad}
            ref={this.imageRef}
          /> */}
          <SmartImage image={image} resize={true} loadCallback={this.imageLoad} />
          <MuiThemeProvider theme={greenTheme}>
            <LinearProgress
              //   color="secondary"
              variant="determinate"
              value={progress}
              className={classes.progress}
              thickness={6}
              classes={{
                colorPrimary: classes.linearColorPrimary,
                barColorPrimary: classes.linearBarColorPrimary
              }}
            />
          </MuiThemeProvider>
          {
            this.props.userInfo.isSupervisor || this.props.userInfo.isReviewer ? (
              <div>
                <div className={classes.addButton} onClick={this.onClickAddDamage}>
                  <AddCircleIcon className={classes.addIcon} />
                  <span className={classes.addText}>{t("home.review.add-damage")}</span>
                </div>
                <div>
                  <p className={classes.textP}>
                    {t("home.review.edit-guide")}
                  </p>
                </div>
              </div>
            ) : null
          }
          {boxes.map((item, idx) => (
            <div className={classes.svg} key={idx}>
              <BoundingBox
                top={item.top}
                left={item.left}
                right={item.right}
                bottom={item.bottom}
                active={idx === boxIndex}
                containerWidth={this.state.boxWidth}
                containerHeight={this.state.boxHeight}
              />
            </div>
          ))}
          {currentBox ? (
            <BBoxDescription
              onClickDelete={() => this._handleClickDelete(currentDamage)}
              onClickEdit={this.onClickEditDamage}
              top={currentBox.top}
              left={currentBox.left}
              bottom={currentBox.bottom}
              reverse={reverseDescriptionBox}
              userInfo={this.props.userInfo}
              text={descriptionText}
              self={this.descriptionRef}
            />
          ) : null}
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = state => {
  return {
    imageDamages: state.damageReducer.damages,
    modified: state.damageReducer.modified,
    showRemoveDamageAlert: state.damageReducer.showRemoveDamageAlert,
    clonedAppraisal: state.resultReducer.clonedAppraisal,
    userInfo: state.userReducer.userInfo
    // pictures: state.pictureReducer.pictures
    // shapes: state.resultReducer.shapes
  };
};

const mapDispatchToProps = dispatch => {
  return {
    deleteDamage: damage => dispatch(removeDamage(damage)),
    _removeDamageFromAppraisal: (partId, damageId) =>
      dispatch(removeAppraisalDamage(partId, damageId)),
    showDeleteAlert: show => dispatch(showDeleteAlert(show))
  };
};

export default withNamespaces("common")(
  withStyles(styles)(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(EditImage)
  )
);
