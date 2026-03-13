async function paraphrase(){

const text = document.getElementById("inputText").value;

if(!text) return;

const chatBox = document.getElementById("chatBox");

/* user message */

chatBox.innerHTML += `
<div class="message user">${text}</div>
`;

document.getElementById("inputText").value="";

/* typing animation */

const typingId="typing"+Date.now();

chatBox.innerHTML+=`
<div class="message ai" id="${typingId}">
AI sedang mengetik...
</div>
`;

chatBox.scrollTop=chatBox.scrollHeight;

/* request API */

const response = await fetch("/paraphrase",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({text})

});

const data = await response.json();

const resultText = data.result;

/* remove typing */

document.getElementById(typingId).remove();

/* highlight */

const highlighted = highlightChanges(text,resultText);

/* show result */

chatBox.innerHTML+=`

<div class="message ai">

${highlighted}

<br><br>

<button onclick="copyText(\`${resultText}\`)">Copy</button>

</div>

`;

chatBox.scrollTop=chatBox.scrollHeight;

}

/* highlight perubahan */

function highlightChanges(original, paraphrased){

const originalWords=original.split(" ");
const newWords=paraphrased.split(" ");

let resultHTML="";

newWords.forEach(word=>{

if(!originalWords.includes(word)){
resultHTML+=`<span class="changed">${word}</span> `;
}else{
resultHTML+=word+" ";
}

});

return resultHTML;

}

/* copy */

function copyText(text){

navigator.clipboard.writeText(text);

alert("Teks berhasil dicopy");

}