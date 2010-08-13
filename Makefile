# raw makefile
# - ease repeatitive operations

all:

PKGNAME="neoip-utils"
VERSION="0.7.0"
SRC_DIR=$(shell /bin/pwd)
DST_DIR_LIB=$(DESTDIR)/usr/share/neoip-utils
DST_DIR_BIN=$(DESTDIR)/usr/bin
DST_DIR_MAN=$(DESTDIR)/usr/share/man

#################################################################################
#		misc								#
#################################################################################
doc:
	pod2man --section=1 --release=$(VERSION) lib/url_builder_oload_exe.js	> doc/man/neoip-url-static.1
	pod2man --section=1 --release=$(VERSION) lib/url_builder_casto_exe.js	> doc/man/neoip-url-stream.1
	pod2man --section=1 --release=$(VERSION) lib/neoip_app_detect_exe.js	> doc/man/neoip-detect.1

jsdoc:
	jsrun.sh -d=doc/jsdoc lib/

#################################################################################
#		usual targets							#
#################################################################################
build: doc
	echo "make build"

clean:
	echo "make clean"

install: build
	install -d $(DST_DIR_LIB)
	rsync -va --exclude debian --exclude .git $(SRC_DIR)/. $(DST_DIR_LIB)
	install -d $(DST_DIR_BIN)
	cp $(DST_DIR_LIB)/bin/neoip-url-static	$(DST_DIR_BIN)
	cp $(DST_DIR_LIB)/bin/neoip-url-stream	$(DST_DIR_BIN)
	cp $(DST_DIR_LIB)/bin/neoip-detect	$(DST_DIR_BIN)
	install -d $(DST_DIR_MAN)/man1
	cp doc/man/neoip-url-static.1		$(DST_DIR_MAN)/man1
	cp doc/man/neoip-url-stream.1		$(DST_DIR_MAN)/man1
	cp doc/man/neoip-detect.1		$(DST_DIR_MAN)/man1

uninstall:
	rm -rf $(DST_DIR_LIB)
	rm -f $(DST_DIR_BIN)/neoip-url-static
	rm -f $(DST_DIR_BIN)/neoip-url-stream
	rm -f $(DST_DIR_BIN)/neoip-detect
	rm -f $(DST_DIR_MAN)/man1/neoip-url-static.1
	rm -f $(DST_DIR_MAN)/man1/neoip-url-stream.1
	rm -f $(DST_DIR_MAN)/man1/neoip-detect.1

#################################################################################
#		deb package handling						#
#################################################################################

deb_src_build:
	debuild -S -k'jerome etienne' -I.git

deb_bin_build:
	debuild -i -us -uc -b

deb_upd_changelog:
	dch --newversion $(VERSION)~lucid1~ppa`date +%Y%m%d%H%M` --maintmaint --force-bad-version --distribution `lsb_release -c -s` Another build

deb_clean:
	rm -f ../$(PKGNAME)_$(VERSION)~lucid1~ppa*

ppa_upload: clean build deb_clean deb_upd_changelog deb_src_build
	dput -U ppa:jerome-etienne/neoip ../$(PKGNAME)_$(VERSION)~lucid1~ppa*_source.changes 
