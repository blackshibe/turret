window.addEventListener("load", () => {
	const set_login_tip = (text: string | number) => {
		let login_tip = document.getElementById("login_tip");
		if (!login_tip) throw "fuck";
		login_tip.innerHTML = text as string;
	};

	const login = () => {
		let username_key = document.getElementsByName("username")[0];
		let password_key = document.getElementsByName("password")[0];

		if (username_key instanceof HTMLInputElement && password_key instanceof HTMLInputElement) {
			set_login_tip("logging in...");
			fetch("../api/web/login", {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify([username_key.value, password_key.value]),
			}).then(async (res) => {
				if (res.status == 200) {
					//
					console.log(window.location.protocol + "//" + window.location.host);
					console.log(window.location);
					window.location.href = window.location.origin;
				} else {
					set_login_tip(await res.text());
				}
			});
		}
	};

	let login_button = document.getElementById("login_button");
	if (!login_button) throw "fuck";

	login_button.addEventListener("click", login);
});
