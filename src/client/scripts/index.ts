window.addEventListener("load", () => {
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

	let logout_button = document.getElementById("logout");
	if (!logout_button) throw "fuck";
	logout_button.addEventListener("click", leave);
});
