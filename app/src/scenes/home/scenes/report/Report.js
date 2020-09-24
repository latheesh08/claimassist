import React, { Component, Fragment } from "react";
import { Title, TopNav } from "../../../../components";
import { Redirect } from "react-router-dom";
import Link from "@material-ui/core/Link";
// import TopNav from '../../../../components/topnav/TopNav';
import { Icon, Grid, Divider, Typography, CircularProgress } from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { Alert } from 'reactstrap';
import "./styles.scss";
import { connect } from "react-redux";
import { withSnackbar } from "notistack";
import { withNamespaces } from "react-i18next";
import { getDamageReport } from "./Utils";
import { sendData, get } from "../../../../api/http_proxy";

import ReactExport from "react-export-excel";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
// const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

class Report extends Component {
  state = {
    name: "Mercedes Benz",
    model: "C-Class",
    year: 2014,
    claimID: "DSFL3249LL",
    report_data: [],
    download: false,
    excel_data: [],
    navigateTo: null
  };

  titleCase = text => {
    console.log(text);
    return text
      .split(" ")
      .map(item => item[0].toUpperCase() + item.substr(1, item.length))
      .join(" ");
  };

  title = text => {
    return text[0].toUpperCase() + text.substr(1, text.length);
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
      return null
    } else {
      return response.data
    }
  }

  parseReportData = data => { 

    return data.damagedParts.map(damagedPart => {
      let damages_array = [];
      let damage_obj = {};
      let damagesString = "";
      if (damagedPart.hasOwnProperty("damages") && damagedPart.damages && damagedPart.damages.length > 0) {
        damages_array = damagedPart.damages.map(item => item.damage.replace(/_/g, " "));
      }
      console.log(damages_array);
      damages_array.forEach(function (i) { damage_obj[i] = (damage_obj[i] || 0) + 1; });
      let damage_key = Object.keys(damage_obj)
      let damages_count = Object.values(damage_obj)
      damage_key.map((it, id) => {
        if (damages_count[id] > 1) {
          damagesString += it.concat(" (" + damages_count[id].toString() + ")") + ", ";
        } else {
          damagesString += it + ", ";
        }
      });
      damagesString = damagesString.substring(0, damagesString.length - 2)
      console.log(damagesString);

      return {
        part : damagedPart.partPoseDisplay,
        damages : damagesString
      }
    })
    
  }

  componentDidMount = async () => {
    console.log("REPORT PROPS");
    console.log(this.props);
    const { currentIncident, clone, appraisal, userInfo } = this.props;
    const { make, model, year } = currentIncident.vehicles[0];
    const incidentId = currentIncident.incidentId;

    // const reportData = getDamageReport(this.props.damages, currentIncident.images);
    // const { reportData } = this.props.location.state;
    const reportData = await this.getAlgoEstimation(appraisal.appraisalId, userInfo);
    console.log("REPORT DATA");
    console.log(reportData);

    // console.log(this.titleCase(make));

    const parts = clone && clone.hasOwnProperty("parts") && clone.parts.length > 0 ? clone.parts : [];

    const partData =
      parts !== null
        ? parts
          .filter(
            item =>
              item.decision === "Replace" ||
              item.decision === "Repair"
          )
          .map(item => {
            return {
              cost: item.amtTot,
              todo: item.decision,
              part: this.title(item.type),
              damages: item.damageSummary
                .split(",")
                .map(_item => this.title(_item))
            };
          })
        : null;

    const severity = clone && clone.hasOwnProperty("maxSeverity") ? clone.maxSeverity : '';

    // const excelData = reportData.map(item => {
    //   return [
    //     {
    //       value: item.part,
    //       style: {
    //         font: { sz: 12 },
    //         border: {
    //           top: { style: "thin", color: "black" },
    //           bottom: { style: "thin", color: "black" },
    //           left: { style: "thin", color: "black" },
    //           right: { style: "thin", color: "black" }
    //         }
    //       }
    //     },
    //     {
    //       value: item.damages.join(", "),
    //       style: {
    //         font: { sz: 12 },
    //         border: {
    //           top: { style: "thin", color: "black" },
    //           bottom: { style: "thin", color: "black" },
    //           left: { style: "thin", color: "black" },
    //           right: { style: "thin", color: "black" }
    //         }
    //       }
    //     }
    //   ];
    // });

    // const excelDataset = [
    //   {
    //     columns: [""],
    //     data: [
    //       [
    //         {
    //           value: `Claim ID: ${currentIncident.incidentId}`,
    //           style: { font: { sz: 12, bold: true } }
    //         }
    //       ],
    //       [
    //         {
    //           value: `Claim Severity: ${severity}`,
    //           style: { font: { sz: 12, bold: true } }
    //         }
    //       ]
    //     ]
    //   },
    //   {
    //     columns: ["Part", "Damage"],
    //     data: excelData,
    //     ySteps: 1
    //   }
    // ];

    console.log("====================================");
    // console.log("REPORT DATA");
    // console.log(report_data);
    console.log("PART DATA");
    console.log(partData);
    console.log("====================================");

    this.setState({
      // make: this.titleCase(make),
      // model: this.titleCase(model),
      // year: this.titleCase(year),
      make: make,
      model: model,
      year: year,
      report_data: this.parseReportData(reportData),
      // excel_data: excelDataset,
      claimID: incidentId
    });
  }

  toggleDownload = () => {
    this.setState(prev => ({ download: !prev.download }));
  };

  updateIncidentState = async () => {
    console.log("in approve algo appraisal");
    const headers = {
      "Content-Type": "application/json",
      "x-galaxyai-role": this.props.userInfo.isSubmitter ? "submitter" : "admin"
    };
    const data = {
      updatedBy: this.props.userInfo.userId,
      state: this.props.userInfo.isSupervisor ? "appraised" : "reviewed",
      type: this.props.currentIncident.type
    }
    const url = process.env.REACT_APP_INCIDENT_API_ENDPOINT + this.props.currentIncident.incidentId;
    const response = await sendData('PUT', url, data, this.props.userInfo, headers);
    console.log(response);
    if (!response.error) {

      this.props.enqueueSnackbar(
        this.props.t('home.estimation.appraisal-success'),
        { variant: "success", autoHideDuration: 2000 }
      );
    } else {
      console.log("SOME SORT OF ERROR OCCURED UPDATING THE INCIDENT STATE");
      this.props.enqueueSnackbar(
        this.props.t('home.estimation.appraisal-failure'),
        { variant: "error", autoHideDuration: 2000 }
      );
    }
  };

  render() {
   

    console.log("PROPS");
    console.log(this.props);

    const { report_data } = this.state;
    const { t, clone, userInfo, currentIncident } = this.props;

    const severity = clone && clone.hasOwnProperty("maxSeverity") ? clone.maxSeverity : '';
    // appraisals && appraisals.length === 1
    //   ? this.title(appraisals[0].maxSeverity)
    //   : null;
    const clientName = process.env.REACT_APP_CLIENT_NAME ? process.env.REACT_APP_CLIENT_NAME : 'Galaxy';
    const basicInfoLinkText = t("home.estimation.basic-info-link", { clientName : clientName})

    // let total_cost = 0;
    // report_data.forEach(rd => (total_cost += rd.cost));

    if (this.state.navigateTo) {
      return <Redirect
        to={{
          pathname: this.state.navigateTo,
          state: {
            returnPath: '/report'
          }
        }}
      />;
    }

    return (
      <div className="report-wrapper">
        <div className="content">
          <TopNav
            backType="backward"
            title="View Report"
            narrow
            hasMore
            goBack={() => this.props.history.goBack()}
          />
          <div className="report-container">
            <div className="car-specs">
              <div className="info">
                <label className="name">
                  {this.state.make +
                    " " +
                    this.state.model +
                    " " +
                    this.state.year}
                </label>
              </div>
              <div className="claim">
                {(this.props.userInfo.isUnderwriting) ? 'PolicyID' : 'ClaimID'}  : <label className="id">{this.state.claimID}</label>
              </div>
            </div>
            <div className="policy-report-table">
              <Table id="galaxyai-policy-report-table">
                <TableHead>
                  <TableRow>
                    <TableCell>{t("home.report.table-part")}</TableCell>
                    <TableCell>{t("home.report.table-damage")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report_data.map((row, index) => {
                    return (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row">
                          {row.part}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {row.damages}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                </TableBody>
              </Table>
            </div>
            {(userInfo.isSupervisor && currentIncident.state !== 'appraised') ? (
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
                    {
                      this.state.isLoading ? (
                        <CircularProgress />
                      ) : (
                          <Icon className="approve-icon">thumb_up</Icon>
                        )
                    }
                  </Grid>
                  <Grid item xs={10} container alignContent="center">
                    {/* <Link variant="body2" className={classes.vehicleName} component="button"> Approve Appraisal</Link> */}
                    <div>
                      <Link variant="body2" component="button">{t("home.estimation.approve")}</Link>
                      <Grid item xs={12}>
                        <Typography variant="caption">
                          {t("home.estimation.approve-message")}
                        </Typography>
                      </Grid>
                    </div>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Divider className="divider" variant="fullWidth" />
                </Grid>
              </Fragment>
            ) : null}
            {(userInfo.isReviewer && currentIncident.state !== 'reviewed') ? (
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
                    {
                      this.state.isLoading ? (
                        <CircularProgress />
                      ) : (
                          <Icon className="approve-icon">thumb_up</Icon>
                        )
                    }
                  </Grid>
                  <Grid item xs={10} container alignContent="center">
                    {/* <Link variant="body2" className={classes.vehicleName} component="button"> Approve Appraisal</Link> */}
                    <div>
                      <Link variant="body2" component="button">{t("home.estimation.reviewed")}</Link>
                      <Grid item xs={12}>
                        <Typography variant="caption">
                          {t("home.estimation.reviewed-message")}
                        </Typography>
                      </Grid>
                    </div>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Divider className="divider" variant="fullWidth" />
                </Grid>
              </Fragment>
            ) : null}
            {
              userInfo.isSupervisor === false && userInfo.isReviewer === false ? (
                <Grid className="link-navigation-container" style={{ marginBottom: '20px' }} container onClick={() => this.setState({ navigateTo: '/basic-info' })}>
                  <Alert color="success"><Link className="link-button">{basicInfoLinkText}</Link></Alert>
                </Grid>
              ) :
                <Grid className="link-navigation-container" style={{ marginTop: '20px' }} container onClick={() => this.setState({ navigateTo: '/home' })}>
                  <Link className="link-button">{userInfo.isUnderwriting ? t("home.estimation.return-policies") : t("home.estimation.return-claims")}</Link>
                </Grid>
            }
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    currentIncident: state.incidentReducer.currentIncident,
    incidents: state.resultReducer.incidents,
    userInfo: state.userReducer.userInfo,
    // elements: state.resultReducer.elements,
    appraisal: state.resultReducer.appraisal,
    damages: state.damageReducer.damages,
    totalImages: state.resultReducer.images,
    clone: state.resultReducer.clonedAppraisal
  };
};

export default withNamespaces("common")(connect(mapStateToProps)(withSnackbar(Report)));
