import { beforeAll, beforeEach, expect, jest, test } from "@jest/globals";

const mockUserInstance = {
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  save: jest.fn(),
};

const User = {
  findById: jest.fn(),
};

jest.unstable_mockModule("../../modules/User/User.model.js", () => ({
  __esModule: true,
  User,
}));

let generateAcessAndRefreshAtoken;

beforeAll(async () => {
  const mod = await import("../../utils/helpers/generatingJWTTokens.js");
  generateAcessAndRefreshAtoken = mod.generateAcessAndRefreshAtoken;
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Generating JWT Tokens -- Unit Test", () => {
  test("Should generate access and refresh tokens successfully", async () => {
    mockUserInstance.generateAccessToken.mockReturnValue("access-token");
    mockUserInstance.generateRefreshToken.mockReturnValue("refresh-token");
    User.findById.mockResolvedValue(mockUserInstance);

    const result = await generateAcessAndRefreshAtoken("user123");

    expect(mockUserInstance.save).toHaveBeenCalledWith({
      validateBeforeSave: false,
    });
    expect(result).toEqual({
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });
    expect(User.findById).toHaveBeenCalledWith("user123");
  });

  test("should throw error if user not found", async () => {
    User.findById.mockResolvedValue(null);

    await expect(generateAcessAndRefreshAtoken("user1234")).rejects.toThrow(
      "error while creating tokens"
    );
  });

  test("should throw error if tokens not generated", async () => {
    mockUserInstance.generateAccessToken.mockReturnValue(null);
    mockUserInstance.generateRefreshToken.mockReturnValue(null);
    User.findById.mockResolvedValue(mockUserInstance);

    await expect(generateAcessAndRefreshAtoken("user123")).rejects.toThrow(
      "Token generation failed"
    );
    expect(User.findById).toHaveBeenCalled();
  });

  test("should throw wrapped ApiError if any internal error occurs", async () => {
    User.findById.mockRejectedValue(new Error("DB failed"));

    await expect(generateAcessAndRefreshAtoken("user123")).rejects.toThrow(
      "something went wrong"
    );
  });
});
