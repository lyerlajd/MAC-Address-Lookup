const textarea = document.querySelector('textarea');
const mac_info_area = document.querySelector('.mac-info-area');

textarea.addEventListener('keydown', (e) => {
    if(e.ctrlKey && e.key === 'Enter') {
        console.log('running mac_lookup');
        mac_lookup();
    }
});

async function get_mac_info(mac) {
    let lines = null;
    
    try {
        const response = await fetch('./OUI.txt');
        if (!response.ok) {
            throw new Error(`Could not find file: ${response.status}`);
        }
        const file = await response.text();
        lines = file.split(/\r?\n/);
        // lines.slice(4,9).forEach(line => console.log(line));
    }
    catch (error) {
        console.error('Error reading file', error);
        return null;
    }

    try {
        const mac_info = [];
        lines.forEach((line, index) => {
            if (typeof line === 'string' && line.includes(mac)) {
                console.log(`line ${index + 1} has a match!`);
                const matchedLines = lines.slice(index, index + 5);
                console.log(matchedLines);
                mac_info.push(matchedLines);
            }
        });

        return mac_info;
        // console.log(matchedLineIndexes);
        

        // const matchedLines = {};
        // matchedLineIndexes.forEach(index => {
        //     matchedLines[index] = lines.slice(index, index + 4)
        // });
        // return matchedLines;
    }
    catch (error) {
        console.error('Error searching file', error);
        return null;
    }
}

function alphanumeric(inputString) {
  const letterNumber = /^[0-9a-zA-Z]+$/;
  if (inputString.match(letterNumber)) {
    return true; // Contains only letters and numbers
  } else {
    return false; // Contains other characters
  }
}

function clean_input(mac) {
    mac = mac.trim();

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
            console.log('invalid mac format, contains invalid character or length is incorrect');
            return null;
    }

    mac = mac.toUpperCase().slice(0, 6);
    if (alphanumeric(mac)) {
        return mac;
    } else {
        return null;
    }
}

async function mac_lookup() {
    const userInput = textarea.value.split(/\r?\n/);
    console.log('userInput:')
    console.log(userInput);

    const mac_info_array = await userInput.map(async (input) => {
        let mac = await clean_input(input);
        if (mac !== null) {
            console.log(`cleaned mac: ${mac}`);
            let mac_info = await get_mac_info(mac);
            return mac_info;
        } else {
            console.error(`invalid mac: ${input}`);
            return null;
        }
    });

    // verify all promises are resolved
    let mac_info_completed = await Promise.all(mac_info_array);

    // filter out null results
    mac_info_completed = mac_info_completed.filter(item => item !== null);

    mac_info_area.innerHTML = mac_info_completed.map(info => {
        if (info && info.length > 0) {

            console.log('info:', info);

            let oui = info[0][0].split('(base 16)')[0].trim();
            let company = info[0][0].split('(base 16)')[1].trim();
            let address = info[0][2] + info[0][3] + info[0][4];
            address = address.trim().replaceAll('\t', ' ');
            console.log('oui:', oui);
            console.log('company:', company);
            console.log('address:', address);

            return `<div class="mac-entry">
            ${company}
            </div>`;
        } else {
            return `<div class="mac-entry">
                <p>No match found</p>
            </div>`;
        }
    }).join('');

    // oui: ${oui}<br>company: ${company}<br>address: ${address}
}