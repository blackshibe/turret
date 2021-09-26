const hyperscript = (tagName, attributes, ...arguments) => {
	let children = [];

	arguments.forEach((element) => {
		if (Array.isArray(element)) {
			element.forEach((_element) => {
				children.push(_element);
			});
		} else {
			children.push(element);
		}
	});

	return { tagName: tagName, attributes: attributes, children: children };
};

const render = (vdom) => {
	let dom: HTMLElement = document.createElement(vdom.tagName);

	for (let key in vdom.attributes || {}) {
		dom.setAttribute(key, vdom.attributes[key]);
	}

	vdom.children.forEach((element) => {
		if (element)
			if (typeof element === "string" || typeof element === "number") {
				dom.appendChild(document.createTextNode(element as string));
			} else {
				dom.appendChild(render(element));
			}
	});

	return dom;
};
