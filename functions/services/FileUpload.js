const {Storage} = require('@google-cloud/storage');
const storage = new Storage({
  projectId: 'petmatch-6110a',
  keyFilename: 'functions/PetMatch-095c4489b0ec.json'
});
const bucket = storage.bucket('petmatch-6110a.appspot.com');

module.exports = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(Error('No image file'));
    }

    let newFileName = `${file.originalname}_${Date.now()}`;
    let fileUpload = bucket.file(newFileName);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype
      }
    });

    blobStream.on('error', (error) => {
      console.log(error);
      reject(Error('Something is wrong! Unable to upload at the moment.'));
    });

    blobStream.on('finish', async () => {
      const options = {
        version: 'v4',
        action: 'read',
        expires: Date.now() + 15 * 60 * 100 * 1000, // 15 minutes
      };
      const [url] = await storage
        .bucket(bucket.name)
        .file(fileUpload.name)
        .getSignedUrl(options);

      resolve(url);
    });

    blobStream.end(file.buffer);
  });
};
