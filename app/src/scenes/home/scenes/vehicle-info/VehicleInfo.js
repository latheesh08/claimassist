import React, { Component } from "react";
import {
  Title,
  TopNav,
  ArrowButton,
  InputDropdown,
  TermsandPrivacy
} from "../../../../components";
import { Redirect } from "react-router-dom";
import { withNamespaces } from "react-i18next";
import Grid from "@material-ui/core/Grid";
import { connect } from "react-redux";
import { dirtyCurrentIncident, storeCurrentIncident, reEdit } from "../../../../actions";
import { withSnackbar } from "notistack";
import { buildIncident } from "../../components/Utils";
import { sendData } from "../../../../api/http_proxy";
import { Button, Input } from "@material-ui/core";
import "./styles.scss";

const makeModel = require("./car_makes_models_v0.1.json");
const elAguilaMakeModel = require("./elaguila_make_model_v0.1.json");

class VechicleInfo extends Component {
  state = {
    currentMakeModel: {},
    navigateTo: null,
    prevPage: null,
    vehicleMake: undefined,
    vehicleModel: undefined,
    vehicleYear: undefined,
    vehicleMakes: [],
    allVehicleModels: [],
    vehicleModels: [],
    hasUser: true
  };

  getYearOptions = () => {
    const yearCount = 50;
    const thisYear = new Date().getFullYear();
    const yearArray = [];
    for (let index = 0; index < yearCount; index++) {
      const year = (thisYear - index).toString();
      const elem = {
        value: year,
        label: year
      };
      yearArray.push(elem);
    }
    return yearArray;
  };

  saveData = async () => {
    console.log("saving data");

    const { vehicleMake, vehicleModel, vehicleYear } = this.state;
    const vehicleParams = {
      make: vehicleMake.value,
      model: vehicleModel.value,
      year: vehicleYear.value,
      createdBy: this.props.userInfo.userId
    }

    const newIncident = await buildIncident(this.props.currentIncident, vehicleParams);
    await this.props.storeIncident(newIncident);

    console.log("CURRENT INCIDENT TO POST/PUT");
    console.log(newIncident);

    // If we should redirect to a particular page instead of instructions
    if (this.props.location.state && this.props.location.state.redirect) {
      this.setState({ navigateTo: this.props.location.state.redirect });
    } else {
      if (this.props.userInfo.hasOwnProperty("org") && this.props.userInfo.org === 'elaguila') {
        this.setState({ navigateTo: "/license-plate" });
      } else {
        this.setState({ navigateTo: "/odometer" });
      }
    }
  };

  handleCreateMake = e => {
    // console.log("just created ", e);
    const make = {
      value: e,
      label: `${e[0].toUpperCase()}${e.substr(1, e.length - 1)}`
    };
    this.setState(prev => {
      // console.log("FIRST");
      // console.log(prev.vehicleMakes.length);
      // console.log(make);
      return {
        ...prev,
        vehicleMakes: [...prev.vehicleMakes, make],
        vehicleMake: make
      };
    });
  };

  handleCreateModel = e => {
    // console.log("CREATING MODEL");
    // console.log(e);
    const model = {
      value: e,
      label: e
    };
    this.setState(prev => {
      const _model = { model: e, make: prev.vehicleMake.value };
      return {
        ...prev,
        allVehicleModels: [...prev.allVehicleModels, _model],
        vehicleModels: [...prev.vehicleModels, model],
        vehicleModel: model
      };
    });
  };

  handleCreateYear = e => {
    console.log("CREATING YEAR");
    console.log(e);
  };

  handleMakeChange = e => {
    // console.log(e);
    // console.log("inside event");
    // const value = e ? e.value : "";
    this.setState({ vehicleMake: e });
    this.filterModels(e);
    // const value = e.target.value;
    // this.selectModelData(value);
  };

  filterModels = make => {
    const vehicleModel = undefined;
    const vehicleYear = undefined;
    const vehicleModels = !make
      ? []
      : this.state.allVehicleModels
        .filter(item => item.make === make.value)
        .map(item => {
          return { value: item.model, label: item.model };
        });
    this.setState({ vehicleModels, vehicleModel, vehicleYear });
  };

  handleModelChange = e => {
    console.log(e);
    this.setState({ vehicleModel: e });
  };

  handleYearChange = e => {
    this.setState({ vehicleYear: e });
  };

  handleBackClick = () => {
    // this.props.clearState();
    // this.setState({ goToVehInfo: true });

    if (this.props.location.state && this.props.location.state.prevPage) {
      console.log("PREVIOUS PAGE VALUE");
      console.log(this.props.location.state.prevPage);
      this.setState({ prevPage: this.props.location.state.prevPage });
    } else {
      console.log("GO BACK VALUE");
      this.setState({ prevPage: this.props.history.goBack() });
    }
    //this.props.history.goBack()
  };

  componentDidMount() {
    console.log("VEHICLE INFO PROPS");
    //     $("input, textarea").focus(function(){  $(document.body).addClass('when-keyboard-showing');     });
    // $("input, textarea").blur( function(){  $(document.body).removeClass('when-keyboard-showing');  });
    console.log(this.props);
    // if (!this.props.userInfo || !this.props.userInfo.userId) {
    //   this.setState({ hasUser: false });
    // }

    let currentMakeModel;
    if (this.props.userInfo.hasOwnProperty("org") && this.props.userInfo.org === 'elaguila') {
      currentMakeModel = elAguilaMakeModel;
      this.setState({ currentMakeModel: elAguilaMakeModel });
    } else {
      currentMakeModel = makeModel;
      this.setState({ currentMakeModel: makeModel });
    }

    const vehicleMakes = Object.keys(currentMakeModel).map(item => {
      return {
        value: item,
        label: `${item[0].toUpperCase()}${item.substr(1, item.length - 1)}`
      };
    }).sort((a, b) => (a.label > b.label) ? 1 : -1);

    const _vehicleModels = vehicleMakes.map(item =>
      currentMakeModel[item.value].map(model => {
        return { model: model.Model, make: item.value };
      })
    );

    const allVehicleModels = [].concat(..._vehicleModels).sort((a, b) => (a.model > b.model) ? 1 : -1);
    this.initializeVehicleInfo(vehicleMakes, allVehicleModels);
  }

  initializeVehicleInfo = (vehicleMakes, allVehicleModels) => {
    const currentIncident = this.props.currentIncident;
    let [make, model, year] = Array(3).fill(null).map(() => (undefined));
    if (currentIncident.hasOwnProperty("vehicles") && currentIncident.vehicles.length > 0) {
      console.log("has incident")
      make = this.props.currentIncident.vehicles[0].make;
      model = this.props.currentIncident.vehicles[0].model;
      year = this.props.currentIncident.vehicles[0].year;
    }

    console.log("initializeVehicleInfo");
    console.log(this.props.currentIncident);
    console.log("Make, model and year values: ", make, model, year);

    if (make || model) {

      // if(make){
        const _makes = vehicleMakes.filter(item => item.value === make);

        const vehicleMake = { value: make, label: make };
        const _vehicleMakes =
          _makes.length === 1 ? vehicleMakes : [...vehicleMakes, vehicleMake];

          this.setState({
              vehicleMakes: _vehicleMakes,
              vehicleMake: vehicleMake,
          });
      // }

      // if(model){
        const _models = allVehicleModels.filter(
          item => item.model === model && item.make === make
        );
        const _allModels =
          _models.length === 1
            ? allVehicleModels
            : [...allVehicleModels, { model: model, make: make }];
  
        const vehicleModel = { value: model, label: model };
  
        const vehicleModels = _allModels
          .filter(item => item.make === make)
          .map(item => {
            return { value: item.model, label: item.model };
          });

          this.setState({
            allVehicleModels: _allModels,
            vehicleModel: vehicleModel,
            vehicleModels: vehicleModels
          });
      // }

      // if(year){
        const vehicleYear = { value: year, label: year };
        this.setState({
          vehicleYear: vehicleYear
        });
      // }
      
    } else {
      this.setState({
        allVehicleModels: allVehicleModels,
        vehicleMakes: vehicleMakes
      });
    }
  };


  menuOpenHandler = () => {
    // document.getElementById('vehicle-info-id').classList.add("id_make_class");
    // document.getElementsByClassName('id_make_class')[0].scrollTop = 300
  }
  menuCloseHandler = () => {
    // var element = document.getElementById("vehicle-info-id");
    // element.classList.remove("id_make_class");
  }

  render() {
    if (this.state.hasUser === false) {
      return <Redirect to="/collect-vehicle-details" />;
    }

    const { t, classes } = this.props;
    // const { vehicleModels } = this.state;

    console.log("====================================");
    // console.log("VEHICLE INFO PROPS");
    // console.log(this.props);
    console.log("STATE");
    console.log(this.state);
    console.log("====================================");
    // console.log("VEHICLE INFO");
    // console.log(this.props.vehicleInfo);

    if (this.state.navigateTo) {
      return <Redirect push to={this.state.navigateTo} />;
    }

    if (this.state.prevPage) {
      return <Redirect push to={this.state.prevPage} />;
    }

    return (
      <div className="vehicle-info-container">
        {this.props.reEdit_val ? null : <TopNav backType="backward" hasMore goBack={this.handleBackClick} />}
        <div className="content">
          <Title
            title={t("home.vehicle-info.title")}
            subtitle={t("home.vehicle-info.subtitle")}
          />
          <form
            className="vehicle-form claim-form"
            noValidate
            autoComplete="off"
          >
            <Grid container spacing={8}>
              <Grid item xs={12} id='id_make_id'>
                <InputDropdown
                  value={this.state.vehicleMake}
                  onChange={this.handleMakeChange}
                  onCreate={this.handleCreateMake}
                  options={this.state.vehicleMakes}
                  id="id-make"
                  name="make"
                  placeholder={t("vehicle-info-summary.make")}
                  menuOpenHandler={this.menuOpenHandler}
                  menuCloseHandler={this.menuCloseHandler}
                />
                <InputDropdown
                  value={this.state.vehicleModel}
                  disabled={!this.state.vehicleMake}
                  onChange={this.handleModelChange}
                  onCreate={this.handleCreateModel}
                  options={this.state.vehicleModels}
                  id="id-model"
                  name="model"
                  placeholder={t("vehicle-info-summary.model")}
                  menuOpenHandler={this.menuOpenHandler}
                  menuCloseHandler={this.menuCloseHandler}
                />
                <InputDropdown
                  value={this.state.vehicleYear}
                  onChange={this.handleYearChange}
                  onCreate={this.handleCreateYear}
                  options={this.getYearOptions()}
                  id="id-year"
                  name="year"
                  placeholder={t("vehicle-info-summary.year")}
                  menuOpenHandler={this.menuOpenHandler}
                  menuCloseHandler={this.menuCloseHandler}
                />
              </Grid>
            </Grid>
            {
              this.props.reEdit_val ? <Grid style={{ marginTop: 20, width: '10%', display: 'flex', flexDirection: 'column' }}>

                <ArrowButton
                  icon='save'
                  disabled={
                    !this.state.vehicleMake ||
                    !this.state.vehicleModel ||
                    !this.state.vehicleYear
                  }
                  onClick={() => {
                    this.saveData()
                    this.props.reEdit(false)
                    this.setState({
                      navigateTo: '/vehicle-info-summary-screen'
                    })
                  }} />
                <a style={{ color: '#41bcf2', marginTop: '20px', cursor: 'pointer' }}
                  onClick={() => {
                    this.props.reEdit(false)
                    this.setState({
                      navigateTo: '/vehicle-info-summary-screen'
                    })
                  }}
                >{t("general.cancel")}</a>
              </Grid>
                :
                <ArrowButton
                  onClick={this.saveData}
                  icon="arrow_forward"
                  disabled={
                    !this.state.vehicleMake ||
                    !this.state.vehicleModel ||
                    !this.state.vehicleYear
                  }
                />
            }
          </form>

        </div>

      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    currentIncident: state.incidentReducer.currentIncident,
    dirtyIncident: state.incidentReducer.dirtyIncident,
    userInfo: state.userReducer.userInfo,
    reEdit_val: state.incidentReducer.reEdit
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dirtyCurrentIncident: (value) => dispatch(dirtyCurrentIncident(value)),
    storeIncident: (value) => dispatch(storeCurrentIncident(value)),
    reEdit: val => dispatch(reEdit(val)),
  };
};
export default withNamespaces("common")(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withSnackbar(VechicleInfo))
);
