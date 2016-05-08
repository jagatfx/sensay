"use strict";

var http = require('http');


// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Prevent someone else from configuring a skill that sends requests to this function. This ties to the amazon skill app id
         */        
        if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.e55597ce-7a1b-4ec2-a46a-3358652f8af5") {
             context.fail("Invalid Application ID");
        }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    
    if ("AMAZON.HelpIntent" === intentName) {
        getWelcomeResponse(callback);
    } else if ("AMAZON.StopIntent" === intentName || "AMAZON.CancelIntent" === intentName) {
        handleSessionEndRequest(callback);
    } else if ("SentimentIntent") {
        getSentiment(intentRequest, callback);
    }
    else {
        throw "Invalid intent";
    }
}

function getSentiment(intentRequest, callback) {
    var message = intentRequest.intent.slots.message.value;
    
    console.log("Message: " + message);
    
    var postData = `{ "text": "${message}" }`;
    var options = {
      hostname: 'sensay.herokuapp.com',
      port: 80,
      path: '/api/tone',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    var req = http.request(options, (res) => {
      console.log(`STATUS: ${res.statusCode}`);
      console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
      res.setEncoding('utf8');
      
      var toneName = "Unknown";
      
      res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
        
        
        var toneData = JSON.parse(chunk);
        toneData = toneData.result;

        //Find the emotion_tone section in the json response
        var emotionTone = toneData.document_tone.tone_categories.find(function(tone_category){ return tone_category.category_id === 'emotion_tone'; });
  
        //Find the max emotion tone score
        var maxScore = Math.max.apply(Math,emotionTone.tones.map(function(tone){return tone.score;}));

        //Using the max score, find the tone object with that score
        var toneWithHighestScore = emotionTone.tones.find(function(tone){ return tone.score == maxScore; });

        console.log(toneWithHighestScore.tone_name);
        
        //Find out the tone name
        toneName = toneWithHighestScore.tone_name;
        
        
      });

      res.on('end', () => {
        console.log('No more data in response.');
        
        var replyMessage = null;
        switch(toneName)
        {
            case "Anger" : replyMessage = "<speak>Why so angry? <audio src='https://s3.amazonaws.com/arrowiapp/cantdo.mp3' /></speak>";break;
            case "Fear"  : replyMessage = "<speak>No need to fear.</speak>";break;
            case "Disgust"  : replyMessage = "<speak>And you disgust me too.</speak>";break;
            case "Joy"  : replyMessage = "<speak>That's great!</speak>";break;
            case "Sadness"  : replyMessage = "<speak>I'm sorry.</speak>";break;
        }
        
        //We made it to the end - send a success response and expect the tone name to hav eben set in the data event before this
        callback(
            {},
            buildSpeechletResponse("Ok", replyMessage, "What's next", false)
            );
        
      });
    });
    
    req.on('error', (e) => {
      console.log(`problem with request: ${e.message}`);
      
      //Some problem with the API call - let the user know
      callback({},
        buildSpeechletResponse("Fail", "Call Failed", "What's next", false));
    });
    
    // write data to request body
    req.write(postData);
    req.end();
    
       
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = "<speak>Welcome to SenSay!</speak>";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Please say something";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(callback) {
    var cardTitle = "Session Ended";
    var speechOutput = "<speak>SenSay Thanks You!</speak>";
    // Setting this to true ends the session and exits the skill.
    var shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}

/**
 * Sets the color in the session and prepares the speech to reply to the user.
 */
/*function setColorInSession(intent, session, callback) {
    var cardTitle = intent.name;
    var favoriteColorSlot = intent.slots.Color;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";

    if (favoriteColorSlot) {
        var favoriteColor = favoriteColorSlot.value;
        sessionAttributes = createFavoriteColorAttributes(favoriteColor);
        speechOutput = "I now know your favorite color is " + favoriteColor + ". You can ask me " +
            "your favorite color by saying, what's my favorite color?";
        repromptText = "You can ask me your favorite color by saying, what's my favorite color?";
    } else {
        speechOutput = "I'm not sure what your favorite color is. Please try again";
        repromptText = "I'm not sure what your favorite color is. You can tell me your " +
            "favorite color by saying, my favorite color is red";
    }

    callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function createFavoriteColorAttributes(favoriteColor) {
    return {
        favoriteColor: favoriteColor
    };
}

function getColorFromSession(intent, session, callback) {
    var favoriteColor;
    var repromptText = null;
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";

    if (session.attributes) {
        favoriteColor = session.attributes.favoriteColor;
    }

    if (favoriteColor) {
        speechOutput = "Your favorite color is " + favoriteColor + ". Goodbye.";
        shouldEndSession = true;
    } else {
        speechOutput = "I'm not sure what your favorite color is, you can say, my favorite color " +
            " is red";
    }

    // Setting repromptText to null signifies that we do not want to reprompt the user.
    // If the user does not respond or says something that is not understood, the session
    // will end.
    callback(sessionAttributes,
         buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
}
*/

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "SSML",
            ssml: output
        },
        card: {
            type: "Simple",
            title: "SessionSpeechlet - " + title,
            content: "SessionSpeechlet - " + output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}