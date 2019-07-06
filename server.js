
/**
 * @author: Tomasz Turek
 * @description: Server supporting the operations of the Broadcaster
 * application. It enables the applications quiz functionality as that
 * that is dependent on both sending and receiving sms messages.
 */


const express = require('express')
const bodyParser = require('body-parser')
const twilio = require('twilio');


// initialize Twilio API
var accountSid = [INSERT ID HERE]; // Your Account SID from www.twilio.com/console
var authToken = [INSERT TOKEN HERE];   // Your Auth Token from www.twilio.com/console
var client = new twilio(accountSid, authToken);


// initialize express app
const app = express()
const port = process.env.PORT

// configs
app.use(bodyParser.urlencoded({ extended: false }))


// array tracking student responses.
let results = [];

// Routes

// main route
app.get('/', (req, res) => { res.send("Hello this is a `Broadcaster` Server") })

// test route
app.get('/test', (req, res) => { res.send("Test response") })

// initialize the quiz route
app.get('/start', (req, res) => {

    // reset results when starting a new quiz
    results = [];

    // quiz question being asked.
    const question = req.query.message;

    // string of contact numbers.
    const contacts = req.query.numbers;

    // split o array of contact numbers.
    let contactsArray = contacts.split("/");

    // remove last empty contact.
    contactsArray.pop();

    // log quiz initialization.
    console.log("INITIALIZING a new question")

    // send quiz question to all supplied contacts using twilio.
    contactsArray.forEach(contact => {

        client.messages.create({
            body: question, // message payload
            to: contact,  // Text this number
            from: '19179050846' // From a valid Twilio number
        }).then((message) => { console.log(`MESSAGE SENT to + ${contact}`) })

    });

    // log completion of all sent messages
    console.log("ALL MESSAGES SENT awaiting responses..")

    res.send("Question successfully broadcasted")

})

// route for incoming messages.
app.post('/message', (req, res) => {

    let senderNumber = req.body.From;
    let senderResponse = req.body.Body;

    // add response to an array of responses
    results.push({ number: senderNumber, answer: senderResponse })

    // log inbound reply
    console.log(`REPLY from ${senderNumber}`)

})

// end current quiz and get student results
app.get('/results', (req, res) => {

    console.log("QUESTION IS BEING TERMINATED sending results to client")
    //json object containing student results;
    res.json({ "results": results })

})

// rout for peeking current response count.
app.get('/answerCount', (req, res) => {

    let currentCount = results.length

    let result = currentCount.toString()

    res.send(result)
})

app.listen(port, () => console.log(`SERVER listening on localhost port  ${port}`))