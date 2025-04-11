/// @param {ApiResponse} handling manually response of api and returning success flag

class ApiResponse {
  constructor(statusCode, data = [], message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}
export { ApiResponse };
