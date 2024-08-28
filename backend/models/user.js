const axios = require('axios');

class HttpClient {
    constructor(baseURL = '') {
        this.client = axios.create({
            baseURL: baseURL,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    async get(url, headers = {}) {
        try {
            const response = await this.client.get(url, { headers });
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async post(url, data = {}, headers = {}) {
        try {
            const response = await this.client.post(url, data, { headers });
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async put(url, data ={}, headers = {}) {
        try {
            const response = await this.client.put(url, data, { headers });
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async delete(url, headers = {}) {
        try {
            const response = await this.client.delete(url, { headers });
            return response.data;
        } catch (error) {
            this.handleError(error)
        }
    }

    handleError(error) {
        if (error.response) {
            console.log(`Error: ${error.response.status} - ${error.response.data}`);
            throw new Error(error.response.data);
        } else if (error.request) {
            console.log('Error: No response received from the server.');
            throw new Error('No response received from the server.');
        } else {
            console.log('Error: ', error.message);
            throw new Error(error.message);
        }
    }
}

module.exports = class User {
    constructor(firstName, middleName, lastName, positionId, positionRanking, email, password) {
        this.firstName = firstName;
        this.middleName = middleName;
        this.lastName = lastName;
        this.positionId = positionId;
        this.positionRanking = positionRanking;
        this.email = email;
        this.password = password
    }
    
    
    static find(email) {
        require('dotenv').config();
        let httpClient = new HttpClient(process.env.BACKEND_URL);
        let response = {};
        httpClient.get(`/employees?email=${email}`).then(item => response = item);
        return response;
    }

    static save(user) {
        require('dotenv').config();
        let httpClient = new HttpClient(process.env.BACKEND_URL);
        let response = {};
        httpClient.post('/employees', { user }).then(item => response = item);
        return response;
    }
}
