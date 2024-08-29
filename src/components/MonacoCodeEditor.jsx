import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import Editor from '@monaco-editor/react';
import { useEffect, useMemo, useState } from 'react';
import LanguageOptions from './LanguageOptions';

function MonacoCodeEditor() {
    const [selectedOption, setSelectedOption] = useState({
        language: 'javascript',
        id: 63
    });
    const [code, setCode] = useState("");
    const ydoc = useMemo(
        () => new Y.Doc(), []);
    const [editor, setEditor] = useState(null);
    const [provider, setProvider] = useState(null);
    const [binding, setBinding] = useState(null);
    // this effect manages the lifetime of the Yjs document and the provider
    useEffect(() => {
        const provider = new WebsocketProvider('ws://localhost:5173', 'monaco-react-2', ydoc);
        setProvider(provider);
        console.log({ provider });
        return () => {
            provider?.destroy()
            ydoc.destroy()
        }
    }, [ydoc]);

    // this effect manages the lifetime of the editor binding
    useEffect(() => {
        if (provider === null || editor === null) {
            return;
        }
        console.log('reached', provider);
        const binding = new MonacoBinding(ydoc.getText(), editor.getModel(), new Set([editor]), provider.awareness)
        console.log({
            'getText': ydoc.getText(),
            'getModel': editor.getModel(),
            'awarness': provider.awareness,
            binding
        });

        setBinding(binding)
        return () => {
            binding.destroy()
        }
    }, [ydoc, provider, editor]);
    function handleChangeCode(value) {
        setCode(value);
    }
    async function handleSubmitCode() {
        const formData = {
            language_id: selectedOption.id,
            source_code: btoa(code),
            stdin: btoa("rahulc"),
        }
        const url = `${import.meta.env.VITE_RAPID_API_URL}?fields=*`;
        const options = {
            method: 'POST',
            body: JSON.stringify(formData),
            headers: {
                'x-rapidapi-key': import.meta.env.VITE_RAPID_API_KEY,
                'x-rapidapi-host': import.meta.env.VITE_RAPID_API_HOST,
                'Content-Type': 'application/json'
            },
            credentials :'include',
        };

        // fetch(process.env.REACT_APP_RAPID_API_URL,option).then((res) => {
        //     console.log(res.data);
        // });
        try {
            const response = await fetch(url, options);
            const result = await response.json();
            console.log(result);
            await checkStatus(result.token)
        } catch (error) {
            console.error(error);
        }
    }
    async function checkStatus(token) {
        const url = `${import.meta.env.VITE_RAPID_API_URL}/${token}?base64_encoded=true&fields=*`;
        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': import.meta.env.VITE_RAPID_API_KEY,
                'x-rapidapi-host': import.meta.env.VITE_RAPID_API_HOST,
            },
            credentials :'include'
        };

        try {
            const response = await fetch(url, options);
            const result = await response.json();
            console.log(result);
            const statusCode = result.status?.id;
            console.log(statusCode);
        } catch (error) {
            console.error(error);
        }
    }
    return (
        <div>
            <LanguageOptions setSelectedOption={setSelectedOption} selectedOption={selectedOption.language} />
            <Editor height="90vh" defaultValue="// some comment" defaultLanguage="javascript"
                onMount={editor => { setEditor(editor) }}
                onChange={handleChangeCode}
                language={selectedOption.language}
                theme='vs-dark'
            />
            <button onClick={handleSubmitCode}>Submit Code</button>
        </div>
    );
}

export default MonacoCodeEditor;