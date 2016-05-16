var tv4 = require('tv4');
var TYPES = {};
function Type(schema) {
    if (!schema.title) {
        throw new Error('Please provide schema title');
    }
    var schemaName = schema.title.toLowerCase();
    if (TYPES[schemaName]) {
        throw new Error('Schema with title ' + schema.title + ' already defined');
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

/**
 * checkWithTypeVariables
 * @param arguments {Array} parts, params splitted by "->"
 * @return arguments {Array} parts
 **/
function checkWithTypeVariables(arguments) {
    var typedVarsRegexp = new RegExp('\\\(?(.*?)\\\)?\\\s*=>');
    var typeVars = arguments[0].match(typedVarsRegexp);
    if (typeVars) {
        arguments[0] = arguments[0].replace(typedVarsRegexp, '');
        typeVars = typeVars[1].split(/,\s*/).map(function(varWithType) {
            var split = varWithType.split(/\s+/);
            return {type: split[0], var: split[1]};
        });
        arguments = arguments.map(function (param) {
            param = param.trim();
            typeVars.some(function(typeVar) {
                if (['Object', 'Function', 'Array'].indexOf(typeVar) !== -1) {
                    throw new Error('Not allowed to use Object, Function and Array types');
                }
                if (param === typeVar.var) {
                    param = typeVar.type;
                    return true;
                }
            });
            return param;
        });
    }
    return arguments;
}

function compileDefinition(def) {
    def = def.replace(/^\s*::\s*/, '');
    if (!def) {
        throw new Error('Function definition must contain at least returned value');
    }
    var ps = def.split(/\s+\-\>\s/);
    ps = checkWithTypeVariables(ps);
    return ps;
}

var def = function (func, def) {
    var args = compileDefinition(def);
    return function () {
        if (args.length < args.length - 1) {
            throw new Error('Too few arguments');
        }
        args.forEach((type, i) => {
            if (i === args.length - 1) return;
            var arg = args[i];
            checkType(arg, type, (i + 1) + ' argument');
        });
        var res = func.apply(func, arguments);
        checkType(res, args[args.length - 1], 'returned value');
        return res;
    }
};

module.exports = {
    def: def,
    Type: Type,
    compileDefinition: compileDefinition
};




