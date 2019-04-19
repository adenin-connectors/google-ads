'use strict';
const api = require('./common/api');

const xmlDefinition = `
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

module.exports = async (activity) => {
  try {
    api.initialize(activity);

    let opts = {
      method: 'POST'
    };
    opts.form = true;
    opts.body = {
      ...opts.body,
      __rdxml: xmlDefinition
    };
    const response = await api(`/api/adwords/reportdownload/v201809`, opts);

    if ($.isErrorResponse(activity, response)) return;

    //splits string after 'total' to get totals of Impressions,Clicks And cost in that order
    let data = response.body.split('Total,')[1];
    let values = data.split(',');

    let totalImpressions = values[0];
    let totalClicks = values[1];
    let totalCost = values[2];

    let campaignStatus = {
      title: T(activity, 'Camapaigns Status'),
      link: 'https://ads.google.com/aw/overview?',
      linkLabel: T(activity, 'All Campaigns'),
      description: T(activity, `Yesterday you had {0} clicks and {1} impression with a total cost of {2}$.`, totalClicks, totalImpressions, totalCost / 1000000),
      color: 'blue',
      value: response.body.length,
      actionable: true
    };

    activity.Response.Data = campaignStatus;
  } catch (error) {
    $.handleError(activity, error);
  }
};