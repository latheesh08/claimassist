Use SAP Authentication Code
===============================

Create axios GET or POST call
----------------------------------
* First axios example is in the ClaimsDay.jsx file
* axios.get('/get?url=services.xsodata/events')
* URL in the string above is the end of the SAP API endpoint. The base url is defined in the config.js
* Test your endpoint is accurate by combining the value of the clientUrl variable in the config.js with the url query string and run it in a browser to see if it produces a result


Build your application
----------------------------------
* On your command line/terminal, navigate to this projects directory (react-dashboard) and run command: 
'npm run-script build'
* Wait a good while until an optimized production build is complete

Run the SAP server.js file
----------------------------------
* Open the config.js file located in the config folder and enter your SAP username and password into the relavant variables
* On your command line/terminal, navigate to this projects directory (react-dashboard) and run command: 
'nodemon server.js'