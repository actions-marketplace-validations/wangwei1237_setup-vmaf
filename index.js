const core   = require('@actions/core');
const github = require('@actions/github');
const exec   = require('@actions/exec');
const wait   = require('./wait');


// most @actions toolkit packages have async methods
async function run() {
    try {
      // `who-to-greet` input defined in action metadata file
      const nameToGreet = core.getInput('who-to-greet');
      console.log(`Hello ${nameToGreet}!`);
      const time = (new Date()).toTimeString();
      core.setOutput("time", time);
      core.setOutput("name", nameToGreet);
      // Get the JSON webhook payload for the event that triggered the workflow
      const payload = JSON.stringify(github.context.payload, undefined, 2)
      console.log(`The event payload: ${payload}`);

      core.startGroup('Install dependencies');
      await exec.exec(`python -m pip install --upgrade pip`);
      await exec.exec(`pip install meson`);
      await exec.exec('sudo apt-get update');
      await exec.exec('sudo -E apt-get -yq install ccache ninja-build');
      await exec.exec('sudo -E apt-get -yq install gcc g++ nasm');
      core.endGroup();

      core.startGroup('Download source code');
      await exec.exec(`git clone https://github.com/Netflix/vmaf.git --branch  master --depth 1`);
      core.endGroup();
      
      const vmafPath = './vmaf/libvmaf';
      const vmafBuildPath  = './vmaf/libvmaf/build';
      core.startGroup('Compile and install');
      // await exec.exec(`meson setup vmaf/libvmaf/build vmaf/libvmaf --prefix=/home/runner/work/setup-vmaf/setup-vmaf/libvmaf`);
      // await exec.exec(`ninja -vC vmaf/libvmaf/build install`);
      await exec.exec('"meson"', [setup, vmafBuildPath, vmafPath], {'prefix':'/home/runner/work/setup-vmaf/setup-vmaf/libvmaf'});
    
      await exec.exec(`ls -R .`);
      core.endGroup();

    } catch (error) {
      core.setFailed(error.message);
    }
}

run();
