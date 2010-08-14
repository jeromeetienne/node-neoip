# raw makefile
# - ease repeatitive operations

CONTENT_URL:=$(shell node ../../../lib/url_builder_oload_exe.js http://127.0.0.1/~jerome/Videos/Fearless.mp4)
CONTENT_PATH:=~/Videos/Fearless.mp4

all: test

test: test_accuracy test_stress

test_accuracy:
	@echo "neoip-oload Testing accuracy ***********************************"
	node oload_stress_test.js -n 120 -c 3 -l 30k -r 5k $(CONTENT_URL) $(CONTENT_PATH)

test_stress:
	@echo "neoip-oload Testing stress *************************************"
	node oload_stress_test.js -n 120 -c 3 -l 30k -r 5k $(CONTENT_URL)
