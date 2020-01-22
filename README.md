# [BETA] fireflyio-monitoring

Fireflyio monitoring is a fireflyio module to manage and control the users connection.   

## 🚀 Fireflyio

[Fireflyio server](https://github.com/dobobaie/fireflyio)  
[Fireflyio client](https://github.com/dobobaie/fireflyio-client)  
[Fireflyio module monitoring](https://github.com/dobobaie/fireflyio-monitoring)  

## ☁️ Installation

```
$ unavaible
```

## 💻 Add the module to `fireflyio`

```js
const Fireflyio = require('fireflyio');
const FireflyioMonitoring = require('fireflyio-monitoring');

const app = new Fireflyio();

const options = {};
app.extend(FireflyioMonitoring, options);

// ...
```

## ⚙️ Options 

`const app = new Fireflyio(options: object);`   

Name parameter | Type | Default | Description
--- | --- | --- | ---
debug | `boolean` | `false` | Enable debug mode
maxNumberServers | `number` | `10` | Maximum servers allowed `(-1 = unlimited)`
maxNumberUsersPerServer | `number` | `200` | Maximum users per server allowed `(-1 = unlimited)`
isLocal | `boolean` | `false` | Set local mode

## 👥 Contributing

Please help us to improve the project by contributing :)  

## ❓️ Testing

```
$ npm install
$ npm test
```
