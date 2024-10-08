import {supportedLanguage} from '../utils/supportedLang'

function LanguageOptions({setSelectedOption, selectedOption}) {
    
    function handleLanguage(e){
        const id = e.target[e.target.selectedIndex].getAttribute('data-id');
        setSelectedOption({
            language: e.target.value,
            id
        });
        // console.log(e.target[e.target.selectedIndex].getAttribute('data-id'));
        
        
    }
    return (
        <div>
            <select onChange={handleLanguage} value={selectedOption} className="mt-4 font-mono text-md rounded bg-blue-200 py-2 border outline-none px-4 mx-2">
                {
                    supportedLanguage.map((el) => (
                        <option data-id={el.id} value={el.value} key={el.id}>{el.value}</option>
                    ))
                }
            </select>
        </div>
    );
}

export default LanguageOptions;