// todo: foldable issues/events in list
// todo: clean the css

// https://expressjs.com/en/resources/middleware/session.html#compatible-session-stores
// https://stackoverflow.com/questions/52580754/nodejs-how-to-securely-store-ip-username-and-password-of-a-database#52586124

type SessionRequest = express.Request & {
	session: Session & {
		user?: user;
	};
	sessionID: string;
};

type user = {
	userid: number;
	username: string;
};

const sprightly = require("sprightly");
const package_file = require("../../package.json");

import mysql from "mysql";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import session, { Session } from "express-session";

dotenv.config();
if (!process.env.SECRET) throw "no env.SECRET";
if (!process.env.DB_HOST) throw "no env.DB_HOST";
if (!process.env.DB_USER) throw "no env.DB_USER";

const app = express();
const mysql_connection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
});

app.use(
	session({
		secret: process.env.SECRET,
	})
);
// render engine
app.engine("spy", sprightly);
app.set("views", "views");
app.set("view engine", "spy");

// localhost:8000/stylesheets/style.css
app.use(express.static("public"));
app.use(express.static("dist/client"));

const closure = (func: (req: SessionRequest, res: express.Response, next: (...args: any[]) => void) => void) => {
	return (req: express.Request, res: express.Response, next: (...args: any[]) => void) => {
		let req_ = req as SessionRequest;
		func(req_, res, next);
	};
};

const force_signed_in = (req: SessionRequest, res: express.Response, next: (...args: any[]) => void) => {
	if (req.session.user) {
		next();
	} else {
		// redirect to login page
		res.redirect("/login");
		res.end();
	}
};

const cl_unsignedin = (req: SessionRequest, res: express.Response, next: (...args: any[]) => void) => {
	if (req.session?.user) {
		// redirect to main page
		res.redirect("/");
		res.end();
	} else {
		next();
	}
};

const cl_signin = closure(force_signed_in);
const json_parser = bodyParser();

// web api

app.post(
	"/api/web/login",
	json_parser,
	closure((req, res) => {
		console.log("traffic to /api/web/login");
		console.log("POST login request", req.body);

		let username = req.body[0];
		let password = req.body[1];

		const finish = (msg: string) => {
			res.setHeader("Content-type", "text/plain");
			res.status(403);
			res.send(msg);
			res.end();
		};

		mysql_connection.query(`SELECT * FROM accounts WHERE username = '${username}';`, (err, result) => {
			if (err) return finish(err.message);

			let account = result[0];
			if (!account) return finish("no account under given username");

			let correct = bcrypt.compareSync(password, account.password);
			if (!correct) return finish("incorrect password");

			req.session.user = { userid: account.userid, username: account.username };
			res.status(200);
			res.end();
		});
	})
);

app.post(
	"/api/web/logout",
	json_parser,
	closure((req, res) => {
		console.log("POST logout request");
		req.session.user = undefined;
		res.end();
	})
);

// project api

// named output because it's not guaranteed to create an issue and event does not fit
app.post(
	"/api/proj/output",
	json_parser,
	closure((req, res) => {
		console.log("POST API output");

		const finish = (code: number, msg: { [index: string]: string }) => {
			res.setHeader("Content-type", "text/json");
			res.status(code);
			res.send(msg);
			res.end();
		};

		if (req.body.auth !== process.env.LOG_TOKEN) {
			return finish(401, { err: "Invalid token" });
		}

		// if an issue with matching content exists, an event with its' errid is created
		// if no issue exists, a new one will be created
		mysql_connection.query(`SELECT * FROM issues WHERE content = '${req.body.content}';`, (err, result) => {
			if (err) return finish(500, { code: err.code, err: err.message });
			if (result[0]) {
				const issue = JSON.parse(JSON.stringify(result[0]));
				mysql_connection.query(
					`insert into events (issueid, userid) values (${issue.issueid}, '${req.body.content}')`,
					(err, result) => {
						if (err) return finish(500, { code: err.code, err: err.message });
						console.log(2);

						res.json({ ok: true, id: issue.issueid, new: false });
						res.end();
					}
				);
			} else {
				// obvious chance for code injection lmao
				mysql_connection.query(`insert into issues (content) values ('${req.body.content}')`, (err, issue) => {
					if (err) return finish(500, { code: err.code, err: err.message });
					mysql_connection.query(
						`insert into events (userid, issueid) values ('${req.body.userid}', (select issueid from issues where content = '${req.body.content}'));`,
						(err, result) => {
							if (err) return finish(500, { code: err.code, err: err.message });

							res.json({ ok: true, new: true });
							res.end();
						}
					);
				});
			}
		});
	})
);

app.post(
	"/api/proj/issues/get",
	json_parser,
	closure((req, res) => {
		console.log("POST API issues/get");

		const finish = (code: number, msg: any) => {
			if (res.writableEnded) return;

			res.setHeader("Content-type", "text/json");
			res.status(code);
			res.send(msg);

			res.end();
		};

		if (req.body.auth !== process.env.LOG_TOKEN) {
			return finish(401, { err: "Invalid token" });
		}

		type bodyElement = { [index: string]: any };
		let reply: bodyElement[] = [];
		mysql_connection.query(`SELECT * FROM issues;`, async (err, result) => {
			if (err) return finish(500, { code: err.code, err: err.message });

			for (let row in result) {
				let body: bodyElement = { events: {} };
				for (let col in result[row]) body[col] = result[row][col];

				reply.push(body);
			}

			mysql_connection.query(`SELECT * FROM events;`, (err, result) => {
				if (err) return finish(500, { code: err.code, err: err.message });
				for (let row in result) {
					let body: bodyElement = {};
					for (let col in result[row]) body[col] = result[row][col];

					reply.forEach((element) => {
						if (element.issueid === result[row].issueid) element.events[row] = body;
					});
				}
				finish(200, reply);
			});
		});
	})
);

app.post(
	"/api/proj/issues/delete",
	json_parser,
	closure((req, res) => {
		console.log("POST API issues/delete");

		const finish = (code: number, msg: any) => {
			if (res.writableEnded) return;

			res.setHeader("Content-type", "text/json");
			res.status(code);
			res.send(msg);

			res.end();
		};

		if (req.body.auth !== process.env.LOG_TOKEN) {
			return finish(401, { err: "Invalid token" });
		}

		mysql_connection.query(`delete from events where issueid = ${req.body.issueid};`, async (err, result) => {
			if (err) return finish(500, { code: err.code, err: err.message });

			mysql_connection.query(`delete from issues where issueid = ${req.body.issueid};`, async (err, result) => {
				if (err) return finish(500, { code: err.code, err: err.message });
			});

			finish(200, { ok: true });
		});
	})
);

// website

app.get(
	"/login",
	cl_unsignedin,
	closure((req, res) => {
		console.log("GET /login");

		// https://stackoverflow.com/questions/10183291/how-to-get-the-full-url-in-express#10185427
		let full_url = req.protocol + "://" + req.get("host") + req.baseUrl;
		res.render("login", { weblink: full_url });
	})
);

app.get(
	"/list",
	cl_signin,
	closure((req, res) => {
		console.log("GET /list");

		let full_url = req.protocol + "://" + req.get("host") + req.baseUrl;
		res.render("list", { weblink: full_url });
	})
);

app.get(
	"/",
	cl_signin,
	closure((req, res) => {
		console.log("GET /");

		res.render("index", { username: req.session.user!.username, version: package_file.version });
	})
);

app.use(function (req, res) {
	res.send(404);
});

// entry

const PORT = 8000;
app.listen(PORT, () => {
	console.log(`running from ${__dirname}`);
	console.log(`if local, available under http://localhost:${PORT}`);

	mysql_connection.query(`SELECT * FROM accounts WHERE username = "${process.env.ADMIN_USERNAME}"`, (err, result) => {
		if (err) throw err;

		if (!result[0]) {
			if (!process.env.ADMIN_USER) throw "no process.env.ADMIN_USER";
			if (!process.env.ADMIN_PASS) throw "no process.env.ADMIN_PASS";

			const SALT = bcrypt.genSaltSync(10);
			const ADMIN_USERNAME = process.env.ADMIN_USER;
			const ADMIN_PASSWORD = bcrypt.hashSync(process.env.ADMIN_PASS, SALT);

			mysql_connection.query(
				`INSERT INTO accounts(username, password) VALUES("${ADMIN_USERNAME}", "${ADMIN_PASSWORD}")`,
				(err, result, fields) => {
					console.log("admin account forcibly created with error:", err);
				}
			);
		} else {
			console.log("admin account already exists");
		}
	});
});
