//
//   Copyright 2019  SenX S.A.S.
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.
//

module.exports = function(RED) {

  function WarpScriptNode(config) {

    RED.nodes.createNode(this,config);
    var node = this;
    this.warpurl = config.warpurl;
    this.warpscript = config.warpscript;  

    var urllib = require("url");

    var https = require('https');
    var http = require('http');

    var isTemplatedUrl = (this.url || "").indexOf("{{") != -1;

    this.on('input', function(msg) {
  
      var method = "POST";

      //
      // Create the representation of the message
      //

      var postData = "{ ";

      for(var key in msg) {
        currentData = msg[key];
        var parsed = parse(currentData) ;
        if (undefined != parsed) {
          postData += " '" +  key.toString() + "' " + parsed;
        }
      }

      postData += "} " + this.warpscript;

      console.log(postData);

      var async = true;

      var opts = urllib.parse(this.warpurl);

      var post_options = {
        host: opts.hostname,
        port: opts.port,
        path: opts.path,
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      // Set up the response handling

      var post_req = ((/^https/.test(this.warpurl)) ? https : http).request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          //
	  // parse the JSON returned by Warp 10™ and reverse it so the most recent element is last
          //
          json = JSON.parse(chunk).reverse();

          output = []

	  json.forEach(function(message) {
	    if (Array.isArray(message)) {
	      output.push(message);
            } else if (typeof message == 'object') {
              output.push(message);
            } else {
	      //
	      // Wrap the element in an object
              //
	      msg = {}
              msg.payload = message
	      output.push(msg);
            }
	  });

          //
          // Emit the output messages
          //
          output.forEach(function(msg) {
	    node.send(msg);
	  });          
        });
      });

      post_req.on('error',function(err) {
        node.error(err,msg);
        msg.payload = err.toString() + ": " + this.warpurl;
        msg.statusCode = err.code;
        node.send(msg);
        node.status({fill: "red", shape: "ring", text: err.code});
      });
    
      //
      // do the actual HTTP call
      //
      post_req.write(postData);
      post_req.end();
    });
  }

  //
  // Parse an element and output its WarpScript™ representation
  //

  function parse(currentData) {

    if (typeof currentData === 'string') {  
      return " '" + currentData.toString() + "' ";
    }

    if (typeof currentData === 'number' || typeof currentData === 'boolean') {  
      return currentData.toString() + " ";
    }

    if (typeof currentData === 'Buffer') {
      return currentData.toString('utf-8') + "' ";
    }

    if (Array.isArray(currentData)) {
      var array= "[ ";
      for (index = 0; index < currentData.length; ++index) {  
        array += parse(currentData[index]);
      }
      array += "] ";
      return array;
    }

    if (typeof currentData === 'object') {
      if (null === currentData) {
        return "NULL";
      }
      var obj= "{ ";
      for(var keyItem in currentData) {
        subItem = currentData[keyItem];
        obj += " '" +  keyItem.toString() + "' " + parse(subItem);
      } 
      obj += "} ";
      return obj;
    }

    return undefined;
  }

  RED.nodes.registerType("WarpScript", WarpScriptNode);
}
