#!/bin/bash

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <TAG_PREFIX> <VERSION>"
    echo "The TAG_PREFIX can include a registry if necessary."
    exit 1
fi

tag_prefix=$1
version=$2

cd workshops-frontend
docker build -t ${tag_prefix}-frontend:${version} --build-arg REACT_APP_VERSION=${version} .
docker push ${tag_prefix}-frontend:${version}

cd ../workshops-backend
docker build -t ${tag_prefix}-backend:${version} .
docker push ${tag_prefix}-backend:${version}

cd ../workshops-backend-v2
docker build -t ${tag_prefix}-backend-v2:${version} .
docker push ${tag_prefix}-backend-v2:${version}
