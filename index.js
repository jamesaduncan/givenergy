const url   = require('url');
const fetch = require('node-fetch');
const FormData  = require('form-data');
const HTTPError = require('./http-errors');
const APIError = require('./api-errors');

const root = "/GivManage/api";
const base = new URL("https://www.givenergy.cloud");

let cookie = "";

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
	throw new APIError[ response.msgCode ]();
      }
    } else {
      throw new HTTPError[ result.status ]( result.statusText );
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

