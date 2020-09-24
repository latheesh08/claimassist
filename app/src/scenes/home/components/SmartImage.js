import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { Grid, Icon, IconButton } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import { withStyles } from "@material-ui/core/styles";
import LazyLoad from "react-lazyload";
import { CircularProgress } from "@material-ui/core";
import "./styles.scss";

const styles = (theme) => ({
  root: {
    flexGrow: 1,
    minHeight: 100,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "#f7f7f7",
    // borderRadius: 5
    // paddingTop: theme.spacing(1)
  },
  hidden: {
    display: "none",
  },
  progress: {
    // display: "block"
  },
  icon: {
    color: "#ccc",
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
    color: "white",
  },
  editIcon: {
    fontSize: "large",
  },
});

class SmartImage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      loading: true,
      slowLoad: false,
    };
    this.imageRef = React.createRef();
  }
  idgenerator = (id) => {
    let id_name = `claim_item_${id}`;
    return id_name;
  };

  getAgent = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    let device = "default";
    let browser = "default";
    let version = [];
    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
      device = "Windows Phone";
    }

    if (/android/i.test(userAgent)) {
      device = "Android";
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      device = "iOS";
    }

    if (/Macintosh/i.test(userAgent)) {
      device = "Macintosh";
    }

    if (/Chrome/i.test(userAgent)) {
      version = userAgent
        .split("Chrome")[1]
        .split(" ")[0]
        .replace("/", "")
        .split(".")
        .map((item) => {
          return Number(item);
        });
      browser = "Chrome";
    }

    return {
      device: device,
      browser: browser,
      version: version,
    };
  };

  imageUrlLoaded = (e) => {
    var img = document.getElementById(this.props.image.imageId);

   if(img !== null){
    console.log("=================image===================");
    console.log(img);
    const agentData = this.getAgent();
    let orientation = "";
    if (
      this.props.hasOwnProperty("image") &&
      this.props.image.hasOwnProperty("orientation") &&
      this.props.image.orientation !== 1
    ) {
      orientation = this.props.image.orientation;
      if (
        agentData.device === "iOS" ||
        (agentData.browser === "Chrome" && agentData.device === "Android") ||
        (agentData.browser === "Chrome" &&
          agentData.device === "Macintosh" &&
          agentData.version.length > 0 &&
          agentData.version[0] > 80)
      ) {
        img.classList.add("imageScale");
      } else {
        img.classList.add("image" + orientation);
      }
    }

    this.setState({ loaded: true, loading: false, slowLoad: false });
    img.style.display = "block";
    // let icon = document.getElementById('icon_' + this.props.image.imageId);
    // icon.style.display = "none";
    // let progress = document.getElementById('progress_' + this.props.image.imageId);
    // progress.style.display = "none";
    // console.log("====================================");
    if (this.props.loadCallback && this.imageRef.current != null) {
      const { clientWidth, clientHeight } = this.imageRef.current;
      this.props.loadCallback({ width: clientWidth, height: clientHeight });
    }
   }
  };

  componentDidMount = async () => {
    if (this.props.resize === true) {
      window.addEventListener("resize", (resize) => {
        this.imageUrlLoaded();
      });
    } else {
      window.removeEventListener("resize", (resize) => {});
    }
    setTimeout(
      function () {
        this.setState({ loading: false });
        if (!this.state.loaded) {
          this.setState({ slowLoad: true });
        }
      }.bind(this),
      10000
    );
  };

  render() {
    const { classes, image } = this.props;
    // console.log("====================================");
    // console.log("SMART IMAGE");
    // console.log(image);
    // console.log("====================================");
    let id = "";
    let url = "";
    if (image) {
      if (image.hasOwnProperty("imageId")) {
        id = image.imageId;
      }

      if (image.hasOwnProperty("url")) {
        url = image.url;
      } else if (
        image.hasOwnProperty("dataStore") &&
        image.dataStore.hasOwnProperty("url")
      ) {
        url = image.dataStore.url;
      }
    }

    if (this.state.editDamages === true) {
      return (
        <Redirect
          push
          to={{
            pathname: "/review-image",
            state: { imageId: id, boxIndex: 0 },
          }}
        />
      );
    }

    return (
      <Grid container className={classes.root}>
        <LazyLoad height={200} overflow>
          <img
            id={id}
            src={url}
            alt=""
            className="image"
            ref={this.imageRef}
            onLoad={this.imageUrlLoaded}
          />
        </LazyLoad>
        {this.state.loading ? (
          <CircularProgress
            id={`progress_${id}`}
            className={classes.progress}
          />
        ) : null}
        {this.state.slowLoad ? (
          <Icon id={`icon_${id}`} className={classes.icon}>
            directions_car
          </Icon>
        ) : null}
        {this.props.edit ? (
          <IconButton
            className={classes.editButton}
            color="primary"
            size="small"
            // onClick={() => this._editDamage(image.imageId)}
          >
            <EditIcon className={classes.editIcon} />
          </IconButton>
        ) : null}
      </Grid>
    );
  }
}

export default withStyles(styles)(SmartImage);
