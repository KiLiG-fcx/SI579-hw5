/**
 * Returns a list of objects grouped by some property. For example:
 * groupBy([{name: 'Steve', team:'blue'}, {name: 'Jack', team: 'red'}, {name: 'Carol', team: 'blue'}], 'team')
 *
 * returns:
 * { 'blue': [{name: 'Steve', team: 'blue'}, {name: 'Carol', team: 'blue'}],
 *    'red': [{name: 'Jack', team: 'red'}]
 * }
 *
 * @param {any[]} objects: An array of objects
 * @param {string|Function} property: A property to group objects by
 * @returns  An object where the keys representing group names and the values are the items in objects that are in that group
 */
 function groupBy(objects, property) {
    // If property is not a function, convert it to a function that accepts one argument (an object) and returns that object's
    // value for property (obj[property])
    if(typeof property !== 'function') {
        const propName = property;
        property = (obj) => obj[propName];
    }

    const groupedObjects = new Map(); // Keys: group names, value: list of items in that group
    for(const object of objects) {
        const groupName = property(object);
        //Make sure that the group exists
        if(!groupedObjects.has(groupName)) {
            groupedObjects.set(groupName, []);
        }
        groupedObjects.get(groupName).push(object);
    }

    // Create an object with the results. Sort the keys so that they are in a sensible "order"
    const result = {};
    for(const key of Array.from(groupedObjects.keys()).sort()) {
        result[key] = groupedObjects.get(key);
    }
    return result;
}

// Initialize DOM elements that will be used.
const outputDescription = document.querySelector('#output_description');
const wordOutput = document.querySelector('#word_output');
const showRhymesButton = document.querySelector('#show_rhymes');
const showSynonymsButton= document.querySelector('#show_synonyms');
const wordInput = document.querySelector('#word_input');
const savedWords = document.querySelector('#saved_words');

// Stores saved words.
const savedWordsArray = [];

/**
 * Makes a request to Datamuse and updates the page with the
 * results.
 * 
 * Use the getDatamuseRhymeUrl()/getDatamuseSimilarToUrl() functions to make
 * calling a given endpoint easier:
 * - RHYME: `datamuseRequest(getDatamuseRhymeUrl(), () => { <your callback> })
 * - SIMILAR TO: `datamuseRequest(getDatamuseRhymeUrl(), () => { <your callback> })
 *
 * @param {String} url
 *   The URL being fetched.
 * @param {Function} callback
 *   A function that updates the page.
 */
function datamuseRequest(url, callback) {
    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            // This invokes the callback that updates the page.
            callback(data);
        }, (err) => {
            console.error(err);
        });
}

/**
 * Gets a URL to fetch rhymes from Datamuse
 *
 * @param {string} rel_rhy
 *   The word to be rhymed with.
 *
 * @returns {string}
 *   The Datamuse request URL.
 */
function getDatamuseRhymeUrl(rel_rhy) {
    return `https://api.datamuse.com/words?${(new URLSearchParams({'rel_rhy': wordInput.value})).toString()}`;
}

/**
 * Gets a URL to fetch 'similar to' from Datamuse.
 *
 * @param {string} ml
 *   The word to find similar words for.
 *
 * @returns {string}
 *   The Datamuse request URL.
 */
function getDatamuseSimilarToUrl(ml) {
    return `https://api.datamuse.com/words?${(new URLSearchParams({'ml': wordInput.value})).toString()}`;
}

/**
 * Add a word to the saved words array and update the #saved_words `<span>`.
 *
 * @param {string} word
 *   The word to add.
 */
function addTosavedWords(word) {
    // You'll need to finish this...
    if (savedWordsArray.includes(word)) { // already in the saved array
        return
    }
    savedWordsArray.push(word);
    savedWords.textContent = savedWordsArray.join(', ');
}

// Add additional functions/callbacks here.
function savebtn(){ // create a new save button
    const savebtn = document.createElement('button');
    savebtn.textContent='(Save)';
    savebtn.className='btn-save';
    savebtn.style='background-color:green;color:white;box-shadow: 1px 1px;margin-left:5px';
    return savebtn
}

function addsavebtn(){ // add event listener to all save buttons
    const savebtns = document.getElementsByClassName('btn-save');
    for(let i=0;i<savebtns.length;i++){
        button=savebtns[i]
        button.addEventListener('click', function(e) {
            const lineword = e.target.parentElement.textContent;
            //console.log(lineword)
            word = lineword.substring(0, lineword.indexOf('('));
            addTosavedWords(word);
        });
    }
}

function updaterhyme(){
    outputDescription.textContent=`Words that rhyme with ${wordInput.value}:`
    wordOutput.innerHTML='<div id="pageload">...loading</div>';
    datamuseRequest(getDatamuseRhymeUrl(wordInput.value),(listofwords)=>{ // the callback function
        if(!listofwords.length){
            wordOutput.textContent='(no results)'
        }
        else{
            newwordlist=groupBy(listofwords,"numSyllables") // group by num of syllables
            for (let wordkey in newwordlist){
                wordOutput.innerHTML+="<h3>Syllables: "+wordkey+"</h3>"
                const syllablelist=document.createElement("ul") // ul for all word li of one syllable
                valuelist=newwordlist[wordkey]
                for (wordobj in valuelist){
                    const word=valuelist[wordobj]['word']
                    const newli=document.createElement('li')
                    newli.textContent=word
                    newli.appendChild(savebtn())
                    syllablelist.append(newli)
                }
                wordOutput.append(syllablelist)
            }
            addsavebtn();
        }
    })
    document.querySelector('#pageload').remove();
}

function updatesyn(){
    outputDescription.innerHTML=`Words with a similar meaning to ${wordInput.value}:`
    wordOutput.innerHTML='<div id="pageload">...loading</div>'
    datamuseRequest(getDatamuseSimilarToUrl(wordInput.value),(listofwords)=>{
        if(!listofwords.length){
            wordOutput.textContent='(no results)'
        }
        else{
            const synlist=document.createElement("ul")
            for (synword in listofwords){
                //console.log(synword)
                const word=listofwords[synword]['word']
                const newli=document.createElement("li")
                newli.textContent=word
                newli.appendChild(savebtn())
                synlist.append(newli)
            }
            wordOutput.append(synlist)
            addsavebtn()
        }
    })
    document.querySelector('#pageload').remove();
}

function nosavedword() {
    savedWords.textContent='(none)';
}
nosavedword();

// Add event listeners here.

showRhymesButton.addEventListener('click',()=>{
    updaterhyme();
})
wordInput.addEventListener('keyup',function(e){
    if(e.keyCode===13){
        updaterhyme();
    }
})
showSynonymsButton.addEventListener('click',updatesyn)
