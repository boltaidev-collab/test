export const starfield = host => {
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	let stars = [];
	let frame = 0;
	let running = true;

	canvas.className = 'starfield__canvas';
	canvas.setAttribute('aria-hidden', 'true');
	host.appendChild(canvas);

	const resize = () => {
		const ratio = Math.min(window.devicePixelRatio || 1, 2);
		const width = host.clientWidth || window.innerWidth;
		const height = host.clientHeight || window.innerHeight;
		canvas.width = Math.floor(width * ratio);
		canvas.height = Math.floor(height * ratio);
		context.setTransform(ratio, 0, 0, ratio, 0, 0);
	};

	const seed = () => {
		stars = Array.from({ length: 86 }, (_, index) => ({
			x: Math.random(),
			y: Math.random(),
			r: Math.random() * 1.25 + 0.25,
			a: Math.random() * 0.55 + 0.15,
			s: Math.random() * 0.00012 + 0.00003,
			tw: Math.random() * Math.PI * 2,
			gold: index % 6 === 0
		}));
	};

	const draw = now => {
		const width = host.clientWidth || window.innerWidth;
		const height = host.clientHeight || window.innerHeight;
		context.clearRect(0, 0, width, height);
		stars.forEach(star => {
			if (!reduce) star.y -= star.s;
			if (star.y < 0) star.y += 1;
			const alpha = star.a * (0.62 + 0.38 * Math.sin((now || 0) / 900 + star.tw));
			context.fillStyle = star.gold ? `rgba(228, 199, 138, ${alpha})` : `rgba(244, 236, 223, ${alpha})`;
			context.beginPath();
			context.arc(star.x * width, star.y * height, star.r, 0, Math.PI * 2);
			context.fill();
		});
		context.strokeStyle = 'rgba(228, 199, 138, 0.16)';
		context.lineWidth = 1;
		context.beginPath();
		for (let index = 0; index < 8; index += 1) {
			const from = stars[index];
			const to = stars[index + 4];
			if (!from || !to) continue;
			context.moveTo(from.x * width, from.y * height);
			context.lineTo(to.x * width, to.y * height);
		}
		context.stroke();
		if (!reduce && running) frame = window.requestAnimationFrame(draw);
	};

	resize();
	seed();
	frame = window.requestAnimationFrame(draw);

	window.addEventListener('resize', () => {
		resize();
		if (reduce) draw(0);
	});

	document.addEventListener('visibilitychange', () => {
		running = !document.hidden;
		if (running && !reduce) {
			frame = window.requestAnimationFrame(draw);
		} else {
			window.cancelAnimationFrame(frame);
		}
	});
};
