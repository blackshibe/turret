import React from "react";
import ReactDOM from "react-dom";

window.addEventListener("load", () => {
	let logout_button = document.getElementById("logout");
	let test_button = document.getElementById("test");
	let output = document.getElementById("page_content");

	if (!output) throw "fuck";
	if (!logout_button) throw "fuck";
	if (!test_button) throw "fuck";

	const leave = () => {
		fetch("../api/web/logout", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
		}).then(async (res) => {
			window.location.href = window.location.origin + "/login";
		});
	};

	const test = () => {
		fetch("../api/proj/output", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ userid: "123", content: "test error 67" + Math.random(), auth: "LOGTOKEN" }),
		}).then(async (res) => {
			alert(JSON.stringify(res.text()));

			// window.location.href = window.location.origin + "/login";
		});

		// fetch("../api/proj/issues/delete", {
		// 	method: "POST",
		// 	headers: {
		// 		Accept: "application/json",
		// 		"Content-Type": "application/json",
		// 	},
		// 	body: JSON.stringify({ issueid: 8, auth: "LOGTOKEN" }),
		// }).then(async (res) => {
		// 	window.location.href = window.location.origin + "/";
		// });
	};

	const render_container = (props: { [index: string]: any }) => {
		let server_error = true;
		let unique_accounts = 0;
		let unique_account_list = [];
		let occured = 0;

		for (const index in props.events) {
			const element = props.events[index];

			occured += 1;
			if (!unique_account_list.includes(element.userid)) {
				if (element.userid !== 0) {
					server_error = false;
				}

				unique_accounts += 1;
				unique_account_list.push(element.userid);
			}
		}

		const render_content = () => {
			let ret = [];
			props.content.split("\n").forEach((line, index) => {
				if (index === 0) ret.push(<span>{line}</span>);
				else ret.push(<span className="info">{line}</span>);
			});
			return ret;
		};

		const delete_container = () => {
			fetch("../api/proj/issues/delete", {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ auth: "LOGTOKEN", issueid: props.issueid }),
			}).then(async (res) => {
				window.location.reload();
			});
		};

		return (
			<fieldset className="info-container">
				<legend className="info-header">
					<span className="error-id hbold">#{props.issueid}</span> -{" "}
					<span className="info hbold">{occured}</span> times on{" "}
					{server_error ? "the server" : <span className="info hbold">{unique_accounts}</span> + "accounts"}
				</legend>

				<div className="info-code">{...[...render_content()]}</div>
				<div className="halfbreak"></div>

				{/* <div class="info-code">
					<code>
						Graph view n shit
						<br />
						<br />
						<br />
						<br />
					</code>
				</div> */}

				<div className="halfbreak"></div>

				<nav className="info-actions">
					<button id="">delete</button>
					<div className="space" />
					<button>get eventlist</button>
					<div className="space" />
					<button>toggle graph</button>
				</nav>
			</fieldset>
		);
	};

	const arse = {
		"grid-column": "1/4",
	};
	output.appendChild(render(<div className="loading-bar">loading...</div>));

	fetch("../api/proj/issues/get", {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ auth: "LOGTOKEN" }),
	}).then(async (res) => {
		let response = await res.json();

		output.innerHTML = "";
		response.forEach((element) => {
			ReactDOM.render(render_container({}), output);
		});
	});

	logout_button.addEventListener("click", leave);
	test_button.addEventListener("click", test);
});
