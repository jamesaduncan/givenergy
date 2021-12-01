# A node.js API to the GivEnergy API

GivEnergy is a British battery storage manufacturer, that mainly does
things for Solar PV installations. They have an API into their battery
storage system, so I've been implementing a node.js client to access
it.

This is not yet a complete implementation of their entire API, and is just
a work in progress.

The API documentation is at GivEnergy's [knowledge base website](https://kb.givenergy.cloud/article.php?id=5).


## create a client

```javascript
let client = new GivEnergy({
  username: 'a username',
  password: 'a password'
});
```

## authenticate the client

```javascript
await client.authenticate()
```

## determine the client's authentication status

```javascript
if ( client.authenticated ) console.log("client is authenticated");
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

## get the plants connected to the system

```javascript
let plants = await client.plants;
let plant  = plants[0];
```

## get information about a plant.

```javascript
let plants = await client.plants;
await plants[0].info;
```

## get summary from a plant
```javascript
let plants = await client.plants;
await plants[0].summary
```

## get current runtime information from a plant
```javascript
let plants = await client.plants;
await plants[0].current;
```

## get devices attached to a plant
```javascript
let plants = await client.plants;
await plants[0].devices;
```


