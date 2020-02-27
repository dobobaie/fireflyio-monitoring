const Fireflyio = require('../../fireflyio/lib');
const FireflyioMonitoring = require('../lib');

const app = new Fireflyio({ debug: true });
app.extend(FireflyioMonitoring, {
  debug: true,
  maxNumberUsersPerServer: 1,
  maxNumberServers: 2,
  isLocal: true
});

app.use(ctx => {
  ctx.body = 'Hello Fireflyio';
});

app.listen(4000);
