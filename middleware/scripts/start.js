const fs = require("fs");
const express = require("express");
const path = require("path");
const app = express();
var cors = require("cors");

app.use(cors());
var bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

var config = require("../config/config");
var auth = require("../auth");

// app.use(function(req, res, next) {
//   console.log("APP USE ACCESS CONTROL");
//   console.log("----------------------------------");
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

// app.use(function(req, res, next) {
//   console.log("APP USE ACCESS CONTROL");
//   console.log("----------------------------------");
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );

//   next();
// });

// a catch all error handling function
app.use(function(err, req, res, next) {
  var code = err.hasOwnProperty("statusCode") ? err.statusCode : 500;
  var message = err.hasOwnProperty("message")
    ? err.message
    : "An internal server error occured on the API Server";
  var errorResponse = {
    error: {
      errors: err,
      code: code,
      message: message
    }
  };
  console.log("CATCH ALL ERROR MESSAGE HIT");
  console.log(errorResponse);
  res.send(errorResponse);
});

var clientUrl = config.clientUrl;
var debugLevel = 3; // the debug has 3 levels. 1 being the lowest level of info being displayed and 3 being the highest

app.post("/test", function(req, res) {
  var data = req.body;

  res.status(200).json(data);
});

app.post("/post", function(req, resultMain) {
  var data = req.body;
  console.log("POST DATA");
  console.log("-------------------------------");
  console.log(data);
  console.log("-------------------------------");
  console.log("-------------------------------");
  console.log("POST QUERY STRING");
  console.log(req.query);
  var endpoint = req.query.endpoint;
  console.log("ENDPOINT");
  console.log(clientUrl + endpoint);

  /**
   * @function postClaimRequest
   * @description The postClaimRequest function is called from the auth module to pass the UAA Server Authentication methods.
   */
  auth.postClaimRequest(clientUrl + endpoint, data, function(
    err,
    statusCode,
    xuaa,
    result
  ) {
    console.log("NEW POST REQUEST CALLBACK:");
    console.log(xuaa);
    if (xuaa) {
      auth.oAuthPost(xuaa, function(errors) {
        if (errors.length === 0) {
          auth.postClaimRequest(clientUrl + endpoint, data, function(
            err2,
            statusCode2,
            xuaa2,
            result2
          ) {
            console.log(
              "---------------- POST CLAIM DONE WITH AUTH CODE HIT ----------------"
            );
            if (err2) {
              console.log("ERROR: " + err2.message);
              resultMain.send({ error: err2 });
            } else {
              console.log("---------------- LOGIN EXPIRES AT ----------------");
              console.log(xuaa[1]);
              console.log("RESULT: ");
              console.log(result2);
              console.log(typeof result2);

              if (result2) {
                if (isJSON(result2)) {
                  result2 = JSON.parse(result2);
                }

                if (typeof result2.code !== "undefined") {
                  result2 = {
                    error:
                      "A connection could not be made to the algorithm server."
                  };
                }

                createFile("output.json", JSON.stringify(result2));
                result2["display"] = config.display;
              }
              resultMain.send(result2);
            }
          });
        } else {
          console.log(
            "---------------- ERRORS OCCURRED IN AUTHENTICATION CODE ----------------"
          );
          console.log(errors);
          resultMain.send(errors);
        }
      });
    } else {
      console.log(
        "---------------- POST CLAIM DONE WITHOUT AUTH CODE HIT ----------------"
      );
      if (err) {
        console.log("ERROR: " + err.message);
        resultMain.send({ error: err });
      } else {
        console.log("RESULT: ");
        console.log(result);
        console.log(typeof result);
        if (result) {
          if (isJSON(result)) {
            result = JSON.parse(result);
          }

          if (result !== null && typeof result.code !== "undefined") {
            result = {
              error: "A connection could not be made to the algorithm server."
            };
          }
          createFile("output.json", JSON.stringify(result));
          result["display"] = config.display;
        }
        resultMain.send(result);
      }
    }
  });
});

app.put("/put", function(req, resultMain) {
  var data = req.body;
  console.log("PUT DATA");
  console.log("-------------------------------");
  console.log(data);
  console.log("-------------------------------");
  console.log("-------------------------------");
  console.log("PUT QUERY STRING");
  console.log(req.query);
  var endpoint = req.query.endpoint;
  console.log("ENDPOINT");
  console.log(clientUrl + endpoint);

  /**
   * @function postClaimRequest
   * @description The postClaimRequest function is called from the auth module to pass the UAA Server Authentication methods.
   */
  auth.putClaimRequest(clientUrl + endpoint, data, function(
    err,
    statusCode,
    xuaa,
    result
  ) {
    console.log("NEW POST REQUEST CALLBACK:");
    console.log(xuaa);
    if (xuaa) {
      auth.oAuthPost(xuaa, function(errors) {
        if (errors.length === 0) {
          auth.postClaimRequest(clientUrl + endpoint, data, function(
            err2,
            statusCode2,
            xuaa2,
            result2
          ) {
            console.log(
              "---------------- POST CLAIM DONE WITH AUTH CODE HIT ----------------"
            );
            if (err2) {
              console.log("ERROR: " + err2.message);
              resultMain.send({ error: err2 });
            } else {
              console.log("---------------- LOGIN EXPIRES AT ----------------");
              console.log(xuaa[1]);
              console.log("RESULT: ");
              console.log(result2);
              console.log(typeof result2);

              if (result2) {
                if (isJSON(result2)) {
                  result2 = JSON.parse(result2);
                }

                if (typeof result2.code !== "undefined") {
                  result2 = {
                    error:
                      "A connection could not be made to the algorithm server."
                  };
                }

                createFile("output.json", JSON.stringify(result2));
                result2["display"] = config.display;
              }
              resultMain.send(result2);
            }
          });
        } else {
          console.log(
            "---------------- ERRORS OCCURRED IN AUTHENTICATION CODE ----------------"
          );
          console.log(errors);
          resultMain.send(errors);
        }
      });
    } else {
      console.log(
        "---------------- POST CLAIM DONE WITHOUT AUTH CODE HIT ----------------"
      );
      if (err) {
        console.log("ERROR: " + err.message);
        resultMain.send({ error: err });
      } else {
        console.log("RESULT: ");
        console.log(result);
        console.log(typeof result);
        if (result) {
          if (isJSON(result)) {
            result = JSON.parse(result);
          }

          if (result !== null && typeof result.code !== "undefined") {
            result = {
              error: "A connection could not be made to the algorithm server."
            };
          }
          createFile("output.json", JSON.stringify(result));
          result["display"] = config.display;
        }
        resultMain.send(result);
      }
    }
  });
});

app.get("/get", function(req, resultMain) {
  console.log("GET QUERY STRING");
  console.log(req.query);
  // var endpoint = req.query.endpoint;

  var endpoint = req.query.endpoint;
  for (key in req.query) {
    if (key !== "endpoint") {
      var parts = "&" + key + "=" + req.query[key];
      endpoint += parts;
    }
  }
  console.log(endpoint);
  console.log("ENDPOINT");
  console.log(clientUrl + endpoint);
  // return resultMain.send("blabla");

  /**
   * @function getClaimRequest
   * @description The getClaimRequest function is called from the auth module to pass the UAA Server Authentication methods.
   */
  auth.getClaimRequest(clientUrl + endpoint, function(
    err,
    statusCode,
    xuaa,
    result
  ) {
    console.log("NEW POST REQUEST CALLBACK UAA TOKEN:");
    console.log(xuaa);
    if (xuaa) {
      auth.oAuthPost(xuaa, function(errors) {
        if (errors.length === 0) {
          auth.getClaimRequest(clientUrl + endpoint, function(
            err2,
            statusCode2,
            xuaa2,
            result2
          ) {
            console.log(
              "---------------- POST CLAIM DONE WITH AUTH CODE HIT ----------------"
            );
            if (err2) {
              console.log("ERROR: " + err2.message);
              resultMain.send({ error: err2 });
            } else {
              console.log("---------------- LOGIN EXPIRES AT ----------------");
              console.log(xuaa[1]);
              console.log("RESULT: ");
              console.log(result2);
              console.log(typeof result2);

              if (result2) {
                if (isJSON(result2)) {
                  result2 = JSON.parse(result2);
                }

                if (typeof result2.code !== "undefined") {
                  result2 = {
                    error:
                      "A connection could not be made to the algorithm server."
                  };
                }

                createFile("output.json", JSON.stringify(result2));
                result2["display"] = config.display;
              }
              resultMain.send(result2);
            }
          });
        } else {
          console.log(
            "---------------- ERRORS OCCURRED IN AUTHENTICATION CODE ----------------"
          );
          console.log(errors);
          resultMain.send(errors);
        }
      });
    } else {
      console.log(
        "---------------- POST CLAIM DONE WITHOUT AUTH CODE HIT ----------------"
      );
      if (err) {
        console.log("ERROR: " + err.message);
        resultMain.send({ error: err });
      } else {
        console.log("RESULT: ");
        console.log(result);
        console.log(typeof result);
        if (result) {
          if (isJSON(result)) {
            result = JSON.parse(result);
          }

          if (result !== null && typeof result.code !== "undefined") {
            result = {
              error: "A connection could not be made to the algorithm server."
            };
          }
          createFile("output.json", JSON.stringify(result));
          result["display"] = config.display;
        }
        resultMain.send(result);
      }
    }
  });
});

function isJSON(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

var createFile = function(file, content) {
  fs.writeFile("tmp/output" + file, content, function(err) {
    if (err) {
      return console.log(err);
    } else {
      console.log("The file was saved!");
    }
  });
};

app.listen(9000);
console.log("Magic happens at http://localhost:" + 9000);
