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

  tap.test("inverter detail", async( test ) => {
    let detail  = await client.inverters[0].detail;
    test.ok(detail, "got details about an inverter");
    let current = await client.inverters[0].current;
    test.ok(current, "got details about current inverter status");
  });
});




