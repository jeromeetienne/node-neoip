# raw makefile
# - ease repeatitive operations

VERSION=0.7.0

all: clean brequire pack minify

pack:
	echo					 > webpeer-$(VERSION).js
	cat build_prefix.js			>> webpeer-$(VERSION).js
	cat ../vendor/brequire/lib/require.js	>> webpeer-$(VERSION).js
	cat `ls build/*.js | grep -v _test.js | grep -v _exe.js`  >> webpeer-$(VERSION).js
	cat build_suffix.js 			>> webpeer-$(VERSION).js

minify:
	cat webpeer-$(VERSION).js | closurec --compilation_level SIMPLE_OPTIMIZATIONS > webpeer-$(VERSION)-min.js

brequire:
	#../vendor/brequire/bin/brequire ../lib/ build/
	brequire ../lib/ build/

clean:
	rm -f build/*.js
	rm -f webpeer-*.js webpeer-*-min.js
