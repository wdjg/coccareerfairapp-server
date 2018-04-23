# CoC Career Fair App
[![Run in Postman](https://run.pstmn.io/button.svg)](https://www.getpostman.com/collections/9c7004b490f65bc97dd5)

#### Junior Design 7359
Brian Wang
Jesse Hayes
John Britti
Naren Dikkala
Wiqas Nassar

#### Description
This is the backend server handling database and api calls for the Coc Career Fair App at Georgia Tech. Server is built on the MERN stack (MongoDB, Express, React, Nodejs).

This repository only includes the back-end portion of this project, which consists of the API and the database.
The front-end portion of this project can be found [here](https://https://github.com/wdjg/coccareerfairapp-web)

This project was built with node v8.9.4 and npm v5.6.0

This app is also compiled using ES6 Javascript standards, using the most recent env-preset. Compiled files are saved in the temporary `dist` folder. You can modify the presets in the `.babelrc` file included in this project.

This app is currently deployed on heroku on these free tier boxes:
```
jacket-web-development.herokuapp.com // web development box
jacket-server-development.herokuapp.com // server development box

jacket-app.herokuapp.com // web production box
jacket-server-production.herokuapp.com // server production box
```

If you need access to this Repository, Heroku, Zenhub, or other documents, please see the contact information below.

#### Install Guide
First install node and npm by going to this [website](https://nodejs.org/en/)

Make sure you can run these two commands and that they show the most recent version.
```
node -v
npm -v
```

Then, you need to set up your secret environment variable. This is used for authentication and jwt token generation.
```
echo 'export SECRET="your_secret_here"' >> ~/.bash_profile
```

OR create a .env in the root of this project with these properties
```
SECRET=ursecrethere
NODE_ENV=development
```

Then install packages using npm.
```
npm install
```

To run this, run this command
```
npm start
```

List of commands you can perform are below:
```
npm start // builds and runs app
npm run build // builds using 
npm run clean // deletes the dist folder
npm test // runs mocha and chai tests
```

#### Release Notes


#### Contact Information
Brian Wang at brianwang9100@gmail.com
