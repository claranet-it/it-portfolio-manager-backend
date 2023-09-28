import createApp from './app'

const app = createApp()

app.ready().then(() => {
  app.listen({ port: 4000 }, (err) => {
    if (err != null) {
      app.log.error(err)
      process.exit(1)
    }
  })
})
