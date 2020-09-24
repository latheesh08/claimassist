import React, { Component } from "react";
import TopNav from "../../../../components/topnav/TopNav";
import Title from "../../../../components/title/Title";
import "./styles.scss";
import { withNamespaces } from "react-i18next";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { Divider } from "@material-ui/core";
import { connect } from 'react-redux';
import { withSnackbar } from "notistack";
import Button from '@material-ui/core/Button';
import { SvgLoader, SvgProxy } from "react-svgmt";
import { Redirect , Link} from "react-router-dom";
import {
  selectedPoses
} from "../../../../actions";


const styles = theme => ({
  root: {
    flexGrow: 1
  }
});

class Instruction extends Component {
  state = {
    selectors: [],
    navigateTo: null,

  }
  componentDidMount(){

  }
  render() {
    if (this.state.navigateTo) {
      return <Redirect push to={this.state.navigateTo} />;
  }
    // let model = this.props.model || "Mercedes";
    const { t } = this.props;
    const { classes } = this.props;
    return (
      <div className="odometer-container">
        <TopNav backType="backward" hasMore goBack={() => this.props.history.goBack()} />
        <div className="content">
          <Title
            title={this.props.title}
          />
          
        </div>
      </div>
    );

  }
}

const mapStateToProps = state => {
  return {
    userInfo: state.userReducer.userInfo,
    damages: state.damageReducer.damages,
    images: state.resultReducer.images,
  };
};
const mapDispatchToProps = dispatch => {
  return {
    selectedPoses: poses => dispatch(selectedPoses(poses)),
  }
}

export default withNamespaces('common')(
  connect(
    mapStateToProps, mapDispatchToProps
  )(withStyles(styles)(withSnackbar(Instruction)))
)