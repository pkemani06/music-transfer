🎵 Music Transfer
Transfer your Spotify playlists to Apple Music seamlessly with this full-stack web application.
Live Demo | Backend API


Overview
Music Transfer is a full-stack application that allows users to seamlessly migrate their music library from Spotify to Apple Music. The app extracts playlists and tracks from Spotify, searches for matching songs on Apple Music, and creates new playlists with the transferred content - all while preserving the original playlist names and structure.
Note: This app is currently in Development Mode on Spotify's platform, which limits usage to 25 authorized users. This is due to Spotify's May 2025 policy change requiring 250k+ MAUs and business registration for Extended Quota Mode.

Features

- Secure Authentication: OAuth 2.0 integration with Spotify
- Playlist Management: Select multiple playlists to transfer at once
- Smart Matching: Automatically searches Apple Music catalog for matching songs
-  Beautiful UI: Responsive design with hover effects and smooth animations
-  Real-time Progress: Track transfer progress with visual indicators
-  Transfer Statistics: See how many songs were successfully matched
-  Batch Processing: Transfer multiple playlists in a single session
-  Playlist Preservation: Maintains original playlist names and structure


Tech Stack
Frontend

React 18 - Modern component-based UI
React Router - Client-side routing
MusicKit JS - Apple Music API integration
CSS3 - Custom styling with gradients and animations

Backend

Node.js - Server runtime
Express.js - Web framework
JWT - Token generation for Apple Music API
OAuth 2.0 - Spotify authentication flow

Deployment & Infrastructure

Vercel - Frontend hosting with automatic deployments
Render - Backend hosting with environment management
GitHub - Version control and CI/CD

APIs

Spotify Web API - Playlist and track retrieval
Apple Music API - Catalog search and playlist creation


Live Demo

Visit the live application: https://music-transfer-five.vercel.app
Backend API: https://music-transfer-server.onrender.com

🏗️ Architecture
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Vercel    │────────▶│    Render    │────────▶│   Spotify   │
│  (Frontend) │         │  (Backend)   │         │     API     │
└─────────────┘         └──────────────┘         └─────────────┘
       │                        │
       │                        │
       │                        ▼
       │                ┌─────────────┐
       └───────────────▶│ Apple Music │
                        │     API     │
                        └─────────────┘
Flow:

User authenticates via Spotify OAuth
Frontend fetches playlists from Spotify API
User selects playlists to transfer
Backend searches Apple Music for matching songs
Backend creates playlists on Apple Music with matched tracks
User receives success confirmation


💻 Local Development Setup
Prerequisites

Node.js 16.x or higher
npm or yarn
Spotify Developer Account
Apple Developer Account with MusicKit enabled

Installation

Clone the repository

bashgit clone https://github.com/pkemani06/music-transfer.git
cd music-transfer

Install backend dependencies

bashcd auth-server
npm install

Install frontend dependencies

bashcd ../client
npm install

Set up Spotify App

Go to Spotify Developer Dashboard
Create a new app
Add redirect URI: https://localhost:8888/callback
Note your Client ID and Client Secret


Set up Apple Music

Go to Apple Developer Portal
Create a MusicKit identifier
Generate a private key (.p8 file)
Note your Team ID and Key ID


Configure backend

Update auth-server/server.js with your Spotify credentials
Place your Apple Music private key as apple-private_key.p8 in auth-server folder
Update Team ID and Key ID in the /token endpoint


Configure SSL certificates for local development

bashcd auth-server
mkdir certs
# Use mkcert or similar to generate localhost certificates

Run the backend

bashcd auth-server
node server.js

Run the frontend

bashcd client
npm start

Access the app

Open http://localhost:3000 in your browser




🔧 Environment Variables
Backend (Render)
PORT=10000 (auto-set by Render)
FRONTEND_URL=https://music-transfer-five.vercel.app/callback
RENDER=true (auto-set by Render)
Frontend
No environment variables needed - API URLs are hardcoded for production

- API Endpoints
Backend Routes
Auth Routes:

GET / - Health check
GET /login - Initiates Spotify OAuth flow
GET /callback - Handles Spotify OAuth callback

Spotify Routes:

GET /spotify/playlists - Fetches user's playlists
GET /spotify/playlist/:playlistId/tracks - Gets tracks from a playlist
GET /spotify/saved-tracks - Fetches user's liked songs

Apple Music Routes:

GET /token - Generates Apple Music developer token (JWT)


- Key Features Explained
OAuth 2.0 Flow
Implements secure authorization with Spotify using the Authorization Code flow, ensuring user credentials are never exposed to the client.
JWT Token Generation
Generates developer tokens for Apple Music API using ES256 algorithm, with proper header configuration and team/key ID management.
Rate Limiting
Implements a 100ms delay between Apple Music API calls to prevent rate limiting and ensure smooth operation.
Error Handling
Comprehensive error handling for:

Failed API requests
Missing tracks
Network timeouts
Invalid tokens

Playlist Matching
Smart algorithm that:

Extracts track name and artist from Spotify
Searches Apple Music catalog
Selects best match based on relevance
Handles songs not available on Apple Music


Known Limitations

Development Mode: Limited to 25 authorized users due to Spotify's Extended Quota Mode requirements
Playlist Art: Apple Music generates playlist covers automatically - custom artwork cannot be transferred
Song Availability: Some songs may not be available on Apple Music and will be skipped
Transfer Time: Large playlists may take several minutes due to API rate limiting
Private Playlists: Only transfers user's own playlists, not followed playlists


🔮 Future Improvements

 Progress bar with percentage completion
 Responsive design for mobile devices
 Custom success/error notifications
 Transfer history and analytics
 Batch transfer optimization
 Support for liked songs transfer
 Reverse transfer (Apple Music → Spotify)
 PWA support for offline capability
 Dark/light mode toggle


Contributing
This is a personal project, but suggestions and feedback are welcome! Feel free to open an issue or reach out.

License
This project is for educational and portfolio purposes. Please respect Spotify and Apple Music's Terms of Service when using their APIs.

Author
Prince Michael Kemani


Acknowledgments

Spotify Web API for playlist data access
Apple MusicKit JS for Apple Music integration
Vercel and Render for seamless deployment
The open-source community for inspiration


