const ServerManager = require('./server');
const { Debug } = require('./utils');

const defaultOptions = {
  debug: false,
  isLocal: false,
  maxNumberServers: 10,
  maxNumberUsersPerServer: 200
};

module.exports = class Server
{
  constructor(fireflyio, custom_options) {
    this.name = 'monitoring';
    this.options = Object.assign({}, defaultOptions, custom_options);
    this.options.maxNumberServers = parseInt(this.options.maxNumberServers);
    this.options.maxNumberUsersPerServer = parseInt(this.options.maxNumberUsersPerServer);
    this.debug = Debug(this.options).debug;
    this.fireflyio = fireflyio;
    this.serverIsListening = false;

    this.modules = {};
    this.modules.server = new ServerManager(this.fireflyio, this.options, this.modules);

    if (
      Number.isNaN(this.options.maxNumberServers)
      || Number.isNaN(this.options.maxNumberUsersPerServer)
      || this.options.maxNumberServers === 0
      || this.options.maxNumberServers === 1
      || this.options.maxNumberUsersPerServer === 0
    ) {
      this.debug('[DEBUG]', `FIREFLYIO-MONITORING: options parameters are invalid`);
      return ;
    }

    fireflyio.listen = port => this._listen(port);
  }

  _findAvailableServer() {
    const serversList = this.modules.server.retrieveServersList();
    return serversList.reduce((available, infosServer) => {
      if (available) return available;
      if (this.options.maxNumberUsersPerServer === -1) {
        return infosServer;
      }
      const numberClients = infosServer.server.getNumberClients();
      return numberClients < this.options.maxNumberUsersPerServer
        ? infosServer
        : null;
     }, null);
  }

  async _newClientConnection(client) {
    this.debug('[DEBUG]', `FIREFLYIO-MONITORING: new connection`, client.id);
    
    let serverAvailable = this._findAvailableServer();
    if (
      !serverAvailable
      && (
        this.options.maxNumberServers === -1
        || this.modules.server.getNumberServers() < this.options.maxNumberServers
      )
    ) {
      serverAvailable = await this.modules.server.createServer();
    }

    if (!serverAvailable) {
      client.emit('hello', {
        error: true,
        reason: 'no_server_available'
      });
    }

    if (serverAvailable) {
      client.emit('hello', {
        pleaseRedirect: serverAvailable.url
      });
    }

    client.disconnect();
  }

  _listen(port) {
    if (this.serverIsListening) return ;
    this.serverIsListening = true;
    return new Promise(async resolve => {
      this.debug('[DEBUG]', `FIREFLYIO-MONITORING: is ready with`, this.options.maxNumberServers, 'servers capacity');
      const mainServer = await this.fireflyio._createServer(port);
      const { server } = await this.modules.server.createServer();
      mainServer._newClientConnection = client => this._newClientConnection(client);
      resolve(server);
    });
  }
};