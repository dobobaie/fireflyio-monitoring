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

  async createServer() {
    const protocol = this.fireflyio.options.https ? 'https://' : 'http://';
    const ip = this.options.isLocal ? '127.0.0.1' : await publicIp.v4();
    const port = await getPort();
    const url = `${protocol}${ip}:${port}`;
    const server = await this.fireflyio._createServer(port);
    const infosServer = { url, protocol, ip, port, server };

    this.debug('[DEBUG]', `FIREFLYIO-MONITORING: create new server`, infosServer.url, 'with', this.options.maxNumberUsersPerServer, 'users capacity');
    this.servers.number += 1;
    this.servers.list.push(infosServer);
    return infosServer;    
  }
};

/*** NOTE: Add something to autokill useless servers ***/
/*** NOTE: Add security during createServer because async can create multi useless server ***/
