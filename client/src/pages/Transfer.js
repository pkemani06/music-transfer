import React, {useState, useEffect} from 'react';
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function Transfer () {
    // create a state to store playlists from spotify
    // epmty array no playlists yet
    const [playlists, setPlaylists] = useState([]);
    // create a state to show  it loading
    const [loading, setLoading] = useState(true);
    const [selectedPlaylists, setSelectedPlaylists] = useState([]);
    const [hoveredPlaylist, setHoveredPlaylist] = useState(null);
    const [isTransferring, setIsTransferring] = useState(false);
    // now we're doing some action
    useEffect(() => {
    // get spotify token from local access storage
    const token = localStorage.getItem('spotify_access_token');
    
    // Check if token exists!
    if (!token) {
        console.log(' No token found!');
        setLoading(false);
        return;
    }
    
    // make the api call to get the token
    console.log('🔍 Fetching playlists...');
    fetch('https://api.spotify.com/v1/me/playlists', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }) // make the response in jS format
    .then(response => response.json())
    .then(data => {
        console.log('Got playlists:', data);
        setPlaylists(data.items || []);
        setLoading(false);
    })
    .catch(error => {
        console.log('Error fetching playlists:', error);
        setLoading(false);
    });
    
}, []);

    useEffect(() => {
    // create the music kit makes it global
    if (window.MusicKit) {
        console.log('Initializing MusicKit...');
        
        // get apple token from server.js
        fetch('https://localhost:8888/token')
            .then(res => res.json())
            .then(data => {
                // set up music kit with my token
                window.MusicKit.configure({
                    developerToken: data.token,  // ← Fixed typo!
                    app: {
                        name: 'Music Transfer',
                        build: '1.0.0',
                        id: 'media.transfertosptf' 
                    },
                    storefrontId: 'us'
                });
                console.log('MusicKit initialized!');
            })
            .catch(error => {
                console.log('MusicKit error:', error);
            });
    }
}, []);

    const handlePlaylistToggle = (playlistId) => {
        // check if the array has the playlust
        if (selectedPlaylists.includes(playlistId)) {
            setSelectedPlaylists(selectedPlaylists.filter(id => id !== playlistId));
        }
        else {
            // copy all the items in selected
            setSelectedPlaylists([...selectedPlaylists, playlistId]);
        }
    };
    // show playlists
    const handleTransfer = async () => {
        setIsTransferring(true);
         const playlistsToTransfer = [];
    
    console.log('Starting transfer!');
    
    const token = localStorage.getItem('spotify_access_token');

    if (!token) {
        console.log('No token!');
        return;
    }
    // store all the tracks for scraping
    const allTracks = [];

    for (const playlistId of selectedPlaylists) {
        console.log(`getting the tracks from ${playlistId}`);

        try {
                    // Get playlist info (name, etc)
       
                const playlistResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const playlistInfo = await playlistResponse.json();
        
        // Get tracks
        const tracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const tracksData = await tracksResponse.json();
        
        const tracks = tracksData.items.map(item => ({
            name: item.track.name,
            artist: item.track.artists[0].name,
            album: item.track.album.name
        }));
        
        // Store playlist with its name and tracks
        playlistsToTransfer.push({
            name: playlistInfo.name,
            tracks: tracks
        });
        
        console.log(`Got ${tracks.length} tracks from "${playlistInfo.name}"`);
            
        } catch (error) {
            console.log('Error:', error);
        }
    }
    console.log(`Total: ${playlistsToTransfer.length} playlists to transfer`);

try {
    console.log('Getting Apple Music token...');
    const appleRes = await fetch('https://localhost:8888/token');
    const appleData = await appleRes.json();
    const appleToken = appleData.token;

    const music = window.MusicKit.getInstance();
    console.log('Requesting authorization...');
    await music.authorize();
    console.log('User authorized!');

    const userToken = music.musicUserToken;

    for (const playlist of playlistsToTransfer) {
        console.log(`Processing playlist: "${playlist.name}"`);
        console.log(`${playlist.tracks.length} tracks to search`);
        
        const appleMusicIds = [];
        
        for (const track of playlist.tracks) {
            const searchUrl = `https://api.music.apple.com/v1/catalog/us/search?term=${encodeURIComponent(track.name + ' ' + track.artist)}&types=songs&limit=1`;
            
            const appleSearchResponse = await fetch(searchUrl, {
                headers: {
                    'Authorization': `Bearer ${appleToken}`
                }
            });
            
            const appleSearchData = await appleSearchResponse.json();
            
            if (appleSearchData && appleSearchData.results.songs && appleSearchData.results.songs.data.length > 0) {
                const song = appleSearchData.results.songs.data[0];
                appleMusicIds.push(song.id);
            }
            
            await sleep(200);
        }
        
        console.log(`Found ${appleMusicIds.length} of ${playlist.tracks.length} tracks on Apple Music`);
        
        if (appleMusicIds.length > 0) {
            const requestBody = {
                attributes: {
                    name: playlist.name,
                    description: 'Transferred from Spotify'
                },
                relationships: {
                    tracks: {
                        data: appleMusicIds.map(id => ({
                            id: id,
                            type: 'songs'
                        }))
                    }
                }
            };
            
            const createResponse = await fetch('https://api.music.apple.com/v1/me/library/playlists', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${appleToken}`,
                    'Music-User-Token': userToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (createResponse.ok) {
                console.log(`Created "${playlist.name}" on Apple Music!`);
            } else {
                console.log(`Failed to create "${playlist.name}"`);
            }
        }
    }

    alert(`Successfully transferred ${playlistsToTransfer.length} playlists!`);
    setIsTransferring(false);
} catch (error) {
    console.log('Transfer failed:', error);
    console.log('Error message:', error.message);
    alert('Transfer failed! Check console for details.');
}


}


   return (
    <div style={styles.container}>
        <h1>🎵 Transfer Your Music!</h1>

        {loading ? (
            <p>Loading..</p>
        ) : (
            <div style={{ textAlign: 'center' }}>
                
                <div style = {styles.playlistGrid}>
                    {playlists.map((playlist) => {
                    const isSelected = selectedPlaylists.includes(playlist.id);
                    const isHovered = hoveredPlaylist === playlist.id;
                    return (
                        // card dic
                        <div key={playlist.id}
                            onClick={() => handlePlaylistToggle(playlist.id)}
                            // control the hover for when mouse is on and off of the playist blocks
                            onMouseEnter = {() => setHoveredPlaylist(playlist.id)}
                            onMouseLeave= {() => setHoveredPlaylist(null)}
                            style = {{
                                cursor: 'pointer', 
                                padding: '35px', 
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                borderRadius: '10px',
                                textAlign: 'center',
                                position: 'relative',
                                transition: 'all 0.3 ease',
                                transform : isHovered? 'scale(1.05)' : 'scale(1)',
                                border: isSelected ? '3px solid #1DB954' : '3px solid transparent',
                                boxShadow: isSelected ? '0 0 20px rgba(29, 185, 84, 0.6)' : 'none'
                            }}
                        >
    
                            {playlist.images && playlist.images[0] && (
                                <img 
                                src = {playlist.images[0].url}
                                alt = {playlist.name}
                                // fix the size
                                style = {{
                                    width: '100%',
                                    height: '170px',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    marginBottom: '10px'
                                }}
                                />
                            )}
                            <p>Playlist: {playlist.name}</p>
                        </div>
                    );
                })}
                </div>
                    {selectedPlaylists.length > 0 && (
                    <button 
                        style = {{
                            ...styles.transferButton,
                            transform: isTransferring ? 'scale(1.1)' : 'scale(1)',
                            backgroundColor: isTransferring ? '#1DB954' : '#0e963eff',
                            transition: 'all 0.3s ease'
                        }} 
                        onClick={handleTransfer}
                        disabled={isTransferring}
                    >
                        {isTransferring ? 'Transferring...' : `Transfer ${selectedPlaylists.length} Playlist${selectedPlaylists.length !== 1 ? 's' : ''}`}
                    </button>
                )}
            </div>
                
        )}
    </div>
);
}



const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        color: 'white',
        background: 'linear-gradient(180deg, #1DB954 0%, #191414 100%)',
        fontFamily: 'Arial, sans-serif',
        padding: '20px'
    },

    playlistGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        padding: '20px'
    },

    transferButton :{
        backgroundColor: '#0e963eff',
        color: 'white',
        border: 'none',
        padding: '20px 50px',
        fontSize: '20px',
        borderRadius: '30px',
        cursor: 'pointer',
        fontWeight: 'bold',
        marginTop: '30px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.3s ease',

    }

};

export default Transfer;