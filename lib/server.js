const getPort = require('get-port');
const publicIp = require('public-ip');

const { Debug } = require('./utils');

module.exports = class Server
{
  constructor(fireflyio, options, modules) {
    this.options = options;
    this.debug = Debug(this.options).debug;
    this.fireflyio = fireflyio;
    this.modules = modules;
    this.serverManagerInProcess = false;
    this.promiseServerCreation = null;
    this.servers = {
      list: [],
      number: 0
    };
  }

  getNumberServers() {
    return this.servers.number;
  }

  retrieveServersList() {
    return this.servers.list;
  }

  async _createServer() {
    const protocol = this.fireflyio.options.https ? 'https://' : 'http://';
    const ip = this.options.isLocal ? '127.0.0.1' : await publicIp.v4();
    const port = await getPort();
    const url = `${protocol}${ip}:${port}`;
    
    this.debug('[DEBUG]', `FIREFLYIO-MONITORING: creating a new server`, url, 'with', this.options.maxNumberUsersPerServer, 'users capacity');
    const server = await this.fireflyio._createServerSocket(port);
    const infosServer = { url, protocol, ip, port, server };

    this.debug('[DEBUG]', `FIREFLYIO-MONITORING: server`, url,  `is created`);
    this.servers.number += 1;
    this.servers.list.push(infosServer);
    return infosServer;
  }

  /***
  * We made a serverManagerInProcess to prevent an async createServer request
  ****/
  async createServer() {
    if (this.serverManagerInProcess) {
      return this.promiseServerCreation.then(() =>
        this.findServer()
      );
    }

    this.serverManagerInProcess = true;
    this.promiseServerCreation = await (
      new Promise(async resolve => {
        const infosServer = await this._createServer();
        resolve(infosServer);
      })
    );
    this.serverManagerInProcess = false;
    return this.promiseServerCreation;
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

  findServer() {
    const serverAvailable = this._findAvailableServer();
    if (serverAvailable) {
      return serverAvailable;
    }

    if (
      this.options.maxNumberServers === -1
      || this.modules.server.getNumberServers() < this.options.maxNumberServers
    ) {
      return this.modules.server.createServer();
    }

    return null;
  }
};

/*** NOTE: Add something to autokill useless servers : create event plugin ***/
 