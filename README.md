# Duckless

Duckless is a wrapper for you functions, that allows you to use Haskell style function definitions.
After that, while runtime, if your function was called in improper way it will be thrown a clear human-readable exception.

Currently supports:
* Number of arguments
* Base JavaScript types
* Complex types, based on JSON Schema
* Returned value of the function

## How to use

```javascript
let def = require('duckless').def;
let Type = require('duckless').Type;

new Type({
	"title": "Human",
	"type": "object",
	"properties": {
		"firstName": {
			"type": "string"
		},
		"lastName": {
			"type": "string"
		},
		"age": {
			"description": "Age in years",
			"type": "integer",
			"minimum": 0
		}
	},
	"required": ["firstName", "lastName"]
});

let sayMyName = human => `${human.firstName} ${human.lastName}`;

sayMyName = def(sayMyName, ':: Human -> String');

sayMyName({firstName: "Werner", lastName: "Heisenberg"}); // Werner Heisenberg
sayMyName({firstName: "Werner"}); // Missing required property: lastName in 1 argument "Human"

```

## Why?

The first question may be: why not to use TypeScript, Flow or other typed languages for js?

The question is yes, please use them, they are really good ones, but if you don't want to bring transpilers into
your projects, duckless maybe that what you need.

The second point is that after compiling you will still have JavaScript and in some cases
(for example when data comes externally) errors still can occur.
 Using duckless at least you will get a good point to debug the issue.
