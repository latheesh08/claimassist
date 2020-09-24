import React, { Component } from "react";
import { withRouter, Route, Switch, Redirect } from "react-router-dom";
import TopNav from "../../components/topnav/TopNav";
import ClaimList from "./scenes/claims-list/ClaimsList";
import "./styles.scss";
import VechicleInfo from "./scenes/vehicle-info/VehicleInfo";
import Odometer from "./scenes/odometer/Odometer";
import License from "./scenes/license-plate/license";
import DriversLicense from "./scenes/drivers-license/drivers-license";
import VehicleRegister from "./scenes/vehicle-reg-number/vehicle_reg_number";
import Accident from "./scenes/accident-description/Accident"
import Analysis from "./scenes/analysis/analysis";
import AnalysisImages from './scenes/analysis-images/AnalysisImages';
import EnterVin from "./scenes/enter-vin/EnterVin";
import Instruction from "./scenes/instruction/Instruction";
import PhotoTips from "./scenes/photo-tips/PhotoTips";
import PhotoUpload from "./scenes/photo-upload/PhotoUpload";
import Analyzing from "./scenes/analyzing/Analyzing";
import AnalysisResult from "./scenes/analysis-result/AnalysisResult";
import AnalysisResultWhy from "./scenes/analysis-result/scenes/analysis-result-why/AnalysisResultWhy";
import ReviewIntro from "./scenes/review-intro/ReviewIntro";
import Review from "./scenes/review/Review";
import EditPart from "./scenes/edit-part/EditPart";
import ReviewImage from "./scenes/review-image/ReviewImage";
import EditDamage from "./scenes/edit-damage/EditDamage";
import AddDamage from "./scenes/add-damage/AddDamage";
import Report from "./scenes/report/Report";
import Estimation from "./scenes/estimation/Estimation";
import ClaimDetail from "./scenes/claim-detail/ClaimDetail";
import ChoseAngle from "./scenes/choose-angle/ChooseAngle";
import SummaryScreen from './scenes/summary-screen/SummaryScreen';
import VehicleInfoSummaryScreen from './scenes/vehicle-info-summary/vehicle_info_summary'
import CommonPose from "./scenes/choose-angle/CommonPose";
import VehicleDetails from "./scenes/collect-vehicle-details/VehicleDetails";
import BasicInfo from './scenes/basic-info/Basic_info';
import { AuthContext } from "../Auth";

// import StartIncident from "../start-incident/StartIncident";

class Home extends Component {
  renderNavBar() {
    if (this.props.location.pathname !== "/404") {
      return <TopNav goBack={() => this.props.history.goBack()} />;
    }
  }

  static contextType = AuthContext

  render() {

    // If '/' redirect to home page
    // if (this.props.location.pathname === "/") {

    //   console.log("REDIRECT TO HOME");
    //   return (
    //     <Redirect
    //       to={{
    //         pathname: "/home"
    //       }}
    //     />
    //   );
    // }

    return (
      <div id="home" className="home-wrapper">
        <div className="sceneContainerClass">
          <Switch>
            <Route
              path="/"
              exact
              component={ClaimList}
            // render={props => <ClaimList {...props} />}
            />
            <Route
              path="/home"
              exact
              component={ClaimList}
            />
            <Route
              path="/item-detail"
              exact
              render={props => <ClaimDetail {...props} />}
            />
            <Route
              path="/vehicle-info"
              exact
              render={props => <VechicleInfo {...props} />}
            />
            <Route
              path="/odometer"
              exact
              render={props => <Odometer {...props} />}
            />
            <Route
              path="/license-plate"
              exact
              render={props => <License {...props} />}
            />
            <Route
              path="/register-card"
              exact
              render={props => <VehicleRegister {...props} />}
            />
            <Route
              path="/drivers-license"
              exact
              render={props => <DriversLicense {...props} />}
            />
            <Route
              path="/accident-description"
              exact
              render={props => <Accident {...props} />}
            />
            <Route
              path="/choose-angle"
              exact
              render={props => <ChoseAngle {...props} />}
            />
            <Route
              path="/individual-angle"
              exact
              render={props => <CommonPose {...props} />}
            />
            <Route
              path='/summary-screen'
              exact
              render={props => <SummaryScreen {...props} />}
            />
            <Route
              path='/vehicle-info-summary-screen'
              exact
              render={props => <VehicleInfoSummaryScreen {...props} />}
            />
            <Route
              path="/collect-vehicle-details"
              exact
              component={VehicleDetails}
            // render={props => <VehicleDetails {...props} />}
            />
            <Route
              path="/enter-vin"
              exact
              render={props => <EnterVin {...props} />}
            />
            <Route
              path="/instruction"
              exact
              render={props => <Instruction {...props} />}
            />
            <Route
              path="/photo-tips"
              exact
              render={props => <PhotoTips {...props} />}
            />
            <Route
              path="/photo-upload"
              exact
              render={props => <PhotoUpload {...props} />}
            />
            <Route
              path="/analyzing"
              exact
              render={props => <Analyzing {...props} />}
            />
            <Route
              path="/analysis-results/why"
              render={props => <AnalysisResultWhy {...props} />}
            />
            <Route
              path="/analysis-results"
              exact
              render={props => <AnalysisResult {...props} />}
            />
            <Route
              path="/analysis"
              exact
              render={props => <Analysis {...props} />}
            />
            <Route
              path="/analysis-images"
              exact
              render={props => <AnalysisImages {...props} />}
            />
            <Route
              path="/review/intro"
              exact
              render={props => <ReviewIntro {...props} />}
            />
            <Route
              path="/basic-info"
              exact
              render={props => <BasicInfo {...props} />}
            />
            <Route
              path="/review-image"
              render={props => <ReviewImage {...props} />}
            />
            <Route path="/review" render={props => <Review {...props} />} />
            <Route
              path="/edit-part"
              render={props => <EditPart {...props} action="Edit" />}
            />
            <Route
              path="/edit-damage"
              render={props => <EditDamage {...props} action="Edit" />}
            />
            <Route
              path="/add-damage-part"
              render={props => <EditPart {...props} action="Add" />}
            />
            <Route
              path="/add-damage-type"
              render={props => <EditDamage {...props} action="Add" />}
            />
            <Route
              path="/add-damage"
              render={props => <AddDamage {...props} />}
            />
            <Route path="/report" render={props => <Report {...props} />} />
            <Route path="/estimation" render={props => <Estimation {...props} />} />

            <Redirect to="/404" />
          </Switch>
        </div>
      </div>
    );
  }
}

export default withRouter(Home);
