import React, { Component } from "react";
import Icon from "@material-ui/core/Icon";
import "./styles.scss";
import { withNamespaces } from "react-i18next";

class ReviewItem extends Component {
  constructor(props) {
    super();

    this.state = {
      isSelected: props.selected,
      isSelectable: props.selectable ? true : false,
      isEditable: props.editable ? true : false,
      name: props.name,
      property: props.property,
      primary: props.primary
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      isSelected: nextProps.selected,
      isSelectable: nextProps.selectable ? true : false,
      isEditable: nextProps.editable ? true : false,
      name: nextProps.name,
      property: nextProps.property,
      primary: nextProps.primary
    });
  }

  render() {
    const { t } = this.props;
    const { onClick, onEdit } = this.props;

    return (
      <div
        className={
          this.state.isSelected ? "review-item selected" : "review-item"
        }
        onClick={onClick}
      >
        <div
          className={
            this.state.primary ? "item-content primary" : "item-content"
          }
        >
          <div className="item-name">{this.state.name}</div>
          <div className="item-property">{this.state.property}</div>
        </div>
        <div className="actions">
          {this.state.isSelected && this.state.isEditable && (
            <Icon onClick={onEdit}>{t("general.create")}</Icon>
          )}
        </div>
      </div>
    );
  }
}

export default withNamespaces("common")(ReviewItem);
