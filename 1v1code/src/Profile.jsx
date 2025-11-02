import React from 'react';
import { Link } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
    return (
        <>
            <div className="profile-container">


                <div className="profile-card">
                    <div className="profile-header">
                        <img
                            className="profile-picture"
                            src="https://imgs.search.brave.com/uRLjIz0r9LwrGq9jagcfeSqoD188L_55nkk0IhaFSrw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvOTk5/NDQ1MzIyL3Bob3Rv/L25hbmR1LXJoZWEt/YW1lcmljYW5hLWdy/ZWF0ZXItcmhlYS5q/cGc_cz02MTJ4NjEy/Jnc9MCZrPTIwJmM9/NGc2MDRpUFBPbDBH/LXlzalBKalVnTmdx/bnFvMGl4SFFGWGhK/dnRhMWRFWT0" 
                            alt="Profile"
                        />
                        <div className="profile-details">
                            <h2 className="profile-name">ELPROGRAMADOR</h2>
                            <p className="join-date">Se unió el 15 nov 2020</p>
                        </div>
                    </div>

                    <div className="profile-footer">
                        <p className="friends">10 partidas jugadas</p>
                        <p className="views">2 victorias</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;
