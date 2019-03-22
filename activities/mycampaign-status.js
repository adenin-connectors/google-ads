'use strict';
const cfActivity = require('@adenin/cf-activity');
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);

    const response = await api(`/api/adwords/reportdownload/v201809`);

    if (!cfActivity.isResponseOk(activity, response)) {
      return;
    }

    //splits string after 'total' to get totals of Impressions,Clicks And cost in that order
    let data = response.body.split('Total,')[1];
    let values = data.split(',');

    let totalImpressions = values[0];
    let totalClicks = values[1];
    let totalCost = values[2];

    let campaignStatus = {
      title: 'Camapaigns Status',
      url: 'https://ads.google.com/aw/overview?',
      urlLabel: 'All Campaigns',
      description: `Yesterday you had ${totalClicks} clicks and ${totalImpressions} impression with a total cost of ${totalCost / 1000000}$.`,
      color: 'blue',
      value: response.body.length,
      actionable: true
    };

    activity.Response.Data = campaignStatus;
  } catch (error) {
    cfActivity.handleError(activity, error);
  }
};