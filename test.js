// Element selectors
const textarea = document.querySelector('textarea');
const mac_info_area = document.querySelector('.mac-info-area');
const search_button = document.querySelector('div.button');

// Event listeners
textarea.addEventListener('keydown', (e) => {
    if(e.ctrlKey && e.key === 'Enter') {
        console.log('running mac_lookup');
        mac_lookup();
    }
});
search_button.addEventListener('click', () => {
    console.log('running mac_lookup');
    mac_lookup();
});
search_button.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        console.log('running mac_lookup');
        mac_lookup();
    }
});

// Functions

/* Fetch the OUI.txt file and search for the MAC address
 Returns a promise that resolves to an array of matching lines or null if an error occurs */
async function get_mac_info(mac) {
    let lines = null;
    
    try {
        const response = await fetch('./OUI.txt');
        if (!response.ok) {
            throw new Error(`Could not find file: ${response.status}`);
        }
        const file = await response.text();
        lines = file.split(/\r?\n/);
    }
    catch (error) {
        console.error('Error reading file', error);
        return null;
    }

    try {
        const mac_info = [];
        lines.forEach((line, index) => {
            if (typeof line === 'string' && line.includes(mac)) {
                // console.log(`line ${index + 1} has a match!`);
                const matchedLines = lines.slice(index, index + 5);
                // console.log(matchedLines);
                mac_info.push(matchedLines);
            }
        });

        return mac_info;
    }
    catch (error) {
        console.error('Error searching file', error);
        return null;
    }
}

/* Separate MAC addresses from user input
 Returns an array of matched MAC addresses */
function separate_macs(userInput) {
    let colonSeparated = '(?:[0-9A-Fa-f]{2}:){2,5}[0-9A-Fa-f]{2}';
    let hyphenSeparated = '(?:[0-9A-Fa-f]{2}-){2,5}[0-9A-Fa-f]{2}';
    let dotSeparated = '(?:[0-9A-Fa-f]{4}\.){2}[0-9A-Fa-f]{4}|[0-9A-Fa-f]{4}\.[0-9A-Fa-f]{2}';

    let regex = new RegExp(`${colonSeparated}|${hyphenSeparated}|${dotSeparated}`, 'g');

    let macs = [...userInput.matchAll(regex)];
    return macs
}

/* Clean and validate MAC address input
 Returns cleaned MAC address or null if invalid */
function clean_input(mac) {
    switch (true) {
        case mac.includes(':'):
            mac = mac.replaceAll(':', '').trim();
            break;
        case mac.includes('.'):
            mac = mac.replaceAll('.', '').trim();
            break;
        case mac.includes("-"):
            mac = mac.replaceAll('-', '').trim();
            break;
        case mac.length >= 6 && mac.length <= 12:
            break;
        default:
            console.error(`invalid mac format: ${mac}\ncontains invalid character or length is incorrect`);
            return null;
    }

    mac = mac.toUpperCase().slice(0, 6);
    return mac;
}

/* Format MAC info into HTML */
function format_mac_info(raw, oui, company, address) {
    return     `<details class="mac-entry">
                <summary>${raw} - ${company}</summary>
                <p><strong>OUI:</strong> ${oui}</p>
                <p><strong>Address:</strong> ${address}</p>
                </details>`;
}

async function mac_lookup() {
    
    // Clear previous results
    mac_info_area.innerHTML = ''; 

    const userInput = textarea.value
    const macs = separate_macs(userInput);

    let mac_info_array = [];
    macs.forEach(mac => {
        // console.log(mac[0]);
        let cleaned_mac = clean_input(mac[0]);
        // console.log('cleaned_mac:', cleaned_mac);
        let mac_info = get_mac_info(cleaned_mac);
        // console.log('mac_info (promise):', mac_info);
        mac_info_array.push({'raw': mac[0], 'info' : mac_info});
    });

    Promise.all(mac_info_array).then(results => {
        results.forEach(result => {

            let raw, oui, company, address;
            
            raw = result.raw;
            result.info.then(info => {
                
                if (info && info.length > 0) {
                    oui = info[0][0].split('(base 16)')[0].trim();
                    company = info[0][0].split('(base 16)')[1].trim();
                    address = (info[0][2] + info[0][3] + info[0][4]).trim().replaceAll('\t', ' ');
                } else {
                    oui = 'N/A';
                    company = 'N/A';
                    address = 'N/A';
                }
                console.log('raw:', raw);
                console.log('oui:', oui);
                console.log('company:', company);
                console.log('address:', address);
                
                mac_info_area.innerHTML += format_mac_info(raw, oui, company, address);
            });
        });
    });
}
