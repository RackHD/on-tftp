#!/bin/bash
set -ex

# Ensure we're always in the right directory.
SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )"
cd $SCRIPT_DIR/..

# this appends a datestring formatting specifically to be increasing
# based on the last date of the commit in this branch to provide increasing
# DCH version numbers for building debian packages for bintray.
GITCOMMITDATE=$(git show -s --pretty="format:%ci")
DATESTRING=$(date -d "$GITCOMMITDATE" -u +"%Y%m%d%H%M%SZ")

if [ -z "$DEBFULLNAME" ]; then
        export DEBFULLNAME=`git log -n 1 --pretty=format:%an`
fi

if [ -z "$DEBEMAIL" ]; then
        export DEBEMAIL=`git log -n 1 --pretty=format:%ae`
fi

if [ -z "$DEBBRANCH" ]; then
        export DEBBRANCH=$(./extra/gen-debbranch.sh)
fi

if [ -z "$DEBPKGVER" ]; then
  export DEBPKGVER=`git log -n 1 --pretty=oneline --abbrev-commit`
fi

if [ -z "$DCHOPTS" ]; then
        if [[ $DEBBRANCH =~ ^[0-9.]+$ ]]; then
                #Use "dch -r" do release, "UNRELEASED" in changelog will be set to "unstable"
                #or any other predefined distribution, the timestamp will be updated too.
                export DCHOPTS="-r \"\""
        else
                #Use "dch -v -u -b" do ci-builds
                export DCHOPTS="-v ${DEBBRANCH} -u low ${DEBPKGVER} -b"
        fi
        
fi

echo "DEBDIR:       $DEBDIR"
echo "DEBFULLNAME:  $DEBFULLNAME"
echo "DEBEMAIL:     $DEBEMAIL"
echo "DEBBRANCH:    $DEBBRANCH"
echo "DEBPKGVER:    $DEBPKGVER"
echo "DCHOPTS:      $DCHOPTS"


if [ -d packagebuild ]; then
  rm -rf packagebuild
fi
mkdir packagebuild
rsync -ar --exclude=packagebuild . packagebuild
pushd packagebuild
rm -rf node_modules
npm install --production
git log -n 1 --pretty=format:%h.%ai.%s > commitstring.txt
dch ${DCHOPTS}
debuild --no-lintian --no-tgz-check -us -uc
popd
if [ ! -d deb ]; then
  mkdir deb
fi

cp -a *.deb deb/
