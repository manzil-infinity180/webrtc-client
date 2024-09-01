import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function YoutubeContent({ onVideoSelect }) {
  const [searchContent, setSearchContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  // useEffect(() => {
  //     async function handleContent() {
  //         const res = await fetch('https://www.googleapis.com/youtube/v3/search?key=AIzaSyDmkpUkJSUGywJyVPzCGmMGZVa8HrYmbJQ&part=snippet&q=modi&type=video&maxResults=50&order=relevance');
  //         const data = await res.json();
  //         console.log(data);
  //         setSearchContent(data.items);
  //     }
  //     handleContent();

  // },[]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (searchTerm.length > 0) {
      // AIzaSyBiMyYAn-wakWsSRCPUdxYzqVaNnhIxLk0
      // AIzaSyDmkpUkJSUGywJyVPzCGmMGZVa8HrYmbJQ
      try{
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?q=${searchTerm}&key=AIzaSyBiMyYAn-wakWsSRCPUdxYzqVaNnhIxLk0&part=snippet&type=video&maxResults=20&order=relevance`);
        const data = await res.json();
        console.log(data);
        setSearchContent(data.items);
      }catch(err){
        toast.error(err.message);
        toast.error("Exceed the free access request");
      }
      
      // data.items.id.videoId // important
      // data.items.snippet
    }
  }
  
  function handleLoadVideo(videoID) {
    console.log(videoID);
    if(videoID){
      const fullVideoUrl = `https://www.youtube.com/watch?v=${videoID}`;
      onVideoSelect(fullVideoUrl);
      toast.success('Loading selected video');
    } else {
      toast.error("Invalid videoId");
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          id="search_field_class"
          className="rounded-l-lg border-2 border-black w-1/2 min-h-10 py-3 px-6 focus:outline-none text-md"
          type="search"
          name="search"
          placeholder="Search Videos . . ."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoComplete='off'
        />
        <button className="rounded-r-lg border-2 border-black bg-black text-white px-6 py-3 text-md font-semibold hover:bg-gray-800 focus:outline-none transition-colors">
          Search</button>
      </form>
      <div className="content grid sm:grid-cols-4 justify-center gap-3 p-3">
        {/* {searchContent &&
        searchContent.map((content) => (
          <ContentView
            key={content.etag}
            thumbnails={content.snippet.thumbnails.high.url}
            title={content.snippet.title}
            channelTitle={content.snippet.channelTitle}
          />
        ))} */}
      </div>
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
                onVideoSelect={handleLoadVideo}
              />
            ))}
        </div>
      </div>
    </>
  );
}

export default YoutubeContent;

function ContentView({ title, thumbnails, channelTitle, videoID, onVideoSelect }) {
  return (
    <div 
      className="border-solid border-2 border-gray-200 rounded-lg overflow-hidden shadow-lg bg-white cursor-pointer"
      onClick={() => onVideoSelect(videoID)}
    >
      <img
        src={thumbnails}
        alt={title}
        className="w-full h-full object-full"
        style={{ width: '360px', height: '180px' }}
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 truncate">{title}</h2>
        <p className="text-sm text-gray-600">{channelTitle}</p>
      </div>
    </div>
  );
}