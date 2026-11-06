import kirklin from "@kirklin/eslint-config";

export default kirklin({
  type: "lib",
  typescript: {
    erasableOnly: true,
  },
  ignores: [
    "assets/styles/*/out",
  ],
});
