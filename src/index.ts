import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.json({ message: 'Hello World!' })
})

app.get('/hello/:id/:fuga', (c) => {
  const {id, fuga} = c.req.param()
  return c.text(`${id} & ${fuga}`)
})

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
