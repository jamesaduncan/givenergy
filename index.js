const url   = require('url');
const fetch = require('node-fetch');
const FormData = require('form-data');

const root = "/GivManage/api";
const base = new URL("https://www.givenergy.cloud");

class GivEnergy {

  constructor( options = {} ) {
    Object.assign(this, options);
  }

  get headers() {
    let headers = {};
    if ( this.cookie ) {
      headers.Cookie = this.cookie;
    }
  }
  
  async authenticate() {
    let url = new URL(`${root}/login`, base);
    let fd  = url.searchParams;
    fd.append( 'account', this.username );
    fd.append( 'password', this.password );
    
    let result = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: new FormData(),
      'redirect': 'follow'
    });

    let cookiestring = result.headers.get('set-cookie');
    this.cookie = cookiestring.split(/;/)[0]
    
    let response = await result.json();    
    console.log( response );
    if ( response.success ) {
      this.inverters = response.inverters.map( (e) => {
	return new GivEnergy.Inverter( e );
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
}

GivEnergy.Inverter = Inverter;

module.exports = GivEnergy;

