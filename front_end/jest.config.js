module.exports = {
  preset: "@vue/cli-plugin-unit-jest",
  transform: {
    "^.+\\.vue$": "@vue/vue3-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|sass|scss)$": "<rootDir>/tests/unit/__mocks__/styleMock.js",
    "\\.(jpg|jpeg|png|gif|webp|svg)$":
      "<rootDir>/tests/unit/__mocks__/fileMock.js",
    "^video.js$": "<rootDir>/tests/unit/__mocks__/videojsMock.js",
  },
};
