import cron from 'node-cron';
import https from 'https';

const BACKEND_URL = process.env.BACKEND_URL || 'https://firmcommand-backend.onrender.com';

const keepAlive = () => {
    // Render spins down free tier services after 15 minutes of inactivity.
    // Ping the server every 14 minutes to keep it awake.
    cron.schedule('*/14 * * * *', () => {
        console.log('Pinging server to keep it awake...');
        https.get(BACKEND_URL, (res) => {
            if (res.statusCode === 200) {
                console.log('Server pinged successfully');
            } else {
                console.error(`Server ping failed with status code: ${res.statusCode}`);
            }
        }).on('error', (err) => {
            console.error('Error during ping:', err.message);
        });
    });
};

export default keepAlive;
