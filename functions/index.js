const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: true }));

const UserController = require('./controllers/UserController');
const PetController = require('./controllers/PetController');
const SettingsController = require('./controllers/SettingsController');
const SearchController = require('./controllers/SearchController');

app.post('/login', UserController.login);
app.get('/profile', UserController.profile);
app.put('/profile', UserController.updateProfile);
app.put('/profile/location', UserController.setLocation);

app.get('/pets', PetController.index);
app.post('/pets', PetController.create);
app.put('/pets/:id', PetController.update);
app.delete('/pets/:id', PetController.delete);

app.get('/settings', SettingsController.get);
app.put('/settings', SettingsController.saveSettings);

app.get('/pets/search', SearchController.getNearestPets);

exports.api = functions.https.onRequest(app);
