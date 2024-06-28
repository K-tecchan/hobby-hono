import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const app = new Hono();

app.get("/", (c) => {
	return c.json({ message: "Hello World!" });
});

app.get(
	"/hello/:id/:name",
	zValidator(
		"param",
		z.object({
			id: z.string().regex(/^\d+$/, "Invalid Id format"),
			name: z.string().min(1, "Name cannot be empty"),
		}),
	),
	(c) => {
		const { id, name } = c.req.valid("param");
		return c.text(`${id} & ${name}`);
	},
);

app.get("/greet", zValidator("query", z.object({ name: z.string() })), (c) => {
	console.log(c.req.path);
	console.log(c.req.query());
	const { name } = c.req.valid("query");
	return c.text(`Hello ${name}`);
});

app.get(
	"/:name",
	zValidator("param", z.object({ name: z.string() })),
	zValidator(
		"query",
		z.object({ age: z.string().regex(/^\d+$/, "Invalid Id format") }),
	),
	(c) => {
		const { name } = c.req.valid("param");
		const { age } = c.req.valid("query");
		return c.text(`Hello ${name}!! Your age is ${age}`);
	},
);

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
	fetch: app.fetch,
	port,
});
