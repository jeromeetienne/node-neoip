# raw makefile
# - ease repeatitive operations

VERSION=0.7.0

# if DESTDIR is not yet defined use "./build"
# - thus "DESTDIR=/tmp make" will generate webpeer-*.js in /tmp
ifeq ($(origin DESTDIR), undefined)
	DESTDIR=./build
endif

all: clean brequire pack minify latest

brequire:
	../vendor/brequire/bin/brequire ../lib/ build/lib

pack:
	cat build_prefix.js			 > $(DESTDIR)/webpeer-$(VERSION).js
	cat ../vendor/brequire/lib/brequire.js	>> $(DESTDIR)/webpeer-$(VERSION).js
	cat `ls build/lib/*.js | grep -v _test.js | grep -v _exe.js`  >> $(DESTDIR)/webpeer-$(VERSION).js
	cat build_suffix.js 			>> $(DESTDIR)/webpeer-$(VERSION).js

minify:
	cat $(DESTDIR)/webpeer-$(VERSION).js | closurec > $(DESTDIR)/webpeer-$(VERSION)-min.js

# latest: doesnt do symlink because github pages dont follow symlink
latest:
	cp -f $(DESTDIR)/webpeer-$(VERSION).js		$(DESTDIR)/webpeer-latest.js
	cp -f $(DESTDIR)/webpeer-$(VERSION)-min.js	$(DESTDIR)/webpeer-latest-min.js
	cp -f $(DESTDIR)/webpeer-$(VERSION)-min.js	$(DESTDIR)/webpeer.js
	
clean:
	rm -f build/lib/*.js
	rm -f build/*.js
