// CheatingDetection.jsx
import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { AlertTriangle, Eye, Users, Activity } from 'lucide-react';

function CheatingDetection({ meetingId, localStream, isInterviewer = false }) {
    const [detectionSocket, setDetectionSocket] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [currentStatus, setCurrentStatus] = useState('normal');
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [sessionReport, setSessionReport] = useState(null);
    const canvasRef = useRef(null);
    const videoRef = useRef(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        // Connect to cheating detection server
        const DETECTION_URL = import.meta.env.VITE_DETECTION_API || 'http://localhost:5007';
        const socket = io(DETECTION_URL, {
            transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
            console.log('Connected to cheating detection server');
            setDetectionSocket(socket);
            
            // Join monitoring for this meeting
            socket.emit('join_monitoring', { meetingId });
        });

        socket.on('monitoring_started', (data) => {
            console.log('Monitoring started for:', data.meetingId);
            setIsMonitoring(true);
        });

        socket.on('detection_result', (data) => {
            if (data.meetingId === meetingId) {
                const result = data.result;
                
                // Update current status
                setCurrentStatus(result.status);
                
                // Add alert if there's suspicious behavior
                if (result.status === 'alert' || result.status === 'warning') {
                    const newAlert = {
                        id: Date.now(),
                        timestamp: new Date(data.timestamp * 1000).toLocaleTimeString(),
                        message: result.message,
                        severity: result.severity,
                        details: result.details
                    };
                    
                    setAlerts(prev => [newAlert, ...prev].slice(0, 20)); // Keep last 20 alerts
                }
            }
        });

        socket.on('session_report', (data) => {
            if (data.meetingId === meetingId) {
                setSessionReport(data.report);
            }
        });

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            socket.disconnect();
        };
    }, [meetingId]);

    useEffect(() => {
        // Setup video element with local stream
        if (localStream && videoRef.current) {
            videoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        // Start frame capture when monitoring is active
        if (isMonitoring && localStream && detectionSocket) {
            startFrameCapture();
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isMonitoring, localStream, detectionSocket]);

    const captureFrame = () => {
        if (!videoRef.current || !canvasRef.current) return null;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw current video frame to canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64
        return canvas.toDataURL('image/jpeg', 0.8);
    };

    const startFrameCapture = () => {
        // Capture and analyze frame every 2 seconds
        intervalRef.current = setInterval(() => {
            const frameData = captureFrame();
            if (frameData && detectionSocket) {
                detectionSocket.emit('analyze_frame', {
                    meetingId,
                    frame: frameData
                });
            }
        }, 2000); // Analyze every 2 seconds
    };

    const getSessionReport = () => {
        if (detectionSocket) {
            detectionSocket.emit('get_session_report', { meetingId });
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'medium':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'alert':
                return 'bg-red-500';
            case 'warning':
                return 'bg-yellow-500';
            default:
                return 'bg-green-500';
        }
    };

    const getRiskLevelColor = (level) => {
        switch (level) {
            case 'high':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            default:
                return 'bg-green-100 text-green-800 border-green-300';
        }
    };

    // Only show to interviewer
    if (!isInterviewer) {
        return (
            <>
                {/* Hidden video and canvas for frame capture */}
                <video ref={videoRef} autoPlay muted style={{ display: 'none' }} />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                
                {/* Monitoring indicator for candidate */}
                <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    <span className="text-sm font-medium">Interview Monitoring Active</span>
                </div>
            </>
        );
    }

    // Interviewer view
    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            {/* Hidden video and canvas for frame capture */}
            <video ref={videoRef} autoPlay muted style={{ display: 'none' }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-orange-500" />
                    <h2 className="text-xl font-semibold text-gray-900">Cheating Detection Monitor</h2>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(currentStatus)} animate-pulse`}></div>
                    <span className="text-sm text-gray-600 capitalize">{currentStatus}</span>
                </div>
            </div>

            {/* Monitoring Status */}
            {isMonitoring ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-green-700">
                        <Activity className="w-5 h-5" />
                        <span className="text-sm font-medium">
                            Real-time behavioral monitoring active (analyzing every 2 seconds)
                        </span>
                    </div>
                </div>
            ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <span className="text-sm text-yellow-700">Starting monitoring...</span>
                </div>
            )}

            {/* Current Alerts */}
            {alerts.length > 0 && (
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Alerts</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className={`border rounded-lg p-3 ${getSeverityColor(alert.severity)}`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="font-medium">{alert.message}</p>
                                        {alert.details.alerts && alert.details.alerts.length > 0 && (
                                            <ul className="text-sm mt-1 space-y-1">
                                                {alert.details.alerts.map((detail, idx) => (
                                                    <li key={idx}>• {detail}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <span className="text-xs opacity-75 ml-2">{alert.timestamp}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Session Report */}
            <div className="mt-4">
                <button
                    onClick={getSessionReport}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors">
                    Generate Session Report
                </button>

                {sessionReport && (
                    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Session Report</h3>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-white p-3 rounded-lg border">
                                <p className="text-sm text-gray-600">Total Events</p>
                                <p className="text-2xl font-bold text-gray-900">{sessionReport.total_events || 0}</p>
                            </div>
                            <div className={`p-3 rounded-lg border ${getRiskLevelColor(sessionReport.risk_level)}`}>
                                <p className="text-sm">Risk Level</p>
                                <p className="text-2xl font-bold capitalize">{sessionReport.risk_level}</p>
                            </div>
                        </div>

                        {sessionReport.common_behaviors && sessionReport.common_behaviors.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Most Common Behaviors</h4>
                                <div className="space-y-2">
                                    {sessionReport.common_behaviors.map((behavior, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border">
                                            <span className="text-sm text-gray-700">{behavior.behavior}</span>
                                            <span className="text-sm font-semibold text-gray-900">×{behavior.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {sessionReport.summary && (
                            <p className="mt-3 text-sm text-gray-600">{sessionReport.summary}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CheatingDetection;