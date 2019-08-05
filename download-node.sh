#!/usr/bin/env bash

set -e

version=$(cat ./.nvmrc)
url="https://nodejs.org/dist/v$version/node-v$version-linux-x64.tar.gz"

if [ -f "./tmp/node-v$version-linux-x64/bin/node" ]; then
  echo "Node $version already installed at $(pwd)/tmp/node-v$version-linux-x64"
  exit 0
fi

if type wget > /dev/null; then
  wget -O /tmp/node.tar.gz "$url"
elif type curl > /dev/null; then
  curl -Lfo /tmp/node.tar.gz "$url"
else
  echo "Either curl or wget required for install-node"
  exit 1
fi

mkdir -p ./tmp
tar xzf "/tmp/node.tar.gz" -C ./tmp/

echo -e "#!/usr/bin/env /bin/bash\n$(pwd)/tmp/node-v$version-linux-x64/bin/node --no-deprecation \"\$@\"" > $(pwd)/tmp/node-v$version-linux-x64/bin/dnode
chmod +x $(pwd)/tmp/node-v$version-linux-x64/bin/dnode
