import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import Title from "../../../../components/title/Title";
import TopNav from "../../../../components/topnav/TopNav";
import "./styles.scss";
import { CircularProgress } from "@material-ui/core";

class Analyzing extends Component {
  constructor() {
    super();

    this.state = {
      isAnalyzed: false
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.setAnalyzedState();
    }, 3000);
  }

  setAnalyzedState() {
    this.setState({
      isAnalyzed: true
    });
  }

  renderRedirect = () => {
    if (this.state.isAnalyzed) {
      return <Redirect to="/analysis-results" />;
    }
  };

  render() {
    return (
      <div className="analyzing-wrapper">
        {this.renderRedirect()}
        <div className="content">
          <TopNav
            backType="backward"
            narrow
            goBack={() => this.props.history.goBack()}
          />
          <div className="analyzing-container">
            <div className="car-in-progress">
              <img src="/images/pass_1.png" alt="" />
              <CircularProgress
                className="car-outline-progress"
                color="secondary"
                size={140}
                thickness={0.6}
              />
            </div>
            <Title
              title="Sit tight"
              subtitle="The photos are being uploaded and analyzed. It make take up to 3 minutes."
            />
            <div className="state-text">Uploading...</div>
          </div>
        </div>
      </div>
    );
  }
}

export default Analyzing;
