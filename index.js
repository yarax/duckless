var tv4 = require('tv4');
var TYPES = {};
function Type(schema) {
    if (!schema.title) {
        throw new Error('Please provide schema title');
    }
    TYPES[schema.title.toLowerCase()] = schema;
    this.schema = schema;
}

function checkType(data, type, position) {
    var origType = type;
    type = type.toLowerCase();
    var objSchema = TYPES[type];
    if (objSchema) {
        if (typeof data !== 'object') throw new Error('Typed ' + position + ' "' + origType + '" must be an object');
        var res = tv4.validate(data, objSchema);
        if (!res) {
            tv4.error.message = tv4.error.message + ' in ' + position + ' "' + origType + '"';
            throw new Error(tv4.error);
        }
    } else if (typeof data === 'object') {
        throw new Error('Unknown type "' + origType + '"');
    } else {
        if (typeof data !== type) throw new Error('Wrong type in ' + position + ', expected "' + origType + '", given "' + typeof data + '"');
    }
}

var def = function (func, def) {
    def = def.replace(/^\s*::\s*/, '');
    if (!def) {
        throw new Error('Function definition must contain at least returned value');
    }
    var ps = def.split(/\s+\-\>\s/);
    return function () {
        if (arguments.length < ps.length - 1) {
            throw new Error('Too few arguments');
        }
        ps.forEach((type, i) => {
            if (i === ps.length - 1) return;
            var arg = arguments[i];
            checkType(arg, type, (i + 1) + ' argument');
        });
        var res = func.apply(func, arguments);
        checkType(res, ps[ps.length - 1], 'returned value');
        return res;
    }
};

module.exports = {
    def,
    Type
};




