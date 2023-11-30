const Fastify = require("fastify");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("data.db");

db.serialize(() => {
	db.run(
		"CREATE TABLE IF NOT EXISTS users (\
            id INTEGER PRIMARY KEY AUTOINCREMENT, \
            name TEXT NOT NULL, \
            email TEXT NOT NULL \
        )"
	);
});

const fastify = Fastify({
	logger: true,
});

// Listar todos os usuários
fastify.get("/users", function handler(request, reply) {
	let users = [];

	db.all("SELECT id, name, email FROM users", function (fail, rows) {
		if (fail) throw fail;

		for (let i = 0; i < rows.length; i++) {
			console.log("push");
			users.push({
				id: rows[i].id,
				username: rows[i].name,
				email: rows[i].email,
			});
		}

		if (users.length == 0) {
			reply.code(204);
		} else {
			reply.code(200).send(users);
		}
	});

	return reply;
});

// Cadastrar usuário
fastify.post("/users/new", async function handler(request, reply) {
	[username, email] = [request.body.username, request.body.email];

	// Armazena o usuário no banco de dados
	try {
		const stmt = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");
		stmt.run(username, email);
	} catch (err) {
		console.error(`falha ao criar usuario: ${err}`);
		reply.code(500).send({ status: "failed" });
		return;
	}

	reply.code(200).send({ status: "success" });
});

// Apagar usuário
fastify.delete("/users/:id", async function handler(request, reply) {});

// Editar usuário
fastify.put("/users/:id", function handler(request, reply) {});

try {
	fastify.listen({ port: 3000 });
} catch (err) {
	fastify.log.error(err);
	process.exit(1);
}
