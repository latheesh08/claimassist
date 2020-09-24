import React, { Component } from "react";
import { Redirect } from "react-router-dom";

import { Grid, Icon } from "@material-ui/core";

import { withStyles } from "@material-ui/core/styles";

import { withNamespaces } from "react-i18next";
import { connect } from "react-redux";
import {
  ResizableBoundingBox,
  TopBar,
  SmartImage,
  resizeBox
} from "../../components";
import { DropDown, Alert } from "../../../../components";
import Checkbox from "@material-ui/core/Checkbox";
import { FormControl, FormControlLabel, CircularProgress } from "@material-ui/core";

import { damageList, fullPartList } from "../../../../constants";
import {
  addDamage,
  addAppraisalPart,
  addAppraisalDamage,
  updateDamageSize
} from "../../../../actions";
import { buildNewDamage, createDamageSizeOutput, makePartList, postDamageSize, buildDamageSizeInput, randomInteger, cleanDamage } from "../../components/Utils";

const styles = theme => ({
  root: {
    flexGrow: 1,
    justifyContent: "space-between",
    // backgroundColor: "red",
    // margin: "auto",
    // height: "100%",
    position: "relative"
  },
  topnav: {
    // marginBottom: 40
  },
  imageContainer: {
    position: "relative"
    // margin: theme.spacing(0.2),
    // marginTop: theme.spacing(2)
  },
  image: {
    height: "auto",
    width: "100%",
    padding: 0
  },
  body: {
    // backgroundColor: "white"
    marginBottom: 20,
    display: "flex",
    justifyContent: "center"
  },
  footer: {
    justifyContent: "center",
    alignItems: "center"
  },
  bottom: {
    display: "flex",
    justifyContent: "center"
    // backgroundColor: "yellow"
  },
  nav: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    width: "100%"
  },
  delete: {
    margin: theme.spacing(1),
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    fontWeight: 400,
    fontSize: "0.875rem"
  },
  deleteContainer: {
    display: "flex",
    alignItems: "center",
    opacity: 0.5
  },
  deleteIcon: {
    padding: 12
  },

  button: {
    borderWidth: 1,
    borderColor: "red",
    margin: 10,
    padding: 5,
    borderRadius: 250
  },
  buttonText: {
    fontSize: 10,
    color: "#666"
  },
  title: {
    fontWeight: 700,
    fontSize: 15
  },
  titleCounter: {
    fontWeight: 500,
    fontSize: 11,
    opacity: 0.7,
    marginLeft: 10
  },
  line: {
    textAlign: "center"
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0
  },
  active: {
    color: "#19D752"
  }
});

class AddDamage extends Component {
  constructor() {
    super();

    this.state = {
      boxWidth: 0,
      boxHeight: 0,
      currentIndex: 0,
      accepted: false,
      goBack: false,
      image: null,

      damageType: null,
      partType: null,
      partList: [],
      box: null,
      originalSize: null,

      priorDamage: false,
      showError: false,
      errorMsg: false,
      showDeleteAlert: false,
      imageLoading: true,
      isStoring: false,
      damage: null
    };
    this.imageRef = React.createRef();
  }

  onClickPriorDamage = () => {
    this.setState(prev => {
      return { priorDamage: !prev.priorDamage };
    });
  };

  // getDataUrl = imgData => `data:image/png;base64,${imgData}`;

  componentDidMount() {
    try {
      const { currentIndex, image, box } = this.props.location.state;
      console.log("STATE IMAGE");
      console.log(image);
      const { clone } = this.props;
      console.log("CLONE");
      console.log(clone);

      this.setState({ image : image })
      this.getOriginalSize(image.url, originalSize => {
        console.log("Got Orig Size");
        console.log(originalSize);

        this.setState({
          currentIndex,
          box,
          originalSize
          // damage
        });
        console.log("mounted");
      });
      fullPartList.sort(function(a, b) {
        var textA = a.name.toUpperCase();
        var textB = b.name.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
      // const partList = makePartList(image.imageId, this.props.clone.parts);
      const partList = fullPartList;
      this.setState({ partList });
      // const damage = buildNewDamage(clone, image.imageId, box);
      // console.log("NEW DAMAGE");
      // console.log(damage);
    } catch (error) {
      console.error(error);
      this.setState({ goBack: true });
    }
  }

  _resizeBox = (width, height, left, top) => {
    const box = {
      left: left,
      top: top,
      right: left + width,
      bottom: top + height
    };
    this.setState({ box: box });
    // this._updateDamageBox(box);
    // this._updateDamageBox(box);
  };

  moveBox = (left, top) => {
    // console.log("MOVING BOX SLOWLY...");
    const dx = left - this.state.box.left;
    const dy = top - this.state.box.top;

    const box = {
      left: left,
      right: this.state.box.right + dx,
      top: top,
      bottom: this.state.box.bottom + dy
    };
    // const box = { ...this.state.box, left, top };
    this.setState({ box: box });
    // this._updateDamageBox(box);
  };

  getOriginalSize = (url, callback) => {

    let img = new Image();
    img.addEventListener("load", function () {
      callback({ width: this.naturalWidth, height: this.naturalHeight });
    });
    img.src = url;
  };

  handleDamageChange = evt => {
    const damages = damageList.filter(
      item => item.code === parseInt(evt.target.value)
    );
    const damageType = damages[0];
    console.log(damageType);
    if (evt.target.value) {
      this.setState({ damageType });
    }
  };

  handlePartChange = evt => {
    const parts = fullPartList.filter(
      item => item.code === parseInt(evt.target.value)
    );
    const actualParts = this.props.clone.parts.filter(
      item => item.category === "image" && item.typeCode === parseInt(evt.target.value)
    );
    const actualPart = actualParts[0];
    console.log("NEW PART", actualPart);
    const partType = parts[0];
    console.log(partType);
    if (evt.target.value) {
      this.setState({ partType });
    }
  };

  accept = async () => {
    //Build new damage and new part if necessary
    this.setState({ isStoring: true });
    console.log("accepted");
    const { clone, userInfo } = this.props;
    const {
      image,
      box,
      partType,
      damageType,
      originalSize,
      boxWidth,
      boxHeight
    } = this.state;

    const oldContainer = {
      width: this.state.boxWidth,
      height: this.state.boxHeight
    };
    const resized = resizeBox(box, oldContainer, originalSize);

    const { damage, isNewPart } = buildNewDamage(
      clone,
      image.imageId,
      resized,
      partType,
      damageType,
      userInfo.userId,
      originalSize
    );

    // const { damage } = this.state;

    console.log("IS A NEW PART, AND NEW DAMAGE");
    console.log(isNewPart);
    console.log(damage);
    console.log("STATE IMAGE ID");
    console.log(this.state.image.imageId);

    await this.props._addDamage(damage);
    let aprDamage = cleanDamage(damage);
    aprDamage.shape[0].imageId = this.state.image.imageId;
    if (isNewPart) {
      let part = damage.partSource;
      if(typeof (part.shape) !== "undefined"){
        part.shape[0].imageId = this.state.image.imageId;
      } 
      await this.props.addAppraisalPart(damage.partSource);
      console.log("finished addAppraisalPart");
    } else {
      const partId = damage.partSource.partId;
      await this.props.addAppraisalDamage(partId, aprDamage);
      console.log("finished addAppraisalDamage");
    }
    const damageSizeInput = buildDamageSizeInput(damage);
    console.log("ACCEPT DAMAGE SIZE INPUT");
    console.log(damageSizeInput);
    // const damageSizeOutput = await createDamageSizeOutput(damageSizeInput);
    // console.log("DAMAGE SIZE OUTPUT");
    // console.log(damageSizeOutput);
    // console.log(this.props);
    // console.log(this.state);
    // await this.props._updateDamageSize(damageSizeOutput);

    this.setState({ accepted: true, isStoring: false });
  };

  reject = () => {
    console.log("rejected");
    this.setState({ goBack: true });
  };

  imageLoad = imgInfo => {
    // const originalSize = {
    //   width: imgInfo.width,
    //   height: imgInfo.height
    // };
    this.setState({
      // originalSize,
      imageLoading: false,
      boxWidth: imgInfo.width,
      boxHeight: imgInfo.height
    });
    // this.setState({
    //   boxWidth: clientWidth,
    //   boxHeight: clientHeight
    // });
    console.log("image loaded");
    console.log(imgInfo);
  };

  // initializeDamage = (imageWidth, imageHeight) => {
  //   const {image, box} = this.props.location.state;
  //   const damageBox = { left: box.left, top: box.top };
  // };

  render() {
    if (this.state.goBack === true) {
      return (
        <Redirect
          to={{
            pathname: "/review-image",
            state: {
              image: this.state.image,
              boxIndex: this.state.currentIndex,
              returnPath: this.props.location.state.returnPath
            }
          }}
        />
      );
    }
    if (this.state.accepted === true) {
      return (
        <Redirect
          to={{
            pathname: "/review-image",
            state: {
              image: this.state.image,
              boxIndex: null,
              returnPath: this.props.location.state.returnPath
            }
          }}
        />
      );
    }

    const { image, damage, originalSize } = this.state;
    const { t, classes } = this.props;

    const disableAccept =
      this.state.partType === null || this.state.damageType === null;

    const currentPartValue =
      damage && damage.hasOwnProperty("partSource")
        ? damage.partSource.typeCode
        : undefined;
    // console.log(currentPartValue);
    //this.setState({ currentPartValue: currentPartValue });
    // console.log("Current DAMAGE Value");
    const currentDamageValue =
      damage && damage.hasOwnProperty("damageSource")
        ? damage.typeCode
        : undefined;

    const _box = this.state.box;
    let box = undefined;
    if (originalSize && originalSize.width && originalSize.height) {
      const newContainer = {
        width: originalSize.width,
        height: originalSize.height
      };
      box = resizeBox(_box, originalSize, newContainer);
    } else {
      box = _box;
    }

    return (
      <Grid container className={classes.root}>
        <Alert
          open={this.state.showDeleteAlert}
          message={t("top-nav.delete-damage-message")}
          yesText={t("top-nav.alert-yes-text")}
          noText={t("top-nav.alert-no-text")}
          handleYes={this.reject}
        />
        {
          this.state.isStoring ?
            <CircularProgress />
            :
            <Grid item xs={12} className={classes.topnav}>
              <TopBar
                handleReject={this.reject}
                handleAccept={
                  disableAccept
                    ? () => this.setState({ showError: true })
                    : this.accept
                }
                title={t("home.add-damage.title")}
                disableAccept={disableAccept}
              />
            </Grid>
        }
        <Grid container className={classes.body}>
          {/* <Grid item xs={12} container className={classes.nav}>
            <Icon onClick={this.reject}>close</Icon>
            <span className={classes.title}>ADD DAMAGE</span>
            {this.state.partType === null || this.state.damageType === null ? (
              <Icon onClick={() => this.setState({ showError: true })}>
                check
              </Icon>
            ) : (
              <Icon onClick={this.accept} className={classes.active}>
                check
              </Icon>
            )}
          </Grid> */}

          <Grid item className={classes.imageContainer}>
            {image ? (
              <SmartImage image={image} loadCallback={this.imageLoad} />
            ) : null}
            <div className={classes.svg}>
              {box && this.state.imageLoading === false ? (
                <ResizableBoundingBox
                  top={box.top}
                  left={box.left}
                  bottom={box.bottom}
                  right={box.right}
                  active={true}
                  containerWidth={this.state.boxWidth}
                  containerHeight={this.state.boxHeight}
                  color="#18AEEE"
                  resizeBox={this._resizeBox}
                  moveBox={this.moveBox}
                />
              ) : null}
            </div>
            <Alert
              open={this.state.showError}
              message="Please select a part and a damage"
              yesText={t("top-nav.alert-ok-text")}
              handleYes={() =>
                this.setState({ showError: false, errorMsg: true })
              }
            />
          </Grid>
        </Grid>
        <Grid container className={classes.bottom}>
          <Grid container lg={6} item>
            <Grid item xs={12}>
              <DropDown
                options={this.state.partList.map(item => {
                  return { label: t(`parts.${item.key}`), value: item.code };
                })}
                errorMsg={
                  this.state.errorMsg && this.state.partType === null
                    ? t("home.add-damage.select-part")
                    : ""
                }
                onChange={this.handlePartChange}
                currentValue={currentPartValue}
                id="id-part"
                name="part"
                placeholder={t("home.add-damage.part-placeholder")}
              />
            </Grid>
            <Grid item xs={12}>
              <DropDown
                options={damageList.map(item => {
                  return { label:  t(`damages.${item.key}`), value: item.code };
                })}
                errorMsg={
                  this.state.errorMsg && this.state.damageType === null
                    ? t("home.add-damage.select-part")
                    : ""
                }
                onChange={this.handleDamageChange}
                currentValue={currentDamageValue}
                id="id-damage"
                name="damage"
                placeholder={t("home.add-damage.damage-placeholder")}
              />
            </Grid>
            {/* <Grid item xs={12}>
              <FormControl className={classes.formControl}>
                <FormControlLabel
                  value="disabled"
                  control={
                    <Checkbox
                      color="default"
                      checked={this.state.priorDamage}
                      onChange={this.onClickPriorDamage}
                      value="priorDamage"
                    />
                  }
                  label={t("home.add-damage.prior-damage")}
                />
              </FormControl>
            </Grid> */}
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = state => {
  return {
    clone: state.resultReducer.clonedAppraisal,
    userInfo: state.userReducer.userInfo,
    shapes: state.resultReducer.shapes
  };
};

const mapDispatchToProps = dispatch => {
  return {
    _addDamage: damage => dispatch(addDamage(damage)),
    _updateDamageSize: damageSizeOutput => dispatch(updateDamageSize(damageSizeOutput)),
    addAppraisalDamage: (partId, damage) =>
      dispatch(addAppraisalDamage(partId, damage)),
    addAppraisalPart: part => dispatch(addAppraisalPart(part))
  };
};

export default withStyles(styles)(
  withNamespaces("common")(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(AddDamage)
  )
);
