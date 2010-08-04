# raw makefile
# - ease repeatitive operations

all:

PKGNAME="neoip-utils"
VERSION="0.5.0"
# work: get that dynamically
SRC_DIR=/home/jerome/webwork/node-neoip
DST_DIR_LIB=$(DESTDIR)/usr/share/neoip-utils
DST_DIR_BIN=$(DESTDIR)/usr/bin

build:
	echo "make build"

clean:
	echo "make clean"

install: build
	echo "make install"
	install -d $(DST_DIR_LIB)
	rsync -va --exclude debian --exclude .git $(SRC_DIR)/. $(DST_DIR_LIB)
	install -d $(DST_DIR_BIN)
	cp $(DST_DIR_LIB)/bin/neoip-url $(DST_DIR_BIN)

uninstall:
	rm -rf $(DST_DIR_LIB)
	rm -f $(DST_DIR_BIN)/neoip-url

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
