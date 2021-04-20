#!/bin/bash

if [ $# -ne 1 ]
then
    echo "w"
fi

URL_PREFIX="https://api.github.com/repos/wangwei1237/setup-vmaf/releases"

version=$1
token=$2

tag="libvmaf-${version#v}"

get_release_url="${URL_PREFIX}/tags/${tag}"
upload_url=$(curl -H "Accept: application/vnd.github.v3+json" "${get_release_url}" | grep 'upload_url' | cut -d'"' -f4)

create_release_url="${URL_PREFIX}"
if [ "$upload_url" = "" ]
then
    upload_url=$(curl -X POST -H "Accept: application/vnd.github.v3+json" "${create_release_url}?access_token=${token}" -d "{\"tag_name\":\"${tag}\", \"name\":\"libvmaf Build for ${version}\"}" | grep 'upload_url' | cut -d'"' -f4)
fi

echo "-----------${upload_url}"
echo "::set-output name=upload-url::${upload_url}"
