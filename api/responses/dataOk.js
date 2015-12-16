'use strict';

/**
 * 200 (OK) Response
 *
 * Usage:
 * return res.ok();
 * return res.ok(data);
 * return res.ok(data, 'auth/login');
 *
 * @param  {Object} data
 * @param  {String|Object} options
 *          - pass string to render specified view
 */

module.exports = function dataOk (data, options) {

  let res = this.res;

  // Set status code
  res.status(200);

  return res.jsonx({data: data});
};
