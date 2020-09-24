import React, { Component } from "react";
import { withNamespaces } from "react-i18next";
import { withStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";

const styles = (theme) => ({
  conditions: {
    color: "#41bcf2",
    // marginTop: 20,
    cursor: "pointer",
    textDecoration: "none",
    marginRight: 20,
  },
  container: {
    display: "flex",
    "align-items": "center",
    "justify-content": "center",
    "flex-shrink": 0,
    width: "100%",
    position: "relative",
    flex: 1,
  },
});

class Termsandprivacy extends Component {

  render() {
    return (
      <Grid>
        <div style={{flexDirection:"row",display:"flex",}}>
          {process.env.REACT_APP_CLIENT_NAME === 'El Aguila' && <img
            style={{ width: "6%",height:"2%", marginTop:1 }}
            src={require("../../Images/logo.png")}
            alt=""
            className={"logo"}
          />}
          <div
           className={this.props.classes.container}>
            <a
              className={this.props.classes.conditions}
              href={process.env.REACT_APP_CLIENT_NAME === 'El Aguila' ? 'https://elaguila.com.mx/aviso-de-privacidad/' : 'https://www.galaxy.ai/terms-of-service'}
              target="_blank"
            >
              {this.props.t("home.terms-privacy.terms")}
            </a>
            <a
              className={this.props.classes.conditions}
              href={process.env.REACT_APP_CLIENT_NAME === 'El Aguila' ? 'https://elaguila.com.mx/aviso-de-privacidad/' : 'https://www.galaxy.ai/privacy-policy'}
              target="_blank"
            >
              {this.props.t("home.terms-privacy.privacy")}
            </a>
          </div>
        </div>
      </Grid>
    );
  }
}

export default withNamespaces("common")(withStyles(styles)(Termsandprivacy));
