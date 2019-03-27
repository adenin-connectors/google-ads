'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    const response = await api(`/api/adwords/reportdownload/v201809`);

    if (Activity.isErrorResponse(response)) return;

    //splits string after 'total' to get totals of Impressions,Clicks And cost in that order
    let data = response.body.split('Total,')[1];
    let values = data.split(',');

    let totalImpressions = values[0];
    let totalClicks = values[1];
    let totalCost = values[2];

    let campaignStatus = {
      title: T('Camapaigns Status'),
      link: 'https://ads.google.com/aw/overview?',
      linkLabel: T('All Campaigns'),
      description: T(`Yesterday you had {0} clicks and {1} impression with a total cost of {2}$.`, totalClicks, totalImpressions, totalCost / 1000000),
      color: 'blue',
      value: response.body.length,
      actionable: true
    };

    activity.Response.Data = campaignStatus;
  } catch (error) {
    Activity.handleError(error);
  }
};