import axios from 'axios';

export const UserFetch = async (sessionKey) => {
  
  if (!sessionKey) {
    return null; 
  }

  try {

    const sessionResponse = await axios.get(`http://localhost:5119/User/GetSession/${sessionKey}`);
    const userEmail = sessionResponse.data;

    const userResponse = await axios.get(`http://localhost:5119/User/GetUser/${userEmail}`);
    return {...userResponse.data, userEmail}; 
  } catch (error) {
    console.error('Greška pri preuzimanju korisničkih podataka:', error);
    return null; 
  }
};
