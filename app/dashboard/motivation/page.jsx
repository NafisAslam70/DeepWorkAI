"use client";
import React, { useState, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import axios from 'axios';

const YOUTUBE_API_KEY = 'AIzaSyB20FC1Q-oZFriisgVcVJVlwV25UBCmUDQ'; // Replace if invalid
const YOUTUBE_PLAYLIST_ID = 'PLriLgVg0-Kgzu0Y-Rz2ofUT1E53lUjh_T'; // Verify this is public

function MotivationReels() {
  const [videos, setVideos] = useState([]);
  const mountedRef = useRef(true);

  const fetchVideos = async () => {
    try {
      console.log('Fetching videos from YouTube API...');
      const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
        params: {
          part: 'snippet',
          playlistId: YOUTUBE_PLAYLIST_ID,
          maxResults: 20,
          key: YOUTUBE_API_KEY,
        },
      });
      if (mountedRef.current) {
        console.log('API Response:', response.data.items);
        setVideos(response.data.items || []);
      }
    } catch (error) {
      console.error('Error fetching videos from YouTube:', error);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    fetchVideos();
    return () => {
      mountedRef.current = false; // Cleanup on unmount
    };
  }, []);

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      origin: 'http://localhost:3000', // Update for production
    },
  };

  const handleVideoError = (videoId) => {
    console.error(`Error loading video with ID: ${videoId}`);
    if (mountedRef.current) {
      setVideos((prevVideos) => prevVideos.filter((video) => video.snippet.resourceId.videoId !== videoId));
    }
  };

  return (
    <div className="w-full min-h-screen p-5 bg-gray-100 text-gray-900">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {videos.map((video) => (
          <div
            key={video.snippet.resourceId.videoId}
            className="bg-white rounded-lg shadow-md overflow-hidden w-full aspect-square hover:shadow-lg transition-all cursor-pointer"
          >
            <YouTube
              videoId={video.snippet.resourceId.videoId}
              opts={opts}
              onError={() => handleVideoError(video.snippet.resourceId.videoId)}
              containerClassName="w-full h-full"
            />
          </div>
        ))}
      </div>
      <style jsx>{`
        .video-card {
          width: 100%;
          position: relative;
          transition: transform 0.3s ease-in-out;
        }
        .video-card:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}

export default MotivationReels;
// "use client";
// import React, { useState, useEffect } from 'react';
// import YouTube from 'react-youtube';
// import axios from 'axios';

// const YOUTUBE_API_KEY = 'AIzaSyB20FC1Q-oZFriisgVcVJVlwV25UBCmUDQ';
// const YOUTUBE_PLAYLIST_ID = 'PLriLgVg0-Kgzu0Y-Rz2ofUT1E53lUjh_T';

// function MotivationReels() {
//   const [videos, setVideos] = useState([]);
  
//   const fetchVideos = async () => {
//     try {
//       const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
//         params: {
//           part: 'snippet',
//           playlistId: YOUTUBE_PLAYLIST_ID,
//           maxResults: 20,
//           key: YOUTUBE_API_KEY,
//         },
//       });
//       setVideos(response.data.items);
//     } catch (error) {
//       console.error("Error fetching videos from YouTube", error);
//     }
//   };

//   useEffect(() => {
//     fetchVideos();
//   }, []);

//   const opts = {
//     height: '100%',
//     width: '100%',
//     playerVars: {
//       autoplay: 0,
//       origin: 'http://localhost:3000', // Make sure to change this in production
//     },
//   };

//   const handleVideoError = (videoId) => {
//     console.error(`Error loading video with ID: ${videoId}`);
//     // Filter out the video that caused the error
//     setVideos((prevVideos) => prevVideos.filter((video) => video.snippet.resourceId.videoId !== videoId));
//   };

//   return (
//     <div className="w-full min-h-screen p-5 bg-gray-100 text-gray-900">
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//         {videos.map((video) => (
//           <div key={video.snippet.resourceId.videoId} className="bg-white rounded-lg shadow-md overflow-hidden w-full aspect-square hover:shadow-lg transition-all cursor-pointer">
//             <YouTube
//               videoId={video.snippet.resourceId.videoId}
//               opts={opts}
//               onError={() => handleVideoError(video.snippet.resourceId.videoId)}
//               containerClassName="w-full h-full"
//             />
//           </div>
//         ))}
//       </div>
//       <style jsx>{`
//         .video-card {
//           width: 100%;
//           position: relative;
//           transition: transform 0.3s ease-in-out;
//         }
//         .video-card:hover {
//           transform: scale(1.05);
//         }
//       `}</style>
//     </div>
//   );
// }

// export default MotivationReels;
