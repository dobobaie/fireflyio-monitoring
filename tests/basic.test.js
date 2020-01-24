const Fireflyio = require('../../fireflyio/lib');
const FireflyioMonitoring = require('../lib');

(async () => {
  // ---
  const app = new Fireflyio({ debug: true });
  app.extend(FireflyioMonitoring, {
    debug: true,
    maxNumberServers: 2,
    maxNumberUsersPerServer: 1,
    isLocal: true
  });
  app.listen(2525);
  // ---
})();
