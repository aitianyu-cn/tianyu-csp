/** @format */

/**
 *
 * @param {number[]} data
 * @returns
 */
module.exports.handle = async function (data) {
    return data.map((value) => "p" + value);
};
