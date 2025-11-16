import { useEffect, useState, useRef } from 'react';
import { AlertTriangle, Eye, Smartphone, User, CheckCircle, Clock, Camera } from 'lucide-react';

function InterviewWithProctoring() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [meetingId] = useState('demo-interview-' + Math.random().toString(36).substr(2, 9));
    const [localStream, setLocalStream] = useState(null);
    const [codeEditorContent, setCodeEditorContent] = useState('');
    const [language, setLanguage] = useState('python');
    
    // Proctoring State
    const [proctoringData, setProctoringData] = useState({
        headPoseViolations: 0,
        gazeViolations: 0,
        mobileDetections: 0,
        totalViolations: 0,
        isMonitoring: false,
        lastViolationType: null,
        lastViolationTime: null,
        violations: []
    });

    // Interview State
    const [interviewState, setInterviewState] = useState({
        started: false,
        questions: [],
        currentQuestionIndex: 0,
        loading: false,
        evaluation: null,
        showEvaluation: false,
        completed: false,
        joined: false
    });

    const [interviewSettings, setInterviewSettings] = useState({
        difficulty: 'medium',
        numberOfQuestions: 3,
        enableProctoring: true
    });

    useEffect(() => {
        // Initialize webcam
        const initWebcam = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { width: 640, height: 480 }, 
                    audio: false 
                });
                setLocalStream(stream);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error('Error accessing webcam:', err);
                alert('Please allow camera access for proctoring');
            }
        };

        initWebcam();

        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Simulate proctoring violations for demo
    useEffect(() => {
        if (!proctoringData.isMonitoring) return;

        const interval = setInterval(() => {
            // Randomly generate violations for demo
            if (Math.random() > 0.85) {
                const types = ['head_pose', 'gaze', 'mobile'];
                const type = types[Math.floor(Math.random() * types.length)];
                const severities = ['low', 'medium', 'high'];
                const severity = severities[Math.floor(Math.random() * severities.length)];
                
                const details = {
                    head_pose: 'Head turned away from screen',
                    gaze: 'Looking away from screen',
                    mobile: 'Mobile phone detected in frame'
                }[type];

                const newViolation = {
                    type,
                    timestamp: new Date(),
                    details,
                    severity
                };

                setProctoringData(prev => ({
                    ...prev,
                    headPoseViolations: type === 'head_pose' ? prev.headPoseViolations + 1 : prev.headPoseViolations,
                    gazeViolations: type === 'gaze' ? prev.gazeViolations + 1 : prev.gazeViolations,
                    mobileDetections: type === 'mobile' ? prev.mobileDetections + 1 : prev.mobileDetections,
                    totalViolations: prev.totalViolations + 1,
                    lastViolationType: type,
                    lastViolationTime: new Date(),
                    violations: [...prev.violations, newViolation].slice(-10)
                }));
            }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, [proctoringData.isMonitoring]);

    const handleJoinInterview = () => {
        setInterviewState(prev => ({ ...prev, joined: true }));
    };

    const handleStartInterview = async () => {
        setInterviewState(prev => ({ ...prev, loading: true }));

        // Simulate API call to generate questions
        setTimeout(() => {
            const sampleQuestions = [
                {
                    id: 1,
                    title: "Two Sum",
                    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
                    examples: [
                        "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].",
                        "Input: nums = [3,2,4], target = 6\nOutput: [1,2]"
                    ],
                    constraints: [
                        "2 <= nums.length <= 10^4",
                        "-10^9 <= nums[i] <= 10^9",
                        "Only one valid answer exists"
                    ],
                    difficulty: "easy",
                    timeComplexity: "O(n)",
                    spaceComplexity: "O(n)"
                },
                {
                    id: 2,
                    title: "Valid Parentheses",
                    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
                    examples: [
                        "Input: s = \"()\"\nOutput: true",
                        "Input: s = \"()[]{}\"\nOutput: true",
                        "Input: s = \"(]\"\nOutput: false"
                    ],
                    constraints: [
                        "1 <= s.length <= 10^4",
                        "s consists of parentheses only '()[]{}'."
                    ],
                    difficulty: "easy",
                    timeComplexity: "O(n)",
                    spaceComplexity: "O(n)"
                },
                {
                    id: 3,
                    title: "Merge Two Sorted Lists",
                    description: "You are given the heads of two sorted linked lists list1 and list2.\n\nMerge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.\n\nReturn the head of the merged linked list.",
                    examples: [
                        "Input: list1 = [1,2,4], list2 = [1,3,4]\nOutput: [1,1,2,3,4,4]",
                        "Input: list1 = [], list2 = []\nOutput: []"
                    ],
                    constraints: [
                        "The number of nodes in both lists is in the range [0, 50].",
                        "-100 <= Node.val <= 100"
                    ],
                    difficulty: "easy",
                    timeComplexity: "O(n + m)",
                    spaceComplexity: "O(1)"
                }
            ];

            const selectedQuestions = sampleQuestions.slice(0, interviewSettings.numberOfQuestions);

            setInterviewState(prev => ({
                ...prev,
                questions: selectedQuestions,
                currentQuestionIndex: 0,
                started: true,
                loading: false
            }));

            if (interviewSettings.enableProctoring) {
                setProctoringData(prev => ({ ...prev, isMonitoring: true }));
            }
        }, 2000);
    };

    const handleCodeSubmit = async () => {
        if (!interviewState.questions.length) return;
        
        setInterviewState(prev => ({ ...prev, loading: true }));
        
        // Simulate code evaluation
        setTimeout(() => {
            const evaluation = {
                correctness: Math.random() > 0.5 ? 'correct' : 'partially_correct',
                correctnessScore: Math.floor(Math.random() * 30) + 70,
                timeComplexity: 'O(n)',
                timeComplexityScore: Math.floor(Math.random() * 20) + 75,
                spaceComplexity: 'O(1)',
                spaceComplexityScore: Math.floor(Math.random() * 20) + 75,
                codeQuality: Math.floor(Math.random() * 15) + 80,
                overallScore: Math.floor(Math.random() * 20) + 75,
                feedback: "Good solution! Your approach is correct and handles most test cases. The time complexity is optimal for this problem. Consider adding more comments to explain your logic.",
                strengths: [
                    "Clear variable naming",
                    "Efficient algorithm",
                    "Handles edge cases"
                ],
                weaknesses: [
                    "Could add more comments",
                    "Some redundant checks"
                ],
                suggestions: [
                    "Add inline comments for complex logic",
                    "Consider extracting helper functions"
                ]
            };

            setInterviewState(prev => ({
                ...prev,
                evaluation,
                showEvaluation: true,
                loading: false
            }));
        }, 3000);
    };

    const handleNextQuestion = () => {
        if (interviewState.currentQuestionIndex < interviewState.questions.length - 1) {
            setInterviewState(prev => ({
                ...prev,
                currentQuestionIndex: prev.currentQuestionIndex + 1,
                showEvaluation: false,
                evaluation: null
            }));
            setCodeEditorContent('');
        } else {
            // Complete interview
            setInterviewState(prev => ({ ...prev, completed: true }));
            setProctoringData(prev => ({ ...prev, isMonitoring: false }));
        }
    };

    const getViolationColor = (count) => {
        if (count === 0) return 'text-green-600 bg-green-50';
        if (count < 3) return 'text-yellow-600 bg-yellow-50';
        if (count < 5) return 'text-orange-600 bg-orange-50';
        return 'text-red-600 bg-red-50';
    };

    const getSeverityIcon = (severity) => {
        if (severity === 'high') return <AlertTriangle className="w-4 h-4 text-red-600" />;
        if (severity === 'medium') return <AlertTriangle className="w-4 h-4 text-orange-600" />;
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    };

    // Pre-join screen
    if (!interviewState.joined) {
        return (
            <div className='flex justify-center items-center flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
                <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
                    <div className="text-center mb-6">
                        <Camera className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                        <h2 className='text-3xl font-bold text-gray-800 mb-2'>Join AI Interview</h2>
                        <p className="text-gray-600 text-sm">Proctored Technical Interview Platform</p>
                    </div>
                    
                    <div className="mb-6">
                        <video 
                            ref={videoRef}
                            autoPlay 
                            muted
                            className="w-full rounded-lg bg-gray-900"
                        />
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">Room ID:</span>
                            <span className="text-xs font-mono text-blue-600">{meetingId}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">Proctoring:</span>
                            <span className={`text-sm font-semibold ${interviewSettings.enableProctoring ? 'text-green-600' : 'text-gray-600'}`}>
                                {interviewSettings.enableProctoring ? 'Enabled ✓' : 'Disabled'}
                            </span>
                        </div>
                    </div>

                    <button 
                        onClick={handleJoinInterview}
                        className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg'>
                        Join Interview Room
                    </button>

                    <p className="text-xs text-gray-500 mt-4 text-center">
                        By joining, you consent to being monitored during the interview
                    </p>
                </div>
            </div>
        );
    }

    const currentQuestion = interviewState.questions[interviewState.currentQuestionIndex];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with Proctoring Status */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">AI Proctored Interview</h1>
                            {interviewState.started && !interviewState.completed && (
                                <p className="text-sm text-gray-600">
                                    Question {interviewState.currentQuestionIndex + 1} of {interviewState.questions.length}
                                </p>
                            )}
                        </div>
                        
                        {proctoringData.isMonitoring && (
                            <div className="flex items-center space-x-2 bg-red-50 px-4 py-2 rounded-lg">
                                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-red-700">Recording</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Video & Proctoring */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Video Feed */}
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <h3 className="text-lg font-semibold mb-3">Video Feed</h3>
                            <video 
                                ref={videoRef}
                                autoPlay 
                                muted
                                className="w-full rounded-lg bg-gray-900"
                            />
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                        </div>

                        {/* Proctoring Dashboard */}
                        {proctoringData.isMonitoring && (
                            <div className="bg-white rounded-lg shadow-md p-4">
                                <h3 className="text-lg font-semibold mb-4 flex items-center">
                                    <Eye className="w-5 h-5 mr-2" />
                                    Proctoring Status
                                </h3>
                                
                                <div className="space-y-3">
                                    <div className={`p-3 rounded-lg ${getViolationColor(proctoringData.headPoseViolations)}`}>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium flex items-center">
                                                <User className="w-4 h-4 mr-2" />
                                                Head Movement
                                            </span>
                                            <span className="text-lg font-bold">{proctoringData.headPoseViolations}</span>
                                        </div>
                                    </div>

                                    <div className={`p-3 rounded-lg ${getViolationColor(proctoringData.gazeViolations)}`}>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium flex items-center">
                                                <Eye className="w-4 h-4 mr-2" />
                                                Gaze Detection
                                            </span>
                                            <span className="text-lg font-bold">{proctoringData.gazeViolations}</span>
                                        </div>
                                    </div>

                                    <div className={`p-3 rounded-lg ${getViolationColor(proctoringData.mobileDetections)}`}>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium flex items-center">
                                                <Smartphone className="w-4 h-4 mr-2" />
                                                Mobile Detection
                                            </span>
                                            <span className="text-lg font-bold">{proctoringData.mobileDetections}</span>
                                        </div>
                                    </div>

                                    <div className="border-t pt-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-semibold text-gray-700">Total Violations</span>
                                            <span className="text-2xl font-bold text-gray-900">{proctoringData.totalViolations}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Violations */}
                                {proctoringData.violations.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Alerts</h4>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {proctoringData.violations.map((violation, idx) => (
                                                <div key={idx} className="flex items-start space-x-2 text-xs bg-gray-50 p-2 rounded">
                                                    {getSeverityIcon(violation.severity)}
                                                    <div className="flex-1">
                                                        <p className="font-medium capitalize">{violation.type.replace('_', ' ')}</p>
                                                        <p className="text-gray-500">{violation.details}</p>
                                                        <p className="text-gray-400">{new Date(violation.timestamp).toLocaleTimeString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Interview Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Interview Setup */}
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

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Number of Questions
                                        </label>
                                        <input 
                                            type="number"
                                            min="1"
                                            max="3"
                                            className="border-2 border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500"
                                            value={interviewSettings.numberOfQuestions}
                                            onChange={(e) => setInterviewSettings(prev => ({
                                                ...prev,
                                                numberOfQuestions: parseInt(e.target.value) || 1
                                            }))}
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <input 
                                            type="checkbox"
                                            id="proctoring"
                                            checked={interviewSettings.enableProctoring}
                                            onChange={(e) => setInterviewSettings(prev => ({
                                                ...prev,
                                                enableProctoring: e.target.checked
                                            }))}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <label htmlFor="proctoring" className="ml-2 text-sm font-medium text-gray-700">
                                            Enable Proctoring (Recommended)
                                        </label>
                                    </div>

                                    <button 
                                        onClick={handleStartInterview}
                                        disabled={interviewState.loading}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400">
                                        {interviewState.loading ? 'Generating Questions...' : 'Start Interview'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Question Display */}
                        {interviewState.started && currentQuestion && !interviewState.completed && (
                            <>
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
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="prose max-w-none">
                                        <p className="text-gray-700 whitespace-pre-wrap mb-4">{currentQuestion.description}</p>
                                        
                                        {currentQuestion.examples && (
                                            <div className="mt-4">
                                                <h3 className="font-semibold text-gray-900 mb-2">Examples:</h3>
                                                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                                    {currentQuestion.examples.map((ex, idx) => (
                                                        <pre key={idx} className="text-sm text-gray-800">{ex}</pre>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {currentQuestion.constraints && (
                                            <div className="mt-4">
                                                <h3 className="font-semibold text-gray-900 mb-2">Constraints:</h3>
                                                <ul className="list-disc list-inside text-gray-700 space-y-1">
                                                    {currentQuestion.constraints.map((c, idx) => (
                                                        <li key={idx} className="text-sm">{c}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Code Editor */}
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold">Code Editor</h3>
                                        <select 
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                            className="border-2 border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500">
                                            <option value="python">Python</option>
                                            <option value="javascript">JavaScript</option>
                                            <option value="java">Java</option>
                                            <option value="cpp">C++</option>
                                        </select>
                                    </div>
                                    
                                    <textarea 
                                        value={codeEditorContent}
                                        onChange={(e) => setCodeEditorContent(e.target.value)}
                                        className="w-full h-64 p-4 font-mono text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="# Write your solution here..."
                                        spellCheck={false}
                                    />
                                    
                                    <button 
                                        onClick={handleCodeSubmit}
                                        disabled={interviewState.loading || !codeEditorContent.trim()}
                                        className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                                        {interviewState.loading ? 'Evaluating Code...' : 'Submit Solution'}
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Evaluation Display */}
                        {interviewState.showEvaluation && interviewState.evaluation && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Code Evaluation Results</h2>
                                
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                                        <p className="text-sm text-gray-600 mb-1">Overall Score</p>
                                        <p className="text-3xl font-bold text-blue-600">
                                            {interviewState.evaluation.overallScore}
                                        </p>
                                        <p className="text-xs text-gray-500">out of 100</p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg text-center">
                                        <p className="text-sm text-gray-600 mb-1">Correctness</p>
                                        <p className="text-xl font-semibold text-green-600 capitalize">
                                            {interviewState.evaluation.correctness}
                                        </p>
                                        <p className="text-xs text-gray-500">{interviewState.evaluation.correctnessScore}/100</p>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                                        <p className="text-sm text-gray-600 mb-1">Code Quality</p>
                                        <p className="text-3xl font-bold text-purple-600">
                                            {interviewState.evaluation.codeQuality}
                                        </p>
                                        <p className="text-xs text-gray-500">out of 100</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Complexity Analysis</h3>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-sm text-gray-700">
                                                <span className="font-medium">Time:</span>{' '}
                                                <span className="font-mono bg-white px-2 py-1 rounded">
                                                    {interviewState.evaluation.timeComplexity}
                                                </span>
                                                {' | '}
                                                <span className="font-medium">Space:</span>{' '}
                                                <span className="font-mono bg-white px-2 py-1 rounded">
                                                    {interviewState.evaluation.spaceComplexity}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Feedback</h3>
                                        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg text-sm leading-relaxed">
                                            {interviewState.evaluation.feedback}
                                        </p>
                                    </div>

                                    {interviewState.evaluation.strengths && interviewState.evaluation.strengths.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                                Strengths
                                            </h3>
                                            <ul className="list-disc list-inside text-gray-700 space-y-1 bg-green-50 p-3 rounded-lg">
                                                {interviewState.evaluation.strengths.map((s, idx) => (
                                                    <li key={idx} className="text-sm">{s}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {interviewState.evaluation.suggestions && interviewState.evaluation.suggestions.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-2">Suggestions for Improvement</h3>
                                            <ul className="list-disc list-inside text-gray-700 space-y-1 bg-blue-50 p-3 rounded-lg">
                                                {interviewState.evaluation.suggestions.map((s, idx) => (
                                                    <li key={idx} className="text-sm">{s}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                <button 
                                    onClick={handleNextQuestion}
                                    className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors">
                                    {interviewState.currentQuestionIndex < interviewState.questions.length - 1 ? 'Next Question →' : 'Complete Interview'}
                                </button>
                            </div>
                        )}

                        {/* Interview Completed */}
                        {interviewState.completed && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="text-center">
                                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Interview Completed!</h2>
                                    <p className="text-gray-600 mb-6">Thank you for participating in this AI-proctored interview.</p>
                                    
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg mb-6">
                                        <h3 className="font-semibold text-gray-900 mb-4 text-lg">Session Summary</h3>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                                <p className="text-sm text-gray-600 mb-1">Questions Completed</p>
                                                <p className="text-3xl font-bold text-gray-900">{interviewState.questions.length}</p>
                                            </div>
                                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                                <p className="text-sm text-gray-600 mb-1">Proctoring Violations</p>
                                                <p className={`text-3xl font-bold ${
                                                    proctoringData.totalViolations === 0 ? 'text-green-600' :
                                                    proctoringData.totalViolations < 5 ? 'text-yellow-600' :
                                                    'text-red-600'
                                                }`}>{proctoringData.totalViolations}</p>
                                            </div>
                                        </div>

                                        {proctoringData.totalViolations > 0 && (
                                            <div className="mt-4 grid grid-cols-3 gap-3">
                                                <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                                                    <User className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                                                    <p className="text-xs text-gray-500">Head Pose</p>
                                                    <p className="text-lg font-bold">{proctoringData.headPoseViolations}</p>
                                                </div>
                                                <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                                                    <Eye className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                                                    <p className="text-xs text-gray-500">Gaze</p>
                                                    <p className="text-lg font-bold">{proctoringData.gazeViolations}</p>
                                                </div>
                                                <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                                                    <Smartphone className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                                                    <p className="text-xs text-gray-500">Mobile</p>
                                                    <p className="text-lg font-bold">{proctoringData.mobileDetections}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-700">
                                            Your interview responses and proctoring data have been recorded. 
                                            The interviewer will review your performance and get back to you soon.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InterviewWithProctoring;