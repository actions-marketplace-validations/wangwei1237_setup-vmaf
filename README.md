# setup-vmaf
Setup vmaf in GitHub Actions to use `vmaf` and `libvmaf`. The action will download, cache and add to `PATH` a recent vmaf build for the current os. This action also support the libvmaf library, and export the `libvmaf` and `pkgconfig` file path as action's outputs. 

# Usage
To use `vmaf` and `libvmaf`, run the action before them.

```yml
steps:
  - uses: actions/checkout@v2
  - uses: wangwei1237/setup-vmaf@v1
    with:
      # Not strictly necessary, but it may prevent rate limit
      # errors especially on GitHub-hosted macos machines.
      token: ${{ secrets.GITHUB_TOKEN }}
    id: setup-vmaf
  - run: |
    vmaf --version
    echo "The libvmaf path: ${{ steps.setup-vmaf.outputs.libvmaf-path }}"
    echo "The pkgconfig path: ${{ steps.setup-vmaf.outputs.pkgconfig-path }}"
```

This action also sets a few outputs:
 - `libvmaf-path`: Path to the install directory
 - `pkgconfig-path`: Path to the libvmaf pkgconfig file

# vmaf Version
The action uses a [workflow_dispatch workflow](.github/workflows/build.yml) to build vmaf. This workflow need the ['vmaf verson'](https://github.com/Netflix/vmaf/tags) as input. 

**Note:** This action only supports x64 operating systems.
