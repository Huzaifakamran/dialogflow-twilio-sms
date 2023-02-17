const express = require('express');
const app = express();
// to manage user session
const dialogflowSessionClient = require('./botlib/dialogflow_session_client.js');
require('dotenv').config();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
process.env.GOOGLE_APPLICATION_CREDENTIALS;

const projectId = 'clothesline-cleaners-ibls';
const phoneNumber = "+12082148316";

const accountSid = '<YOUR-ACCOUNT-SID>';
const authToken = '<YOUR-AUTH-TOKEN>';

const client = require('twilio')(accountSid, authToken);
const sessionClient = new dialogflowSessionClient(projectId);

// port_num = 3000;
// start the server
const listener = app.listen(process.env.PORT, function() {
    // const listener = app.listen(port_num, function() {
    console.log('Your Twilio integration server is listening on port ' +
        listener.address().port);
});

app.post('/', async function(req, res) {
    // get the body of the msg
    const body = req.body;
    // get original text by the user
    const text = body.Body;
    // get user mobile number
    const sendTo = body.From;
    // detect the intent and pass the query
    const dialogflowResponse = (
        await sessionClient.detectIntent(text, sendTo, body)).fulfillmentText;

    console.log("User response => " + JSON.stringify(text, null, 2));

    try {
        await client.messages.create({
            body: dialogflowResponse,
            from: phoneNumber,
            to: sendTo
        }).then(message => console.log("*** message sent successfully to => " + sendTo + "  *****"+ message.sid));
    } catch (error) {
        console.log("error => " + JSON.stringify(error, null, 2))
    }
    console.log("Dialogflow responce => " + JSON.stringify(dialogflowResponse, null, 2));
    // terminate the user request successfully
    res.end();
});


process.on('SIGTERM', () => {
    listener.close(() => {
        console.log('Closing http server.');
        process.exit(0);
    });

});