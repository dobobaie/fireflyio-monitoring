const ServerManager = require('./server');
const { Debug } = require('./utils');

const defaultOptions = {
  debug: false,
  isLocal: false,
  maxNumberServers: 10,
  maxNumberUsersPerServer: 200
};

module.exports = class $fireflyioMonitoring
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

    this.fireflyio._monitoringModuleListen = this.fireflyio.listen;
    this.fireflyio.listen = (...args) => this.listen(...args);
  }

  listen(...args) {
    this.fireflyio._monitoringModuleListen(...args).then(socket => {
      socket._newClientConnection = (...args) => this._newClientConnection(...args);
    });
  }

  async _newClientConnection(client) {
    this.debug('[DEBUG]', `FIREFLYIO-MONITORING: new connection`, client.id);
    const serverAvailable = await this.modules.server.findServer();
    client.emit('hello',
      serverAvailable 
      ? { pleaseRedirect: serverAvailable.url }
      : { error: true, reason: 'no_server_available' }
    );
    client.disconnect();
  }
};
