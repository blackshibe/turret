window.addEventListener("load", () => {
	let logout_button = document.getElementById("logout");
	let test_button = document.getElementById("test");
	let output = document.getElementById("page_content");

	if (logout_button === null) throw "fuck";
	if (test_button === null) throw "fuck";

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

	const issue = (props: { issueid: number; content: string; events: any[]; time: string }) => {
		let server_error = true;
		let unique_accounts = 0;
		let unique_account_list: string[] = [];
		let occured = 0;

		for (const index in props.events) {
			const element = props.events[index];

			occured += 1;
			if (!unique_account_list.includes(element.userid)) {
				if (element.userid !== 0) server_error = false;
				unique_accounts += 1;
				unique_account_list.push(element.userid);
			}
		}

		const render_content = () => {
			let ret: React.ReactElement[] = [];
			props.content.split("\n").forEach((line: string, index: number) => {
				if (index === 0) ret.push(<span>{line}</span>);
				else ret.push(<span className="info">{line}</span>);
			});
			return ret;
		};

		const delete_issue = () => {
			fetch("../api/proj/issues/delete", {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ auth: "LOGTOKEN", issueid: props.issueid }),
			}).then(async (res) => {
				let response = await res.json();
				console.log(response);
				if (response.ok) reload_view();
			});
		};

		return (
			<fieldset key={props.issueid} className="info-container">
				<legend className="info-header">
					<span className="error-id hbold">#{props.issueid}</span> -{" "}
					<span className="info hbold">{occured}</span> times on{" "}
					<span className="info hbold">{server_error ? "the server" : unique_accounts + " accounts"}</span>
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
					<button onClick={delete_issue}>delete</button>
					<div className="space" />
					<button>get eventlist</button>
					<div className="space" />
					<button>toggle graph</button>
				</nav>
			</fieldset>
		);
	};

	ReactDOM.render(<div className="info-container loading-bar">loading...</div>, output);

	const reload_view = () => {
		fetch("../api/proj/issues/get", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ auth: "LOGTOKEN" }),
		}).then(async (res) => {
			if (output === null) throw "fuck";
			let response = await res.json();

			// output.innerHTML = "";
			let list: JSX.Element[] = [];
			response.forEach((element: any) => {
				list.push(issue(element));
			});

			ReactDOM.render(list, output);
		});
	};

	reload_view();

	logout_button.addEventListener("click", leave);
	test_button.addEventListener("click", test);
});
