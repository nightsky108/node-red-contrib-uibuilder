/*global document,$,window */
/*
  Copyright (c) 2017 Julian Knight (Totally Information)

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

var debug = false,
    ioChannels = {control: 'uiBuilderControl', client: 'uiBuilderClient', server: 'uiBuilder'},
    msgCounter = {control: 0, sent: 0, data: 0},
    msg = {},
    cookies = [],
    ioNamespace = '/'+readCookie('uibuilder-namespace')

// Create the socket - make sure client uses Socket.IO version from the uibuilder module (using path)
var io = io(ioNamespace, {path: window.location.pathname + 'socket.io', transports: ['polling', 'websocket']})

// send a msg back to Node-RED, NR will generally expect the msg to contain a payload topic
var sendMsg = function(msg) {
    // Track how many messages have been sent
    msgCounter.sent++
    $('#msgsSent').text(msgCounter.sent)
    $('#showMsgSent').text(JSON.stringify(msg))

    io.emit(ioChannels.client, msg)
} // --- End of Send Msg Fn --- //

// When the socket is connected .................
io.on('connect', function() {
    debug && console.log('SOCKET CONNECTED - Namespace: ' + ioNamespace)

    // When Node-RED uibuilder template node sends a msg over Socket.IO...
    io.on(ioChannels.server, function(wsMsg) {
        debug && console.info('uibuilder:io.connect:io.on.data - msg received - Namespace: ' + ioNamespace)
        //console.dir(wsMsg)

        // Make sure that msg is an object & not null
        if ( wsMsg === null ) {
            wsMsg = {}
        } else if ( typeof wsMsg !== 'object' ) {
            wsMsg = { 'payload': wsMsg }
        }

        // Save the msg for further processing
        msg = wsMsg

        // Track how many messages have been recieved
        msgCounter.data++
        $('#msgsReceived').text(msgCounter.data)
        $('#showMsg').text(JSON.stringify(msg))

        // TODO: Add a check for a pre-defined global function here
        //       to make it easier for users to add their own code
        //       to process reciept of new msg
        //       OR MAYBE use msg.prototype to add a function?

        // Test auto-response
        if (debug) {
            wsMsg.payload = 'We got a message from you, thanks'
            sendMsg(wsMsg)
        }

    }) // -- End of websocket recieve DATA msg from Node-RED -- //

    // Recieve a CONTROL msg from Node-RED
    io.on(ioChannels.control, function(wsMsg) {
        debug && console.info('uibuilder:io.connect:io.on.control - msg received - Namespace: ' + ioNamespace)
        //console.dir(wsMsg)


        // Make sure that msg is an object & not null
        if ( wsMsg === null ) {
            wsMsg = {}
        } else if ( typeof wsMsg !== 'object' ) {
            wsMsg = { 'payload': wsMsg }
        }

        msgCounter.control++
        $('#msgsControl').text(msgCounter.control)
        $('#showMsg').text(JSON.stringify(wsMsg))

        switch(wsMsg.type) {
            case 'shutdown':
                // We are shutting down
                break
            case 'connected':
                // We are connected to the server
                break
            default:
                // Anything else
        }

        // Test auto-response
        if (debug) {
            wsMsg.payload = 'We got a control message from you, thanks'
            sendMsg(wsMsg)
        }

    }) // -- End of websocket recieve CONTROL msg from Node-RED -- //

}) // --- End of socket connection processing ---

// When the socket is disconnected ..............
io.on('disconnect', function() {
    debug && console.log('SOCKET DISCONNECTED - Namespace: ' + ioNamespace)
}) // --- End of socket disconnect processing ---

// When JQuery is ready, update
$( document ).ready(function() {

    $('#msgsReceived').text(msgCounter.data)
    $('#msgsControl').text(msgCounter.control)
    $('#msgsSent').text(msgCounter.sent)
    $('#showMsg').text(JSON.stringify(msg))

});

// ----- UTILITY FUNCTIONS ----- //
function readCookie(name,c,C,i){
    // @see http://stackoverflow.com/questions/5639346/what-is-the-shortest-function-for-reading-a-cookie-by-name-in-javascript
    if(cookies.length > 0){ return cookies[name]; }

    c = document.cookie.split('; ');
    cookies = {};

    for(i=c.length-1; i>=0; i--){
        C = c[i].split('=');
        cookies[C[0]] = C[1];
    }

    return cookies[name];
}
// ----------------------------- //

// EOF
