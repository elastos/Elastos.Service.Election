#!/usr/bin/env python

from requests import Session
from requests.exceptions import ConnectionError, Timeout, TooManyRedirects

import json
import time
import logging
import traceback
import sys
import os

# API Misc Service for Mainchain
URL = "api-wallet-ela.elastos.org"

parameters = {}
headers = {
    'Accepts': 'application/json'
}

session = Session()
session.headers.update(headers)

try:
    # Setting logger
    logging.basicConfig(level=logging.INFO, filename=f'{sys.argv[1]}', filemode='a',
                        format='%(asctime)s - %(pathname)s[line:%(lineno)d] - %(levelname)s: %(message)s')
    logging.info("Begin getting the status of the super node")


    # Get the current height
    URL_HEIGHT = "https://{0}/api/1/history/checking/sync".format(URL)
    response = session.get(URL_HEIGHT, params=parameters)
    logging.info(response.text);
    data = json.loads(response.text)
    current_height = data["result"]
    logging.info(f"The current height is {current_height}")

    # Get the current ranking list
    URL_RANK_LIST = "https://{0}/api/1/dpos/rank/height/{1}".format(URL, current_height)
    response = session.get(URL_RANK_LIST, params=parameters)
    data = json.loads(response.text)
    logging.info("The current ranking list has been obtained already")

    # Aggregate the unique ELA addresses used for voting
    ela_addresses = {}
    status = data["status"]
    rank_list = data["result"]
    num = 0

    logging.info("Aggregate the unique ELA addresses used for voting")
    for owner in rank_list:
        pub_key = owner["Ownerpublickey"]
        url_voters_stats = "https://{0}/api/1/dpos/producer/{1}".format(URL, pub_key)
        response = session.get(url_voters_stats, params=parameters)
        d = json.loads(response.text)["result"]
        for voter in d:
            ela_address = voter["Address"]
            votes = float(voter["Value"])
            if ela_address not in ela_addresses.keys():
                ela_addresses[ela_address] = votes
            else:
                if ela_addresses[ela_address] < votes:
                    ela_addresses[ela_address] = votes
        num += 1
        logging.info(f"{num}/{len(rank_list)} has been completed")

    # Get actual ELA used for voting and total unique voters
    logging.info("Get actual ELA used for voting and total unique voters")
    ela_used = 0
    for vote in ela_addresses.values():
        ela_used = ela_used + vote

    # Get total votes used for voting
    logging.info("Get total votes used for voting")
    URL_TOTAL_VOTES = "https://{0}/api/1/dpos/vote/height/{1}".format(URL, current_height)
    response = session.get(URL_TOTAL_VOTES, params=parameters)
    data = json.loads(response.text)
    total_votes = data["result"]

    # Create json file
    elaIndexJson = "{\n" \
                   f"    \"uniqueVoters\" : \"{len(ela_addresses.keys())}\",\n" \
                   f"    \"elaUsed\" : \"{ela_used}\",\n" \
                   f"    \"totalVotes\" : \"{total_votes}\",\n" \
                   f"    \"updateTime\" : \"{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}\"\n" \
                   "}"

    # Write json file to disc
    logging.info("Write json file to disc")

    with open(f'{os.getcwd()}/{sys.argv[2]}', 'w') as fw:
        fw.write(elaIndexJson)

    logging.info("Updating the status of the super node has done\n\n\n")

except (ConnectionError, Timeout, TooManyRedirects, Exception) as e:
    logging.error("Encountered a fatal error:")
    logging.error(e)
    traceback.print_exc()
