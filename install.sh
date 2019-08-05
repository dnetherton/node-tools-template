#!/usr/bin/env bash

set -e

MARKER="# Path for node-tools-template"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
file=$HOME/.bashrc

if ! grep -q "^$MARKER" $file; then
  printf "\n${MARKER}\n" >> $file
  printf "PATH=\$PATH:$DIR/bin\n" >> $file
  echo "Modified $file to extend path to include $DIR/bin"
  echo "You will need to source $file or open a new terminal"
fi

./download-node.sh
./build.sh
