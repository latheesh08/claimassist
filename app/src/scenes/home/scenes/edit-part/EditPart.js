import React, { Component } from "react";
import TopNav from "../../../../components/topnav/TopNav";
import Icon from "@material-ui/core/Icon";
import "./styles.scss";
import ArrowLink from "../../../../components/ArrowLink/ArrowLink";
import { withNamespaces } from "react-i18next";

class EditPart extends Component {
  constructor() {
    super();

    this.state = {
      part: 1,
      state: 1
    };
  }

  handleOnClickPart(index) {
    this.setState({
      part: index
    });
  }

  handleOnClickState(index) {
    this.setState({
      state: index
    });
  }

  render() {
    const { t } = this.props;

    const parts = [
      t("general.car-parts.roof"),
      t("general.car-parts.door"),
      t("general.car-parts.windshield"),
      t("general.car-parts.fender"),
      t("general.car-parts.bumper")
    ];

    const status = [
      t("general.damage-action.replace"),
      t("general.damage-action.repair")
    ];

    const { action } = this.props;
    console.log("action");
    console.log(action);

    return (
      <div className="edit-part-wrapper">
        <div className="content">
          <TopNav
            backType="close"
            narrow
            title={action === "Edit" ? "EDIT PART" : "SELECT DAMAGED PART"}
            goBack={() => this.props.history.goBack()}
          />

          <div className="edit-part-container">
            <div className="photo-container">
              <img src="/images/pass_1_origin.png" alt="" />
            </div>
            <div className="main-area">
              <div className="select-group">
                {parts.map((part, index) => (
                  <div
                    key={index}
                    className={
                      this.state.part === index
                        ? "select-item selected"
                        : "select-item"
                    }
                    onClick={() => this.setState({ part: index })}
                  >
                    {part}
                  </div>
                ))}
              </div>
              <div className="select-group">
                {status.map((state, index) => (
                  <div
                    key={index}
                    className={
                      this.state.state === index
                        ? "select-item selected"
                        : "select-item"
                    }
                    onClick={() => this.setState({ state: index })}
                  >
                    {state}
                  </div>
                ))}
              </div>
            </div>
            <div className="action">
              <div className="done">
                {action === "Edit" && <ArrowLink to="/review" icon="done" />}
                {action === "Add" && (
                  <ArrowLink to="/add-damage-type" icon="done" />
                )}
                {/* {action === "Add" && (
                  <Button
                    component={Link}
                    to="/add-damage-type"
                    variant="fab"
                    color="secondary"
                    aria-label="Add"
                    className="next-button"
                  >
                    <Icon>done</Icon>
                  </Button>
                )} */}
              </div>
              {action === "Edit" && (
                <div className="remove">
                  <Icon>delete</Icon>
                  <label>{t("general.damage-action.remove")}</label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withNamespaces("common")(EditPart);
