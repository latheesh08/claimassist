import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { TopNav } from "../../../../components";
import { Link } from "react-router-dom";
import Icon from "@material-ui/core/Icon";
import ReviewItemList from "./components/review-item-list/ReviewItemList";
import "./styles.scss";
import { withNamespaces } from "react-i18next";
import { connect } from "react-redux";

class Review extends Component {
  constructor() {
    super();

    this.state = {
      count: 4,
      current: 0,
      damagedParts: [],
      index: { idx: -1, idy: -1 },
      redirect: undefined
    };
  }

  getDataUrl = imgData => `data:image/png;base64,${imgData}`;

  componentDidMount() {
    this.setState({
      damagedParts: [
        {
          type: "text",
          data: "All damages"
        },
        {
          type: "item",
          data: {
            part: "Fender",
            property: "Replace",
            damages: ["Scratch", "Dent", "Crack"]
          }
        },
        {
          type: "item",
          data: {
            part: "Bumper",
            property: "Repair",
            damages: ["Scratch", "Dent"]
          }
        }
      ]
    });
  }

  handleOnEditDamage = () => {
    this.setState({
      redirect: <Redirect to="/edit-damage" />
    });
  };

  handleOnEditPart = () => {
    this.setState({
      redirect: <Redirect to="/edit-part" />
    });
  };

  handleAddManually = () => {
    this.setState({
      redirect: <Redirect to="/add-damage" />
    });
  };

  handleOnClick = (idx, idy) => {
    this.setState({
      index: { idx, idy }
    });
  };

  moveNext = () => {
    this.setState(prev => ({
      current: prev.current + 1
    }));
  };

  render() {
    console.log("CURRENT INDEX");
    console.log(this.state.current);
    console.log("PROPS");
    console.log(this.props);
    const { t } = this.props;

    console.log("PICTURES");
    console.log(this.props.pictures);
    const { pictures } = this.props;
    console.log(pictures);
    console.log(pictures.length);
    const count = pictures.length;
    console.log("PICTURE COUNT");
    console.log(count);

    const navTitle = (
      <label>
        <span>PHOTO {this.state.current + 1}</span> /{" "}
        {this.state.count}
      </label>
    );

    return (
      <div className="review-wrapper">
        {this.state.redirect}
        <div className="content">
          <TopNav
            backType="backward"
            narrow="true"
            title={navTitle}
            goBack={() => this.props.history.goBack()}
          />

          <div className="review-container">
            <div className="photo-container">
              <img src="/images/pass_1_origin.png" alt="" />
            </div>
            <div className="main-area">
              {this.state.damagedParts.map((part, index) => (
                <ReviewItemList
                  key={index}
                  id={index}
                  type={part.type}
                  data={part.data}
                  onClick={(idx, idy) => {
                    console.log({ idx, idy });
                    this.handleOnClick(idx, idy);
                  }}
                  onEditDamage={() => this.handleOnEditDamage()}
                  onEditPart={() => this.handleOnEditPart()}
                  selected={this.state.index.idx === index}
                  selected_child={this.state.index.idy}
                />
              ))}

              <ReviewItemList
                type="content"
                data={
                  <div className="add-manual">
                    <div className="title">
                      <label>{t("home.review.miss-anything")}</label>
                      <label>
                        <strong>{t("home.review.add-manually")}</strong>
                      </label>
                    </div>
                    <div>
                      <p>{t("home.review.edit-guide")}</p>
                    </div>
                    <div className="actions">
                      <Icon onClick={this.handleAddManually}>add_circle</Icon>
                    </div>
                  </div>
                }
              />

              <div className="next-photo">
                {this.state.current < count - 1 && (
                  <div className="next-link" onClick={this.moveNext}>
                    {t("home.review.next-photo")}
                  </div>
                )}
                {this.state.current === count - 1 && (
                  <Link className="report-link" to={"/report"} color="primary">
                    {t("home.review.generate-report")}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    pictures: state.pictureReducer.pictures,
    grades: state.resultReducer.grades,
    elementsImages: state.resultReducer.elementsImages,
    scores: state.resultReducer.scores,
    parts: state.resultReducer.parts
  };
};

export default withNamespaces("common")(connect(mapStateToProps)(Review));
