import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./styles.scss";
import { withNamespaces } from "react-i18next";

class StartIncidentNavigation extends Component {
  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  render() {
    const { t } = this.props;
    return (
      <div className="start-incident-container">
        {/* <Link to={"/enter-vin"} className="link-button">
          {t("start-incident.enter-vin")}
        </Link> */}
        <Link to={"/vehicle-info"} className="link-button">
          {t("start-incident.enter-make")}
        </Link>
      </div>
    );
  }
}

export default withNamespaces("common")(StartIncidentNavigation);
