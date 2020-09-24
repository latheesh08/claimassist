import React, { Fragment } from "react";
import { Redirect } from "react-router-dom";
import { Grid, IconButton } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import { withStyles } from "@material-ui/core/styles";
import { withNamespaces } from "react-i18next";
import { connect } from "react-redux";
import { BoundingBox, resizeBox } from "../../../components/";
import { SmartImage } from "../../../components";

const styles = theme => ({
  root: {
    flexGrow: 1,
    margin: "auto"
  },
  image: {
    height: "auto",
    width: "100%"
  },
  imageContainer: {
    position: "relative",
    margin: theme.spacing(0.2),
    // marginTop: theme.spacing(2)
    // padding: 10
  },
  overlay: {
    position: "absolute",
    top: 10,
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
    top: 10,
    right: 5,
    zIndex: 100,
    backgroundColor: "black",
    padding: 5,
    // paddingBottom: 1,
    // paddingLeft: 7,
    // paddingRight: 7,
    color: "white"
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0
  }
});

class Image extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      boxWidth: 0,
      boxHeight: 0,
      reviewImage: false,
      editImageId: null,
      editDamages: false,
      isLoaded: false
    };
    this.imageRef = React.createRef();
  }

  imageLoad = imgInfo => {
    this.setState({
      boxWidth: imgInfo.width,
      boxHeight: imgInfo.height,
      isLoaded: true
    });
  };

  _editDamage = imageId => {
    this.setState({ editDamages: true, editImageId: imageId });
  };

  render() {
    if (this.state.editDamages === true) {
      console.log("EDIT DAMAGES IS TRUE");
      return (
        <Redirect
          push
          to={{
            pathname: "/review-image",
            state: { imageId: this.state.editImageId, boxIndex: 0 }
          }}
        />
      );
    }

    const { image, index, classes } = this.props;
    const { boxWidth, boxHeight } = this.state;

    const damages = this.props.imageDamages.filter(
      item => item.imageId === image.imageId
    );
    const newContainer = { width: boxWidth, height: boxHeight };
    const boxes =
      boxHeight && boxWidth
        ? damages.map(item =>
            resizeBox(item.box, item.originalSize, newContainer)
          )
        : [];

    // console.log("====================================");
    // console.log("BOXES");
    // console.log(boxes);
    // console.log("====================================");

    return (
      <Grid item className={classes.imageContainer}>
        <SmartImage
          ref={this.imageRef}
          image={this.props.image}
          loadCallback={this.imageLoad}
        />
        {this.state.isLoaded === true ? (
          <Fragment>
            <span className={classes.overlay}>{index + 1}</span>
            <IconButton
              className={classes.editButton}
              color="primary"
              onClick={() => this._editDamage(image.imageId)}
            >
              <EditIcon />
            </IconButton>
            {boxes.map((item, idx) => (
              <div className={classes.svg} key={idx}>
                <BoundingBox
                  top={item.top}
                  left={item.left}
                  right={item.right}
                  bottom={item.bottom}
                  active={true}
                  containerWidth={this.state.boxWidth}
                  containerHeight={this.state.boxHeight}
                />
              </div>
            ))}
          </Fragment>
        ) : null}
      </Grid>
    );
  }
}

const mapStateToProps = state => {
  return {
    imageDamages: state.damageReducer.damages
  };
};

export default withNamespaces("common")(
  withStyles(styles)(connect(mapStateToProps)(Image))
);
