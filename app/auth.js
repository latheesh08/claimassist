
var request     = require('request');
var config = require('./config/config');
var jar = request.jar();
var request = request.defaults({jar:jar});
var debugLevel = 3; // the debug has 3 levels. 1 being the lowest level of info being displayed and 3 being the highest

module.exports =  {
    /**
     * @function postClaimRequest 
     * @description The postClaimRequest function is comprised of an initial get request that retrieves two different tokens, depending on whether this application is already logged in or not. If the app is not already logged in, then the X-Uaa-Csrf token is captured for use in the login post request. This token also contains the expiry datetime value. If the app is logged in then a short lived security X-CSRF-Token is captured. This is used to make the post request containing the claim data to the SAP server.
     */
    postClaimRequest: function(url, postData, callback) {
        var errorMessage = "";
        var returnValue = null;

        var xuaa = [];
        var xCsrfToken = null;
        
        if(debugLevel >= 2){
          console.log('--------------------------------------------------------------------------');
          console.log('NEW REQUEST GET CALL TO RETRIEVE THE X-CSRF-TOKEN IF LOGGIN IN OR THE X-UAA-CSRF TOKEN IF LOGIN IS REQUIRED');
          console.log('--------------------------------------------------------------------------');
        }

        if(debugLevel >= 3){
          console.log('--------------------------------------------------------------------------');
          console.log('CLIENT COOKIES:');
          cookie_string = jar.getCookieString(url); 
          cookies = jar.getCookies(url);
          console.log('--------------------------------------------------------------------------');
          console.log(cookie_string);
        }

        var options = { 
            url: url,
            followAllRedirects: true,
            headers: 
            { 
            accept: 'application/json',
            'Connection' : 'keep-alive',
            'X-CSRF-Token' : 'Fetch'
            } 
        };

        request.get(options, function (err, res, body) {
                if (err) {
                    errorMessage = err;
                    return console.error('Failed to make initial get request necessary to retrieve token required to make post: ', err);
                }
                
                if(debugLevel >= 2){
                console.log('STATUS CODE:', res && res.statusCode);
                }

                if(debugLevel >= 3){
                    console.log('--------------------------------------------------------------------------');
                    console.log('---------------- REQUEST HEADERS ----------------');
                    console.log(res.request.headers);
                    console.log('---------------- RESPONSE HEADERS ----------------');
                    console.log(res.headers);
                    console.log('---------------- TOKEN ----------------');
                    console.log(res.headers['x-csrf-token']);
                    var requestCookies = jar.getCookies(url);
                    console.log('--------------------------------------------------------------------------');
                    console.log('---------------- REQUEST COOKIES ----------------');
                    console.log(requestCookies);
                }

                xCsrfToken = res.headers['x-csrf-token'];

                if(xCsrfToken){
                    // AUTHENTICATION ALREADY DONE
                    postRequest(res.headers['x-csrf-token']);
                }else{
                    // NEED TO AUTHENTICATE
                    var expiresOn = '';
                    var cookie = res.headers['set-cookie'][0];
                    var cookies = jar.getCookies(url);
                    var cookieParts = cookie.split(";");

                    for(i=0; i<cookieParts.length; i++){
                        if(cookieParts[i].includes('X-Uaa-Csrf')){
                            xuaa[0] = cookieParts[i].replace("X-Uaa-Csrf=", "");
                            if(debugLevel >= 3){
                                console.log('X UAA CSRF VALUE:');
                                console.log(xuaa[0]);
                            }
                        }else if(cookieParts[i].includes('Expires')){
                            expiresOn = cookieParts[i].replace("Expires=", "");
                            xuaa[1] = expiresOn;
                            if(debugLevel >= 3){
                                console.log('EXPIRES ON');
                                console.log(expiresOn);
                            }
                        }

                        if(i === cookieParts.length - 1){
                            callback(null, null, xuaa, null);
                        }
                    }
                    
                }
        });

        var postRequest = function(token) {

            if(debugLevel >= 2){
            console.log('--------------------------------------------------------------------------');
            console.log('ACTUAL POST CALL CONTAINING THE DATA WITH RESPONSE');
            console.log('--------------------------------------------------------------------------');
            console.log('POST DATA:');
            console.log(postData);
            }
            
            var options = { 
                url: url,
                jar: jar,
                followAllRedirects: true,
                headers: 
                { 
                    accept: 'application/json',
                    'X-CSRF-TOKEN' : token,
                    'Connection' : 'keep-alive'
                },
                form: postData
            };

            request.post(options, function (err, res, body) {
                if (err) {
                    errorMessage = err;
                    return console.error('Failed to make the post request that contains the desired response: ', err);
                }

                if(debugLevel >= 2){
                    console.log('STATUS CODE:', res && res.statusCode);
                }

                if(debugLevel >= 1){
                    console.log('---------------- POST BODY RESPONSE ----------------');
                    console.log(body);
                }
                                
                returnValue = body;
                // resultMain.send(body);
                callback(errorMessage, res.statusCode, null, returnValue);

            });
        };
    },
    /**
     * @function oAuthPost 
     * @description The oAuthPost function is comprised of a post request made to the SAP login servers that authenticates this applications' user credentials. This function gets invoked if the application has not logged in yet during a session and when the X-Uaa-Csrf token has expired.
     */
    oAuthPost: function(xuaa, callback) {
        var loginUrl = config.loginUrl;
        var refererUrl = config.refererUrl;
        var username = config.username;
        var password = config.password;

        var debugLevel = 3; // the debug has 3 levels. 1 being the lowest level of info being displayed and 3 being the highest
        var cookie_string = '';
        var cookies = '';
        var xcsrf = xuaa[0];
        var xcsrfPost = '';
        var expiresOn = '';

        var errorMessages = [];
        
        if(debugLevel === 1){
          console.log('Starting the Authentication Process (please be patient)....');
        }
  
          if(debugLevel >= 2){
            console.log('--------------------------------------------------------------------------');
            console.log('POST TO LOGIN: ', loginUrl);
            console.log('--------------------------------------------------------------------------');
          }

          request.post({
            url: loginUrl,
            followAllRedirects: true,
            jar: jar,
            headers: {
              'Referer' : refererUrl,
              'Accept' : 'application/json',
              'Connection' : 'keep-alive'
            },
            form:{
              username : username,
              password : password,
              'X-Uaa-Csrf' : xcsrf
            }
          }, function(err, res, body) {
              if (err) {
                  errorMessages.push(err);
                  return console.error('Failed to post data to the login.do url: ', err);
              }

              if(debugLevel >= 3){
                  console.log('LOGIN HEADERS');
                  console.log(res.headers);
                  console.log('--------------------------------------------------------------------------');
              }
          
          if(debugLevel >= 2){
            console.log('STATUS CODE:', res && res.statusCode); // Print the response status code if a response was received
            console.log('LOGIN BODY');
            console.log(body);
          }
          callback(errorMessages);
        }); 
    }
}