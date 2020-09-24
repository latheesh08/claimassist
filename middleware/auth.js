
var request = require('request');
var config = require('./config/config');
var jar = request.jar();
var request = request.defaults({ jar: jar });
var debugLevel = 3; // the debug has 3 levels. 1 being the lowest level of info being displayed and 3 being the highest
var accessToken  = 'eyJhbGciOiAiUlMyNTYiLCJ0eXAiOiAiSldUIn0.eyJqdGkiOiI1NTAzMjZlMTJkMTk0MmE3YjM0ZjJmMzM2NzVhZmY5NyIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEifSwiZ2l2ZW5fbmFtZSI6IkxhdGhlZXNoIiwieHMudXNlci5hdHRyaWJ1dGVzIjp7fSwiZmFtaWx5X25hbWUiOiJQIiwic3ViIjoiMTA1MjQ4OSIsInNjb3BlIjpbImdhbGFjdGljYXIhaTYuRGVsZXRlIiwib3BlbmlkIiwiZ2FsYWN0aWNhciFpNi5EaXNwbGF5IiwiZ2FsYWN0aWNhciFpNi5FZGl0IiwiZ2FsYWN0aWNhciFpNi5WaWV3QWxsIl0sImNsaWVudF9pZCI6InNiLWdhbGFjdGljYXIhaTYiLCJjaWQiOiJzYi1nYWxhY3RpY2FyIWk2IiwiYXpwIjoic2ItZ2FsYWN0aWNhciFpNiIsImdyYW50X3R5cGUiOiJwYXNzd29yZCIsInVzZXJfaWQiOiIxMDUyNDg5Iiwib3JpZ2luIjoidWFhIiwidXNlcl9uYW1lIjoiTEFUSEVFU0giLCJlbWFpbCI6ImxhdGhlZXNoQHN0YXJzeXN0ZW1zLmluIiwiYXV0aF90aW1lIjoxNTc2MTI0OTk2LCJyZXZfc2lnIjoiZTQ0MzEzZTEiLCJpYXQiOjE1NzYxMjQ5OTYsImV4cCI6MTU3NjE2ODE5NiwiaXNzIjoiaHR0cDovL3hzYS1lNTkzZTJlMi0zZDZiLTQwNDYtOTJmMi1kMGFjMWQ0MWVjOTMvVUFBL29hdXRoL3Rva2VuIiwiemlkIjoidWFhIiwiYXVkIjpbInNiLWdhbGFjdGljYXIhaTYiLCJvcGVuaWQiLCJnYWxhY3RpY2FyIWk2Il19.c3jwj3xsy3coTKsRXKZAm8mSAC-ZHhLZG5Yv-FEWESHnjX20EVniHVOZpSDqhsWCndBvttSlRVkFWZgoHJg6bSo457Ax_nVDfV6HJOx1Xu9Hmhdo0VWRTSxBLUA9fuLA8xMFw-ZxfrgcbzVomGzPjSYzjDmY9HRmYp2CXKggwcKdCD8JLDXPgkMe8oLUawjxB9Ic2diB1m7HFFOcq3Z8XDaWmM_r7UmtYRMJCb6bFnpaB86-4rcnxYEi4BAj37M5lhojTNqEgoJsWn-IqLpBztrgisVGVzvxcp51_jmke8AQZt3XwC9shkMgm63WwM-LzQVquZYUV0EItz4eXAtBkg';
var global_cookie = 'JSESSIONID=s%3AyZOfyuIipuQSednY9nu-So27HrtfK1ZT.OpxkfnZ%2F63o4VuGbtkgGFzrjKobH2IBCFBTp%2FXov%2Fm4'
module.exports = {
    /**
     * @function getClaimRequest 
     * @description The getClaimRequest function is comprised of an initial get request that retrieves two different tokens, depending on whether this application is already logged in or not. If the app is not already logged in, then the X-Uaa-Csrf token is captured for use in the login post request. This token also contains the expiry datetime value. If the app is logged in then a short lived security X-CSRF-Token is captured. This is used to make the post request containing the claim data to the SAP server.
     */
    getClaimRequest: function (url, gcrCallback) {
        var errorMessage = "";
        var returnValue = null;

        var xuaa = [];
        var xCsrfToken = null;
        var cookie_string = "";

        if (debugLevel >= 2) {
            console.log('--------------------------------------------------------------------------');
            console.log('GET CLAIM REQUEST GET CALL TO RETRIEVE THE X-CSRF-TOKEN IF LOGIN IN OR THE X-UAA-CSRF TOKEN IF LOGIN IS REQUIRED');
            console.log('--------------------------------------------------------------------------');
        }

        if (debugLevel >= 3) {
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
                'Authorization': 'Bearer ' + accessToken, 
                accept: 'application/json',
                'Connection': 'keep-alive',
                'X-CSRF-Token': 'Fetch',
                'Cookie' : global_cookie
            }
        };

        request.get(options, function (err, res, body) {
            console.log('... in the get Claim ....')
            console.log(res.body)
            if (err) {
                errorMessage = err;
                return console.error('Failed to make initial get request necessary to retrieve token required to make post: ', err);
            }

            if (debugLevel >= 2) {
                console.log('STATUS CODE:', res && res.statusCode);
            }

            if (debugLevel >= 3) {
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

            if(res.statusCode === 403){

                console.log('--------------------------------------------------------------------------');
                console.log('---------------- 403 PERMISSIONS ERROR ----------------');
                var err403 = {
                    message: "403 permissions error",
                    status: 403
                }
                gcrCallback(err403, res.statusCode, null, null);
            }else{

                xCsrfToken = res.headers['x-csrf-token'];

                if (xCsrfToken) {
                    // AUTHENTICATION ALREADY DONE
                    getRequest(res.headers['x-csrf-token']);
                } else {
                    // NEED TO AUTHENTICATE
                    var expiresOn = '';

                    var cookie = null;

                    var cookie = res.headers['set-cookie'][0];

                    var cookies = jar.getCookies(url);
                    var cookieParts = cookie.split(";");

                    for (i = 0; i < cookieParts.length; i++) {
                        if (cookieParts[i].includes('X-Uaa-Csrf')) {
                            xuaa[0] = cookieParts[i].replace("X-Uaa-Csrf=", "");
                            if (debugLevel >= 3) {
                                console.log('X UAA CSRF VALUE:');
                                console.log(xuaa[0]);
                            }
                        } else if (cookieParts[i].includes('Expires')) {
                            expiresOn = cookieParts[i].replace("Expires=", "");
                            xuaa[1] = expiresOn;
                            if (debugLevel >= 3) {
                                console.log('EXPIRES ON');
                                console.log(expiresOn);
                            }
                        }

                        if (i === cookieParts.length - 1) {
                            gcrCallback(null, null, xuaa, null);
                        }
                    }
                }
            }

        });



        var getRequest = function (token) {

            var options = {
                url: url,
                jar: jar,
                followAllRedirects: true,
                headers:
                {
                'Authorization': 'Bearer ' + accessToken, 
                accept: 'application/json',
                'Connection': 'keep-alive',
                'Cookie' : global_cookie,
                'X-CSRF-TOKEN': token
                }
            };

            request.get(options, function (err, res, body) {
                if (err) {
                    errorMessage = err;
                    return console.error('Failed to make the post request that contains the desired response: ', err);
                }

                if (debugLevel >= 2) {
                    console.log('STATUS CODE:', res && res.statusCode);
                }

                if (debugLevel >= 1) {
                    console.log('---------------- POST BODY RESPONSE ----------------');
                    console.log(body);
                }

                returnValue = body;
                // resultMain.send(body);
                gcrCallback(errorMessage, res.statusCode, null, returnValue);

            });
        };
    },
    /**
     * @function postClaimRequest 
     * @description The postClaimRequest function is comprised of an initial get request that retrieves two different tokens, depending on whether this application is already logged in or not. If the app is not already logged in, then the X-Uaa-Csrf token is captured for use in the login post request. This token also contains the expiry datetime value. If the app is logged in then a short lived security X-CSRF-Token is captured. This is used to make the post request containing the claim data to the SAP server.
     */
    postClaimRequest: function (url, postData, callback) {
        var errorMessage = "";
        var returnValue = null;

        var xuaa = [];
        var xCsrfToken = null;

        if (debugLevel >= 2) {
            console.log('--------------------------------------------------------------------------');
            console.log('POST CLAIM REQUEST GET CALL TO RETRIEVE THE X-CSRF-TOKEN IF LOGIN IN OR THE X-UAA-CSRF TOKEN IF LOGIN IS REQUIRED');
            console.log('--------------------------------------------------------------------------');
        }

        if (debugLevel >= 3) {
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
                'Authorization': 'Bearer ' + accessToken, 
                accept: 'application/json',
                'Connection': 'keep-alive',
                'Cookie' : global_cookie,
                'X-CSRF-Token': 'Fetch'
            }
        };

        request.get(options, function (err, res, body) {
            if (err) {
                errorMessage = err;
                return console.error('Failed to make initial get request necessary to retrieve token required to make post: ', err);
            }

            if (debugLevel >= 2) {
                console.log('STATUS CODE:', res && res.statusCode);
            }

            if (debugLevel >= 3) {
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

            if (xCsrfToken) {
                // AUTHENTICATION ALREADY DONE
                postRequest(res.headers['x-csrf-token']);
            } else {
                // NEED TO AUTHENTICATE
                var expiresOn = '';
                var cookie = res.headers['set-cookie'][0];
                var cookies = jar.getCookies(url);
                var cookieParts = cookie.split(";");

                for (i = 0; i < cookieParts.length; i++) {
                    if (cookieParts[i].includes('X-Uaa-Csrf')) {
                        xuaa[0] = cookieParts[i].replace("X-Uaa-Csrf=", "");
                        if (debugLevel >= 3) {
                            console.log('X UAA CSRF VALUE:');
                            console.log(xuaa[0]);
                        }
                    } else if (cookieParts[i].includes('Expires')) {
                        expiresOn = cookieParts[i].replace("Expires=", "");
                        xuaa[1] = expiresOn;
                        if (debugLevel >= 3) {
                            console.log('EXPIRES ON');
                            console.log(expiresOn);
                        }
                    }

                    if (i === cookieParts.length - 1) {
                        callback(null, null, xuaa, null);
                    }
                }

            }
        });

        var postRequest = function (token) {

            if (debugLevel >= 2) {
                console.log('--------------------------------------------------------------------------');
                console.log('ACTUAL POST CALL CONTAINING THE DATA WITH RESPONSE');
                console.log('--------------------------------------------------------------------------');
                console.log('POST DATA:');
                console.log(postData);
            }
            console.log("URL");
            console.log(url);

            var options = {
                url: url,
                jar: jar,
                followAllRedirects: true,
                headers:
                {
                    'Authorization': 'Bearer ' + accessToken, 
                    accept: 'application/json',
                    'Connection': 'keep-alive',
                    'Cookie' : global_cookie,
                    'X-CSRF-Token': token
                },
                form: postData
            };

            request.post(options, function (err, res, body) {
                if (err) {
                    errorMessage = err;
                    return console.error('Failed to make the post request that contains the desired response: ', err);
                }

                if (debugLevel >= 2) {
                    console.log('STATUS CODE:', res && res.statusCode);
                }

                if (debugLevel >= 1) {
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
     * @function putClaimRequest 
     * @description The putClaimRequest function is comprised of an initial get request that retrieves two different tokens, depending on whether this application is already logged in or not. If the app is not already logged in, then the X-Uaa-Csrf token is captured for use in the login post request. This token also contains the expiry datetime value. If the app is logged in then a short lived security X-CSRF-Token is captured. This is used to make the post request containing the claim data to the SAP server.
     */
    putClaimRequest: function (url, putData, callback) {
        var errorMessage = "";
        var returnValue = null;

        var xuaa = [];
        var xCsrfToken = null;

        if (debugLevel >= 2) {
            console.log('--------------------------------------------------------------------------');
            console.log('POST CLAIM REQUEST GET CALL TO RETRIEVE THE X-CSRF-TOKEN IF LOGIN IN OR THE X-UAA-CSRF TOKEN IF LOGIN IS REQUIRED');
            console.log('--------------------------------------------------------------------------');
        }

        if (debugLevel >= 3) {
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
                'Authorization': 'Bearer ' + accessToken, 
                accept: 'application/json',
                'Connection': 'keep-alive',
                'Cookie' : global_cookie,
                'X-CSRF-Token': 'Fetch'
            }
        };

        request.get(options, function (err, res, body) {
            if (err) {
                errorMessage = err;
                return console.error('Failed to make initial get request necessary to retrieve token required to make post: ', err);
            }

            if (debugLevel >= 2) {
                console.log('STATUS CODE:', res && res.statusCode);
            }

            if (debugLevel >= 3) {
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

            if (xCsrfToken) {
                // AUTHENTICATION ALREADY DONE
                putRequest(res.headers['x-csrf-token']);
            } else {
                // NEED TO AUTHENTICATE
                var expiresOn = '';
                var cookie = res.headers['set-cookie'][0];
                var cookies = jar.getCookies(url);
                var cookieParts = cookie.split(";");

                for (i = 0; i < cookieParts.length; i++) {
                    if (cookieParts[i].includes('X-Uaa-Csrf')) {
                        xuaa[0] = cookieParts[i].replace("X-Uaa-Csrf=", "");
                        if (debugLevel >= 3) {
                            console.log('X UAA CSRF VALUE:');
                            console.log(xuaa[0]);
                        }
                    } else if (cookieParts[i].includes('Expires')) {
                        expiresOn = cookieParts[i].replace("Expires=", "");
                        xuaa[1] = expiresOn;
                        if (debugLevel >= 3) {
                            console.log('EXPIRES ON');
                            console.log(expiresOn);
                        }
                    }

                    if (i === cookieParts.length - 1) {
                        callback(null, null, xuaa, null);
                    }
                }

            }
        });

        var putRequest = function (token) {

            if (debugLevel >= 2) {
                console.log('--------------------------------------------------------------------------');
                console.log('ACTUAL POST CALL CONTAINING THE DATA WITH RESPONSE');
                console.log('--------------------------------------------------------------------------');
                console.log('PUT DATA:');
                console.log(putData);
            }
            console.log("URL");
            console.log(url);

            var options = {
                url: url,
                jar: jar,
                followAllRedirects: true,
                headers:
                {    
                'Authorization': 'Bearer ' + accessToken, 
                accept: 'application/json',
                'Connection': 'keep-alive',
                'Cookie' : global_cookie,
                'X-CSRF-Token': token
 
                },
                form: putData
            };

            request.put(options, function (err, res, body) {
                if (err) {
                    errorMessage = err;
                    return console.error('Failed to make the PUT request that contains the desired response: ', err);
                }

                if (debugLevel >= 2) {
                    console.log('STATUS CODE:', res && res.statusCode);
                }

                if (debugLevel >= 1) {
                    console.log('---------------- PUT BODY RESPONSE ----------------');
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
    oAuthPost: function (xuaa, callback) {
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

        if (debugLevel === 1) {
            console.log('Starting the Authentication Process (please be patient)....');
        }

        if (debugLevel >= 2) {
            console.log('--------------------------------------------------------------------------');
            console.log('POST TO LOGIN: ', loginUrl);
            console.log('--------------------------------------------------------------------------');
        }

        request.post({
            url: loginUrl,
            followAllRedirects: true,
            jar: jar,
            headers: {
                'Referer': refererUrl,
                'Accept': 'application/json',
                'Connection': 'keep-alive'
            },
            form: {
                username: username,
                password: password,
                'X-Uaa-Csrf': xcsrf
            }
        }, function (err, res, body) {
            if (err) {
                errorMessages.push(err);
                return console.error('Failed to post data to the login.do url: ', err);
            }

            if (debugLevel >= 3) {
                console.log('LOGIN HEADERS');
                console.log(res.headers);
                console.log('--------------------------------------------------------------------------');
            }

            if (debugLevel >= 2) {
                console.log('STATUS CODE:', res && res.statusCode); // Print the response status code if a response was received
                console.log('LOGIN BODY');
                console.log(body);
            }
            callback(errorMessages);
        });
    }
}