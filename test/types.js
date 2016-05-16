var def = require('../').def;
var Type = require('../').Type;
var compileDefinition = require('../').compileDefinition;
var assert = require('assert');

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

describe('Types checks', function () {
	it('Should throw exception too few parameters', () => {
		var sayMyName = human => `${human.firstName} ${human.lastName}`;
		sayMyName = def(sayMyName, ':: Human -> String');
        assert.throws(
            () => {
                sayMyName();
            },
            /Too few arguments/
        );
	});

    it('Should throw exception Missing required property: lastName in 1 argument "Human"', () => {
        var sayMyName = human => `${human.firstName} ${human.lastName}`;
        sayMyName = def(sayMyName, ':: Human -> String');
        assert.throws(
            () => {
                sayMyName({firstName: "Werner"});
            },
            /Missing required property: lastName in 1 argument "Human"/
        );
    });

    it('Should throw exception title already defined', () => {
        assert.throws(
            () => {
                new Type({title: "Human"})
            },
            /Schema with title Human already defined/
        );
    });

    it('Should throw exception Invalid type: number (expected string) in 1 argument "Human"', () => {
        var sayMyName = human => `${human.firstName} ${human.lastName}`;
        sayMyName = def(sayMyName, ':: Human -> String');
        assert.throws(
            () => {
                sayMyName({firstName: "Werner", lastName: 5});
            },
            /Invalid type: number \(expected string\) in 1 argument "Human"/
        );
    });

    it('Should throw exception Unknown type "Unknown"', () => {
        var sayMyName = human => `${human.firstName} ${human.lastName}`;
        sayMyName = def(sayMyName, ':: Unknown -> String');
        assert.throws(
            () => {
                sayMyName({firstName: "Werner", lastName: "Heisenberg"});
            },
            /Unknown type "Unknown"/
        );
    });

    it('Should throw exception Wrong type in returned value, expected "String", given "number"', () => {
        var sayMyName = human => 5;
        sayMyName = def(sayMyName, ':: String');
        assert.throws(
            () => {
                sayMyName({firstName: "Werner", lastName: "Heisenberg"});
            },
            /Wrong type in returned value, expected "String", given "number"/
        );
    });

    it('Should throw exception Function definition must contain at least returned value', () => {
        var sayMyName = human => 5;
        assert.throws(
            () => {
                sayMyName = def(sayMyName, ':: ');
                sayMyName({firstName: "Werner", lastName: "Heisenberg"});
            },
            /Function definition must contain at least returned value/
        );
    });

    it('Return undefined', () => {
        var sayMyName = () => {
        };
        sayMyName = def(sayMyName, ':: undefined');
        sayMyName();
    });

    it('Should perform function', () => {
        var sayMyName = human => `${human.firstName} ${human.lastName}`;
        sayMyName = def(sayMyName, ':: Human -> String');
        var res = sayMyName({firstName: 'Werner', lastName: 'Heisenberg'});
        assert.equal(res, 'Werner Heisenberg');
    });

    it('Should parse definition with type variables', () => {
        assert.deepEqual([ 't', 'Eq', 'Num' ], compileDefinition(' :: (Eq a, Num a, Num a1) => t -> a -> a1'));
    });

    it('Should parse definition with type variables (no parentheses)', () => {
        assert.deepEqual([ 't', 'Num' ], compileDefinition(':: Num a => t -> a'));
    });

    it('Should parse definition without type variables', () => {
        assert.deepEqual([ 't', 'a' ], compileDefinition('::t -> a'));
    });

    it('Should throw Object, Array, Function are not allowed', () => {
        var sayMyName = human => `${human.firstName} ${human.lastName}`;
        sayMyName = def(sayMyName, ':: Human -> Object');
        var res = sayMyName({firstName: 'Werner', lastName: 'Heisenberg'});
        assert.equal(res, 'Werner Heisenberg');
    });

});