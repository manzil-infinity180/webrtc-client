import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'

export const YT_REGEX = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;

function WatchYoutube() {
  const [searchContent, setSearchContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const ytKey = import.meta.env.VITE_GOOGLE_YOUTUBE;
  const [ytUrl, setYtURL] = useState("");
  const [startYtVideo, setStartYtVideo] = useState("");
  // useEffect(() => {
  //     async function handleContent() {
  //         const res = await fetch('https://www.googleapis.com/youtube/v3/search?key=${ytKey}&part=snippet&q=modi&type=video&maxResults=50&order=relevance');
  //         const data = await res.json();
  //         console.log(data);
  //         setSearchContent(data.items);
  //     }
  //     handleContent();

  // },[]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (searchTerm.length > 0) {
      try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?q=${searchTerm}&key=${ytKey}&part=snippet&type=video&maxResults=20&order=relevance`);
        const data = await res.json();
        console.log(data);
        setSearchContent(data.items);
      } catch (err) {
        toast.error(err.message);
        toast.error("Exceed the free access request");
      }
    }
  }

  function handleYtVideo(){
    if(ytUrl.match(YT_REGEX)){
        // setVi
        const id = ytUrl.split("=")[1]
        setStartYtVideo(id);
        setYtURL("");
    }

   

  }

  return (
    <>
    <div className='flex justify-center'>
                    <span className="text-2xl sm:text-3xl font-serif mb-1 mt-0 bg-pink-200 text-center rounded px-4">
                       Free Youtube , I guess No ADS
                    </span>
                </div>
    <input
          id="search_field_class"
          className="rounded-l-lg border-2 border-black w-1/2 min-h-10 py-3 px-4 focus:outline-none text-md my-4"
          type="search"
          name="search"
          placeholder="Enter Youtube URL"
          value={ytUrl}
          onChange={(e) => setYtURL(e.target.value)}
          autoComplete='off'
      />
      <button className="rounded-r-lg border-2 border-black bg-black text-white px-6 py-3 text-md font-semibold hover:bg-gray-800 focus:outline-none transition-colors"
      onClick={handleYtVideo}
      >Load Video By Yt Link</button>
      <div className="w-4/5 h-auto border-2 rounded-lg max-w-full overflow-hidden">
          <LiteYouTubeEmbed
            id={(startYtVideo) || 'Odx7B8faaik'}
          />
        </div>
      

      <form onSubmit={handleSubmit}>
        <input
          id="search_field_class"
          className="rounded-l-lg border-2 border-black w-1/2 min-h-10 py-3 px-4 focus:outline-none text-md my-4"
          type="search"
          name="search"
          placeholder="Search Videos . . ."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoComplete='off'
        />
        <button className="rounded-r-lg border-2 border-black bg-black text-white px-6 py-3 text-md font-semibold hover:bg-gray-800 focus:outline-none transition-colors">
          Search Yt Videos</button>
      </form>
      <div className="overflow-x">
        <div className="flex-none min-w-72 max-w-96 px-0 overflow-auto scrollbar:w-1.5 scrollbar:h-1.5 scrollbar:bg-transparent scrollbar-track:bg-slate-100 scrollbar-thumb:rounded scrollbar-thumb:bg-slate-300 scrollbar-track:rounded dark:scrollbar-track:bg-slate-500/[0.16] dark:scrollbar-thumb:bg-slate-500/50 supports-scrollbars:pr-2 max-h-72">
          {searchContent &&
            searchContent.map((content) => (
              <ContentView
                key={content.etag}
                thumbnails={content.snippet.thumbnails.high.url}
                title={content.snippet.title}
                channelTitle={content.snippet.channelTitle}
                videoID={content.id.videoId}
                setStartYtVideo={setStartYtVideo}
              />
            ))}
        </div>
      </div>
    </>
  );
}

export default WatchYoutube;

function ContentView({ title, thumbnails, channelTitle, videoID, handleLoadVideo,setStartYtVideo }) {
    
    function handleLoadYtVideo(){
        console.log(videoID);
        setStartYtVideo(videoID);
    }
  return (
    <div
      className="border-solid border-2 border-gray-200 rounded-lg overflow-clip shadow-lg bg-white cursor-pointer"
      onClick={handleLoadYtVideo}
    >
      <img
        src={thumbnails}
        alt={title}
        className="w-full h-full object-full"
        style={{ width: '460px', height: '280px' }}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-600">{channelTitle}</p>
      </div>
    </div>
  );
}