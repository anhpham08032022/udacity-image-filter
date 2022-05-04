import express, {Request, Response } from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import { nextTick } from 'process';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  app.get("/filteredimage", async (req:Request, res:Response) => {
    let {image_url} = req.query;

    // validate the image_url query
    if (!image_url) {
      return res.status(400).send({ message: 'URL of image is required' });
    }
    let outPath = "";
    console.log(`Start downloading the image url: ${image_url}`);
    try {
      outPath = await filterImageFromURL(image_url);
    } catch (error) {
      console.log(`Got error when processing image: ${error}`);
      return res.status(442).send({ message: 'Got Error message when processing image.' });
    }
    
    console.debug(`The location of the file: ${outPath}`);
    res.sendFile(outPath);

    // remove the file when res.sendFile is done
    res.on('finish', function() {
      try {
        deleteLocalFiles([outPath]);
      } catch (ex) {
        console.log(`Error when removing ${outPath}`);
      }
    });
  })

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req:Request, res:Response ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();