window.addEventListener("load", () => {
	let logout_button = document.getElementById("logout");
	let all_button = document.getElementById("all");
	let output = document.getElementById("page_content");

	if (logout_button === null) throw "fuck";
	if (all_button === null) throw "fuck";

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

	const all = () => {
		window.location.href = window.location.origin + "/list";
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
			if (!unique_account_list.includes(element.user)) {
				if (element.user !== 0) server_error = false;
				unique_accounts += 1;
				unique_account_list.push(element.user);
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

		const show_list = () => {
			window.location.href = `/list/issue/${props.issueid}`;
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
				chart.destroy();
				chart = undefined;
			} else {
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
				<div className="halfbreak"></div>

				<nav className="info-actions">
					<button onClick={delete_issue}>delete</button>
					<div className="space" />
					<button onClick={show_list}>get eventlist</button>
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
	all_button.addEventListener("click", all);
});
