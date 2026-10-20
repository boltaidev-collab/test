import Splide from '@splidejs/splide';

export const spotlight = section => {
	const root = section.querySelector('.splide');
	if (!root) return;
	if (window.matchMedia('(min-width: 900px), (prefers-reduced-motion: reduce)').matches) return;

	const splide = new Splide(root, {
		type: 'slide',
		perPage: 1,
		gap: '1rem',
		arrows: true,
		pagination: true,
		i18n: {
			prev: 'Претходна представа',
			next: 'Следећа представа',
			first: 'Прва представа',
			last: 'Последња представа',
			slideX: 'Представа %s',
			pageX: 'Страна %s',
			select: 'Изабери представу',
			carousel: 'Издвојене представе',
			slide: 'Представа',
			slideLabel: '%s од %s'
		}
	});

	splide.mount();
};
