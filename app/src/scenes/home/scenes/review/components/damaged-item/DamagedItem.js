import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Link } from 'react-router-dom';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import './styles.scss';

function DamagedItem(props) {
  
  return (
    <div className="damaged-item">
      <div className="item-name">
        {props.name}
        <div className="item-state">
          {props.state}
        </div>
      </div>
      {
        props.damages 
        && 
        <div className="item-damages">
          {
            props.damages.map(d =>
              <div className="damage">
                {d}
              </div>)
          }
        </div>
      }
    </div>
  );
}

export default DamagedItem;