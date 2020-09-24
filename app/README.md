## Available Scripts - Classic mode

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

## New scripts - In GCP/Firebase mode

### Building and deploying to our dev integration environment

```npm run build:development```

```firebase --project development deploy```


### Building and deploying to any other 'target' environment (as of 06/12/2020)

#### Required configurations

For Authentication enabled setup:

* Enable Email/Password login in Firebase Console for this new project
* Create a user named frictionless@galaxy.ai 

Add the web app, and get the values for the 'Config' and update the .env.{target} file with the new values for the relevant *FIREBASE* keys.

#### Commands to run from local

```npm install```

...next...

```npm run build:${target}```

...next...

```firebase --project ${target} deploy```

 * Make sure you have a .env.${target} file, and build command in package.json to use that env file.

 * Make sure you have the target aliases defined in the .firebaserc file to match the gcp projects.


Thats it! Check the web app link spit out by the command and validate the app flow.


