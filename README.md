# Node WarpScript #

This module can be used to execute some WarpScript with node-red. This will be done by executing an HTTP POST to the [Warp 10](http://www.warp10.io/) url indicated in the warpscript node config.

## Input 

If an input is added before the warpscript node, then it pushes the message contained in it directly on the stack. If the message contains any primitives types, they are pushed as if on warpscript (String, Number and boolean), array are converted in List, object in Map, null in NULL, and Buffer in utf-8 string. 

A message on WarpScript have the following form:  

```
  { '_msgid' 'f8f4fefe.070b' 'topic' '' 'payload' 1472737293700 }
```

## Execute custom WarpScript

Insert the [WarpScript](http://www.warp10.io/reference/) to execute on the input in the editor in the config of the warpscript node.

## Send a message as output

In the config of the warpscript, it possibles to enter as many output as possible in node-red. To send messages to specific output define a map on the top of the stack. For example the following WarpScript code takes as input a message, store it in a variable then send two output messages: one to the first output configured (transfered the message received), and then send a second one to another output with a new message containing a "test" payload.

```
  'msg' STORE
  {
      '0' $msg
      '2' { 'payload' 'test' }
  }
```

## Set-UP

To install a new node just configure the setting file of the installed node-red server located in 

```
/Home/user/.node-red/settings.js
```
Link nodesDir properties to a directory path

```
nodesDir = '/Your/path/nodes'
```

Then add both warpscript.html and warpscript.js files in this folder. 

Restart node-red.