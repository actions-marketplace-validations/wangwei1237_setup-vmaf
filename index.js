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
      var platform = core.getInput('os');
      var cc       = core.getInput('cc');
      var version  = core.getInput('version').slice(1);

      platform = 'ubuntu-20.04';
      cc = 'gcc';
      version = 'v2.1.1'.slice(1);
      console.log(platform + ',' + cc + ',' + version);
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

      
    } catch (error) {
      core.setFailed(error.message);
    }
}

run();
