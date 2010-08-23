# raw makefile
# - ease repeatitive operations

PROJECT_ROOT	:= "../../.."

all: test

test: test_low test_high

test_low:
	@echo "neoip-casti/neoip-casto test low *******************************"	
	node ./neoip_cast_tester.js -i 1 -o 1 -l 20000

test_high:
	@echo "neoip-casti/neoip-casto test high ******************************"	
	node ./neoip_cast_tester.js -i 30 -o 3  -l 20000


#################################################################################
#################################################################################
#		some target to ease testing					#
#################################################################################
#################################################################################

# config on pure localhost
CASTI_CALL_URL	:= "http://localhost:4570"
CASTO_HOST	:= "localhost"
CHARGEN_HOST	:= "127.0.0.1"
MDATA_SRC_URI	:= "http://localhost/~jerome/neoip_html/cgi-bin/cast_mdata_echo_server.fcgi"

######################################################
# config on amacbook/casti and jmebox.local/casto
# NOTE: this one is working
#CASTI_CALL_URL	:= "http://amacbook.local:4570"
#CASTO_HOST	:= "127.0.0.1"
#CHARGEN_HOST	:= "jmebox.local"
#MDATA_SRC_URI	:= "http://jmebox.local/~jerome/neoip_html/cgi-bin/cast_mdata_echo_server.fcgi"

######################################################
# config on amacbook/casto and jmebox.local/casti
# NOTE: this one is working
#CASTI_CALL_URL	:= "http://127.0.0.1:4570"
#CASTO_HOST	:= "amacbook.local"
#CHARGEN_HOST	:= "jmebox.local"
#MDATA_SRC_URI	:= "http://jmebox.local/~jerome/neoip_html/cgi-bin/cast_mdata_echo_server.fcgi"

######################################################
# config on amacbook/casto and amacbook.local/casti
# NOTE: this one is FAILING... likely amacbook unable to find itself
# - likely a issue in nslan which isnt doing loopback
#CASTI_CALL_URL	:= "http://amacbook.local:4570"
#CASTO_HOST	:= "amacbook.local"
#CHARGEN_HOST	:= "jmebox.local"
#MDATA_SRC_URI	:= "http://jmebox.local/~jerome/neoip_html/cgi-bin/cast_mdata_echo_server.fcgi"

simple_chargen:
	node $(PROJECT_ROOT)/vendor/node-chargen/node-chargen.js -v -n $(CHARGEN_HOST)

simple_casti:
	node $(PROJECT_ROOT)/lib/casti_ctrl_exe.js --call_url $(CASTI_CALL_URL)/neoip_casti_ctrl_wpage_jsrest.js -o mdata_srv_uri $(MDATA_SRC_URI) -o cast_name superstream -o cast_privtext supersecret -o scasti_uri http://$(CHARGEN_HOST):8124 -o scasti_mod raw -o http_peersrc_uri '' -o web2srv_str 'dummyweb2serv_str' -v
	
simple_casto:
	curl `node $(PROJECT_ROOT)/lib/url_builder_casto_exe.js -n $(CASTO_HOST) -s $(MDATA_SRC_URI) a761ce3a superstream`