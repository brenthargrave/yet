#!/bin/bash
set -x
set -u
set -e
set -v

(
  cd ..
  git push prod --force $(git subtree split --prefix web HEAD):refs/heads/master
)
