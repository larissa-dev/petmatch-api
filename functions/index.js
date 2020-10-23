const functions = require('firebase-functions');
const express = require('express');
const Multer = require('multer');
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});
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
app.post('/pets', multer.fields([
  { name: 'photo1', maxCount: 1 },
  { name: 'photo2', maxCount: 1 },
  { name: 'photo3', maxCount: 1 },
  { name: 'photo4', maxCount: 1 },
  { name: 'photo5', maxCount: 1 },
  { name: 'photo6', maxCount: 1 },
  { name: 'photo7', maxCount: 1 },
]), PetController.create);

app.get('/settings', SettingsController.get);
app.put('/settings', SettingsController.saveSettings);

app.get('/pets/search', SearchController.getNearestPets);

exports.api = functions.https.onRequest(app);
