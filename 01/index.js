const Alexa = require("alexa-sdk");

var handlers = {
  'LaunchRequest': function() {
    this.emit(':ask', "Welcome to the translate skill. Say something like translate butterfly to German");
  },

  'Translate': function() {
    var language = this.event.request.intent.slots.Language.value;
    var word = this.event.request.intent.slots.Source.value;

    this.emit(":tell", `Translating ${word} to ${language}`);
  }
};

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};
