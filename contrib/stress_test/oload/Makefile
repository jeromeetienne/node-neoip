# raw makefile
# - ease repeatitive operations

#################################################################################
# normal variable to get neoip-oload+content on localhost
OLOAD_HOST	:= "127.0.0.1"
CONTENT_HOST	:= "127.0.0.1"
#################################################################################
# variables to get neoip-oload on amacbook.local + content on jmebox.local
#OLOAD_HOST	:= "amacbook.local"
#CONTENT_HOST	:= "jmebox.local"

CONTENT_URL	:= `node ../../../lib/url_builder_oload_exe.js -n $(OLOAD_HOST) http://$(CONTENT_HOST)/~jerome/Videos/Fearless.mp4`
CONTENT_PATH	:= ~/Videos/Fearless.mp4

all: test

test: test_accuracy test_stress

test_accuracy:
	@echo "neoip-oload Testing accuracy ***********************************"
	node oload_stress_test.js -n 120 -c 3 -l 30k -r 5k $(CONTENT_URL) $(CONTENT_PATH)

test_stress:
	@echo "neoip-oload Testing stress *************************************"
	node oload_stress_test.js -n 120 -c 3 -l 30k -r 5k $(CONTENT_URL)
