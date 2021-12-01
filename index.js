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

    let response = await (mk_api_getter( url ));
    if ( response.success ) {
      this.inverters = response.inverters.map( (e) => {
	return new GivEnergy.Inverter( e.serialNum );
      });
      this.authenticated = true;      
      this.plants = (async () => {
	try {
	  let url = new URL(`${root}/plant/getPlantList`, base);
	  let response = await (mk_api_getter(url));
	  let plants = response.rows.map( (e) => {
	    return new GivEnergy.Plant(e.plantId, e);
	  });
	  return plants;
	} catch(e) {
	  return null;
	}
      })();
    }
    return this.authenticated;
  }
  
}

class Plant {
  constructor(id, options) {
    this.id = id;
    Object.assign(this, options);
  }

  get info () {
    let url = new URL(`${root}/plant/getPlantInfo`, base);
    url.searchParams.append( 'plantId', this.id );
    return mk_api_getter( url );
  }

  get current () {
    let url = new URL(`${root}/plant/getPlantRuntime`, base);
    url.searchParams.append( 'plantId', this.id );
    return mk_api_getter( url );
  }

  get devices () {
    let url = new URL(`${root}/plant/getPlantDevices`, base);
    url.searchParams.append( 'plantId', this.id );
    return mk_api_getter( url );    
  }

  get summary () {
    let url = new URL(`${root}/plant/getPlantSummary`, base);
    url.searchParams.append( 'plantId', this.id );
    return mk_api_getter( url );
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
GivEnergy.Plant    = Plant;
module.exports = GivEnergy;

