/**
1. easier debugging: `param n should be a number but string given`
2. pure functional style
3. 
**/
var TYPES = {};
function Type(schema) {
	TYPES[schema.title.toLowerCase()] = schema;
}

var Human = new Type({
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

function checkType(data, type, position) {
	type = type.toLowerCase();
	var objType = TYPES[type];
	if (objType) {
		if (typeof data !== 'object') throw new Error(`Typed ${position} "${type}" must be an object`);
		objType.required.forEach((prop) => {
			if (!data[prop]) throw new Error(`No required field "${prop}" in ${position} typed "${type}"`);
		});
	} else {
		if (typeof data !== type) throw new Error(`Wrong type in ${position}, expected "${type}", given "${typeof data}"`);
	}
}

var def = function (func, def) {
	def = def.replace(/^\s*::\s*/, '');
	var ps = def.split(/\s+\-\>\s/);
	return function () {
		if (arguments.length < ps.length - 1) {
			throw new Error('Too few arguments');
		}
		ps.forEach((type, i) => {
			if (i === ps.length - 1) return;
			var arg = arguments[i];
			checkType(arg, type, `${i+1} argument `);
		});
		//var args = Array.prototype.slice.call(arguments);
		//func.apply(func, args);
		var res = func(...arguments);
		checkType(res, ps[ps.length-1], `returned value`);
		return res;
	}
}

var sayMyName = function (human){
	return human.firstName + ' ' + human.lastName;
	//return 1;
};
sayMyName = def(sayMyName, ':: Human -> String');

var name = sayMyName({firstName: "Roman", lastName: "Krivtsov"});
console.log(name);





