// Simple express server to be able to run app locally (use "npm run build-and-run" command)

const express = require('express');
const path = require('path');
const port = process.env.PORT || 8080;
const app = express();
// __dirname is the current directory from where the script is running
app.use(express.static(path.resolve(__dirname, './dist')));
// Send the user to index.html page in spite of the url
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, './dist/index.html'));
});
app.listen(port, ()=>{console.log(`Running on port ${port}`)});
