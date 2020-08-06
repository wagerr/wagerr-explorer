
/**
 * Date
 *
 * Simple wrapper methods around moment.js.
 */
const moment = require('moment');

/**
 * Return the date as a string in provided format.
 * @param {Date} date The date object to format.
 * @param {String} fmt The moment.js format string.
 */
const dateFormat = (date, fmt = 'YYYY-MM-DD hh:mm:ss') => {
  if (!date) {
    date = new Date();
  }

  return `${ moment(date).utc().format(fmt) } UTC`;
};
//const betTime = moment(bet.createdAt).utc().local().format('YYYY-MM-DD HH:mm:ss');
const date24Format = (date, fmt = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) {
    date = new Date();
  }
  //return `${ moment(date).utc().format(fmt) } UTC`;
  return `${ moment(date).utc().local().format(fmt) }`;
};

const timeStamp24Format = (timestamp, fmt = 'YYYY-MM-DD HH:mm:ss') => {
  //return `${ moment(new Date(parseInt(timestamp))).utc().format(fmt) } UTC`;
  return `${ moment(new Date(parseInt(timestamp))).utc().local().format(fmt) }`;
};

module.exports = {
  dateFormat,
  date24Format,
  timeStamp24Format
};
