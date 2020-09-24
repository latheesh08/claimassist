import React from 'react'
import ReactDOM from 'react-dom'
import loadImage from 'blueimp-load-image'
import "./styles.scss";

// important ones
const rotationMap = {
  1: '0CW',
  3: '180CW',
  6: '90CW',
  8: '270CW'
};

class ImageViewer extends React.Component {
  imageCanvas;
  imgClass;

  render() {
    let className = ''
    console.log("IMAGE VIEWER PROPS");
    console.log(this.props);
    if (this.props.imclass) {
      className = this.props.imgclass;
    } else {
      className = 'fit_to_parent';
    }

    if (this.props.vehicle_summary !== undefined && this.props.vehicle_summary) {
      className = 'images_vehicle_summary_class';
    } else if (this.props.pose !== undefined && this.props.pose) {
      className = 'images_pose_helper_class'
    } else if (this.props.pose_summary !== undefined && this.props.pose_summary) {
      className = 'summary_images_class'
    } else {

    }
    this.imgClass = className + '_' + rotationMap[this.props.orientation];

    return (
      <div className="rotation-wrapper-outer">
        <div className="rotation-wrapper-inner">
          <img
            src={this.props.src}
            alt=""
            className={this.imgClass}
          />
        </div>
      </div>
    );
  }
}

export default ImageViewer;
