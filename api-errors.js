const error_codes = {
  101: 'Login Error username and password don’t match',
  102: 'Session needs to be established before accessing the API (use Login API)',
  103: 'Parameter Error in API',
  104: 'Dataframe is unsent (Server sided Error)',
  105: 'Server HTTP Exception (Server sided Error)',
  106: 'Role not supported',
  110: 'The plant doesn’t exist',
  111: 'Can’t find the plant',
  112: 'User has no condition to view the plant',
  113: 'Plant error no condition',
  114: 'Error getting the weather',
  150: 'Unable to find the inverter',
  151: 'Access to inverter information restricted',
  200: 'User error mismatch',
  400: 'Client sided error',
  404: 'Input API does not exist',
  500: 'Server sided error'
}

function createError( code ) {
  return function() {
    Error.captureStackTrace(this, this.constructor);
    this.name = `GivEnergy API Error`;
    this.code = code;
    this.message = error_codes[code];
  }
}

Object.keys(error_codes)
  .forEach(code => { 
    exports[code] = createError(Number(code));
    require('util').inherits(exports[code], Error);
  });



