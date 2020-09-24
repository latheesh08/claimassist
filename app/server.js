const fs          = require('fs');
const express = require('express');
const path = require('path');
const app = express();

var config = require('./config/config');
var auth = require('./auth');

app.use(express.static(path.join(__dirname, 'build')));

var clientUrl = config.clientUrl;
var debugLevel = 3; // the debug has 3 levels. 1 being the lowest level of info being displayed and 3 being the highest

app.post("/post", function(req, resultMain) {
  var data = req.body;
    console.log("QUERY STRING");
    console.log(req.query);
    var url = req.query.url;
    console.log("URL STRING");
    console.log(url);

  /**
   * @function postClaimRequest
   * @description The postClaimRequest function is called from the auth module to pass the UAA Server Authentication methods.
   */
  auth.postClaimRequest(clientUrl+url, data, function(err, statusCode, xuaa, result){
      console.log("NEW POST REQUEST CALLBACK:");
      console.log(xuaa);
      if(xuaa){
          auth.oAuthPost(xuaa, function(errors){
              if(errors.length === 0){
                  auth.postClaimRequest(clientUrl+url, data, function(err2, statusCode2, xuaa2, result2){
                      console.log('---------------- POST CLAIM DONE WITH AUTH CODE HIT ----------------');
                      if (err2) {
                          console.log("ERROR: " + err2.message);
                          resultMain.send({ error : err2 });
                      } else {
                          console.log('---------------- LOGIN EXPIRES AT ----------------');
                          console.log(xuaa[1]);
                          console.log("RESULT: ");
                          console.log(result2);
                          console.log(typeof result2);
                          
                          if(result2){
                              if(isJSON(result2)){
                                  result2 = JSON.parse(result2);
                              }

                              if (typeof result2.code   !== 'undefined') {
                                  result2 = { error : 'A connection could not be made to the algorithm server.' }
                              }

                              createFile('output.json', JSON.stringify(result2));
                              result2['display'] = config.display;
                          }
                          resultMain.send(result2);
                      }
                  });
              }else{
                  console.log('---------------- ERRORS OCCURRED IN AUTHENTICATION CODE ----------------');
                  console.log(errors);
                  resultMain.send(errors);
              }
          });
      }else{
          console.log('---------------- POST CLAIM DONE WITHOUT AUTH CODE HIT ----------------');
          if (err) {
              console.log("ERROR: " + err.message);
              resultMain.send({ error : err });
          } else {
              console.log("RESULT: ");
              console.log(result);
              console.log(typeof result);
              if(result){
                  if(isJSON(result)){
                      result = JSON.parse(result);
                  }
                  
                  if (result !== null && typeof result.code   !== 'undefined') {
                      result = { error : 'A connection could not be made to the algorithm server.' }
                  }
                  createFile('output.json', JSON.stringify(result));
                  result['display'] = config.display;
              }
              resultMain.send(result);
          }
      }
  });
});

app.get("/get", function(req, resultMain) {
    
    console.log("QUERY STRING");
    console.log(req.query);
    var url = req.query.url;
    console.log("URL STRING");
    console.log(url);
  
    /**
     * @function getClaimRequest
     * @description The getClaimRequest function is called from the auth module to pass the UAA Server Authentication methods.
     */
    auth.getClaimRequest(clientUrl+url, function(err, statusCode, xuaa, result){
        console.log("NEW POST REQUEST CALLBACK:");
        console.log(xuaa);
        if(xuaa){
            auth.oAuthPost(xuaa, function(errors){
                if(errors.length === 0){
                    auth.getClaimRequest(clientUrl+url, function(err2, statusCode2, xuaa2, result2){
                        console.log('---------------- POST CLAIM DONE WITH AUTH CODE HIT ----------------');
                        if (err2) {
                            console.log("ERROR: " + err2.message);
                            resultMain.send({ error : err2 });
                        } else {
                            console.log('---------------- LOGIN EXPIRES AT ----------------');
                            console.log(xuaa[1]);
                            console.log("RESULT: ");
                            console.log(result2);
                            console.log(typeof result2);
                            
                            if(result2){
                                if(isJSON(result2)){
                                    result2 = JSON.parse(result2);
                                }
  
                                if (typeof result2.code   !== 'undefined') {
                                    result2 = { error : 'A connection could not be made to the algorithm server.' }
                                }
  
                                createFile('output.json', JSON.stringify(result2));
                                result2['display'] = config.display;
                            }
                            resultMain.send(result2);
                        }
                    });
                }else{
                    console.log('---------------- ERRORS OCCURRED IN AUTHENTICATION CODE ----------------');
                    console.log(errors);
                    resultMain.send(errors);
                }
            });
        }else{
            console.log('---------------- POST CLAIM DONE WITHOUT AUTH CODE HIT ----------------');
            if (err) {
                console.log("ERROR: " + err.message);
                resultMain.send({ error : err });
            } else {
                console.log("RESULT: ");
                console.log(result);
                console.log(typeof result);
                if(result){
                    if(isJSON(result)){
                        result = JSON.parse(result);
                    }
                    
                    if (result !== null && typeof result.code   !== 'undefined') {
                        result = { error : 'A connection could not be made to the algorithm server.' }
                    }
                    createFile('output.json', JSON.stringify(result));
                    result['display'] = config.display;
                }
                resultMain.send(result);
            }
        }
    });
});

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
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
  
  fs.writeFile("tmp/"+file, content, function(err) {
      if(err) {
          return console.log(err);
      }else{
          console.log("The file was saved!");
      }
      
  }); 

}

app.listen(9000);
console.log('Magic happens at http://localhost:' + 9000);