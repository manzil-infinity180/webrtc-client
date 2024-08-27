import { UnControlled as CodeMirror } from "react-codemirror2";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/javascript-hint";
import "codemirror/addon/fold/foldgutter.css";
import "codemirror/addon/fold/foldgutter";
import "codemirror/addon/fold/brace-fold";
import './codeEditorImport';
import { useState } from "react";
function MyEditor() {
    const [theme, setTheme] = useState("default");
 
    return (
        <>
            {/* <textarea id="code" name="code">
            </textarea> */}
            <select id="select" onChange={(e) => setTheme(e.target.value)} defaultValue={theme} value={theme}>
                <option selected="">default</option>
                <option>3024-day</option>
                <option>3024-night</option>
                <option>abbott</option>
                <option>abcdef</option>
                <option>ambiance</option>
                <option>ayu-dark</option>
                <option>ayu-mirage</option>
                <option>base16-dark</option>
                <option>base16-light</option>
                <option>bespin</option>
                <option>blackboard</option>
                <option>cobalt</option>
                <option>colorforth</option>
                <option>darcula</option>
                <option>dracula</option>
                <option>duotone-dark</option>
                <option>duotone-light</option>
                <option>eclipse</option>
                <option>elegant</option>
                <option>erlang-dark</option>
                <option>gruvbox-dark</option>
                <option>hopscotch</option>
                <option>icecoder</option>
                <option>idea</option>
                <option>isotope</option>
                <option>juejin</option>
                <option>lesser-dark</option>
                <option>liquibyte</option>
                <option>lucario</option>
                <option>material</option>
                <option>material-darker</option>
                <option>material-palenight</option>
                <option>material-ocean</option>
                <option>mbo</option>
                <option>mdn-like</option>
                <option>midnight</option>
                <option>monokai</option>
                <option>moxer</option>
                <option>neat</option>
                <option>neo</option>
                <option>night</option>
                <option>nord</option>
                <option>oceanic-next</option>
                <option>panda-syntax</option>
                <option>paraiso-dark</option>
                <option>paraiso-light</option>
                <option>pastel-on-dark</option>
                <option>railscasts</option>
                <option>rubyblue</option>
                <option>seti</option>
                <option>shadowfox</option>
                <option>solarized dark</option>
                <option>solarized light</option>
                <option>the-matrix</option>
                <option>tomorrow-night-bright</option>
                <option>tomorrow-night-eighties</option>
                <option>ttcn</option>
                <option>twilight</option>
                <option>vibrant-ink</option>
                <option>xq-dark</option>
                <option>xq-light</option>
                <option>yeti</option>
                <option>yonce</option>
                <option>zenburn</option>
            </select>
            <CodeMirror
                options={{
                    lineNumbers: true,
                    mode: { name: 'javascript', json: true },
                    extraKeys: { "Ctrl-Space": "autocomplete" },
                    foldGutter: true,
                    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                    theme: theme
                }}
            />
        </>
    );
}

export default MyEditor;