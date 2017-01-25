const Alexa = require("alexa-sdk");
const RapidAPI = require('rapidapi-connect');
const rapid = new RapidAPI("Ruckus", "99c79808-d927-49aa-8cee-70223ac9bc6c");

var handlers = {
  'LaunchRequest': function() {
    this.emit(':ask', "Welcome to the translate skill. Say something like translate butterfly to German");
  },

  'Translate': function() {
    const langCodes = {
        "German" : "de",
        "Dutch" : "nl",
        "English" : "en",
        "French" : "fr",
        "Italian" : "it",
        "Polish" : "pl",
        "Russian" : "ru",
        "Spanish" : "es"
    };

    var language = this.event.request.intent.slots.Language.value;
    var word = this.event.request.intent.slots.Source.value;
    var langCode = langCodes[language];

    rapid.call('GoogleTranslate', 'translateAutomatic', {
	     'apiKey': 'AIzaSyCZhGB7c4GK07UN_K5Y83G13YwHEr7zKn4',
	      'string': word,
	      'targetLanguage': langCode

    }).on('success', (payload) => {
      this.emit(":tell", `${word} is ${payload} in ${language}`);
    }).on('error', (payload) => {
      this.emit(":tell", "Sorry, translation was unsuccessful..");
    });

  }
};

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};
