/**
 * @class ApiResponse
 * @classdesc An object to return when gets success and returning something to client-side.
 *
 * @example
 * //Usage Example
 * new ApiResponse(200, {Data}, "Successfull reponse")
 *
 * // Expect Response
 * {
 * "Success": true,
 * "statusCode": 200
 * "data": {
 *  name: "Wasiq",
 *  email: "Wasiq634233@com",
 *  },
 * "message": "Successfull reponse",
 * }
 */

class ApiResponse {
  /** Creates an instance of ApiResponse
   * @param {Number} statusCode - HTTP status code representing the successful response (e.g., 200, 201).
   * @param {Object|Array}  [data=[]] - A data giving to client side in the shape of object or array.
   * @param {string} [message="Success"] - A human readable description of success response.
   */

  constructor(statusCode, data = [], message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}
export { ApiResponse };
