import React, { Component } from "react";
import { Link } from "react-router-dom";
import Icon from "@material-ui/core/Icon";
import { withNamespaces } from "react-i18next";

class Page404 extends Component {
  render() {
    const { t } = this.props;

    return (
      <div className="page404">
        <div className="text-muted">404</div>
        <Icon>search</Icon>

        <div className="h4">{t("general.404.page-not-found")}</div>

        <Link to={"/"}>{t("general.404.go-home")}</Link>
      </div>
    );
  }
}

export default withNamespaces("common")(Page404);
