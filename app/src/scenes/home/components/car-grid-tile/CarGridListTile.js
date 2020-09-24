import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import GridListTile from '@material-ui/core/GridListTile';
import Icon from '@material-ui/core/Icon';
import './styles.scss';

const styles = theme => ({  
  
});

function CarGridListTile(props) {
  const { classes, type, imgSrc } = props;
  
  return (
    <GridListTile className={classes.root} cols={props.cols}
    >
      <img src={imgSrc} />
      <div className="icon-delete">
        <Icon>delete</Icon>
      </div>
    </GridListTile>
  );
}
  
export default withStyles(styles)(CarGridListTile);
