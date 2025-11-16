import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import Editor from '@monaco-editor/react';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import LanguageOptions from './LanguageOptions';

function MonacoCodeEditor({ onSubmit, loading }) {
    const { meetingId } = useParams(); // Get room ID from URL
    const [selectedOption, setSelectedOption] = useState({
        language: 'javascript',
        id: 63
    });
    const [code, setCode] = useState("");
    const ydoc = useMemo(() => new Y.Doc(), []);
    const [editor, setEditor] = useState(null);
    const [provider, setProvider] = useState(null);
    const [binding, setBinding] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');

    // Manage Yjs document and provider lifetime
    useEffect(() => {
        if (!meetingId) {
            console.warn('No meeting ID provided for collaborative editing');
            return;
        }

        // Connect to the same server but on /yjs path
        const wsUrl = import.meta.env.VITE_SEVER_API || 'http://localhost:5006';
        const wsProtocol = wsUrl.startsWith('https') ? 'wss' : 'ws';
        const wsHost = wsUrl.replace('http://', '').replace('https://', '');
        
        // Use meeting ID as the room name for Yjs
        const roomName = `interview-room-${meetingId}`;
        const yjsUrl = `${wsProtocol}://${wsHost}/yjs`;
        
        console.log(`Connecting to Yjs: ${yjsUrl} | Room: ${roomName}`);
        
        const wsProvider = new WebsocketProvider(
            yjsUrl,
            roomName,
            ydoc
        );

        // Connection status listeners
        wsProvider.on('status', ({ status }) => {
            console.log('Yjs connection status:', status);
            setConnectionStatus(status);
        });

        wsProvider.on('sync', (isSynced) => {
            console.log('Yjs synced:', isSynced);
        });

        setProvider(wsProvider);
        
        return () => {
            console.log('Cleaning up Yjs connection');
            wsProvider?.destroy();
            ydoc.destroy();
        };
    }, [ydoc, meetingId]);

    // Manage editor binding lifetime
    useEffect(() => {
        if (provider === null || editor === null) {
            return;
        }
        
        console.log('Setting up Monaco binding with Yjs');
        
        const ytext = ydoc.getText('monaco');
        const monacoBinding = new MonacoBinding(
            ytext,
            editor.getModel(), 
            new Set([editor]), 
            provider.awareness
        );
        
        setBinding(monacoBinding);
        
        return () => {
            monacoBinding.destroy();
        };
    }, [ydoc, provider, editor]);

    function handleChangeCode(value) {
        setCode(value);
    }

    function handleSubmitCode() {
        if (!code.trim()) {
            alert('Please write some code before submitting!');
            return;
        }
        
        // Call the parent component's onSubmit function
        if (onSubmit) {
            onSubmit(code, selectedOption.language);
        }
    }

    // Get status color
    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'connected':
                return 'bg-green-500';
            case 'connecting':
                return 'bg-yellow-500';
            default:
                return 'bg-red-500';
        }
    };

    const getStatusText = () => {
        switch (connectionStatus) {
            case 'connected':
                return 'Synced';
            case 'connecting':
                return 'Connecting...';
            default:
                return 'Disconnected';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className='flex justify-between items-center mb-4'>
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-gray-900">Code Editor</h2>
                    {/* Connection Status Indicator */}
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}></div>
                        <span className="text-sm text-gray-600">{getStatusText()}</span>
                    </div>
                </div>
                <div className='flex items-center gap-4'>
                    <LanguageOptions 
                        setSelectedOption={setSelectedOption} 
                        selectedOption={selectedOption.language} 
                    />
                    <button 
                        onClick={handleSubmitCode} 
                        disabled={loading}
                        className='font-semibold text-lg rounded-lg bg-green-600 hover:bg-green-700 text-white px-6 py-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'>
                        {loading ? 'Evaluating...' : 'Submit Code'}
                    </button>
                </div>
            </div>
            
            {connectionStatus !== 'connected' && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                        ⚠️ Collaborative editing is {connectionStatus}. Changes may not sync in real-time.
                    </p>
                </div>
            )}
            
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                <Editor 
                    height="70vh" 
                    defaultValue="// Write your solution here
// This editor syncs in real-time with other participants!

function solution() {
    // Your code here
}
" 
                    defaultLanguage="javascript"
                    onMount={editor => { 
                        setEditor(editor);
                        console.log('Monaco editor mounted');
                    }}
                    onChange={handleChangeCode}
                    language={selectedOption.language}
                    theme='vs-dark'
                    options={{
                        minimap: { enabled: true },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        wordWrap: 'on',
                        cursorBlinking: 'smooth',
                    }}
                />
            </div>
            
            <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <p className="flex items-start gap-2">
                    <span className="text-lg">💡</span>
                    <span>
                        <strong>Collaborative Editing Enabled:</strong> Everyone in the room can see and edit the code in real-time. 
                        {connectionStatus === 'connected' && ' All changes are synced!'}
                    </span>
                </p>
            </div>
        </div>
    );
}

export default MonacoCodeEditor;