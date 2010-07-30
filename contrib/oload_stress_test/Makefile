# raw makefile
# - ease repeatitive operations

CONTENT_URL:=$(shell node ../../neoip-url http://localhost/~jerome/Videos/Fearless.mp4)
CONTENT_PATH:=~/Videos/Fearless.mp4


all: test_accuracy test_stress

test_accuracy:
	@echo "Testing accuracy ************************************************"
	node oload_stress_test.js -n 40  -l 30k -r 5k $(CONTENT_URL) $(CONTENT_PATH)

test_stress:
	@echo "Testing stress **************************************************"
	node oload_stress_test.js -n 40 -l 30k -r 5k $(CONTENT_URL)
