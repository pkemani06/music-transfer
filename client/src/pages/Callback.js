/*
login page -> spotify website -
*/
// use effect for actions
import React, {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';

function Callback() {
    const navigate = useNavigate();
    useEffect (() => {
        // getting URL parameters
        const params = new URLSearchParams(window.location.search);
        const access_token = params.get('access_token');

        // check for token
        if (access_token){

            localStorage.setItem('spotify_access_token', access_token)
            console.log('saved');

            setTimeout (() => {
                navigate('/transfer');
            }, 1000);
        }
        else{
            console.log('no url');
            navigate('/');
        }

        // make sure we got it
        console.log('Token ' + access_token);
    }, [navigate]);
    return (
        <div style = {styles.container}>
            <h1>Processing your login...</h1>
            <p>Please wait, we're getting your Spotify daa!</p>
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
        fontFamily: 'Arial, sans-serif'
    }
};

export default Callback;