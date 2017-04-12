#!/bin/env python
# Copyright 2016, EMC, Inc.
# Note, the following checksum currently has to be hand generated and done
# AFTER the profile has been rendered with the apiServerAddress and apiServerPort value until
# RackHD can taught to handle this kind of render-chain.
# f=cisco-poap.py ; cat $f | sed '/^#md5sum/d' > $f.md5 ; sed -i "s/^#md5sum=.*/#md5sum=\"$(md5sum $f.md5 | sed 's/ .*//')\"/" $f

import urllib2
import json
import imp
import traceback
import sys
import cisco
import time

# Python module names vary depending on nxos version
try:
    from cli import cli
except:
    from cisco import cli

API_SERVER_ADDRESS = '<%=apiServerAddress%>'
API_SERVER_PORT = '<%=apiServerPort%>'

switch_profile_uri = 'http://{0}:{1}/api/current/profiles/switch'.format(API_SERVER_ADDRESS, API_SERVER_PORT)
switch_profile_error_uri = '{0}/error/'.format(switch_profile_uri)
cisco_switch_profile_uri = '{0}/cisco'.format(switch_profile_uri)

def download_cisco_script(context):
    # Add switch vendor string as the last URI element as a hint to the
    # HTTP API server
    poap_log("Downloading script %s - vrf %s" % (cisco_switch_profile_uri, context))
    cisco.vrf.set_global_vrf(context)
    script = urllib2.urlopen(cisco_switch_profile_uri).read()
    poap_log("Opening script rackhd_cisco_script.py")
    poap_log(script)
    with open('rackhd_cisco_script.py', 'w') as rackhd_cisco_script:
        rackhd_cisco_script.write(script)

def poap_log (info):
    poap_log_file.write("cisco-poap.py:")
    poap_log_file.write(info)
    poap_log_file.write("\n")
    poap_log_file.flush()
    print "poap_py_log:" + info
    sys.stdout.flush()

def poap_log_close ():
    poap_log_file.close()

def abort_cleanup_exit () :
    poap_log("INFO: cleaning up")
    poap_log_close()
    exit(-1)

# open a clean copy of the log only when this script runs. all other scripts will append to the log.
log_filename = "/bootflash/poap.log"
poap_log_file = open(log_filename, "w+")

good_context = ''

try:
    # We are going to try downloading from two different vrf contexts
    download_cisco_script('management')
    good_context = 'management'
except Exception as e:
    poap_log("download script failed with error %s" % type(e).__name__)
    try:
        download_cisco_script('default')
        good_context = 'default'
    except Exception as e:
        # We cannot communicate with the server so no sense trying
        # to send back an error message
        poap_log("Failed downloading with both managmenet and default vrf")
        raise e

try:
    poap_log("Executing script rackhd_cisco_script.py")
    execfile('./rackhd_cisco_script.py')
except SystemExit as e:
    sys.exit(e)
except Exception as e:
    data = json.dumps({"error": traceback.format_exc()})
    cisco.vrf.set_global_vrf(good_context)
    req = urllib2.Request(switch_profile_error_uri,
                          data, {"Content-Type": "application/json"})
    urllib2.urlopen(req)
    # Don't swallow exceptions otherwise the Cisco switch will think the POAP was a success
    # and proceed to boot rather than retrying
    raise e

poap_log_close()

