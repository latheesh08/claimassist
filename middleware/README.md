Galacticar Authentication Testing App
===============================

Install and Usage Guidelines
----------------------------------
* If you do not have node installed on your machine, go to https://nodejs.org/en/download/ and install
* Set this project up in a location you can navigate to on your command line/terminal.
* On your command line/terminal, navigate to this projects directory (galacticar-web-auth) and run command: 'npm install'
* Go to the config subfolder in this project directory and open the config.js file in your favourite text editor
* Note that your username and password credentials must be entered into their respective variables in the config.js, the authentication endpoints and the test transaction endpoint are stored there also
* On your command line, within the project root directory, run the command: 'node server.js'
* Browse to http://localhost:8080 on your browser to see the application running
* Click on the Launch Algorithm button to send test data to the API
* You should see a success message and data be returned if the transaction was a success. Otherwise, contact a Galaxy Adminstrator for assistance

Code Guidlines
-----------------------------------
* In order to send data to the Galacticar API for processing, you must pass our unique, custom OAuth2 authentication process
* We have constructed this angularjs/node application that demonstrates how this is done
* The majority of the authentication code is in the auth.js file
* Server.js is where the authentication code is invoked
* You will find detailed comments embedded in the code that explain exactly what each authentication function is doing
* At a high level, the sequence is as follows:
    - A GET request must first be sent to the OSHOT test transaction endpoint in order to retrieve a token. On your very first attempt at this request you will receive the X-Uaa-Csrf token that is required to be passed during the LOGIN POST request.
    - The LOGIN POST request is then made that posts the X-Uaa-Csrf token along with your login credentials to the authentication endpoints.
    - Once you are logged in successfully, you must then make a second GET REQUEST identical to the original get request mentioned above. However, this time you will receive a short lived token called x-csrf-token that you need in order to make the final OSHOT POST request to the test transaction endpoint.
    - Now that you have retreived the x-csrf-token you can make the final OSHOT POST request containing the json input to be processed by the Galacticar API.
    - Once logged in you do not need to make the LOGIN POST request but you do have to keep making the GET request to retreive the short lived x-csrf-token
* Notes:
    - Please pay close attention to the request and response headers that are being passed with each request. For example, it is vital that you pass the request header 'X-CSRF-Token' : 'Fetch' in the GET request in order to retreive the x-csrf-token
    - It is not possible to test any of these requests in isolation to each other. The cookies/headers must persist between calls in order for the entire flow to work.
    - Please analyse what is being logged to the console to see exactly what cookies/headers are being passed in order to successfully reverse engineer this authentication process.
    - Good Luck!