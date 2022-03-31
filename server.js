require("dotenv").config()
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const Genius = require('genius-lyrics');
const Client = new Genius.Client('C7BBc5ysns2ZvPug4PrxRZ2AcJ1meSU31zZ565DOnrigR4j8pgu9G9Ur01Ls27QN');
const SpotifyWebApi = require("spotify-web-api-node");
const { query } = require("express");

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req,res) => {
  res.send("Hello Vinify")
})

app.post("/refresh", (req, res) => {
  const refreshToken = req.body.refreshToken
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.client_id,
    clientSecret: process.env.client_secret,
    redirectUri: `https://www.vinify.vinitparekh.rocks/`,
    refreshToken: refreshToken
  })

  spotifyApi
    .refreshAccessToken()
    .then(data => {
      res.json({
        accessToken: data.body.accessToken,
        expiresIn: data.body.expiresIn,
      })
    })
    .catch(err => {
      console.log(err)
      res.sendStatus(400)
    })
})

app.post("/login", (req, res) => {
  const code = req.body.code
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.client_id,
    clientSecret: process.env.client_secret,
    redirectUri: `https://www.vinify.vinitparekh.rocks/`,
  })

  spotifyApi
    .authorizationCodeGrant(code)
    .then(data => {
      res.json({
        accessToken: data.body.access_token,
        refreshToken: data.body.refresh_token,
        expiresIn: data.body.expires_in,
      })
    })
    .catch(err => {
      res.sendStatus(400)
    })
})

app.get("/lyrics", async (req, res) => {
  console.log(req.query);
  // const lyrics = await lyricsFinder(req.query.artist, req.query.track) || "No Lyrics Found";
  const searches = await Client.songs.search(req.query.track);
  const firstSong = searches[0];
  const lyrics = await firstSong.lyrics();
  res.json({ lyrics })
})

app.listen(process.env.PORT || 3001, (e) => {
  if (!e) {
    console.log('Server is up and running');
  } else {
    console.log(e);
  }
})
