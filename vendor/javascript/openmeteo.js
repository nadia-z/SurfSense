// openmeteo@1.2.0 downloaded from https://ga.jspm.io/npm:openmeteo@1.2.0/lib/index.js

import*as e from"flatbuffers";import*as t from"@openmeteo/sdk/weather-api-response";var n=e;try{"default"in e&&(n=e.default)}catch(e){}var r=t;try{"default"in t&&(r=t.default)}catch(e){}var o={};var i=o&&o.__awaiter||function(e,t,n,r){function adopt(e){return e instanceof n?e:new n((function(t){t(e)}))}return new(n||(n=Promise))((function(n,o){function fulfilled(e){try{step(r.next(e))}catch(e){o(e)}}function rejected(e){try{step(r.throw(e))}catch(e){o(e)}}function step(e){e.done?n(e.value):adopt(e.value).then(fulfilled,rejected)}step((r=r.apply(e,t||[])).next())}))};Object.defineProperty(o,"__esModule",{value:true});o.fetchWeatherApi=fetchWeatherApi;const s=n;const a=r;const sleep=e=>new Promise((t=>setTimeout(t,e)));function fetchRetried(e){return i(this,arguments,void 0,(function*(e,t=3,n=.5,r=2,o={}){const i=[500,502,504];const s=[400,429];let a=0;let c=yield fetch(e,o);while(i.includes(c.status)){a++;if(a>=t)throw new Error(c.statusText);const i=Math.min(n*Math.pow(2,a),r)*1e3;yield sleep(i);c=yield fetch(e,o)}if(s.includes(c.status)){const e=yield c.json();if("reason"in e)throw new Error(e.reason);throw new Error(c.statusText)}return c}))}
/**
 * Retrieve data from the Open-Meteo weather API
 *
 * @param {string} url Server and endpoint. E.g. "https://api.open-meteo.com/v1/forecast"
 * @param {any} params URL parameter as an object
 * @param {number} [retries=3] Number of retries in case of an server error
 * @param {number} [backoffFactor=0.2] Exponential backoff factor to increase wait time after each retry
 * @param {number} [backoffMax=2] Maximum wait time between retries
 * @param {RequestInit} [fetchOptions={}] Additional fetch options such as headers, signal, etc.
 * @returns {Promise<WeatherApiResponse[]>}
 */function fetchWeatherApi(e,t){return i(this,arguments,void 0,(function*(e,t,n=3,r=.2,o=2,i={}){const c=new URLSearchParams(t);c.set("format","flatbuffers");const f=yield fetchRetried(`${e}?${c.toString()}`,n,r,o,i);const u=new s.ByteBuffer(new Uint8Array(yield f.arrayBuffer()));const h=[];let l=0;while(l<u.capacity()){u.setPosition(l);const e=u.readInt32(u.position());h.push(a.WeatherApiResponse.getSizePrefixedRootAsWeatherApiResponse(u));l+=e+4}return h}))}const c=o.__esModule;const f=o.fetchWeatherApi;export{c as __esModule,o as default,f as fetchWeatherApi};

