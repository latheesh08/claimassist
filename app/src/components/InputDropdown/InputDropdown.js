import React from "react";
// import classNames from "classnames";
// import Select from "react-select";
import CreatableSelect from "react-select/lib/Creatable";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
// import classes from "*.module.scss";

const styles = theme => ({
  root: {
    flexGrow: 1,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
    // height: 250
  },
  input: {
    display: "flex",
    marginTop: theme.spacing(1.5),
    padding: 0,
    height: theme.spacing(5),
    // margin: 10
  },
  valueContainer: {
    display: "flex",
    flexWrap: "wrap",
    flex: 1,
    alignItems: "center",
    overflow: "hidden"
  },
  noOptionsMessage: {
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`
  },
  singleValue: {
    fontSize: 16
  },
  placeholder: {
    position: "absolute",
    left: 2,
    fontSize: 16
  },
  paper: {
    position: "absolute",
    zIndex: 1,
    marginTop: theme.spacing(1),
    left: 0,
    right: 0
  },
  divider: {
    height: theme.spacing(2)
  }
});

function NoOptionsMessage(props) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.noOptionsMessage}
      {...props.innerProps}
    >
      {this.props.t('home.input-dropdown.not-found')}
    </Typography>
  );
}

function inputComponent({ inputRef, ...props }) {
  return <div ref={inputRef} {...props} />;
}

function Control(props) {
  return (
    <TextField
      fullWidth
      InputProps={{
        inputComponent,
        inputProps: {
          className: props.selectProps.classes.input,
          inputRef: props.innerRef,
          children: props.children,
          ...props.innerProps
        }
      }}
      {...props.selectProps.textFieldProps}
    />
  );
}

function Option(props) {
  return (
    <MenuItem
      buttonRef={props.innerRef}
      selected={props.isFocussed}
      component="div"
      style={{
        fontWeight: props.isSelected ? 500 : 400
      }}
      {...props.innerProps}
    >
      {props.children}
    </MenuItem>
  );
}

function Placeholder(props) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.placeholder}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

function SingleValue(props) {
  return (
    <Typography
      className={props.selectProps.classes.singleValue}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

function ValueContainer(props) {
  return (
    <div className={props.selectProps.classes.valueContainer}>
      {props.children}
    </div>
  );
}

function Menu(props) {
  return (
    <Paper
      square
      className={props.selectProps.classes.paper}
      {...props.innerProps}
    >
      {props.children}
    </Paper>
  );
}

const components = {
  Control,
  Menu,
  NoOptionsMessage,
  Option,
  Placeholder,
  SingleValue,
  ValueContainer
};

class InputDropdown extends React.Component {
  state = {
    value: null
  };

  //   handleChange = value => {
  //     console.log("VALUE");
  //     console.log(value);
  //     this.setState({ value });
  //   };
  // componentDidMount() {
  //   console.log("MOUNTED INPUT DROPDOWN");
  // }

  render() {
    const { classes } = this.props;
    // console.log("INSIDE INPUT DROPDOWN");
    // console.log(this.props);
    return (
      <div className={classes.root}>
        <CreatableSelect
          id={this.props.id}
          classes={classes}
          options={this.props.options}
          components={components}
          value={this.props.value}
          onChange={this.props.onChange}
          onCreateOption={this.props.onCreate}
          createOptionPosition="first"
          placeholder={this.props.placeholder}
          isClearable
          // isSearchable={ false }
          openMenuOnClick={false}
          onMenuOpen={this.props.menuOpenHandler}
          onMenuClose={this.props.menuCloseHandler}
        />
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(InputDropdown);
