window.addEventListener("load", () => {
	let output = document.getElementById("page_content");
	let path = window.location.href.split("/").reverse();
	let userlist = "";

	if (path[0] === "") path.shift();

	ReactDOM.render(
		<div key="loading-bar" className="info-container loading-bar">
			loading...
		</div>,
		output
	);

	const copy = () => {
		navigator.clipboard.writeText(userlist);
	};

	const event = (props: { time: string; issueid: string; eventid: string; userid: string }) => {
		let time = new Date(props.time);
		let formatted_time = `${time.toLocaleTimeString()} ${time.toDateString()}`;

		if (!userlist.includes(props.userid)) userlist += props.userid + "\n";

		return (
			<nav className="page-content-wide">
				<fieldset className="info-container">
					<legend className="info-header">
						<span className="event-id hbold">${props.eventid}</span> -
						<span className="info hbold">{formatted_time}</span> caused by{" "}
						<span className="info hbold"> {props.userid ? props.userid : "server"}</span>
					</legend>
				</fieldset>
			</nav>
		);
	};

	const issue = (props: { issueid: string; content: string; events: any[]; time: string }) => {
		let time = new Date(props.time);
		let formatted_time = `${time.toLocaleTimeString()} ${time.toDateString()}`;
		let server_error = true;
		let unique_accounts = 0;
		let unique_account_list: string[] = [];

		for (const index in props.events) {
			const element = props.events[index];
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

		return (
			<fieldset className="info-container">
				<legend className="info-header">
					<span className="error-id hbold">#{props.issueid}</span> -
					<span className="info hbold">{formatted_time}</span> caused by {render_side()}
				</legend>

				<code>{...render_content()}</code>
			</fieldset>
		);
	};
	const reload_view = () => {
		// ver 3
		if (path[1] == "issue") {
			fetch(`../../api/proj/events/get/${path[0]}`, {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ auth: "LOGTOKEN" }),
			}).then(async (res) => {
				if (output === null) throw "fuck";
				let response = await res.json();
				let list: JSX.Element[] = [];
				let eventlist: JSX.Element[] = [];

				response.forEach((element: any) => {
					eventlist.push(event(element));
				});

				list.push(
					<h2 style={{ paddingLeft: "20px" }}>
						Events for <span className="error-id hbold">#{path[0]}</span>
						<br />
						<br />
						<button onClick={copy}>get userlist</button>
					</h2>
				);
				list.push(
					<nav className="page-content" id="page_content">
						{...eventlist}
					</nav>
				);

				ReactDOM.render(list, output);
			});
		} else if (path[0] == "list") {
			fetch(`../../api/proj/events/get/${path[0]}`, {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ auth: "LOGTOKEN" }),
			}).then(async (res) => {
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

					list.push(<h2 style={{ paddingLeft: "20px" }}>All issues</h2>);
					response.forEach((element: any) => {
						list.push(issue(element));
					});

					list.push(<h2 style={{ paddingLeft: "20px" }}>All events</h2>);
					response.forEach((element: any) => {
						for (let index in element.events) {
							const value = element.events[index];
							list.push(event(value));
						}
					});

					ReactDOM.render(list, output);
				});
			});
		}
	};

	reload_view();
});
