const SELECTORS = {
	form: '.form',
	feedbackArea: '.form__feedback'
};

class OfflineForm {
	constructor(element) {
		this.form = element;
		this.id = element.id;
		this.action = element.action;
		this.data = {};
		this.feedbackArea = this.form.querySelector(SELECTORS.feedbackArea);

		this.form.addEventListener('submit', e => this.handleSubmit(e));
		window.addEventListener('online', () => this.checkStorage());
		window.addEventListener('load', () => this.checkStorage());
	}

	handleSubmit(e) {
		// check network status on form submit

		e.preventDefault();
		this.getFormData();

		if (!navigator.onLine) {
			// user is offline, store data locally
			const stored = this.storeData();
			let message = '<strong>You appear to be offline right now. </strong>';
			if (stored) {
				message += 'Your data was saved and will be submitted once you come back online.';
			}
			this.resetFeedback();
			this.feedbackArea.innerHTML = message;
		} else {
			// user is online, send data to server
			this.sendData();
		}
	}

	storeData() {
		// save data in localStorage

		if (typeof Storage !== 'undefined') {
			const entry = {
				time: new Date().getTime(),
				data: this.data
			};

			localStorage.setItem(this.id, JSON.stringify(entry));
			return true;
		}
		return false;
	}

	sendData() {
		// send ajax call to server

		axios
			.post(this.action, this.data)
			.then(response => {
				this.handleResponse(response);
			})
			.catch(error => {
				console.warn(error);
			});
	}

	handleResponse(response) {
		// handle server response

		this.resetFeedback();

		if (response.status === 200) {
			// on success
			localStorage.removeItem(this.id);
			this.form.reset();
			this.feedbackArea.classList.add(`success`);
			this.feedbackArea.textContent = '👍 Successfully sent. Thank you!';
		} else {
			// failure
			this.feedbackArea.textContent = '🔥 Invalid form submission. Oh noez!';
		}
	}

	checkStorage() {
		// check if we have saved data in localStorage

		if (typeof Storage !== 'undefined') {
			const item = localStorage.getItem(this.id);
			const entry = item && JSON.parse(item);

			if (entry) {
				// discard submissions older than one day
				const now = new Date().getTime();
				const day = 24 * 60 * 60 * 1000;
				if (now - day > entry.time) {
					localStorage.removeItem(this.id);
					return;
				}

				// we have saved form data, try to submit it
				this.data = entry.data;
				this.sendData();
			}
		}
	}

	getFormData() {
		// simple parser, get form data as object

		let field;
		let i;
		const data = {};

		if (typeof this.form === 'object' && this.form.nodeName === 'FORM') {
			const len = this.form.elements.length;
			for (i = 0; i < len; i += 1) {
				if (window.CP.shouldStopExecution(0)) break;
				if (window.CP.shouldStopExecution(0)) break;
				field = this.form.elements[i];
				if (
					field.name &&
					!field.disabled &&
					field.type !== 'file' &&
					field.type !== 'reset' &&
					field.type !== 'submit'
				) {
					data[field.name] = field.value || '';
				}
			}
			window.CP.exitedLoop(0);
			window.CP.exitedLoop(0);
		}
		this.data = data;
	}

	resetFeedback() {
		this.feedbackArea.classList.remove(`success`);
		this.feedbackArea.innerHTML = '';
	}
}

// init
Array.from(document.querySelectorAll(SELECTORS.form)).forEach(form => {
	new OfflineForm(form);
});
