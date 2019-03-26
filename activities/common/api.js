'use strict';
const got = require('got');
const isPlainObj = require('is-plain-obj');
const HttpAgent = require('agentkeepalive');
const HttpsAgent = HttpAgent.HttpsAgent;

function api(path, opts) {
  if (typeof path !== 'string') {
    return Promise.reject(new TypeError(`Expected \`path\` to be a string, got ${typeof path}`));
  }

  opts = Object.assign({
    json: false,
    token: Activity.Context.connector.token,
    endpoint: 'https://adwords.google.com',
    method: 'POST',
    agent: {
      http: new HttpAgent(),
      https: new HttpsAgent()
    }
  }, opts);

  opts.headers = Object.assign({
    'clientCustomerId': Activity.Context.connector.custom1,
    'developerToken': Activity.Context.connector.custom2,
    'Content-Type': 'application/x-www-form-urlencoded',
    'user-agent': 'adenin Now Assistant Connector, https://www.adenin.com/now-assistant'
  }, opts.headers);

  if (opts.token) {
    opts.headers.Authorization = `Bearer ${opts.token}`;
  }

  opts.form = true;
  opts.body = {
    ...opts.body,
    __rdxml: xmlDefinition
  };

  const url = /^http(s)\:\/\/?/.test(path) && opts.endpoint ? path : opts.endpoint + path;

  if (opts.stream) {
    return got.stream(url, opts);
  }

  return got(url, opts).catch(err => {
    throw err;
  });
}

const helpers = [
  'get',
  'post',
  'put',
  'patch',
  'head',
  'delete'
];

api.stream = (url, opts) => apigot(url, Object.assign({}, opts, {
  json: false,
  stream: true
}));

for (const x of helpers) {
  const method = x.toUpperCase();
  api[x] = (url, opts) => api(url, Object.assign({}, opts, { method }));
  api.stream[x] = (url, opts) => api.stream(url, Object.assign({}, opts, { method }));
}

module.exports = api;

let xmlDefinition = `
<reportDefinition xmlns="https://adwords.google.com/api/adwords/cm/v201809">
<selector>
<fields>CampaignId</fields>
<fields>Impressions</fields>
<fields>Clicks</fields>
<fields>Cost</fields>
<predicates>
  <field>AdGroupStatus</field>
  <operator>IN</operator>
  <values>ENABLED</values>
  <values>PAUSED</values>
</predicates>
</selector>
<reportName>Custom Adgroup Performance Report</reportName>
<reportType>ADGROUP_PERFORMANCE_REPORT</reportType>
<dateRangeType>YESTERDAY</dateRangeType>
<downloadFormat>CSV</downloadFormat>
</reportDefinition>`;