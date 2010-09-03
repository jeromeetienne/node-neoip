# raw makefile
# - ease repeatitive operations

all:

PKGNAME="webpeer-utils"
VERSION="0.7.3"
SRC_DIR=$(shell /bin/pwd)
DST_DIR_LIB=$(DESTDIR)/usr/share/webpeer-utils
DST_DIR_BIN=$(DESTDIR)/usr/bin
DST_DIR_MAN=$(DESTDIR)/usr/share/man

#################################################################################
#		misc								#
#################################################################################
doc: manpage_build

manpage_build:
	pod2man --section=1 --release=$(VERSION) lib/oload_preloader_exe.js	> man/webpeer-preload.1
	pod2man --section=1 --release=$(VERSION) lib/url_builder_oload_exe.js	> man/webpeer-url-static.1
	pod2man --section=1 --release=$(VERSION) lib/url_builder_casto_exe.js	> man/webpeer-url-stream.1
	pod2man --section=1 --release=$(VERSION) lib/neoip_app_detect_exe.js	> man/webpeer-detect.1

manpage_clean:
	rm -f man/*.1

jsdoc:
	jsrun.sh -d=doc/jsdoc lib/
	
tag_version:
	git tag -a v$(VERSION) -m "v$(VERSION) - version bump"
	git push origin v$(VERSION)

#################################################################################
#		npm package handling						#
#################################################################################

npm_link:
	npm link .

npm_install:
	npm install .

npm_uninstall:
	npm uninstall webpeer

npm_publish:
	npm publish .


#################################################################################
#		usual targets							#
#################################################################################
build: doc
	echo "make build"

clean: manpage_clean
	echo "make clean"

install: build
	install -d $(DST_DIR_LIB)
	rsync -va --exclude debian --exclude .git $(SRC_DIR)/. $(DST_DIR_LIB)
	install -d $(DST_DIR_BIN)
	cp $(DST_DIR_LIB)/bin/webpeer-preload		$(DST_DIR_BIN)
	cp $(DST_DIR_LIB)/bin/webpeer-url-static	$(DST_DIR_BIN)
	cp $(DST_DIR_LIB)/bin/webpeer-url-stream	$(DST_DIR_BIN)
	cp $(DST_DIR_LIB)/bin/webpeer-detect		$(DST_DIR_BIN)
	install -d $(DST_DIR_MAN)/man1
	cp man/webpeer-preload.1	$(DST_DIR_MAN)/man1
	cp man/webpeer-url-static.1	$(DST_DIR_MAN)/man1
	cp man/webpeer-url-stream.1	$(DST_DIR_MAN)/man1
	cp man/webpeer-detect.1		$(DST_DIR_MAN)/man1

uninstall:
	rm -rf $(DST_DIR_LIB)
	rm -f $(DST_DIR_BIN)/webpeer-preload
	rm -f $(DST_DIR_BIN)/webpeer-url-static
	rm -f $(DST_DIR_BIN)/webpeer-url-stream
	rm -f $(DST_DIR_BIN)/webpeer-detect
	rm -f $(DST_DIR_MAN)/man1/webpeer-preload.1
	rm -f $(DST_DIR_MAN)/man1/webpeer-url-static.1
	rm -f $(DST_DIR_MAN)/man1/webpeer-url-stream.1
	rm -f $(DST_DIR_MAN)/man1/webpeer-detect.1

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
