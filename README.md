# WarpScript™ Node #

This module can be used to execute some WarpScript™ code within Node-RED.

Execution is triggered for every incoming message. Execution is performed on a remote Warp 10™ instance via an HTTP POST request.

## Setup

To install the WarpScript™ node, from your `~/.node-red` directory simply run

```
  npm install node-red-contrib-warpscript
```

or copy the `warpscript.js` and `warpscript.html` files into the `nodes` subdirectory.

Once the WarpScript™ node is installed, you need to restart Node-RED.

You should then see a new type of node on the Node-RED left-side menu.

## Input 

Whenever a message is received by the WarpScript™ node, the message is pushed onto the stack followed by the configured WarpScript™ code.

Each message is a map. Messages produced by Node-RED usually contain the following fields:

```
  { '_msgid' 'f8f4fefe.070b' 'topic' '' 'payload' 1472737293700 }
```

Types are converted using the following rules, primitives types (String, Number, boolean) are unmodified, arrays are converted to lists, objects are converted to maps, null is converted to NULL and Buffer is converted to a UTF-8 STRING.

## Output

Your WarpScript™ code can produce some outputs which will be pushed down your flow.

The WarpScript™ node will inspect the stack levels and convert each one to output messages according to the following rules.

If a level contains a map, it is assumed to be a valid Node-RED message, with a `payload` field containing the message content.

```
  { 'payload' 'This is the message payload' }
```

If a level contains a list, the list is assumed to be a list of lists of messages, with one inner list per output. The content of each of those lists is assumed to be messages for the given output.

```
  [
    [
      { 'payload' 'First message for output 1' }
      { 'payload' 'Second message for output 1' }
    ]
    [ { 'payload' 'Message for output 2' } ]
  ]
```

If a level contains anything else, the content will be put in the `payload` field of a Node-RED message.

If your WarpScript™ returned multiple stack levels, each level will be scanned, starting with the deepest one.
