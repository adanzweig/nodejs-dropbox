// Load environment variables from a .env file
require('dotenv').config();
const { Dropbox } = require('dropbox'); // Import the Dropbox SDK
const fetch = require('isomorphic-fetch'); // Import a fetch-compatible library for making HTTP requests
const fs = require('fs'); // Import Node.js's native file system module for reading and writing files

// Initialize a new Dropbox client with the access token from environment variables
const dbx = new Dropbox({
    accessToken: process.env.ACCESS_TOKEN,
    fetch
});

// Define an asynchronous function to list all files in a given Dropbox path
async function getAllFiles(path){
    try {
        // Request a list of files from Dropbox
        const files = await dbx.filesListFolder({path});
        // Return the list of file entries
        return files.result.entries;
    } catch (error) {
        // Log any errors that occur
        console.error('Error:', error);
    }
}

// Define an asynchronous function to upload a file to Dropbox
async function uploadFile(file, path){
    try {
        // Read the content of the file from the local file system
        const fileContent = fs.readFileSync(file, 'utf8');
        if (fileContent) {
            // Upload the file content to Dropbox at the specified path
            const fileuploaded = await dbx.filesUpload({path, contents: fileContent});
            // Return the response from the upload operation
            return fileuploaded;
        } else {
            // Return false if there was no content in the file
            return false;
        }
    } catch (error) {
        // Log any errors that occur
        console.error('Error:', error);
    }
}

// Define an asynchronous function to download a file from Dropbox
async function downloadFile(fileToDownload, path){
    try {
        // Request to download the file from Dropbox
        const fileDownloaded = await dbx.filesDownload({path: fileToDownload});
        // Write the downloaded file to the local file system at the given path
        const fileDownloadedIntoServer = fs.writeFileSync(path, fileDownloaded.result.fileBinary, 'binary');
        // Return the result of the write operation
        return fileDownloadedIntoServer;
    } catch (error) {
        // Log any errors that occur
        console.error('Error:', error);
    }
}

// Self-invoking asynchronous function to execute the file operations
(async () => {
    // Get and log the list of all files at the Dropbox root
    const filesList = await getAllFiles("");
    console.log('Files list', filesList);
    
    // Upload a file and log the result
    const fileUploaded = await uploadFile("./package.json", "/packageuploaded.json");
    console.log('File uploaded', fileUploaded);
    
    // Get and log the list of all files again to see the changes
    const filesList2 = await getAllFiles("");
    console.log('Files list', filesList2);
    
    // Download a file and log a confirmation message
    const fileDonwloaded = await downloadFile("/packageuploaded.json", './packagedownloaded.json');
    console.log('file Downloaded');
})();
