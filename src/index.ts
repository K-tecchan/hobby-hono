import { serve } from "@hono/node-server";
import { z, createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { zValidator } from "@hono/zod-validator";
import { swaggerUI } from "@hono/swagger-ui";

const app = new OpenAPIHono();

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
	"/hoge/:name",
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

const route = createRoute({
	method: "get",
	path: "/test-api/{id}",
	request: {
		params: z.object({
			id: z.string().regex(/^\d+$/, "Invalid Id format"),
		}),
		query: z.object({
			name: z.string().min(1, "Name cannot be empty"),
		}),
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: z.object({
						id: z.string().openapi({ example: "100" }),
						name: z.string().openapi({ example: "John" }),
					}),
				},
			},
			description: "Success Response",
		},
	},
});

app.openapi(route, (c) => {
	const { id } = c.req.valid("param");
	const { name } = c.req.valid("query");
	return c.json({ id, name });
});

app.doc("/doc", {
	openapi: "3.0.0",
	info: {
		title: "Test API",
		description: "Test API for testing",
		version: "1.0.0",
	},
});

app.get("/ui", swaggerUI({ url: "/doc" }));

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
	fetch: app.fetch,
	port,
});
