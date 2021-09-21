require('dotenv').config();
const tap = require('tap');
const GivEnergy = require('../');

let client = new GivEnergy({
  username: process.env.GIVENERGY_USERNAME,
  password: process.env.GIVENERGY_PASSWORD
});

tap.ok( client, "got a client");
tap.ok( client.username == process.env.GIVENERGY_USERNAME, "username set ok");
tap.ok( client.password == process.env.GIVENERGY_PASSWORD, "password set ok");

tap.test("authenticate", async (t) => {
  await client.authenticate();
  t.ok(client.authenticated, `client is authenticated`);

  tap.test("error messages", async(t) => {
    try {
      let i = new GivEnergy.Inverter( 'made up id');
      let detail = await i.detail;
    } catch(e) {
      t.ok(e.code == 150, "correct error code");
      t.ok(e.message == 'Unable to find the inverter', "error message is correct");
    }
  });
  
  tap.test("inverter detail", async( test ) => {
    let detail  = await client.inverters[0].detail;
    test.ok(detail, "got details about an inverter");
    let current = await client.inverters[0].current;
    test.ok(current, "got details about current inverter status");
  });
});






