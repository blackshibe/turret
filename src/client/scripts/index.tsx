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
			body: JSON.stringify({
				userid: "123",
				content: "test error 67\nStack Begin\nYeah\nStack end" + Math.random(),
				auth: "LOGTOKEN",
			}),
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

	const issue = (props: { issueid: string; content: string; events: any[]; time: string }) => {
		let server_error = true;
		let unique_accounts = 0;
		let unique_account_list: string[] = [];
		let occured = 0;
		let chart: Chart | undefined;

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
				ret.push(<br />);
			});
			return ret;
		};

		const render_side = () => {
			if (server_error) {
				return <span className="hbold">the server</span>;
			} else {
				return <span className="info hbold">{unique_accounts + " accounts"}</span>;
			}
		};

		let first = true;
		const toggle_chart = () => {
			// dont ask me
			if (first) {
				first = false;
				toggle_chart();
				toggle_chart();
			}

			if (chart) {
				document.getElementById("halfbreak:" + props.issueid)?.setAttribute("style", "height: 0px !important");

				chart.destroy();
				chart = undefined;
			} else {
				document.getElementById("halfbreak:" + props.issueid)?.setAttribute("style", "height: 10px !important");

				// Chart.options is pretty retarded
				let properties: { type: string; data: { labels: string[]; datasets: any } } = {
					type: "line",
					data: {
						labels: [],
						datasets: [
							{
								label: "Events per day",
								data: [],
								backgroundColor: ["rgba(255, 99, 132, 0.2)"],
								borderColor: ["rgba(255, 99, 132, 1)"],
								borderWidth: 1,
							},
						],
					},
				};

				let show_last_days = 60 * 60 * 24 * 7 * 1000;
				for (const index in props.events) {
					const element = props.events[index];
					const date = new Date(element.time);

					// date is too old to be counted
					if (new Date().valueOf() - date.valueOf() - show_last_days > 0) continue;

					const formatted_date = `${date.getDate()}/${date.getMonth()}`;
					const date_index = properties.data.labels.indexOf(formatted_date);

					if (date_index !== -1) {
						properties.data.datasets[0].data[date_index] += 1;
					} else {
						const new_size = properties.data.labels.push(formatted_date);
						properties.data.datasets[0].data[new_size - 1] = 1;
					}
				}

				chart = new Chart("canvas:" + props.issueid, properties);
			}
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
					<span className="info hbold">{occured}</span> times on {render_side()}
				</legend>

				<div className="info-code">{...render_content()}</div>
				<div className="halfbreak" id={"halfbreak:" + props.issueid}></div>
				<div className="info-canvas-holder">
					<canvas className="info-canvas" id={"canvas:" + props.issueid}></canvas>
				</div>
				<div className="halfbreak" style={{ height: "0px !important" }}></div>

				<nav className="info-actions">
					<button onClick={delete_issue}>delete</button>
					<div className="space" />
					<button>get eventlist</button>
					<div className="space" />
					<button onClick={toggle_chart}>toggle graph</button>
				</nav>
			</fieldset>
		);
	};

	ReactDOM.render(
		<div key="loading-bar" className="info-container loading-bar">
			loading...
		</div>,
		output
	);

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
