const cache   = require('@actions/tool-cache');
const core    = require('@actions/core');
const exec    = require('@actions/exec');
const octokit = require('@octokit/rest');
const { Octokit } = require("@octokit/rest");

async function find(os, arch, options = {}) {
    const owner   = 'wangwei1237';
    const repo    = 'setup-vmaf';

    const octokit = new Octokit();
    const response = await octokit.repos.listReleases({ owner, repo });
    const release = response.data.find(({ tag_name }) => tag_name.startsWith('libvmaf-'));
    console.log('release-----------' + release.tag_name);
    return {
        release,
        version1: release.tag_name,
        url: `https://github.com/${owner}/${repo}/releases/download/${release.tag_name}/libvmaf-${os}-${arch}.tar.gz`,
    };
}

// most @actions toolkit packages have async methods
async function run() {
    try {
      const platform = core.getInput('os');
      const cc       = core.getInput('cc');
      const version  = core.getInput('version');
      const prefix   = core.getInput('prefix');

      console.log(platform + ',' + arch);
      const {version1, url} = await find(platform, arch);
      console.log('xsssss' + version1 + ',' + url);

      core.startGroup('Install dependencies');
      await exec.exec(`echo ${platform} ${arch}`);
      // await exec.exec(`python -m pip install --upgrade pip`);
      // await exec.exec(`pip install meson`);
      // await exec.exec('sudo apt-get update');
      // await exec.exec('sudo -E apt-get -yq install ccache ninja-build');
      // await exec.exec('sudo -E apt-get -yq install gcc g++ nasm');
      core.endGroup();

      core.startGroup('Download vmaf source code');
      // await exec.exec(`git clone https://github.com/Netflix/vmaf.git --branch  ${version} --depth 1`);
      core.endGroup();
      
      core.startGroup('Compile and install');
      const vmafPath       = './vmaf/libvmaf';
      const vmafBuildPath  = './vmaf/libvmaf/build';
      const setupCmd       = 'meson setup ' + 
                             vmafBuildPath + ' ' +
                             vmafPath + ' ' + 
                             '--prefix=' + prefix;
      const installCmd = 'ninja -vC ' + vmafBuildPath + ' install';
      // await exec.exec(setupCmd);
      // await exec.exec(installCmd);
      // await exec.exec('ls -R .');
      core.endGroup();

    } catch (error) {
      core.setFailed(error.message);
    }
}

run();
