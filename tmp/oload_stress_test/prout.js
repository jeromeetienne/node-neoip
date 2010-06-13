#!/usr/bin/env node
// on linux ubuntu 10.04, nodejs 0.1.97
// without sys.puts('trace1'), this display trace2 without keyboard interaction
// with    sys.puts('trace1'), this *needs* to press a keyboard key to print 
var sys		= require('sys');
//sys.puts("trace1");
var http	= require('http');
sys.puts("trace2");