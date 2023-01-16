const core = require('@actions/core');
const { runSiteSpeed, runLighthouse } = require('./commander/measure')

// most @actions toolkit packages have async methods
async function main() {
  try {
    const websites = core.getInput('websites');
    const iterations = core.getInput('iterations');
    const cookies = core.getInput('cookies');
    const preset = core.getInput('preset');
    const sitespeed = core.getBooleanInput('sitespeed');
    const lighthouse = core.getBooleanInput('lighthouse');
    if (sitespeed) {
      runSiteSpeed({websites, preset, iterations, cookies})
    }
    if (lighthouse) {
      runLighthouse({websites, preset, iterations, cookies})
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();