import React, { Component } from "react";
import TopNav from "../../../../components/topnav/TopNav";
import Title from "../../../../components/title/Title";
import "./styles.scss";
import { withNamespaces } from "react-i18next";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { Divider } from "@material-ui/core";
import { connect } from "react-redux";
import { withSnackbar } from "notistack";
import Button from "@material-ui/core/Button";
import { SvgLoader, SvgProxy } from "react-svgmt";
import { Redirect, Link } from "react-router-dom";
import { selectedPoses, store_analysis_results } from "../../../../actions";
import Analysis_Details from "../analysis-details/AnalysisDetails";
import Tooltip from "@material-ui/core/Tooltip";
import { getReportInput } from "../../components/Utils";
import { fullPartList } from "../../../../constants";
import { post } from "../../../../api/http_proxy";
import { addReportId } from "../../../../actions";
import { Loading } from "../../components";
import uuid from "uuid";
var available_parts = require("./damages.json");
var final_damaged_parts = [];
var results = [];
// var that
const styles = (theme) => ({
  root: {
    flexGrow: 1,
  },
});

const svg = require("./car.svg");

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tooltip: "",
      selectors: [],
      navigateTo: null,
      isLoading: false,
      isCompleted: false,
    };
    this.mouseEnter = this.mouseEnter.bind(this);
    // this.partDisplay = this.partDisplay.bind(this);
  }

  postEstimateData = async (reportInput) => {
    // this.setState({ isLoading: true });
    const url = process.env.REACT_APP_REPAIR_REPLACE_API_ENDPOINT;
    let appraisalId = null;
    if (this.props.modified) {
      appraisalId = this.props.clone.appraisalId;
    } else {
      appraisalId = this.props.clone.clonedFrom;
    }
    const reportId = uuid.v4();
    //this.setState({ reportId: reportId });
    this.props.addReportId(reportId);
    const payload = {
      report_id: reportId,
      appraisalId: appraisalId,
      user_id: this.props.userInfo.userId,
      report_input: {
        allDamages: reportInput,
      },
    };
    console.log("====================================");
    console.log("REVIEW INTRO REPORT ID ", reportId);
    console.log("====================================");

    const response = await post(url, payload);
    return response;
  };

  generateReport = async () => {
    console.log("GENERATE REPORT");
    if (this.props.damages.length > 0 && this.props.images.length > 0) {
      this.setState({ isLoading: true });
      console.log("In Generate Report");
      const reportInput = getReportInput(this.props.clone, this.props.images);
      console.log("Report Input");
      console.log(reportInput);
      if (reportInput && reportInput.length > 0) {
        const resp = await this.postEstimateData(reportInput);
        console.log("Estimate Response");
        console.log(resp);

        if (
          (typeof resp.data === "string" &&
            resp.data.includes("Internal server error")) ||
          (resp.hasOwnProperty("ok") && resp.ok === false)
        ) {
          this.setState({ isPostReport: false });
          this.props.enqueueSnackbar(
            this.props.t("home.analysis-images.try-again"),
            { variant: "error", autoHideDuration: 3000 }
          );
        } else {
          console.log("redirect to estimation");
          this.setState({ isCompleted: true, isPostReport: false });
        }
      } else {
        this.props.enqueueSnackbar(
          this.props.t("home.analysis-images.error1"),
          { variant: "warning", autoHideDuration: 4000 }
        );
        this.setState({ isPostReport: false, isLoading: false });
      }
    } else {
      this.props.enqueueSnackbar(this.props.t("home.analysis-images.error1"), {
        variant: "warning",
        autoHideDuration: 4000,
      });
    }
  };

  changed() {
    console.log(arguments);
  }

  componentDidMount() {
    console.log("BUTTERFLY PROPS");
    console.log(this.props);
    console.log(this.props.damages);
    console.log(this.props.images);
    // var res = parts.map((itm) => this.support(itm))
    var parts = this.props.damages.map((itm) =>
      this.support(itm.partSource, itm.shape[0].imageId, true)
    );
    var poses = this.props.images
      .filter((img) => img.contentType === "damage")
      .map((itm) => this.support(itm.userPose, itm.imageId));
    // var result = createUsaPartDisplay("rear_back_glass" , poses)
    console.log("PARTS AND POSES");
    console.log(parts);
    console.log(poses);
    var final_parts = [...new Set(parts.map((itm) => itm.damage))].map(
      (item) => {
        let ids = parts
          .filter((itm) => itm.damage === item)
          .map((itm) => itm.id);
        let id = ids.filter((item, id) => ids.indexOf(item) === id);
        return {
          damage: parts.find((itm) => itm.damage === item).damage,
          id: id,
          poses: [],
          decision: "",
          damage_part: null,
        };
      }
    );
    for (let i = 0; i < final_parts.length; i++) {
      for (let j = 0; j < poses.length; j++) {
        let temp = final_parts[i]["id"];
        for (let k = 0; k < temp.length; k++) {
          if (final_parts[i]["id"][k] === poses[j].id) {
            final_parts[i].poses.push(poses[j].pose);
          }
        }
      }
      let temp = final_parts[i].damage.replace(/ /g, "_");
      if (typeof available_parts[temp] === "string") {
        final_parts[i].damage_part = available_parts[temp];
      } else {
        var dummy = final_parts[i].poses[0];
        final_parts[i].damage_part = available_parts[temp][dummy];
      }
    }
    results = final_parts;
    final_damaged_parts = final_parts.map((item) => item.damage_part);
    console.log(final_damaged_parts);
    this.setState({
      selectors: final_damaged_parts,
    });
  }
  support = (itm, id, flag) => {
    if (flag) {
      var parts = fullPartList.filter(
        (item) => item.code === parseInt(itm.typeCode)
      );
      parts = parts.length > 0 ? parts[0].key : itm.type;
      console.log("parts", parts, itm);
      return {
        damage: parts,
        id: id,
      };
    } else {
      return {
        pose: itm,
        id: id,
      };
    }
  };
  mouseEnter(e) {
    var paths = e.getElementsByTagName("path");
    var ploy = e.getElementsByTagName("polygon");
    var that = this;
    console.log("../path",paths)
    for (let i = 0; i < paths.length; i++) {
      paths[i].addEventListener("mouseenter", function () {
        that.setState({
          tooltip: paths[i].id.replace(/-/g, " "),
        });
        // console.log(paths[i].id);
      });
    }
    for (let i = 0; i < ploy.length; i++) {
      ploy[i].addEventListener("mouseenter", function () {
        that.setState({
          tooltip: ploy[i].id.replace(/-/g, " "),
        });
        // console.log(ploy[i].id);
      });
    }
  }

  render() {
    const { t } = this.props;
    if (this.state.navigateTo) {
      return <Redirect push to={this.state.navigateTo} />;
    }

    if (this.state.isCompleted && !this.props.userInfo.isUnderwriting) {
      return <Redirect push to="/estimation" />;
      // return <Redirect push to="/analysis" />;
    }

    if (this.state.isLoading === true) {
      return <Loading notification={t("general.creating-report")} />;
    }
    return (
      <div className="odometer-container">
        <TopNav
          backType="backward"
          hasMore
          goBack={() => this.props.history.goBack()}
        />
        <div className="content">
          <Title
            title={t("home.analysis.title")}
            // subtitle={t("home.analysis.subtitle")}
          />
          <div
            onClick={
              null
              //   (e) => {
              //   let selected = results[results.map((item) => item.damage_part === e.target.id).indexOf(true)]
              //   console.log(e.target.id)
              //   if (selected) {
              //     console.log(selected)
              //     this.props.store_analysis_results(selected)
              //     this.setState({
              //       navigateTo: '/analysis-images'
              //     })
              //   }
              // }
            }
            style={{ margin: "5% 2%" }}
          >
            <Tooltip title={this.state.tooltip} placement="top">
              <SvgLoader path={svg} onSVGReady={this.mouseEnter}>
                {this.state.selectors.map((selector, ix) => (
                  <SvgProxy
                    key={ix}
                    selector={"#" + selector}
                    // fill="#ff3838"
                    fill="#f4cdcc"
                  />
                ))}
              </SvgLoader>
            </Tooltip>
            {/* <div className='report_button_wrapper'>
              <Button variant="contained" className="report_button"
                onClick={() => {
                  this.props.userInfo.isUnderwriting ? this.setState({ navigateTo: "/report" }) : this.generateReport();
                }}
              >
                {t("home.analysis.view-report")}
              </Button>
            </div> */}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userInfo: state.userReducer.userInfo,
    damages: state.damageReducer.damages,
    images: state.resultReducer.images,
    clone: state.resultReducer.clonedAppraisal,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    selectedPoses: (poses) => dispatch(selectedPoses(poses)),
    store_analysis_results: (arg) => dispatch(store_analysis_results(arg)),
    addReportId: (reportId) => dispatch(addReportId(reportId)),
  };
};

export default withNamespaces("common")(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(withSnackbar(App)))
);
