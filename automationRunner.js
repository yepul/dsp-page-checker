const { exec } = require("child_process");

function runAutomation() {
  return new Promise((resolve, reject) => {
    const command = "node automation.js";

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

module.exports = runAutomation;
