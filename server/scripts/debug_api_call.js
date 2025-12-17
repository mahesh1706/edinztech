const axios = require('axios');

async function checkApi() {
    // Test with legacy ID containing whitespace and dash to verify normalization
    const certId = 'ISS-BXL-09-2022-   ';

    console.log(`Fetching ${certId}...`);
    axios.get(`http://localhost:5000/api/certificates/verify/${encodeURIComponent(certId)}`)
        .then(res => {
            console.log('Response Status:', res.status);
            console.log('Response Data:', JSON.stringify(res.data, null, 2));
        })
        .catch(err => {
            console.error('Error:', err.message);
            if (err.response) {
                console.error('Data:', err.response.data);
            }
        });
}

checkApi();
