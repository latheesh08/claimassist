import React, { Component, Fragment } from "react";
import { Title, TopNav } from "../../../../components";
import { Redirect } from "react-router-dom";
import Link from "@material-ui/core/Link";
import {
  Icon,
  Grid,
  Divider,
  Typography,
  CircularProgress,
  Input
} from "@material-ui/core";
import { Alert } from "reactstrap";
import Popup from "../../../../components/Alert/Alert";
import MaterialTable from "material-table";
import {
  storeIncidentState,
  store_analysis_results,
} from "../../../../actions";
import "./styles.scss";
import { connect } from "react-redux";
import { withSnackbar } from "notistack";
import { withNamespaces } from "react-i18next";
import { createUsaPartDisplay } from "../../components/Utils";
import { get, sendData, actionClaimLevel } from "../../../../api/http_proxy";
import { Loading } from "../../components";

// const ExcelFile = ReactExport.ExcelFile;
// const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
// const { height, width } = useWindowDimensions();

class Estimation extends Component {
  state = {
    name: "",
    model: "",
    year: 0,
    claimID: "",
    columns: [],
    data: [],
    report: [],
    totalClaimEstimate: 0,
    estimateModified: false,
    download: false,
    initialized: false,
    estimation: {},
    navigateTo: null,
    uniquePartsAndDecisions: [],
    isLoading: false,
    showPopup: false,
  };

  columns = () => {
    const t = this.props.t;
    return [
      { title: t("home.report.table-part"), field: "part", editable: "never" },
      {
        title: t("home.report.table-damage"),
        field: "damages",
        editable: "never",
      },
      {
        title: t("home.estimation.decision"),
        field: "decision",
        lookup: { repair: "Repair", replace: "Replace" },
      },
      {
        title: t("home.estimation.glass-labor"),
        field: "glassLaborHours",
        type: "numeric",
      },
      {
        title: t("home.estimation.part-labor"),
        field: "partLaborHours",
        type: "numeric",
      },
      {
        title: t("home.estimation.paint-labor"),
        field: "paintLaborHours",
        type: "numeric",
      },
      {
        title: t("home.estimation.hazardous-waste-amt"),
        field: "hazardousWasteAmount",
        type: "numeric",
      },
      {
        title: t("home.estimation.paint-labor-amt"),
        field: "paintAmount",
        type: "numeric",
      },
      {
        title: t("home.estimation.paint-supply-amt"),
        field: "totalMaterialAmount",
        type: "numeric",
      },
      {
        title: t("home.estimation.total-labor-amt"),
        field: "totalLaborAmount",
        type: "numeric",
      },
      {
        title: t("home.estimation.part-price"),
        field: "actualPartPrice",
        type: "numeric",
      },
    ];
  };

  postEstimate = async () => {
    console.log("In Pose Estimate");

    const data = {
      appraisalId: this.props.appraisal.appraisalId,
      reportAsJson: this.state.estimation,
      createdFor: this.props.userInfo.userId,
      createdBy: this.props.userInfo.userId,
      comment: "user edited",
    };
    console.log(process.env.REACT_APP_REPAIR_REPLACE_API_ENDPOINT);
    console.log(data);
    const response = await sendData(
      "POST",
      process.env.REACT_APP_REPAIR_REPLACE_API_ENDPOINT,
      data,
      this.props.userInfo
    );
    if (!response.error) {
      this.props.enqueueSnackbar("Estimate was saved successfully", {
        variant: "success",
        autoHideDuration: 2000,
      });
      this.setState({ estimateModified: false });
    } else {
      this.props.enqueueSnackbar(
        "There was a problem with saving your changes, please try again",
        { variant: "error", autoHideDuration: 2000 }
      );
      this.setState({ estimateModified: true });
    }
  };

  getAlgoEstimation = async (appraisalId, userInfo) => {
    console.log("Get reports for the following appraisal, ", appraisalId);

    const url =
      process.env.REACT_APP_REPAIR_REPLACE_API_ENDPOINT +
      `?appraisalId=${appraisalId}`;
    const response = await get(url, userInfo);
    console.log("GET LATEST ESTIMATE RESPONSE");
    console.log(response);

    if (response.error) {
      console.log("ERROR GETTING LATEST ESTIMATE");
      console.log(response.error);
      return null;
    } else {
      return response.data;
    }
  };

  parseAlgoOutput = (algoOutput) => {
    let report = [];

    for (var i = 0; i < algoOutput.damagedParts.length; i++) {
      let damagedPart = algoOutput.damagedParts[i];
      // const partDisplay = createUsaPartDisplay(damagedPart.part, damagedPart.finalPose);
      let partError = null;
      let decision =
        damagedPart.hasOwnProperty("userDecision") &&
        damagedPart.userDecision.length > 0
          ? damagedPart.userDecision
          : damagedPart.decision;

      let glassLaborHours =
        damagedPart.hasOwnProperty("estimates") &&
        damagedPart.estimates &&
        damagedPart.estimates.hasOwnProperty("glassLaborHours")
          ? damagedPart.estimates.glassLaborHours
          : 0;
      let paintLaborHours =
        damagedPart.hasOwnProperty("estimates") &&
        damagedPart.estimates &&
        damagedPart.estimates.hasOwnProperty("paintLaborHours")
          ? damagedPart.estimates.paintLaborHours
          : 0;
      let partLaborHours =
        damagedPart.hasOwnProperty("estimates") &&
        damagedPart.estimates &&
        damagedPart.estimates.hasOwnProperty("partLaborHours")
          ? damagedPart.estimates.partLaborHours
          : 0;
      let hazardousWasteAmount =
        damagedPart.hasOwnProperty("estimates") &&
        damagedPart.estimates &&
        damagedPart.estimates.hasOwnProperty("hazardousWasteAmount")
          ? damagedPart.estimates.hazardousWasteAmount
          : 0;
      let paintAmount =
        damagedPart.hasOwnProperty("estimates") &&
        damagedPart.estimates &&
        damagedPart.estimates.hasOwnProperty("paintAmount")
          ? damagedPart.estimates.paintAmount
          : 0;
      let totalMaterialAmount =
        damagedPart.hasOwnProperty("estimates") &&
        damagedPart.estimates &&
        damagedPart.estimates.hasOwnProperty("totalMaterialAmount")
          ? damagedPart.estimates.totalMaterialAmount
          : 0;
      let totalLaborAmount =
        damagedPart.hasOwnProperty("estimates") &&
        damagedPart.estimates &&
        damagedPart.estimates.hasOwnProperty("totalLaborAmount")
          ? damagedPart.estimates.totalLaborAmount
          : 0;
      let actualPartPrice =
        damagedPart.hasOwnProperty("estimates") &&
        damagedPart.estimates &&
        damagedPart.estimates.hasOwnProperty("actualPartPrice")
          ? damagedPart.estimates.actualPartPrice
          : 0;

      let damages_array = [];
      let damage_obj = {};
      let damagesString = "";
      if (
        damagedPart.hasOwnProperty("damages") &&
        damagedPart.damages &&
        damagedPart.damages.length > 0
      ) {
        damages_array = damagedPart.damages.map((item) =>
          item.damage.replace(/_/g, " ")
        );
      }
      console.log(damages_array);
      damages_array.forEach(function (i) {
        damage_obj[i] = (damage_obj[i] || 0) + 1;
      });
      let damage_key = Object.keys(damage_obj);
      let damages_count = Object.values(damage_obj);
      damage_key.map((it, id) => {
        if (damages_count[id] > 1) {
          damagesString +=
            it.concat(" (" + damages_count[id].toString() + ")") + ", ";
        } else {
          damagesString += it + ", ";
        }
      });
      damagesString = damagesString.substring(0, damagesString.length - 2);
      console.log(damagesString);

      report.push({
        part: damagedPart.partPoseDisplay,
        damages: damagesString,
        decision: decision,
        glassLaborHours: parseFloat(glassLaborHours).toFixed(2),
        paintLaborHours: parseFloat(paintLaborHours).toFixed(2),
        partLaborHours: parseFloat(partLaborHours).toFixed(2),
        hazardousWasteAmount: parseFloat(hazardousWasteAmount).toFixed(2),
        paintAmount: parseFloat(paintAmount).toFixed(2),
        totalMaterialAmount: parseFloat(totalMaterialAmount).toFixed(2),
        totalLaborAmount: parseFloat(totalLaborAmount).toFixed(2),
        actualPartPrice: parseFloat(actualPartPrice).toFixed(2),
      });
    }

    return report;
  };

  updateIncidentState = async () => {
    console.log("in approve algo appraisal");
    const headers = {
      "Content-Type": "application/json",
      "x-galaxyai-role": this.props.userInfo.isSubmitter
        ? "submitter"
        : "admin",
    };
    const payload = {
      updatedBy: this.props.userInfo.userId,
      state: this.props.userInfo.isSupervisor ? "appraised" : "reviewed",
      type: this.props.currentIncident.type
    };
    let url = null;
    if (process.env.REACT_APP_INCIDENT_API_ENDPOINT.endsWith("/")) {
      url =
        process.env.REACT_APP_INCIDENT_API_ENDPOINT +
        this.props.currentIncident.incidentId;
    } else {
      url =
        process.env.REACT_APP_INCIDENT_API_ENDPOINT +
        "/" +
        this.props.currentIncident.incidentId;
    }

    const response = await sendData(
      "PUT",
      url,
      payload,
      this.props.userInfo,
      headers
    );
    console.log(response);
    if (!response.error) {
      this.props.enqueueSnackbar(
        this.props.t("home.estimation.appraisal-success"),
        { variant: "success", autoHideDuration: 2000 }
      );
    } else {
      this.props.enqueueSnackbar(
        this.props.t("home.estimation.appraisal-failure"),
        { variant: "error", autoHideDuration: 2000 }
      );
    }
  };

  calculateTotals = (report) => {
    report = report.filter((item) => item.part !== "Totals");
    let totals = {
      glassLaborHours: 0,
      paintLaborHours: 0,
      partLaborHours: 0,
      hazardousWasteAmount: 0,
      paintAmount: 0,
      totalMaterialAmount: 0,
      totalLaborAmount: 0,
      actualPartPrice: 0,
    };
    report.forEach(
      (rd) => (totals.glassLaborHours += parseFloat(rd.glassLaborHours))
    );
    report.forEach(
      (rd) => (totals.partLaborHours += parseFloat(rd.partLaborHours))
    );
    report.forEach(
      (rd) => (totals.paintLaborHours += parseFloat(rd.paintLaborHours))
    );
    report.forEach(
      (rd) =>
        (totals.hazardousWasteAmount += parseFloat(rd.hazardousWasteAmount))
    );
    report.forEach((rd) => (totals.paintAmount += parseFloat(rd.paintAmount)));
    report.forEach(
      (rd) => (totals.totalMaterialAmount += parseFloat(rd.totalMaterialAmount))
    );
    report.forEach(
      (rd) => (totals.totalLaborAmount += parseFloat(rd.totalLaborAmount))
    );
    report.forEach(
      (rd) => (totals.actualPartPrice += parseFloat(rd.actualPartPrice))
    );
    Object.keys(totals).forEach(function (key) {
      totals[key] = totals[key];
    });

    const subtotals = {
      part: "Totals",
      glassLaborHours: parseFloat(totals.glassLaborHours).toFixed(2),
      paintLaborHours: parseFloat(totals.paintLaborHours).toFixed(2),
      partLaborHours: parseFloat(totals.partLaborHours).toFixed(2),
      hazardousWasteAmount: parseFloat(totals.hazardousWasteAmount).toFixed(2),
      paintAmount: parseFloat(totals.paintAmount).toFixed(2),
      totalMaterialAmount: parseFloat(totals.totalMaterialAmount).toFixed(2),
      totalLaborAmount: parseFloat(totals.totalLaborAmount).toFixed(2),
      actualPartPrice: parseFloat(totals.actualPartPrice).toFixed(2),
    };

    const totalClaimEstimate = (
      parseFloat(totals.totalLaborAmount) + parseFloat(totals.actualPartPrice)
    ).toFixed(2);
    return {
      subtotals: subtotals,
      totalClaimEstimate: totalClaimEstimate,
    };
  };

  componentDidMount = async () => {
  console.log("ESTIMATION COMPONENT DID MOUNT PROPS");
  console.log(this.props);
  const { appraisal, currentIncident, t, userInfo } = this.props;
  const { make, model, year } = currentIncident.vehicles[0];
  const { incidentId } = this.props.currentIncident.incidentId;
   if(this.props.damages.length>0){

    this.setState({ notification: t("home.estimation.notification") });
    const estimation = await this.getAlgoEstimation(
      appraisal.appraisalId,
      userInfo
    );

    if (estimation) {
      const report = await this.parseAlgoOutput(estimation);
      const totals = await this.calculateTotals(report);
      report.push(totals.subtotals);
      console.log("data report", report);
      this.setState({
        make: make,
        model: model,
        year: year,
        estimation: estimation,
        columns: this.columns(),
        data: report,
        totalClaimEstimate: totals.totalClaimEstimate,
        claimID: incidentId,
        initialized: true,
      });
    } else {
      console.log("SOME SORT OF ERROR OCCURED GETTING ESTIMATION DATA");
      this.props.enqueueSnackbar(
        this.props.t("home.estimation.estimate-failure"),
        { variant: "error", autoHideDuration: 2000 }
      );
      this.handleGoBack();
    }
   }
   else{
     this.setState({
      make: make,
      model: model,
      year: year,
      claimID: incidentId,
      initialized: true,
     })
   }
  };

  handleYes = () => {
    this.setState({
      navigateTo: "/basic-info",
    });
  };

  handleNo = () => {
    this.props.history.goBack();
  };

  handleGoBack = () => {
    if (
      this.props.userInfo.isSupervisor === false &&
      this.props.userInfo.isReviewer === false
    ) {
      this.setState({ showPopup: true });
    } else {
      this.props.history.goBack();
    }
  };

  toggleDownload = () => {
    this.setState((prev) => ({ download: !prev.download }));
  };

  render() {

    const { currentIncident, t, userInfo } = this.props;

    if (this.state.initialized === false) {
      return <Loading notification={this.state.notification} />;
    }

   
    if (this.state.navigateTo) {
      return (
        <Redirect
          to={{
            pathname: this.state.navigateTo,
            state: {
              returnPath: "/estimation",
            },
          }}
        />
      );
    }

    const name =
      userInfo.hasOwnProperty("space") && userInfo.space.includes("hailpro")
        ? "Hailpro"
        : "Galaxy";
    const clientName = process.env.REACT_APP_CLIENT_NAME
      ? process.env.REACT_APP_CLIENT_NAME
      : "Galaxy";
    const subtitle = t("home.estimation.subtitle", { clientName: clientName });
    const basicInfoLinkText = t("home.estimation.basic-info-link", {
      clientName: clientName,
    });

    return (
      <div className="report-wrapper">
        <div className="content">
          <TopNav
            backType="backward"
            narrow
            hasMore
            goBack={()=>this.handleGoBack()}
          />
          <Popup
            open={this.state.showPopup}
            message={t("home.estimation.popup-message")}
            noText={t("home.estimation.popup-no")}
            yesText={t("home.estimation.popup-yes")}
            handleYes={this.handleYes}
            handleNo={this.handleNo}
          />
          <div className="report-container">
            <Title title={t("home.estimation.title")} subtitle={subtitle} />
            {/* {
              userInfo.isSupervisor === false && userInfo.isReviewer === false ? (
                <Grid className="link-navigation-container" style={{ marginBottom: '20px' }} container onClick={() => this.setState({ navigateTo: '/basic-info' })}>
                  <Alert color="info"><Link to='/basic-info' className="link-button">{basicInfoLinkText}</Link></Alert>
                </Grid>
              ) : null
            } */}
            <div className="car-specs">
              <div className="info">
                {/* <label className="name">{this.state.make}</label> */}
                <label className="name">
                  {this.state.make +
                    " " +
                    this.state.model +
                    " " +
                    this.state.year}
                </label>
              </div>
              <div className="claim">
                {t("home.estimation.claim-id")}:{" "}
                <label className="id">{currentIncident.incidentId}</label>
              </div>
            </div>
            {this.state.data.length > 1 ? (
              <div>
                <div className="car-estimation-table">
                  <MaterialTable
                    options={{
                      search: false,
                      paging: false,
                      toolbar: false,
                      editable: false,
                    }}
                    columns={this.state.columns}
                    data={this.state.data}
                    editable={
                      userInfo.isSubmitter
                        ? null
                        : {
                            isEditable: (rowData) => {
                              return (
                                rowData.part !== "Totals" &&
                                rowData.part !== "Total Claim Estimate"
                              );
                            },
                            onRowUpdate: (newData, oldData) =>
                              new Promise((resolve) => {
                                setTimeout(() => {
                                  resolve();
                                  if (oldData) {
                                    console.log("the row was updated");
                                    console.log(newData);
                                    this.setState((prevState) => {
                                      const estimation = {
                                        ...prevState.estimation,
                                        damagedParts: prevState.estimation.damagedParts.map(
                                          (item) => {
                                            if (
                                              item.partPoseDisplay ===
                                              newData.part
                                            ) {
                                              return {
                                                ...item,
                                                decision: newData.decision,
                                                estimates: {
                                                  ...item.estimates,
                                                  glassLaborHours:
                                                    newData.glassLaborHours,
                                                  paintLaborHours:
                                                    newData.paintLaborHours,
                                                  partLaborHours:
                                                    newData.partLaborHours,
                                                  hazardousWasteAmount:
                                                    newData.hazardousWasteAmount,
                                                  paintAmount:
                                                    newData.paintAmount,
                                                  totalMaterialAmount:
                                                    newData.totalMaterialAmount,
                                                  totalLaborAmount:
                                                    newData.totalLaborAmount,
                                                  actualPartPrice:
                                                    newData.actualPartPrice,
                                                },
                                              };
                                            } else {
                                              return item;
                                            }
                                          }
                                        ),
                                      };
                                      console.log(estimation);
                                      const data = [...prevState.data];
                                      data[data.indexOf(oldData)] = newData;
                                      const totals = this.calculateTotals(data);
                                      console.log("RECALCULATE TOTALS");
                                      console.log(totals);
                                      console.log(data[data.length - 1]);
                                      data[data.length - 1] = totals.subtotals;
                                      return {
                                        ...prevState,
                                        estimateModified: true,
                                        data,
                                        estimation,
                                        totalClaimEstimate:
                                          totals.totalClaimEstimate,
                                      };
                                    });
                                  } else {
                                    console.log("the row was NOT updated");
                                  }
                                }, 600);
                              }),
                          }
                    }
                  />
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <span>
                    Total Claim Estimate: {this.state.totalClaimEstimate}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: "20px",marginTop:"20px" }}>
              <span>
              No damages found
              </span></div>
            )}
            <div style={{ marginBottom: "20px" }}>
              {this.state.estimation.claimSeverity !== null ? (
                <span>
                  {t("home.estimation.claimlevel")}:{" "}
                  {this.state.estimation.claimSeverity === 0
                    ? t("home.estimation.type0")
                    : t("home.estimation.type1")}
                </span>
              ) : null}
            </div>

            {userInfo.isSupervisor && (
              <div>
                {/* <Grid item xs={12}>
                  <Divider variant="fullWidth" />
                </Grid> */}
                <div>
                  <Input
                    style={{ flexWrap: "wrap", marginBottom:"20px"}}
                    placeholder={t("home.estimation.claim-level-comment")}
                    value={this.state.comment}
                    fullWidth
                    onChange={(evt) => {
                      this.setState({ comment: evt.target.value });
                    }}
                  />
                </div>
              </div>
            )}
            <Grid container spacing={2}>
              {(userInfo.isSupervisor || userInfo.isReviewer) &&
              this.state.estimateModified ? (
                <Fragment>
                  <Grid item xs={12}>
                    <Divider variant="fullWidth" />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    container
                    direction="row"
                    alignContent="center"
                    // className={classes.footerRow}
                    onClick={this.postEstimate}
                  >
                    <Grid item xs={2}>
                      <Icon className="save-icon">save</Icon>
                    </Grid>
                    <Grid item xs={10} container alignContent="center">
                      <Link
                        variant="body2"
                        // className={classes.vehicleName}
                        component="button"
                      >
                        {t("home.estimation.save-estimate")}
                      </Link>
                      <Grid item xs={12}>
                        <Typography variant="caption">
                          {t("home.estimation.save-estimate-description")}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Fragment>
              ) : null}

              {userInfo.isSupervisor || userInfo.isReviewer ? (
                <Fragment>
                  <Grid item xs={12}>
                    <Divider className="divider" variant="fullWidth" />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    container
                    direction="row"
                    alignContent="center"
                    className="footerRow"
                    onClick={this.updateIncidentState}
                  >
                    <Grid item xs={2}>
                      {this.state.isLoading ? (
                        <CircularProgress />
                      ) : (
                        <Icon className="approve-icon">thumb_up</Icon>
                      )}
                    </Grid>
                    <Grid item xs={10} container alignContent="center">
                      {/* <Link variant="body2" className={classes.vehicleName} component="button"> Approve Appraisal</Link> */}
                      {userInfo.isSupervisor ? (
                        <div>
                          <Link variant="body2" component="button">
                            {t("home.estimation.approve")}
                          </Link>
                          <Grid item xs={12}>
                            <Typography variant="caption">
                              {t("home.estimation.approve-message")}
                            </Typography>
                          </Grid>
                        </div>
                      ) : (
                        <div>
                          <Link variant="body2" component="button">
                            {t("home.estimation.reviewed")}
                          </Link>
                          <Grid item xs={12}>
                            <Typography variant="caption">
                              {t("home.estimation.reviewed-message")}
                            </Typography>
                          </Grid>
                        </div>
                      )}
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider className="divider" variant="fullWidth" />
                  </Grid>
                </Fragment>
              ) : null}
            </Grid>
            <Grid container spacing={8}>
              {userInfo.isSupervisor === false &&
              userInfo.isReviewer === false ? (
                <Grid
                  item
                  className="link-navigation-container"
                  style={{ marginBottom: "20px" }}
                  container
                  onClick={() => this.setState({ navigateTo: "/basic-info" })}
                >
                  <Alert color="info">
                    <Link className="link-button">{basicInfoLinkText}</Link>
                  </Alert>
                </Grid>
              ) : (
                <Grid
                  item
                  className="link-navigation-container"
                  style={{ marginTop: "20px" }}
                  container
                  onClick={() => this.setState({ navigateTo: "/home" })}
                >
                  <Link className="link-button">
                    {userInfo.isUnderwriting
                      ? t("home.estimation.return-policies")
                      : t("home.estimation.return-claims")}
                  </Link>
                </Grid>
              )}
            </Grid>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    currentIncident: state.incidentReducer.currentIncident,
    userInfo: state.userReducer.userInfo,
    modified: state.damageReducer.modified,
    damages: state.damageReducer.damages,
    appraisal: state.resultReducer.appraisal,
    clone: state.resultReducer.clonedAppraisal,
    parts: state.resultReducer.parts,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    store_analysis_results: (arg) => dispatch(store_analysis_results(arg)),
    storeIncidentState: (idtState) => dispatch(storeIncidentState(idtState)),
  };
};

export default withNamespaces("common")(
  connect(mapStateToProps, mapDispatchToProps)(withSnackbar(Estimation))
);
