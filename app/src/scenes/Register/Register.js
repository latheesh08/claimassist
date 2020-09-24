import React, { Component } from "react";
import Logo from "./components/Logo/Logo";
import Footer from "../../components/Footer/Footer";
import Title from "../../components/title/Title";
import LanguageSelect from "../../components/LanguageSelect/LanguageSelect";
import RegisterForm from "./components/register-form/RegisterForm";
import "./styles.scss";
import { withNamespaces } from "react-i18next";

class Register extends Component {
  render() {
    const { t } = this.props;
    return (
      <div className="register-wrapper">
        <div className="main-wrapper">
          <Logo />
          <Title title={t("auth.register-to-claim")} />
          <RegisterForm />
        </div>
        <Footer
          text={t("auth.already-have-account")}
          navTitle={t("auth.log-in")}
          navLink="/login"
        />
        <LanguageSelect text="Language Select" />
      </div>
    );
  }
}

export default withNamespaces("common")(Register);
