import React, { Component } from 'react';
import ReviewItem from '../review-item/ReviewItem';

import './styles.scss';

class ReviewItemList extends Component {
  constructor(props) {
    super();

    this.state = {
      id: props.id,
      type: props.type,
      data: props.data,
      sid: props.selected ? props.selected_child : -1,
      selected: props.selected,
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      id: nextProps.id,
      type: nextProps.type,
      data: nextProps.data,
      sid: nextProps.selected ? nextProps.selected_child : -1,
      selected: nextProps.selected,
    });
  }
  
  render () {
    const { type, data, id: idx, sid } = this.state;
    const { onClick, onEditPart, onEditDamage } = this.props;

    let items;    
    if (type === "text") {
      items = 
        <ReviewItem 
          name={data} 
          primary 
          selectable
          selected={ sid === 0 }
          onClick={() => onClick(idx, 0)}
        />;
    } else if (type === "content") {
      items = data;
    } else if (type === "item") {
      items = 
        <div className="damaged-part">
          <ReviewItem 
            name={data.part} 
            property={data.property} 
            primary 
            editable 
            selected={ sid === 0 }
            onClick={() => onClick(idx, 0)}
            onEdit={() => onEditPart()}
          />
          <div className="damaged">
          {
            data.damages.map((damage, index) => 
              <ReviewItem 
                key={index} 
                name={damage} 
                editable 
                selected={ sid === index + 1}
                onClick={() => onClick(idx, index + 1)}
                onEdit={() => onEditDamage()}
              />
            )
          }
          </div>
        </div> ;
    }

    return (
      <div className="review-item-list">
      {
        items
      }
      </div>
    );
  }
}

export default ReviewItemList;