# SenSay
Customer support sentiment analysis.

## Prerequisites

For local dev:
- mongo
- nodejs
- node foreman

You need to create a .env file with (fill in blanks):
```
WATSON_URL=
WATSON_USER=
WATSON_PASS=
WATSON_USER_PERSONALITY=
WATSON_PASS_PERSONALITY=
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost/sensay
```

## Installation

```
npm install
```

## Run Locally

```
nf start
```

## Clear Local Database
```
https://localhost:3000/api/clear
```


## Deployment

Deploys automatically on heroku from the latest on master branch.
