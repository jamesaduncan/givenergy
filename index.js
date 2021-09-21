const url   = require('url');
const fetch = require('node-fetch');
const FormData = require('form-data');

const root = "/GivManage/api";
const base = new URL("https://www.givenergy.cloud");

let cookie = "";

let error_codes = {
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

function mk_headers () {
  let headers = {};
  if ( cookie ) {
    headers.Cookie = cookie;
  }
  return headers;
}

class GivEnergy {

  constructor( options = {} ) {
    Object.assign(this, options);
  }

  async authenticate() {
    let url = new URL(`${root}/login`, base);
    let fd  = url.searchParams;
    fd.append( 'account', this.username );
    fd.append( 'password', this.password );
    
    let result = await fetch(url, {
      method: 'POST',
      headers: mk_headers(),
      body: new FormData(),
      'redirect': 'follow'
    });

    let cookiestring = result.headers.get('set-cookie');
    cookie = cookiestring.split(/;/)[0]
    
    let response = await result.json();    
    if ( response.success ) {
      this.inverters = response.inverters.map( (e) => {
	return new GivEnergy.Inverter( e.serialNum );
      });
      this.authenticated = true;      
    } else {
      this.authenticated = false;     
    }
    return this.authenticated;
  }
  
}

class Inverter {
  constructor( id, options ) {
    this.id = id;
    Object.assign(this, options);
  }

  get current () {
    let url = new URL(`${root}/inverter/getInverterRuntime`, base);
    url.searchParams.append( 'serialNum', this.id );
    return ( async() => {
      let result = await fetch(url, {
	method: 'POST',
	headers: mk_headers(),
	body: new FormData()
      });
      let response = await result.json();
      if ( response.success ) {
	return response;
      } else {
	throw {
	  code: response.msgCode,
	  message: error_codes[ response.msgCode ]
	};
      }
    })();
  }
  
  get detail () {
    let url = new URL(`${root}/inverter/getInverterInfo`, base);        
    url.searchParams.append( 'serialNum', this.id );
    if ( this.inverter_details ) return (async() => {
      return this.inverter_details;
    })();
    else return (async() => {
      let result = await fetch(url, {
	method: 'POST',
	headers: mk_headers(),
	body: new FormData(),
      });
      let response = await result.json();
      if ( response.success ) {
	this.inverter_details = response;
	return this.inverter_details;
      } else {
	throw {
	  code: response.msgCode,
	  message: error_codes[ response.msgCode ]
	};
      }      
    })();
  }
}

GivEnergy.Inverter = Inverter;

module.exports = GivEnergy;

