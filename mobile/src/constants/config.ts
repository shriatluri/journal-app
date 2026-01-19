const DEV_API_URL = 'http://localhost:5000/api';
const PROD_API_URL = 'https://your-app.railway.app/api';

export const config = {
  API_BASE_URL: __DEV__ ? DEV_API_URL : PROD_API_URL,
  REQUEST_TIMEOUT: 30000,
};
