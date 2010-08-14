# raw makefile
# - ease repeatitive operations

VERSION=0.7.0

# if DESTDIR is not yet defined use "./"
# - thus "DESTDIR=/tmp make" will generate webpeer-*.js in /tmp
ifeq ($(origin DESTDIR), undefined)
	DESTDIR=.
endif

all: clean brequire pack minify latest

brequire:
	#../vendor/brequire/bin/brequire ../lib/ build/
	brequire ../lib/ build/

pack:
	echo					 > $(DESTDIR)/webpeer-$(VERSION).js
	cat build_prefix.js			>> $(DESTDIR)/webpeer-$(VERSION).js
	cat ../vendor/brequire/lib/require.js	>> $(DESTDIR)/webpeer-$(VERSION).js
	cat `ls build/*.js | grep -v _test.js | grep -v _exe.js`  >> $(DESTDIR)/webpeer-$(VERSION).js
	cat build_suffix.js 			>> $(DESTDIR)/webpeer-$(VERSION).js

minify:
	cat $(DESTDIR)/webpeer-$(VERSION).js | closurec > $(DESTDIR)/webpeer-$(VERSION)-min.js

# latest: doesnt do symlink because github pages dont follow symlink
latest:
	cp -f $(DESTDIR)/webpeer-$(VERSION).js		$(DESTDIR)/webpeer-lastest.js
	cp -f $(DESTDIR)/webpeer-$(VERSION)-min.js	$(DESTDIR)/webpeer-lastest-min.js
	cp -f $(DESTDIR)/webpeer-$(VERSION)-min.js	$(DESTDIR)/webpeer.js
	
clean:
	rm -f build/*.js
	rm -f webpeer.js webpeer-*.js webpeer-*-min.js
