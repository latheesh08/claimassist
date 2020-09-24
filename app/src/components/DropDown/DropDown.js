import React from "react";
import { withStyles } from "@material-ui/core/styles";
// import Input from "@material-ui/core/Input";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
// import Select from "@material-ui/core/Select";
import NativeSelect from "@material-ui/core/NativeSelect";
import InputLabel from "@material-ui/core/InputLabel";

const styles = theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap"
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    width: "100%"
  },
  selectEmpty: {
    marginTop: theme.spacing(2)
  }
});

class DropDown extends React.Component {
  state = { options: [] };

  onclick = e => {
    // console.log("clicked");
    // console.log(e);
    // console.log(e.target.value);
  };
  render() {
    const { classes, currentValue } = this.props;
    // console.log("CURRENT DROPDOWN");
    // console.log(currentValue);

    return (
      <div className={classes.root}>
        <FormControl
          className={classes.formControl}
          error={
            this.props.errorMsg && this.props.errorMsg.length > 0 ? true : false
          }
        >
          <InputLabel>
            {currentValue ? null : this.props.placeholder}
          </InputLabel>
          <NativeSelect
            // placeholder="Test"
            value={currentValue}
            onChange={this.props.onChange}
            // inputProps={{
            //   name: this.props.name,
            //   id: this.props.id
            // }}
          >
            <option value="" />
            {this.props.options.map((item, index) => (
              <option value={item.value} key={index}>
                {item.label}
              </option>
            ))}
          </NativeSelect>
          <FormHelperText>{this.props.errorMsg}</FormHelperText>
        </FormControl>
      </div>
    );
  }
}

export default withStyles(styles)(DropDown);
