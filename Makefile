# raw makefile
# - ease repeatitive operations

all:

#############################################
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
