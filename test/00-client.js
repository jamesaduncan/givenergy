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

tap.test("authenticate", async (test) => {
  await client.authenticate();
  tap.ok(client.authenticated, `client is authenticated`);
});




