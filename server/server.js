const dotenv = require('dotenv');
const path = require('path');
// Explicitly load .env from the server directory to avoid CWD issues
dotenv.config({ path: path.join(__dirname, '.env') });

const app = require('./app');


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
