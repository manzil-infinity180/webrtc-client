import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Video } from './Video';
import MonacoCodeEditor from './MonacoCodeEditor';
import toast from 'react-hot-toast';

let peerConnection = new RTCPeerConnection({
    iceServers: [{
        urls: "stun:stun.l.google.com:19302",
    }],
});

function Interview() {
    const { meetingId } = useParams();
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [socketDetail, setSocketDetails] = useState(null);
    const [roomId, setRoomId] = useState("");
    const [option, setOption] = useState({
        joined: false,
        isRecording: false,
        isFileReady: false,
        isScreenSharing: false,
        mutedValue: true,
        disabled: true
    });

    // AI Interview State
    const [interviewState, setInterviewState] = useState({
        started: false,
        questions: [],
        currentQuestionIndex: 0,
        loading: false,
        evaluation: null,
        showEvaluation: false,
        completed: false,
        summary: null
    });

    const [interviewSettings, setInterviewSettings] = useState({
        difficulty: 'medium',
        topics: ['arrays', 'strings', 'algorithms']
    });

    useEffect(() => {
        // Give access to video
        window.navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            setLocalStream(stream);
        });

        const URL = import.meta.env.VITE_SEVER_API;
        const socketIo = io(URL, {
            transports: ['websocket', 'polling', 'flashsocket'],
        });

        socketIo.on('connect', () => {
            setSocketDetails(socketIo);
            socketIo.emit("join", { meetingId });
        });

        // AI Interview Event Listeners
        socketIo.on('questionsGenerated', (data) => {
            setInterviewState(prev => ({
                ...prev,
                questions: data.questions,
                currentQuestionIndex: data.currentIndex,
                started: true,
                loading: false
            }));
            toast.success('Interview questions generated!');
        });

        socketIo.on('codeEvaluated', (data) => {
            setInterviewState(prev => ({
                ...prev,
                evaluation: data.evaluation,
                showEvaluation: true,
                loading: false
            }));
            toast.success(`Code evaluated! Score: ${data.evaluation.overallScore}/100`);
        });

        socketIo.on('questionChanged', (data) => {
            setInterviewState(prev => ({
                ...prev,
                currentQuestionIndex: data.currentIndex,
                showEvaluation: false,
                evaluation: null
            }));
            toast.success('Moving to next question');
        });

        socketIo.on('interviewCompleted', (data) => {
            setInterviewState(prev => ({
                ...prev,
                completed: true,
                loading: false
            }));
            toast.success(`Interview completed! Average Score: ${data.averageScore.toFixed(2)}/100`);
        });

        socketIo.on('interviewSummary', (data) => {
            setInterviewState(prev => ({
                ...prev,
                summary: data,
                loading: false
            }));
        });

        socketIo.on('interviewError', (data) => {
            setInterviewState(prev => ({ ...prev, loading: false }));
            toast.error(data.message);
        });

        socketIo.on('evaluationError', (data) => {
            setInterviewState(prev => ({ ...prev, loading: false }));
            toast.error(data.message);
        });

        // WebRTC handlers
        socketIo.on('localDescription', async ({ description }) => {
            peerConnection.setRemoteDescription(description);
            peerConnection.ontrack = (e) => {
                setRemoteStream(new MediaStream([e.track]));
            };

            socketIo.on('iceCandidate', ({ candidate }) => {
                peerConnection.addIceCandidate(candidate);
            });

            peerConnection.onicecandidate = ({ candidate }) => {
                socketIo.emit('iceCandidateReply', { candidate });
            };

            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socketIo.emit('remoteDescription', { description: peerConnection.localDescription });
        });

        socketIo.on('remoteDescription', async ({ description }) => {
            peerConnection.setRemoteDescription(description);
            peerConnection.ontrack = (e) => {
                setRemoteStream(new MediaStream([e.track]));
            };

            socketIo.on('iceCandidateReply', ({ candidate }) => {
                peerConnection.addIceCandidate(candidate);
            });

            peerConnection.onicecandidate = ({ candidate }) => {
                socketIo.emit('iceCandidateReply', { candidate });
            };
        });

        return () => {
            if (peerConnection) {
                peerConnection.close();
            }
            if (socketIo) {
                socketIo.disconnect();
            }
        };
    }, [meetingId]);

    async function handleJoinMeeting() {
        peerConnection.onicecandidate = ({ candidate }) => {
            socketDetail.emit('iceCandidate', { candidate });
        };

        peerConnection.addTrack(localStream.getVideoTracks()[0]);

        try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socketDetail.emit('localDescription', {
                description: peerConnection.localDescription
            });
            setOption((s) => ({ ...s, joined: true }));
        } catch (err) {
            console.error(err);
            toast.error('Failed to join meeting');
        }
    }

    function handleStartInterview() {
        setInterviewState(prev => ({ ...prev, loading: true }));
        socketDetail.emit('startInterview', {
            meetingId,
            difficulty: interviewSettings.difficulty,
            topics: interviewSettings.topics
        });
    }

    function handleCodeSubmit(code, language) {
        const currentQuestion = interviewState.questions[interviewState.currentQuestionIndex];
        setInterviewState(prev => ({ ...prev, loading: true }));
        
        socketDetail.emit('submitCode', {
            meetingId,
            code,
            language,
            questionId: currentQuestion.id
        });
    }

    function handleNextQuestion() {
        socketDetail.emit('nextQuestion', { meetingId });
    }

    function handleGetSummary() {
        setInterviewState(prev => ({ ...prev, loading: true }));
        socketDetail.emit('getInterviewSummary', { meetingId });
    }

    if (!option.joined) {
        return (
            <div className='flex justify-center items-center flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
                <img src='https://webrtcclient.com/wp-content/uploads/2021/09/WebRTC-740-fi.png' 
                     alt="webrtc"
                     loading='lazy'
                     className='w-48 sm:w-72 mb-6' />
                <h3 className='text-2xl font-bold text-gray-800 mb-4'>AI-Powered Interview Platform</h3>
                <input 
                    placeholder='Enter Room Id' 
                    className="border-2 border-blue-300 text-lg font-serif m-4 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    value={roomId} 
                    onChange={(e) => setRoomId(e.target.value)}
                />
                <button 
                    onClick={handleJoinMeeting} 
                    className='text-lg font-mono rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 transition-colors shadow-lg'>
                    Join Interview Room
                </button>
            </div>
        );
    }

    const currentQuestion = interviewState.questions[interviewState.currentQuestionIndex];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                        AI Technical Interview
                    </h1>
                    {interviewState.started && !interviewState.completed && (
                        <p className="text-sm text-gray-600 mt-1">
                            Question {interviewState.currentQuestionIndex + 1} of {interviewState.questions.length}
                        </p>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* Video Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Video Call</h2>
                    <div className="flex justify-center space-x-4 mb-4">
                        <Video stream={localStream} muted={option.mutedValue} />
                        <Video stream={remoteStream} />
                    </div>
                    <div className='flex justify-center'>
                        <button 
                            onClick={() => setOption((s) => ({ ...s, mutedValue: !option.mutedValue }))}
                            className={`font-medium text-lg rounded-lg px-6 py-2 transition-colors ${
                                option.mutedValue 
                                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}>
                            {option.mutedValue ? 'Unmute' : 'Mute'}
                        </button>
                    </div>
                </div>

                {/* Interview Control Panel */}
                {!interviewState.started && !interviewState.completed && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Interview Settings</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Difficulty Level
                                </label>
                                <select 
                                    className="border-2 border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500"
                                    value={interviewSettings.difficulty}
                                    onChange={(e) => setInterviewSettings(prev => ({
                                        ...prev,
                                        difficulty: e.target.value
                                    }))}>
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>
                            <button 
                                onClick={handleStartInterview}
                                disabled={interviewState.loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400">
                                {interviewState.loading ? 'Generating Questions...' : 'Start AI Interview'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Question Display */}
                {interviewState.started && currentQuestion && !interviewState.completed && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{currentQuestion.title}</h2>
                                <div className="flex gap-2 mt-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                        currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {currentQuestion.difficulty}
                                    </span>
                                    {currentQuestion.topics?.map(topic => (
                                        <span key={topic} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className="prose max-w-none">
                            <p className="text-gray-700 whitespace-pre-wrap">{currentQuestion.description}</p>
                            
                            {currentQuestion.examples && (
                                <div className="mt-4">
                                    <h3 className="font-semibold text-gray-900">Examples:</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg mt-2">
                                        {currentQuestion.examples.map((ex, idx) => (
                                            <pre key={idx} className="text-sm">{ex}</pre>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {currentQuestion.constraints && (
                                <div className="mt-4">
                                    <h3 className="font-semibold text-gray-900">Constraints:</h3>
                                    <ul className="list-disc list-inside text-gray-700">
                                        {currentQuestion.constraints.map((c, idx) => (
                                            <li key={idx}>{c}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Evaluation Display */}
                {interviewState.showEvaluation && interviewState.evaluation && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Code Evaluation</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">Overall Score</p>
                                <p className="text-3xl font-bold text-blue-600">
                                    {interviewState.evaluation.overallScore}/100
                                </p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">Correctness</p>
                                <p className="text-xl font-semibold text-green-600">
                                    {interviewState.evaluation.correctness}
                                </p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">Code Quality</p>
                                <p className="text-3xl font-bold text-purple-600">
                                    {interviewState.evaluation.codeQuality}/100
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Complexity Analysis</h3>
                                <p className="text-gray-700">
                                    Time: <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                                        {interviewState.evaluation.timeComplexity}
                                    </span>
                                    {' | '}
                                    Space: <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                                        {interviewState.evaluation.spaceComplexity}
                                    </span>
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Feedback</h3>
                                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                                    {interviewState.evaluation.feedback}
                                </p>
                            </div>

                            {interviewState.evaluation.suggestions && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Suggestions</h3>
                                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                                        {interviewState.evaluation.suggestions.map((s, idx) => (
                                            <li key={idx}>{s}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={handleNextQuestion}
                            className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors">
                            Next Question
                        </button>
                    </div>
                )}

                {/* Interview Summary */}
                {interviewState.completed && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Interview Completed!</h2>
                        <button 
                            onClick={handleGetSummary}
                            disabled={interviewState.loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400 mb-4">
                            {interviewState.loading ? 'Generating Summary...' : 'Get Interview Summary'}
                        </button>

                        {interviewState.summary && (
                            <div className="space-y-4 mt-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-2">Overall Assessment</h3>
                                    <p className="text-gray-700">{interviewState.summary.overallAssessment}</p>
                                </div>
                                
                                {interviewState.summary.recommendation && (
                                    <div className={`p-4 rounded-lg ${
                                        interviewState.summary.recommendation === 'hire' ? 'bg-green-50' :
                                        interviewState.summary.recommendation === 'no-hire' ? 'bg-red-50' :
                                        'bg-yellow-50'
                                    }`}>
                                        <h3 className="font-semibold text-gray-900 mb-2">Recommendation</h3>
                                        <p className="text-lg font-bold capitalize">{interviewState.summary.recommendation}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Code Editor */}
                {interviewState.started && !interviewState.completed && (
                    <MonacoCodeEditor onSubmit={handleCodeSubmit} loading={interviewState.loading} />
                )}
            </div>
        </div>
    );
}

export default Interview;