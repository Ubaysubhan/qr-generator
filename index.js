import express from "express";
import bodyParser from "body-parser";
import qr from 'qr-image';
import fs from 'fs';

const app = express();
const port = 3000;

app.use(express.static('qr_codes'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req,res) => {
  res.render("index.ejs");
});


app.post("/qr", (req, res) => {
  res.render("qr.ejs");
});

app.post("/submit", (req, res) => {
  const http = "https://"
  const data =  req.body["link"];

  const dataWithProtocol = data.startsWith("http://") || data.startsWith("https://") ? data : http + data;
  const cleanedFileName = data.replace(/[^a-zA-Z0-9]/g, "_");

  const qr_svg = qr.image(dataWithProtocol, { type: 'png' });
  const qrImageFilePath = `qr_codes/${cleanedFileName}_qr.png`; 

const qrWriteStream = fs.createWriteStream(qrImageFilePath);

const file = `${cleanedFileName}_qr.png`;

  qr_svg.pipe(qrWriteStream)
    .on('finish', () => {
      console.log(file)
      res.render('qr.ejs', { file });
    })
    .on('error', (err) => {
      console.error('Error generating QR code:', err);
      res.send('An error occurred while generating the QR code.');
    });
});

app.get("/download/:fileName", (req, res) => {
  const fileName = req.params.fileName;
  const filePath = `qr_codes/${fileName}`;

  // Trigger the download by setting the appropriate headers
  res.download(filePath, (err) => {
      if (err) {
          console.error('Error downloading file:', err);
          res.status(404).send('File not found.');
      }
  });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
