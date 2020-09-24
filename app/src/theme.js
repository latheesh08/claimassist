import { createMuiTheme } from "@material-ui/core/styles";
import red from "@material-ui/core/colors/red";

// All the following keys are optional.
// We try our best to provide a great default value.
const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#18AEEE"
    },
    secondary: {
      main: "#F62D2D"
    },
    error: red,
    lightGray: {
      main: "#666"
    },
    contrastThreshold: 3,
    tonalOffset: 0.2
  },
  typography: {
    // fontSize: 12,
    fontFamily: [
      "ProximaNova",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      "Oxygen",
      "Ubuntu",
      "Cantarell",
      '"Droid Neue"',
      '"Fira Sans"',
      '"Helvetica Sans"',
      "sans-serif"
    ].join(",")
    // htmlFontSize: 10
  }
});

export default theme;
