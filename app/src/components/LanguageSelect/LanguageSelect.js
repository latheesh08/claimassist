import React, { Component } from "react";
import { withNamespaces } from "react-i18next";
// import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import "./styles.scss";

class LanguageSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lng: "en"
    };
  }

  handleChange = event => {
    this.setState({ lng: event.target.value });
    this.props.i18n.changeLanguage(event.target.value);
    // console.log("changed language to " + event.target.value);
  };

  componentDidMount() {
    console.log(this.props);
  }

  render() {
    return (
      <form className="container">
        <FormControl className="form-control">
          {/* <InputLabel htmlFor="id-lng">Language</InputLabel> */}
          <Select
            value={this.state.lng}
            onChange={this.handleChange}
            inputProps={{
              name: "lng",
              id: "id-lng"
            }}
          >
            <MenuItem value="en" defaultChecked>
              Eng
            </MenuItem>
            <MenuItem value="es">Es</MenuItem>
            {/* <MenuItem value="ja">Jpn</MenuItem> */}
            {/* <MenuItem value="pt">Por</MenuItem> */}
          </Select>
        </FormControl>
      </form>
    );

    // return <div className="footer-container">{this.props.text}</div>;
  }
}

export default withNamespaces("common")(LanguageSelect);
