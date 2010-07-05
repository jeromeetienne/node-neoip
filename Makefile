# raw makefile
# - ease repeatitive operations

all:

PKGNAME="neoip"
VERSION="1.0.0"

DST_ROOT:=/
DST_BIN	:=$(DESTDIR)/usr/bin
DST_LIB	:=$(DESTDIR)/usr/local/lib
PWD 	:= $(shell pwd)
SRC_DIR	:=../node-neoip

################################################################################
#	install/uninstall target
################################################################################

install: install_prod

install_dev:
	mkdir -p $(DST_BIN)
	ln -sf $(PWD)/neoip-url $(DST_BIN)/neoip-url

install_prod:
	mkdir -p $(DST_LIB)/$(PKGNAME)-$(VERSION)
	cp -fr $(SRC_DIR)/* $(DST_LIB)/$(PKGNAME)-$(VERSION)/
	mkdir -p $(DST_BIN)
	ln -sf $(DST_LIB)/$(PKGNAME)-$(VERSION)/neoip-url $(DST_BIN)/neoip-url

uninstall:
	rm -rf $(DST_LIB)/$(PKGNAME)-$(VERSION)
	rm -f $(DST_BIN)/neoip-url


################################################################################
# 	package handling with npm
# - http://github.com/isaacs/npm
# - npm is ultra beta. More an experiement than anything
################################################################################
pkg_publish:
	sudo npm publish $(PWD)

#############################################
pkg_test_install:
	sudo npm install .

pkg_test_uninstall:
	sudo npm uninstall .

#############################################
pkg_install:
	sudo npm install neoip@latest

pkg_uninstall:
	sudo npm uninstall neoip
