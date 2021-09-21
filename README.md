# A node.js API to the GivEnergy API

GivEnergy is a British battery storage manufacturer, that mainly does things
for Solar PV installations. They have an API into their battery storage system,
so I've been implementing a node.js client to access it.


## create a client

```javascript
let client = new GivEnergy({
  username: 'a username',
  password: 'a password'
});


## authenticate the client

```javascript
await client.authenticate()
```

## inverters

```javascript
console.log( client.inverters );
```

## inverter details

```javascript
let detail = await client.inverters[0].detail
```

## current power generation

```javascript
let current = await client.inverters[0].current;
```
