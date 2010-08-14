# raw makefile
# - ease repeatitive operations

all: test

test: test_low test_high

test_low:
	@echo "neoip-casti/neoip-casto test low *******************************"	
	node ./neoip_cast_tester.js -i 1 -o 1 -l 20000

test_high:
	@echo "neoip-casti/neoip-casto test high ******************************"	
	node ./neoip_cast_tester.js -i 30 -o 3  -l 20000

