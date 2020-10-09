const { raw } = require('express');
const Analytics = require('../../models/Analytics');
module.exports = {
  async logAction(action, user_id) {
    try {
      console.log('ANALYTICS: ' + action + ' ' + user_id);
      const response = await Analytics.create({
        user_id: user_id,
        action: action,
        deleted_at: null,
      });
      console.log(response);
      return response;
    } catch (error) {
      return 'ERROR';
    }
  },
};
