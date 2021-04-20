#!/bin/bash

if [ $# -ne 1 ]
then
    echo "w"
fi

URL_PREFIX="https://api.github.com/repos/wangwei1237/setup-vmaf/releases"

tag="libvmaf-${1:1}"
get_release_url="${URL_PREFIX}/tags/${tag}"
upload_url=$(curl -H "Accept: application/vnd.github.v3+json" "${get_release_url}" | grep 'upload_url' | cut -d'"' -f4)

create_release_url="${URL_PREFIX}"
if [ "$upload_url" == "" ]
then
    curl -H "Accept: application/vnd.github.v3+json" "${create_release_url}"
fi

echo "-----------${upload_url}"
echo "::set-output name=upload-url::${upload_url}"
echo "::error Something went wrong"
