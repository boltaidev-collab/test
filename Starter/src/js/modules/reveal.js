export const reveal = root => {
	const nodes = root.querySelectorAll('[data-reveal]');
	const showAll = () => {
		nodes.forEach(node => node.classList.add('is-inview'));
	};

	if (!nodes.length) return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
		showAll();
		return;
	}

	const observer = new IntersectionObserver(entries => {
		entries.forEach(entry => {
			if (!entry.isIntersecting) return;
			entry.target.classList.add('is-inview');
			observer.unobserve(entry.target);
		});
	}, { threshold: 0.14 });

	nodes.forEach(node => observer.observe(node));
};
