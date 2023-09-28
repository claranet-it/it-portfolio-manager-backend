import {test} from "tap"
import createApp from "@src/app";
import {HealthResponseType} from "@src/models/health.model";

test('health', async t => {
  const app = createApp({
    logger: false,
  })

  t.teardown(() => {
    app.close();
  })
  
  const response = await app.inject({
    method: 'GET',
    url: '/api/health',
  })

  const healthResponse = response.json<HealthResponseType>()

  t.equal(response.statusCode, 200, )
  t.equal(healthResponse.status, 'ok')
})
