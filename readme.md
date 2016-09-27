#RapidHack - Amazon Alexa
We just put our hands on the Amazon Echo - a new Alexa powered voice assistant device from Bezos-topia (aka Amazon). Let's see what we can do with it.

##Setup
Setup is pretty straigh forward, after connecting the device to power, it tells you (in it's Siri-esque voice) to set it up using the mobile up. Process seems pretty normal and smooth.

After about 5 mins we were able to get it fully working in the office, playing Spotify playlists to our desire.

##Let the hacking begin
I'll be following Amazon's document [Steps to Build a Custom Skill](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/overviews/steps-to-build-a-custom-skill).
Our new *Skill* will be a voice command for translating text. For example you'll be able to say **Alexam translate butterfly to German** and the response will be **Schmetterling**.

The first step will be to define the intent - `Translate`:

```
{
	"intents": [
		{
			"intent" : "Translate",
			"slots": [
				{
					"name" : "Source",
					"type" : "SOURCE"
				},
				{
					"name" : "Language",
					"type" : "LANGUAGES_LIST"
				}
			]
		}
	]
}
```

We will define some Utterrances for this intent:

```
Translate translate {Source} to {Language}
Translate ask Translate how to say {Source} in {Language}
Translate ask Translate to translate {Source} to {Language}
Translate get translation for {Source} in {Language}
Translate what is {Source} in {Language}
```

We will create the new skill on the Amazon developer portal and enter that data.

##Creating the Amazon Lambda service
Whenever a user interacts with our skill (e.g. asks for a translation), we will respond using an AWS Lambda function. The Lambda function will be the 'backend' of the skill.

After creating the inital function, we'll use the following code to make sure we've wired everything correctly:

```
'use strict';

/**
 * This is the code behind the translate skill
 */


// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: 'PlainText',
            text: output,
        },
        card: {
            type: 'Simple',
            title: `SessionSpeechlet - ${title}`,
            content: `SessionSpeechlet - ${output}`,
        },
        reprompt: {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText,
            },
        },
        shouldEndSession,
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
}


// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    const sessionAttributes = {};
    const cardTitle = 'Welcome';
    const speechOutput = 'Welcome to the translate skill. Say something like translate butterfly to German';
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    const repromptText = 'Say something like translate butterfly to German';
    const shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(callback) {
    const cardTitle = 'Session Ended';
    const speechOutput = 'Thank you for trying the Translate. Have a nice day!';
    // Setting this to true ends the session and exits the skill.
    const shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}

/**
 * Intent handlers
 */
 
function translate(intent, session, callback) {
    const source = intent.slots.Source.value;
    const lang = intent.slots.Language.value;
    
    callback({},
         buildSpeechletResponse('Translate Demo', `Translating ${source} to ${lang}`, null, false));
}


// --------------- Events -----------------------

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log(`onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}`);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log(`onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}`);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log(`onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}`);

    const intent = intentRequest.intent;
    const intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    if (intentName === 'Translate') {
        translate(intent, session, callback);
    } else {
        throw new Error('Invalid intent');
    }
}

/**åå
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log(`onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}`);
    // Add cleanup logic here
}


// --------------- Main handler -----------------------

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = (event, context, callback) => {
    try {
        console.log(`event.session.application.applicationId=${event.session.application.applicationId}`);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== 'amzn1.echo-sdk-ams.app.[unique-value-here]') {
             callback('Invalid Application ID');
        }
        */

        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            onLaunch(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'IntentRequest') {
            onIntent(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, event.session);
            callback();
        }
    } catch (err) {
        callback(err);
    }
};
```

You can now test - should work.

##Connecting to RapidAPI
Copy to local repo

One thing that initally confused me was zipping the code. Turns out you need to zip the files directly, rather than zip the directory in which they are found. (MacOS usrs may natuarally right click the directory in finder and press 'compress' - this won't work).

Install RapidAPI Connect