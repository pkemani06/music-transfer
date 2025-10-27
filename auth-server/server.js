
///initialize packages being used
let express = require('express') 
let cors = require('cors')
let request = require('request')
let querystring = require('querystring')
const fs = require('fs')
const https = require('https')
const jwt = require('jsonwebtoken')

// creating an express object called and app is the server
let app = express()
const port = process.env.PORT || 8888;

const creds = {
  key: fs.readFileSync('./certs/localhost+1-key.pem'),
  cert: fs.readFileSync('./certs/localhost+1.pem'),
};

// initialize variables
let redirect_uri = 'https://127.0.0.1:8888/callback';
let client_id = 'a8fd8f81b4884e9495403fd626b8d150'
let client_secret = '65a80577ebbd4887ba0ab04fbaab3c16'
console.log('CLIENT_ID in code ->', client_id);

// cors allows me to call a server without it being blocked, why though? what do we mean by block?
app.use(cors());

// Add root route so you can test if server is working
app.get('/', function (req, res) {
  res.send('<h1>Auth Server Running</h1><a href="/login">Login with Spotify</a>');
});

// pull up spotifies authentication screen
app.get('/login', function (req, res) {
    const state = Math.random().toString(36).slice(2); // to help make sure we don't misroute callbacks
    const authUrl = 'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: 'user-read-private user-read-email user-library-read playlist-read-private playlist-read-collaborative',
        redirect_uri: redirect_uri,
        state
    });
    console.log('Authorize URL ->', authUrl);
    return res.redirect(authUrl);
});

// create callback that spotify sends code to and then code is used to make a request, and then get a token
app.get('/callback', function (req, res) {
  // If Spotify sent an error (user canceled, etc.)
  if (req.query.error) {
    console.error('Spotify /callback error:', req.query.error);
    return res.status(400).send('Spotify auth error: ' + req.query.error);
  }

  const code = req.query.code || null;
  console.log('Callback hit. code =', code);

  if (!code) {
    console.error('No code returned on /callback');
    return res.status(400).send('Missing authorization code');
  }

  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code,
      redirect_uri, // must match exactly what you used in /login
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    json: true
  };

  request.post(authOptions, function (error, response, body) {
    console.log('Token status:', response && response.statusCode);

    if (error) {
      console.error('Token request error:', error);
      return res.status(500).send('Token request failed');
    }

    if (response.statusCode !== 200) {
      console.error('Token request failed:', response.statusCode, body);
      return res.status(response.statusCode).send(body);
    }

    const access_token = body && body.access_token;
    if (!access_token) {
      console.error('No access_token in token response:', body);
      return res.status(500).send('No access token in response');
    }

    // optional: verify the token by calling Spotify /me endpoint
    request.get({
      url: 'https://api.spotify.com/v1/me',
      headers: { Authorization: 'Bearer ' + access_token },
      json: true
    }, (e, r, me) => {
      console.log('Spotify /me check:', r && r.statusCode, me && me.id);
    });

    // Redirect to React frontend with token
    const url = 'https://umbrose-jaylynn-nondemocratically.ngrok-free.dev/callback';
    return res.redirect(url + '?access_token=' + encodeURIComponent(access_token));
  });
});

// 3 new actions when retrieving the playlist

// first get user playlist
app.get('/spotify/playlists', function (req, res) {
    const access_token = req.query.access_token;

    request.get({
        url: 'https://api.spotify.com/v1/me/playlists?limit=50',
        headers: {
            Authorization: 'Bearer ' + access_token
        },
        json:true
    },
    function (error, response, body){
        if (error){
            return res.status(500).json({error: 'Failed to fetch playliss'})
        }
        if (response.statusCode != 200){
            return res.status(response.statusCode).json(body);
        }

        const playlists = body.items.map(function (playlist){
            return {
                id: playlist.id,
                name: playlist.name,
                tracks_total: playlist.tracks.total,
                owner: playlist.owner.display_name
            };
        });
        res.json({playlists: playlists});
    });

});

// get tracks from playlist
app.get('/spotify/playlist/:playlistId/tracks', function (req, res){
    // get what comes after the question mark
    const access_token = req.query.access_token;
    const playlistId = req.params.playlistId;

    if (!access_token) {
        return res.status(400).json({ error: 'Missing access_token parameter' });
    }

    request.get ({
        url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`,
        headers: {
            Authorization: 'Bearer ' + access_token
        },
        json:true
    },
    function (error, response, body){
        // error checks 
        if (error) {
            return res.status(500).json({error: 'Failed to fetch tracks'});
        }
        if (response.statusCode !== 200) {
            return res.status(response.statusCode).json(body);
        }
        const tracks = body.items.map(item =>({
            name: item.track.name,
            artist: item.track.artists[0]?.name || 'Unknown',
            album: item.track.album.name,
            isrc: item.track.external_ids?.isrc || null
        }));
        res.json({tracks, total: body.total});
    })
});

// get users liked songs
app.get('/spotify/saved-tracks', function(req, res){
    const access_token = req.query.access_token;
    // see if we got the right token
    if (!access_token){
        return res.status(400).json({error: 'No acces token'});
    }

    // get the saves songs now
    request.get({
        url: 'https://api.spotify.com/v1/me/tracks?limit=50',
        headers: {
            Authorization: 'Bearer ' + access_token
        },
        json:true
    },
    function (error, response, body){
        // error checks
        if (error) {
            return res.status(500).json({error: 'Failed to fetch saved tracks'});
        }
        if (response.statusCode !== 200) {
            return res.status(response.statusCode).json(body);
        }
        const tracks = body.items.map(item=> ({
            name: item.track.name,
            artist: item.track.artists[0]?.name || 'Unknown',
            album: item.track.album.name,
            isrc: item.track.external_ids?.isrc || null
        }));
        res.json({tracks, total: body.total});
    })
});

// end point to access this token
app.get('/token', (req, res) => {
  // unlock apple api - only when route is hit
  const private_key = fs.readFileSync('apple-private_key.p8').toString();
  const team_id = '82D24CY272'
  const key_id = 'CR8YD9SP7J'
  
  const now = Math.floor(Date.now() / 1000); // current time in seconds

  const token = jwt.sign(
    {
      // identifies your Apple Developer Team
      iss: team_id,             
      iat: now,                 
      exp: now + 60 * 60 * 24 * 180, 
    },
    private_key,
    {
      algorithm: 'ES256',
      header: {
        alg: 'ES256',
        kid: key_id             
      }
    }
  );

  res.setHeader('Content-Type', 'application/json'); 
  res.send(JSON.stringify({ token }));
});

https.createServer(creds, app).listen(port, () => {
  console.log(`Listening on https://localhost:${port}  Go /login to initiate flow.`);
});


/* initialize packages being used
let express = require('express') 
let cors = require('cors')
let request = require('request')
let querystring = require('querystring')
const fs = require('fs')
const https = require('https')
// creating an expres object called and app is the server
let app = express()
const port = process.env.PORT || 8888;

const creds = {
  key: fs.readFileSync('./certs/localhost+1-key.pem'),
  cert: fs.readFileSync('./certs/localhost+1.pem'),
};

https.createServer(creds, app).listen(port, () => {
  console.log(`Listening on https://localhost:${port}  Go /login to initiate flow.`);
});

// initialize variables
let redirect_uri = 'https://127.0.0.1:8888/callback';;
let client_id = 'a8fd8f81b4884e9495403fd626b8d150'
let client_secret = '65a80577ebbd4887ba0ab04fbaab3c16'
console.log('CLIENT_ID in code ->', client_id);


// cors allows me to call a server without it being blocked, why though? what do we mean by block?
app.use(cors());

// pull up spotifies authentication screen
app.get('/login', function (req, res) {
    const state = Math.random().toString(36).slice(2); // to help make sure we don't misroute callbaxks
    const authUrl = 'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: 'user-read-private user-read-email user-library-read playlist-read-private playlist-read-collaborative',
        redirect_uri: redirect_uri,
        state
    });
    console.log('Authorize URL ->', authUrl);
    return res.redirect(authUrl);

});

/// create callback that spotify sends code to and then code is used to make a request, and then get a token
app.get('/callback', function (req, res) {
  // If Spotify sent an error (user canceled, etc.)
  if (req.query.error) {
    console.error('Spotify /callback error:', req.query.error);
    return res.status(400).send('Spotify auth error: ' + req.query.error);
  }

  const code = req.query.code || null;
  console.log('Callback hit. code =', code);

  if (!code) {
    console.error('No code returned on /callback');
    return res.status(400).send('Missing authorization code');
  }

  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code,
      redirect_uri, // must match exactly what you used in /login
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    json: true
  };

  request.post(authOptions, function (error, response, body) {
    console.log('Token status:', response && response.statusCode);

    if (error) {
      console.error('Token request error:', error);
      return res.status(500).send('Token request failed');
    }

    if (response.statusCode !== 200) {
      console.error('Token request failed:', response.statusCode, body);
      return res.status(response.statusCode).send(body);
    }

    const access_token = body && body.access_token;
    if (!access_token) {
      console.error('No access_token in token response:', body);
      return res.status(500).send('No access token in response');
    }

    // optional: verify the token by calling Spotify /me endpoint
    request.get({
      url: 'https://api.spotify.com/v1/me',
      headers: { Authorization: 'Bearer ' + access_token },
      json: true
    }, (e, r, me) => {
      console.log('Spotify /me check:', r && r.statusCode, me && me.id);
    });

    const url = process.env.FRONTEND_URL || 'http://localhost:3000/playlist';
    return res.redirect(url + '?access_token=' + encodeURIComponent(access_token));
  });
});


// unlock apple api
const jwt = require('jsonwebtoken')


const private_key = fs.readFileSync('apple-private_key.p8').toString();
const team_id = ''
const key_id = ''

const now = Math.floor(Date.now() / 1000); // current time in seconds

const token = jwt.sign(
  {
    // identifies your Apple Developer Team
    iss: team_id,             
    iat: now,                 
    exp: now + 60 * 60 * 24 * 180, 
    aud: 'https://appleid.apple.com' 
  },
  private_key,
  {
    algorithm: 'ES256',
    header: {
      alg: 'ES256',
      // links this JWT to your Apple Music key
      kid: key_id             
    }
  }
);

// end point to access this tokwn

app.get('/token', (req, res) => {
  res.setHeader('Content-Type', 'application/json'); 
  res.send(JSON.stringify({ token }));
});
*/