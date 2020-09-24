import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import CarGridListTile from '../car-grid-tile/CarGridListTile';

const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
  }, 
  gridList: {
    width: 360,
  },
});

function CarGridList(props) {
  const { classes, data: { type, srcList }, cellHeight, cols } = props;  

  console.log('CarGridList');
  console.log(props);

  return (
    <div className={classes.root}>
      <GridList cellHeight={cellHeight} className={classes.gridList} cols={cols}>
        {
          srcList.map((img, index) => (
            <CarGridListTile key={index} type={type} imgSrc={img}/>
          ))
        }
      </GridList>
    </div>    
  );
}

export default withStyles(styles)(CarGridList);