import * as oldL from './Leaflet.js';
export * from './Leaflet.js';

const L = Object.assign({}, oldL, {}); // fix the error: 对象无法拓展

export default L;

getGlobalObject().L = L;

function getGlobalObject() {
	if (typeof globalThis !== 'undefined') { return globalThis; }
	if (typeof self !== 'undefined') { return self; }
	if (typeof window !== 'undefined') { return window; }
	if (typeof global !== 'undefined') { return global; }

	throw new Error('Unable to locate global object.');
}


// import * as L from './Leaflet.js';
// export * from './Leaflet.js';

// export default L;

// getGlobalObject().L = L;

// function getGlobalObject() {
// 	if (typeof globalThis !== 'undefined') { return globalThis; }
// 	if (typeof self !== 'undefined') { return self; }
// 	if (typeof window !== 'undefined') { return window; }
// 	if (typeof global !== 'undefined') { return global; }

// 	throw new Error('Unable to locate global object.');
// }