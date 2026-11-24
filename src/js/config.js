// Los pagos de esta sesión se registran en la API real.
export const PAGOS_API_ACTIVA = true;
export const CAJA_ID = '58b8de45-c009-400c-bf8d-35daa48fb1e1';

const seSirveDesdeSrc = (globalThis.location?.pathname ?? '/src/index.html')
	.split('/')
	.includes('src');

export const API_BASE_URL = seSirveDesdeSrc
	? 'http://localhost:9080/Cafefe/resources/v1'
	: '/cafefe/resources/v1';
