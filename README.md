# CoC Career Fair App
[![Run in Postman](https://run.pstmn.io/button.svg)](https://www.getpostman.com/collections/9c7004b490f65bc97dd5)

## Junior Design 7359
Brian Wang
Jesse Hayes
John Britti
Naren Dikkala
Wiqas Nassar

## Description
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

## Quick Start
First install node and npm by going to this [website](https://nodejs.org/en/)

Clone the repository and open a command line/bash terminal to that directory.
```
git clone https://github.com/wdjg/coccareerfairapp-server.git
cd coccareerfairapp-server
```

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

## To Run...
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

## Release Notes (Version 1.0)
API routes: see https://documenter.getpostman.com/view/3884721/coccareerfairapp/RVnTmgYP

Cron jobs:

cron.js
  * scheduler for individual cron jobs

updateAllPrelineToNotification.js
  * runs every 5 seconds.
  * Checks for all students with 'preline' status & moves them into 'notification' status (& sends email notification [not implemented]) as long as the sum of students in	'notification' and 'inline' does not exceed BATCH_SIZE. 
  * Adjust BATCH_SIZE in models/lines.js; it's currently set to 5. We haven't tested the system at scale yet, so we don't know how good a number 5 is, or whether to move it up or down.
	
updateAllQRValues.js
  * runs every 5 minutes.
  * Deletes expired QR code values for all employers.
    * Current lifetime is 10 minutes, so at most 2 QR code values should exist at any one time.
    * The QR controller should be sending the front end the newest QR code value. We have 2 to handle the edge case where the QR code value rolls over just after the user has scanned it;	this way they don't have to scan it again (since the old one lives on for another 5 minutes after	it stops being displayed).
  * Creates a new QR code value for each employer (unique to each employer).
  * See https://documenter.getpostman.com/view/3884721/coccareerfairapp/RVnTmgYP , "Get QR by QR code value", for an explanation of why this system is in place. The short answer is that lines should not be joined remotely; you must be physically standing in front of the displayed QR code to scan it.
	
updateAllTimeout.js
  * Not implemented.
  * But, the idea is something like this:
    * If someone gets a notification to go re-scan and stand in the active batch line, we want them to do so	relatively quickly. This is to avoid the disaster scenario of a recruiter having people's names listed in the active batch, but no actual people standing in line. There are 2 effects of this scenario:
      * The recruiter has no one to talk to, so they have to either do nothing and wait, or start taking	people from the regular, non-Jacket line, which could cause confusion when someone actually does show up in the Jacket line. Also, the recruiter may lose faith in the Jacket line system overall.
      * The rest of the line comes to a standstill, because nobody is progressing through the line by talking to recruiters. This outcome is obviously worse for everyone involved than if we never had the Jacket line system in the first place. Also, this means that other students may lose faith in the Jacket line system.
    * Anyway, to provide an incentive to NOT just sit on a notification, this cron job should check on everyone that has 'notification' status, and check (via lineEvents) how long it has been since they received that status. If it's been too long (example value in the file is 10 minutes, but we've usually been telling people 5 minutes),	the student gets forcibly removed from the line, via updating their status to "timeoutchurn".
      * Updating their status to "timeoutchurn" will automatically log a lineEvent and then delete the line entry.

## Known Bugs
No currently known bugs. Most bugs have been squashed.

## Contact Information
Brian Wang at brianwang9100@gmail.com

Jesse Hayes at jhayes@gatech.edu
