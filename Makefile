# raw makefile
# - ease repeatitive operations

all:

PKGNAME="neoip-utils"
VERSION="0.5.0"

build:
	echo "make build"

clean:
	echo "make clean"
	
install: build
	echo "make install"

#################################################################################
#		package handling						#
#################################################################################

deb_src_build:
	debuild -S -k'jerome etienne' -I.git

deb_bin_build:
	debuild -i -us -uc -b

deb_upd_changelog:
	dch --newversion $(VERSION)~lucid1~ppa`date +%Y%m%d%H%M` --maintmaint --force-bad-version --distribution `lsb_release -c -s` Another build

ppa_upload: deb_src_build
	dput -U ppa:jerome-etienne/neoip ../$(PKGNAME)_$(VERSION)~lucid1~ppa*_source.changes 
