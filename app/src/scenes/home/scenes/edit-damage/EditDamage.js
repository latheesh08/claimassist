import React, { Component } from "react";
import { Redirect } from "react-router-dom";

import { Grid, Icon } from "@material-ui/core";

import { withStyles } from "@material-ui/core/styles";

import { withNamespaces } from "react-i18next";
import { connect } from "react-redux";
import { post } from "../../../../api/http_proxy";
import {
  ResizableBoundingBox,
  resizeBox,
  TopBar,
  SmartImage
} from "../../components";
import { DropDown } from "../../../../components";
import Checkbox from "@material-ui/core/Checkbox";
import { FormControl, FormControlLabel, CircularProgress } from "@material-ui/core";

import { damageList, fullPartList } from "../../../../constants";
import {
  updateDamageSize,
  updateDamage,
  removeDamage,
  removeAppraisalDamage,
  updateAppraisalPart,
  addAppraisalDamage,
  addAppraisalPart
} from "../../../../actions";
import { Alert } from "../../../../components";
import { makeNewPart, cleanDamage, createDamageSizeOutput, makePartList, buildDamageSizeInput, randomInteger } from "../../components/Utils";
import { withSnackbar } from "notistack";
import { userInfo } from "os";

const styles = theme => ({
  root: {
    flexGrow: 1,
    justifyContent: "space-between",
    // backgroundColor: "red",
    // margin: "auto",
    // height: "100%",
    position: "relative"
  },
  // top: {
  //   display: "flex",
  //   justifyContent: "flex-start"
  // },
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

class EditDamage extends Component {
  constructor() {
    super();

    this.state = {
      index: 0,
      boxWidth: 0,
      boxHeight: 0,
      image: null,
      goBack: false,
      damage: null,
      box: null,
      isStoring: false,
      priorDamage: false,
      showDeleteAlert: false,
      partList: []
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
    console.log("====================================");
    console.log("COMPONENT DID MOUNT PROPS");
    console.log(this.props);
    console.log("====================================");
    try {
      const { index, box, damage, image } = this.props.location.state;
      // const image = damage.image;
      console.log("FULL PART LIST");
      console.log(fullPartList);
      // const partList = makePartList(image.imageId, this.props.clone.parts);
      const partList = fullPartList;
      this.setState({
        index,
        box,
        image,
        damage,
        partList
      });

    } catch (error) {
      this.setState({ goBack: true });
    }
  }

  accept = async () => {
    // console.log("accepted");
    this.setState({ isStoring: true });
    var { damage } = this.state;
    var { clone } = this.props;
    //make sure to change part id
    const partId = damage.partId;
    const damageId = damage.damageId;
    const partTypeCode = damage.partSource.typeCode;
    // First remove damage from old part
    await this.props._removeDamageFromAppraisal(partId, damageId);
    // are there any parts of partType?
    var compatibleParts = clone.parts.filter(
      part => part.category !== "incident" && part.typeCode === partTypeCode
    );
    console.log("IS PART IN CLONED APPRAISAL ALREADY");
    console.log(compatibleParts);

    var aprDamage = cleanDamage(damage);
    console.log("CLEAN DAMAGE TO STORE");
    console.log(damage);

    if (compatibleParts.length > 0) {
      console.log(compatibleParts);
      // add damage to this part
      var compatiblePart = compatibleParts[0];
      aprDamage.partId = compatiblePart.partId;
      aprDamage.appraisalId = compatiblePart.appraisalId;
      aprDamage.createdAt = compatiblePart.createdAt;
      await this.props._addDamageToExistingPart(compatiblePart.partId, aprDamage);

      damage.partSource = compatiblePart;
    } else {
      // No part like this exists in our parts array, so make a new one
      const _partType = this.state.partList.filter(plist => plist.code === partTypeCode)[0];
      const _damageType = damageList.filter(
        dlist => dlist.code === damage.typeCode
      )[0];
      let newPart = makeNewPart(
        clone.appraisalId,
        _partType,
        _damageType,
        clone.createdBy
      );
      aprDamage.partId = newPart.partId;
      newPart.damages = [aprDamage];
      newPart.damageSummary = aprDamage.type;
      console.log("NEW PART TO ADD TO APPRAISAL");
      console.log(newPart);

      await this.props._addDamageToExistingPart(newPart.partId, aprDamage);

      // update damage with partSource
      damage.partSource = newPart;
    }
    
    const damageSizeInput = buildDamageSizeInput(damage);
    console.log("DAMAGE SIZE INPUT");
    console.log(damageSizeInput);
    const damageSizeOutput = await createDamageSizeOutput(damageSizeInput);
    console.log("DAMAGE SIZE OUTPUT");
    console.log(damageSizeOutput);
    console.log(this.props);
    console.log(this.state);
    await this.props._updateDamageSize(damageSizeOutput);
    await this.props.update(damage);
    // this.props.updateAppraisal(damage.partSource);
    this.setState({ goBack: true, isStoring: false });
  };

  reject = () => {
    // console.log("rejected");
    this.setState({ goBack: true });
  };

  _deleteDamage = damage => {
    this.setState({ showDeleteAlert: false });
    this.props.deleteDamage(damage.id);
    this.setState({ goBack: true, index: 0 });
  };

  imageLoad = imgInfo => {
    console.log("EDIT IMAGE LOAD INFO");
    console.log(imgInfo);
    this.setState({
      boxWidth: imgInfo.width,
      boxHeight: imgInfo.height
    });
  };

  handleDamageChange = evt => {
    console.log("changed damage");
    console.log(evt.target.value);
    console.log(damageList);
    const damageTypes = damageList.filter(
      item => item.code === parseInt(evt.target.value)
    );
    const damageType = damageTypes[0];
    console.log("selected damage");
    // console.log(damage[0]);
    console.log(damageType);
    // console.log(this.state.damage);

    if (evt.target.value) {
      this.setState(prev => {
        const damageSource = {
          ...prev.damage,
          typeCode: damageType.code,
          type: damageType.name
        };
        const damages = prev.damage.partSource.damages.map(item => {
          if (item.damageId === damageSource.damageId) {
            return damageSource;
          } else {
            return item;
          }
        });
        const partDamage = damages.map(dmg => dmg.type).join(",");
        return {
          damage: {
            ...damageSource,
            type: damageType.name,
            typeCode: damageType.code,
            partSource: {
              ...prev.damage.partSource,
              damages: damages.map( item => {
                if(item.hasOwnProperty("partSource")) {
                  console.log("delete partSource to stop recursive error")
                  delete item.partSource
                }
                return item
              }),
              damageSummary: partDamage,
              decision: null
            }
          }
        };
      });
    }

  };

  handlePartChange = evt => {
    // Note that if you change the part, the part decision needs to be null
    console.log(evt.target.value);
    const parts = this.state.partList.filter(
      item => item.code === parseInt(evt.target.value)
    );
    const actualParts = this.props.clone.parts.filter(
      item => item.category === "image" && item.typeCode === parseInt(evt.target.value)
    );
    // console.log(parts);
    const part = parts[0];
    const actualPart = actualParts[0];
    console.log("NEW PART", part);
    console.log("NEW ACTUAL PART", actualPart);
    if (evt.target.value) {
      this.setState(prev => {
        return {
          damage: {
            ...prev.damage,
            partSource: {
              ...prev.damage.partSource,
              typeCode: part.code,
              type: part.name,
              vectors: actualPart && actualPart.hasOwnProperty("vectors") ? actualPart.vectors : null,
              decision: null,
              shape: actualPart && actualPart.hasOwnProperty("shape") ? actualPart.shape : null
            }
          }
        };
      });
    }
  };

  _resizeBox = (width, height, left, top) => {
    const box = {
      left: left,
      top: top,
      right: left + width,
      bottom: top + height
    };
    this._updateDamageBox(box);
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
    this._updateDamageBox(box);
  };

  _updateDamageBox = box => {
    // const _box = {
    //   ...box,
    //   bottom: box.top + box.height,
    //   right: box.left + box.width
    // };

    const oldContainer = {
      width: this.state.boxWidth,
      height: this.state.boxHeight
    };

    const { originalSize } = this.state.damage;
    const resized = resizeBox(box, oldContainer, originalSize);
    const { left, right, top, bottom } = resized;
    const resized_str = `${left},${top},${right},${bottom}`;
    // console.log("ORIGINAL");
    // console.log(oldContainer);
    // console.log("RESIZED");
    // console.log(resized);
    // console.log("DAMAGE BOX");
    // console.log(box);
    // console.log("STATE");
    // console.log(this.state);
    // const _damageBox = {
    //   top: damageBox.top,
    //   left: damageBox.left,
    //   right: damageBox.left + damageBox.width,
    //   bottom: damageBox.top + damageBox.height
    // };
    this.setState(prev => {
      const damageSource = {
        ...prev.damage,
        vectors: [left, top, right, bottom],
        shape: [{ ...prev.damage.shape[0], vectors: resized_str }]
      };
      const damages = prev.damage.partSource.damages.map(item => {
        if (item.damageId === damageSource.damageId) {
          return damageSource;
        } else {
          return item;
        }
      });
      return {
        damage: {
          ...damageSource,
          box: resized,
          partSource: {
            ...prev.damage.partSource,
            damages: damages.map( item => {
              if(item.hasOwnProperty("partSource")) {
                console.log("delete partSource to stop recursive error")
                delete item.partSource
              }
              return item
            }),
            decision: null
          }
        },
        box: box
      };
    });
  };

  render() {
    if (this.state.goBack === true) {
      return (
        <Redirect
          to={{
            pathname: "/review-image",
            state: {
              image: this.state.image,
              boxIndex: this.state.index,
              currentPartValue: null,
              currentDamageValue: null,
              returnPath: this.props.location.state.returnPath
            }
          }}
        />
      );
    }

    console.log("====================================");
    console.log("EDIT-DAMAGE PROPS");
    console.log(this.props);
    console.log("====================================");

    const { image, damage, box } = this.state;
    const { t, classes } = this.props;

    console.log("DAMAGE!!");
    console.log(damage);
    // console.log(partList);
    // console.log(damageList);

    // console.log("Current PART Value");
    const currentPartValue = damage && damage.hasOwnProperty("partSource") ? damage.partSource.typeCode : undefined;
    // console.log(currentPartValue);
    //this.setState({ currentPartValue: currentPartValue });
    // console.log("Current DAMAGE Value");
    const currentDamageValue = damage ? damage.typeCode : undefined;

    // console.log(currentDamageValue);
    //this.setState({ currentDamageValue: currentDamageValue })

    return (
      <Grid container className={classes.root}>
        <Alert
          open={this.state.showDeleteAlert}
          message="Are you sure you want to delete this damage?"
          yesText={t("top-nav.alert-yes-text")}
          noText={t("top-nav.alert-no-text")}
          handleYes={() => this._deleteDamage(damage)}
          handleNo={() => this.setState({ showDeleteAlert: false })}
        />
        {/* <Grid container className={classes.top}> */}
        {
          this.state.isStoring ?
            <CircularProgress />
            :
            <Grid item xs={12} className={classes.topnav}>
              <TopBar
                handleReject={this.reject}
                handleAccept={this.accept}
                title="Edit Damage"
              />
            </Grid>
        }
        <Grid container className={classes.body}>
          {/* <Grid item xs={12} container className={classes.nav}>
            <Icon onClick={this.reject}>close</Icon>
            <span className={classes.title}>EDIT DAMAGE</span>
            <Icon onClick={this.accept} className={classes.active}>
              check
            </Icon>
          </Grid> */}

          <Grid item className={classes.imageContainer}>
            {image ? (
              <SmartImage image={image} loadCallback={this.imageLoad} />
            ) : null}
            <div className={classes.svg}>
              {box ? (
                <ResizableBoundingBox
                  top={box.top}
                  left={box.left}
                  right={box.right}
                  bottom={box.bottom}
                  active={true}
                  containerWidth={this.state.boxWidth}
                  containerHeight={this.state.boxHeight}
                  resizeBox={this._resizeBox}
                  moveBox={this.moveBox}
                />
              ) : null}
            </div>
          </Grid>
        </Grid>
        {/* </Grid> */}
        <Grid container className={classes.bottom}>
          <Grid container lg={6} item>
            <Grid item xs={12}>
              <DropDown
                options={this.state.partList.map(item => {
                  return { label: t(`parts.${item.key}`), value: item.code };
                })}
                onChange={this.handlePartChange}
                currentValue={currentPartValue}
                id="id-part"
                name="part"
                placeholder="Part"
              />
            </Grid>
            <Grid item xs={12}>
              <DropDown
                options={damageList.map(item => {
                  return { label:  t(`damages.${item.key}`), value: item.code };
                })}
                onChange={this.handleDamageChange}
                currentValue={currentDamageValue}
                id="id-damage"
                name="damage"
                placeholder="Damage"
              />
            </Grid>
            {/* <Grid item xs={12}>
              <FormControl className={classes.formControl}>
                <FormControlLabel
                  value="disabled"
                  color="#19D752"
                  control={
                    <Checkbox
                      checked={this.state.priorDamage}
                      onChange={this.onClickPriorDamage}
                      value="priorDamage"
                    />
                  }
                  label={t("home.add-damage.prior-damage")}
                />
              </FormControl>
            </Grid> */}
            {/* <Grid item xs={12}>
              <div className={classes.delete}>
                <FormControlLabel
                  control={
                    <div className={classes.deleteContainer}>
                      <Icon
                        className={classes.deleteIcon}
                        onClick={() => this.setState({ showDeleteAlert: true })}
                      >
                        delete
                      </Icon>
                      <span className={classes.deleteText}>
                        Remove this damage
                      </span>
                    </div>
                  }
                />
              </div>
            </Grid> */}
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = state => {
  return {
    // pictures: state.pictureReducer.pictures
    clone: state.resultReducer.clonedAppraisal,
    images: state.resultReducer.images
  };
};

const mapDispatchToProps = dispatch => {
  return {
    update: damage => dispatch(updateDamage(damage)),
    deleteDamage: id => dispatch(removeDamage(id)),
    _removeDamageFromAppraisal: (partId, damageId) =>
      dispatch(removeAppraisalDamage(partId, damageId)),
    _addDamageToExistingPart: (partId, damage) =>
      dispatch(addAppraisalDamage(partId, damage)),
    addAppraisalPart: part => dispatch(addAppraisalPart(part)),
    updateAppraisal: part => dispatch(updateAppraisalPart(part)),
    _updateDamageSize: damageSizeOutput => dispatch(updateDamageSize(damageSizeOutput)),
  };
};

export default withStyles(styles)(
  withNamespaces("common")(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(withSnackbar(EditDamage))
  )
);
