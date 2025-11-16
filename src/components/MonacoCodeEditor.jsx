import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import Editor from '@monaco-editor/react';
import { useEffect, useMemo, useState } from 'react';
import LanguageOptions from './LanguageOptions';

function MonacoCodeEditor({ onSubmit, loading }) {
    const [selectedOption, setSelectedOption] = useState({
        language: 'javascript',
        id: 63
    });
    const [code, setCode] = useState("");
    const ydoc = useMemo(() => new Y.Doc(), []);
    const [editor, setEditor] = useState(null);
    const [provider, setProvider] = useState(null);
    const [binding, setBinding] = useState(null);

    // Manage Yjs document and provider lifetime
    useEffect(() => {
        const wsProvider = new WebsocketProvider(
            'ws://localhost:5173', 
            'monaco-react-2', 
            ydoc
        );
        setProvider(wsProvider);
        
        return () => {
            wsProvider?.destroy();
            ydoc.destroy();
        };
    }, [ydoc]);

    // Manage editor binding lifetime
    useEffect(() => {
        if (provider === null || editor === null) {
            return;
        }
        
        const monacoBinding = new MonacoBinding(
            ydoc.getText(), 
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

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className='flex justify-between items-center mb-4'>
                <h2 className="text-xl font-semibold text-gray-900">Code Editor</h2>
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
            
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                <Editor 
                    height="70vh" 
                    defaultValue="// Write your solution here\n" 
                    defaultLanguage="javascript"
                    onMount={editor => { setEditor(editor) }}
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
                    }}
                />
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
                <p>💡 <strong>Tip:</strong> Write clean, well-commented code. Consider edge cases and optimize for both time and space complexity.</p>
            </div>
        </div>
    );
}

export default MonacoCodeEditor;