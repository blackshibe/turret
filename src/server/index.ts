// todo: .ENV file with a client secret
// todo: post to github

// https://expressjs.com/en/resources/middleware/session.html#compatible-session-stores
// https://stackoverflow.com/questions/52580754/nodejs-how-to-securely-store-ip-username-and-password-of-a-database#52586124

type SessionRequest = express.Request & {
	session: Session & {
		user: user;
	};
	sessionID: string;
};

type user = {
	userid: number;
	username: string;
};

const sprightly = require("sprightly");

import mysql from "mysql";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import session, { Session } from "express-session";

dotenv.config();
const app = express();

const mysql_connection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: "turret",
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
	if (req.session?.user) {
		next();
	} else {
		// redirect to login page
		res.redirect("/login");
		res.end();
	}
};

const force_unsigned_in = (req: SessionRequest, res: express.Response, next: (...args: any[]) => void) => {
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

// project api=

// todo

// website

app.use("/login", force_unsigned_in, (req, res) => {
	console.log("traffic to /logon");

	// https://stackoverflow.com/questions/10183291/how-to-get-the-full-url-in-express#10185427
	let full_url = req.protocol + "://" + req.get("host") + req.baseUrl;
	res.render("login", { weblink: full_url, pgtitle: "Turret login" });
});

app.get(
	"/",
	cl_signin,
	closure((req, res) => {
		console.log("traffic to /");
		res.render("index", { username: req.session.user.username });
	})
);

// entry

const PORT = 8000;
app.listen(PORT, () => {
	console.log(`running from ${__dirname}`);
	console.log(`available under http://localhost:${PORT}`);

	const SALT = bcrypt.genSaltSync(10);
	const ADMIN_USERNAME = "blackshibe";
	const ADMIN_PASSWORD = bcrypt.hashSync("1234", SALT);

	mysql_connection.query(`SELECT * FROM accounts WHERE username = "${ADMIN_USERNAME}"`, (err, result) => {
		if (err) throw err;
		if (!result[0]) {
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

	// mysql_connection.query("SELECT * FROM accounts;", (err, result, fields) => {
	// 	if (err) throw err;
	// 	for (var row in result) {
	// 		console.log(row);
	// 		for (const col in result[row]) {
	// 			console.log(col, result[row][col]);
	// 		}
	// 	}
	// });
});
