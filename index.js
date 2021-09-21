const url   = require('url');
const fetch = require('node-fetch');
const FormData = require('form-data');

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
      this.inverter_details = response;
      return this.inverter_details;
    })();
  }
}

GivEnergy.Inverter = Inverter;

module.exports = GivEnergy;

