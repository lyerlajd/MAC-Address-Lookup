# MAC-Address-Lookup
This site's purpose is to look up information about MAC addresses using the information from the [IEEE list of OUIs](https://standards-oui.ieee.org/).

I figured it is unlikely for github to go down, and our favorite one at work goes down semi-regularly.

## User Guide
Users can paste in a section of text that contains MAC addresses, or type them in individually.

To search for the MACs they entered, they can click the search button, tab over to the search button and press `enter` on their keyboard, or press `ctrl + enter` anywhere on the page.


## How it Works
First, the javascript grabs anything in the `textarea` and parses it for anything that could be a MAC address and returns them in a list. It checks for colon-separated, period-separated, dash-separated, or un-separated MAC addresses. It also checks for shortened MAC addresses like just the OUI.

Next, the javascript fetches the OUI text file and searches it for each MAC address in the list that was returned previously. If it finds a match, it returns all of the information related to that OUI (The OUI, organization, and address).

Then, the javascript formats this information into HTML and adds it to the `mac-info-area` on the right side of the screen.

## Plans for the future
* Adding a copy text button to avoid needing to highlight all of the information
* A cooler background where the blur follows your mouse :)
