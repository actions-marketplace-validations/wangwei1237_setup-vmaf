const assert      = require('assert');
const core        = require('@actions/core');
const exec        = require('@actions/exec');
const fs          = require('fs');
const mvdir       = require('mvdir');
const path        = require('path');
const tc          = require('@actions/tool-cache');
const { Octokit } = require("@octokit/rest");

const chmodx = (path) => fs.promises.chmod(path, '755');

async function find(version, os, cc, options = {}) {
    const owner   = 'wangwei1237';
    const repo    = 'setup-vmaf';

    const octokit  = new Octokit({ auth: options.token });
    const response = await octokit.repos.listReleases({ owner, repo });
    const release  = response.data.find(({ tag_name }) => tag_name.startsWith('libvmaf-' + version));

    if (!release) {
        return {release, tag: '', url: ''};
    } 

    return {
        release,
        tag: release.tag_name,
        url: `https://github.com/${owner}/${repo}/releases/download/${release.tag_name}/libvmaf-${os}-${cc}.tar.gz`,
    };
}

// most @actions toolkit packages have async methods
async function run() {
    try {
      const token = [process.env.INPUT_TOKEN, process.env.INPUT_GITHUB_TOKEN, process.env.GITHUB_TOKEN]
      .filter((token) => token)[0];

      const platform = core.getInput('os');
      const cc       = core.getInput('cc');
      const version  = core.getInput('version').slice(1);

      const {tag, url} = await find(version, platform, cc, { token });
      if (!tag) {
          console.log('can not find libvmaf-' + version + ', please contact the author of setup-vmaf actions.');
          throw('can not find libvmaf-' + version + ', please contact the author of setup-vmaf actions.');
      } 

      // Search in the cache if version is already installed
      let installPath = tc.find('libvmaf', version, platform + '-' + cc);
      
      if (!installPath) {
          const downloadPath = await tc.downloadTool(url, void 0, token);
          const extractPath  = await tc.extractTar(downloadPath);
          installPath        = await tc.cacheDir(extractPath, 'libvmaf', version, platform + '-' + cc);
      }
    
      assert.ok(installPath);

      console.log('mv the libvmaf to path: ${{github.workspace}}/../../');
      const targetPath = '../../libvmaf';
      await mvdir(installPath + '/libvmaf', targetPath, {copy: true});
      
      const vmafPath = path.join(targetPath, '/bin/vmaf');
      await chmodx(vmafPath);
      assert.ok(await exec.exec(vmafPath, ['--version']) === 0);
      core.addPath(targetPath + '/bin');
      
      let pkgconfigPath = '';
      if (platform.startsWith('ubuntu')) {
          pkgconfigPath = targetPath + '/lib/x86_64-linux-gnu/pkgconfig';
      } else if (platform.startsWith('macos')) {
          pkgconfigPath = targetPath + '/lib/pkgconfig';
      }

      console.log('pkgconfigPath: ' + pkgconfigPath);
      core.setOutput('libvmaf-path', targetPath);
      core.setOutput('pkgconfig-path', pkgconfigPath);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
