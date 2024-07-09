// script.js
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async function () {
  await sleep(5000); // Simulate a long-running operation (e.g., 5 seconds)
  console.log("Script completed.");
})();
