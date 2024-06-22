import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { z } from 'zod'

const app = new Hono()

const paramSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid Id format"),
  name: z.string().min(1, "Name cannot be empty")
})

app.get('/', (c) => {
  return c.json({ message: 'Hello World!' })
})

app.get('/hello/:id/:name', (c, next) => {
  const params = c.req.param();
  const result = paramSchema.safeParse(params)
  if (!result.success) {
    return c.json({ error: result.error.errors[0].message}, 400)
  }
  return next()
}, (c) => {
  const {id, name} = c.req.param()
  return c.text(`${id} & ${name}`)
})

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
