export const navigation = header => {
	const button = header.querySelector('.nav-toggle');
	const nav = header.querySelector('.nav');
	if (!button || !nav) return;

	const setOpen = isOpen => {
		header.classList.toggle('is-open', isOpen);
		button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
		button.textContent = isOpen ? 'Затвори' : 'Мени';
		document.body.style.overflow = isOpen ? 'hidden' : '';
	};

	button.addEventListener('click', () => {
		setOpen(!header.classList.contains('is-open'));
	});

	nav.querySelectorAll('a').forEach(link => {
		link.addEventListener('click', () => setOpen(false));
	});

	document.addEventListener('keydown', event => {
		if (event.key === 'Escape') setOpen(false);
	});

	const onScroll = () => {
		header.classList.toggle('is-scrolled', window.scrollY > 8);
	};

	onScroll();
	window.addEventListener('scroll', onScroll, { passive: true });
};
