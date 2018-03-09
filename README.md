# CoC Career Fair App
[![Run in Postman](https://run.pstmn.io/button.svg)](https://www.getpostman.com/collections/7a3cc50f96cef85504ce)

#### Junior Design 7359
Brian Wang
Jesse Hayes
John Britti
Naren Dikkala
Wiqas Nassar


#### Description
This is the backend server handling database and api calls for the Coc Career Fair App at Georgia Tech. Server is built on the MERN stack (MongoDB, Express, React, Nodejs).


#### How to run
Set up your secret environment variable
```
echo 'export SECRET="your_secret_here"' >> ~/.bash_profile
```
or create a .env with these properties
```
SECRET=ursecrethere
NODE_ENV=local,development,production
```
Then install packages
```
npm install
```

To run on production use
```
npm start
```
