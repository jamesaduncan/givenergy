const url   = require('url');
const fetch = require('node-fetch');
const FormData  = require('form-data');
const HTTPErrors = require('./http-errors');

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

async function mk_api_getter ( url, opts ) {
  return ( async() => {
    let fetch_options = { method: "POST", headers: mk_headers() }
    Object.assign(fetch_options, opts);
    let result = await fetch(url, fetch_options );
    if ( result.status == 200 ) {
      if ( result.headers.get('set-cookie') ) {
	cookie = result.headers.get('set-cookie').split(/;/)[0];
      }
      let response = await result.json();
      if ( response.success ) {
	return response;
      } else {
	throw {
	  code: response.msgCode,
	  message: error_codes[ response.msgCode ]
	};
      }
    } else {
      let err = HTTPErrors[ result.status ];
      throw new err(result.statusText, result.status);
    }
  })();
}

class GivEnergy {

  constructor( options = {} ) {
    Object.assign(this, options);
    this.authenticated = false;
  }

  async authenticate() {
    let url = new URL(`${root}/login`, base);
    url.searchParams.append( 'account', this.username );
    url.searchParams.append( 'password', this.password );

    let response = await (mk_api_getter( url ))
    if ( response.success ) {
      this.inverters = response.inverters.map( (e) => {
	return new GivEnergy.Inverter( e.serialNum );
      });
      this.authenticated = true;      
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
    url.searchParams.append( 'serialNum', this.id )
    return mk_api_getter( url )
  }
  
  get detail () {
    let url = new URL(`${root}/inverter/getInverterInfo`, base);        
    url.searchParams.append( 'serialNum', this.id );
    return mk_api_getter( url );
  }
}

GivEnergy.Inverter = Inverter;
module.exports = GivEnergy;

