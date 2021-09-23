#!/bin/bash
set -x
set -u
set -e
set -v

chokidar "./lib/**/*.ex" -c "(cd ui && yarn codegen)"
