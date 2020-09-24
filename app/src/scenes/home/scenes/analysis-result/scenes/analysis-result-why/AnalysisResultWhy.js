import React, { Component } from "react";
import { Redirect } from "react-router-dom";

import { TopNav, Title } from "../../../../../../components";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
// import Title from "../../../../../../components/title/Title";
import DescriptionItem from "./components/description-item/DescriptionItem";
import "./styles.scss";
import { connect } from "react-redux";
import { withNamespaces } from "react-i18next";
import SmartImage from "../../../../components/SmartImage";

class AnalysisResultWhy extends Component {
  state = {
    imageId: null,
    grades: []
  };

  // getDataUrl = imgData => `data:image/png;base64,${imgData}`;

  componentDidMount() {
    if (this.props.location.state) {
      const { image, grades } = this.props.location.state;
      console.log("====================================");
      console.log("PROPS");
      console.log(this.props);
      console.log("====================================");
      this.setState({ image, grades });
    }
  }

  render() {
    const { t } = this.props;

    // find image
    const images = this.props.images.filter(
      item => item.imageId === this.state.imageId
    );
    
    let gradeInfo = []
    if(this.state.grades.length > 0){
      gradeInfo =  this.state.grades;
    }else{
      gradeInfo = images.length > 0 && images[0].hasOwnProperty("grades") && images[0].grades.length > 0 ? images[0].grades : [];
    }

    // if (this.state.grades.length === 0) {

    //   return (
    //     <div className="analysis-result-wrapper">
    //       <div className="content">
    //         <TopNav
    //           backType="close"
    //           narrow
    //           goBack={() => this.props.history.goBack()}
    //         />
    //         <div className="analysis-result-container">
    //           <Title
    //             title={t("general.please-wait")}
    //             subtitle={t("general.loading")}
    //           />
    //         </div>
    //       </div>
    //     </div>
    //   );
    // }

    // find grades
    // const gradeInfo = this.props.grades.filter(
    //   item => item.imageId === this.state.imageId
    // );

    console.log("GRADES");
    console.log(gradeInfo);
    console.log(images);
    const mainGrades = gradeInfo.filter(item => item.typeCode === 655);
    const otherGrades = gradeInfo
      .filter(item => (item.typeCode === 525 || item.typeCode === 590 || item.typeCode === 507 || item.typeCode === 558) && item.found === 0)
      .sort((a, b) => (a.type > b.type) ? 1 : -1);

    let header = "Why this image was rejected";
    // let description;

    if (mainGrades.length > 0) {
      const mainGrade = mainGrades[0];
      header =
        mainGrade.found === 1
          ? t("home.analysis-result-why.why-processed")
          : t("home.analysis-result-why.why-not-processed");
      // description = mainGrade.message;
    }

    // console.log("IMAGE DATA");
    // console.log(this.state);

    return (
      <div className="analysis-result-wrapper">
        <div className="content">
          <TopNav
            backType="close"
            narrow
            goBack={() => this.props.history.goBack()}
          />
          <div className="analysis-result-container">
            <Title title={header} />
            <div className="main">
              <div className="content-image">
                <SmartImage image={this.state.image} />
              </div>
              <div className="report-container">
                <div className="image-quality-table">
                  <Table id="galaxyai-image-quality-table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Image Quality Attribute</TableCell>
                        <TableCell>Algorithm Assessment</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {otherGrades.map((row, index) => {
                        return (
                          <TableRow key={index}>
                            <TableCell component="td" scope="row">
                              {row && row.hasOwnProperty("type") ? row.type.replace("_", " ") : ""}
                            </TableCell>
                            <TableCell component="td" scope="row">
                              {row && row.hasOwnProperty("message") ? row.message : ""}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
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
    currentIncident: state.incidentReducer.currentIncident,
    // damages: state.damageReducer.damages,
    images: state.resultReducer.images,
    grades: state.gradeReducer.grades
  };
};

export default withNamespaces("common")(
  connect(mapStateToProps)(AnalysisResultWhy)
);
