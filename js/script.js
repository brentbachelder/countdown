// Variables
var currentWord = '';
var goodWord = false;
// [Total Letters, Vowels, Consonants]
var letterCount = [0, 0, 0];
// Timer for auto-choose letter
var timer;
// Consonants based on scrabble tiles
var consonants = ['b', 'b', 'c', 'c', 'd', 'd', 'd', 'd', 'f', 'f', 'g', 'g', 'g', 'h', 'h', 'j', 'k', 'l', 'l', 'l', 'l', 'm', 'm', 'n', 'n', 'n', 'n', 'n', 'n',
    'p', 'p', 'q', 'r', 'r', 'r', 'r', 'r', 'r', 's', 's', 's', 's', 't', 't', 't', 't', 't', 't', 'v', 'v', 'w', 'w', 'x', 'y', 'y', 'z'];
// Vowels based on scrabble tiles
var vowels = ['a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'i', 'i', 'i', 'i', 'i', 'i', 'i', 'i',
    'i', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'u', 'u', 'u', 'u'];

// Player chooses either vowel or consonant
function ChooseLetter(isVowel = false) {
    var chosenLetter;

    if(isVowel) chosenLetter = ChooseVowel();
    else chosenLetter = ChooseConsonant();
    letterCount[0] += 1;

    var newLetterElement = document.createElement("div");
    newLetterElement.classList.add("box", "draggable");
    newLetterElement.draggable = "true";
    newLetterElement.innerHTML = chosenLetter.toUpperCase();
    document.getElementById("chosen-letters").append(newLetterElement);
    if(letterCount[0] == 9) GameStart();
    else if(letterCount[0] >= 1) ShowLetterTimer();
}

function ChooseVowel() {
    var chosenLetter = vowels[Math.floor(Math.random() * vowels.length)];
    letterCount[1] += 1;
    if(letterCount[1] == 5) document.getElementById("vowel-button").disabled = "true";
    return chosenLetter;
}

function ChooseConsonant() {
    var chosenLetter = consonants[Math.floor(Math.random() * consonants.length)];
    letterCount[2] += 1;
    if(letterCount[2] == 6) document.getElementById("consonant-button").disabled = "true";
    return chosenLetter;
}

function ShowLetterTimer() {
    document.getElementById("info-box").innerHTML = "Choose Next Letter";
    document.getElementById("timer").innerHTML = 3;
    clearInterval(timer);
    CountdownTimer(3);
}

function CountdownTimer(time, gameStart = false) {
    var timeLeft = time;
    timer = setInterval(function function1() {
        timeLeft -= 1;
        if (timeLeft <= 0) {
            clearInterval(timer);
            if(!gameStart) ComputerChoosesLetter();
            else GameEnd();
        }
        else document.getElementById("timer").innerHTML = timeLeft;
    }, 1000);
}

function ComputerChoosesLetter() {
    if(letterCount[1] >= 5) ChooseLetter();
    else if(letterCount[2] >= 6) ChooseLetter(true);
    else {
        var random = Math.round(Math.random());
        if(random == 0) ChooseLetter();
        else ChooseLetter(true);
    }
}

function UpdateWord() {
    // We're putting the current selected letters (the top row) into a word
    const letters = document.getElementById("chosen-word").getElementsByClassName("draggable");
    currentWord = '';
    for(var i = 0; i < letters.length; i++) currentWord += letters[i].innerHTML;
    console.log(currentWord);
}

function LookupWord(word) {
    // Send the selected word to the dictionary API to see if it exists
    const url = "https://api.dictionaryapi.dev/api/v2/entries/en/" + word;

    var request = new XMLHttpRequest();  
    request.open('GET', url, true);
    request.onreadystatechange = function(){
        if (request.readyState === 4){
            if (request.status === 404) {  
                goodWord = false;
            }
            else goodWord = true;
        }
    };
    request.send();
}

function GameEnd() {
    document.getElementById("timer").innerHTML = '0';
    LookupWord(currentWord.toLowerCase());
    setTimeout(() => {
        document.getElementById("timer").innerHTML = '';
        if(goodWord) document.getElementById("info-box").innerHTML = `Your word "${currentWord.toUpperCase()}" is a word!<br />YOU GET ${currentWord.length} POINTS`;
        else document.getElementById("info-box").innerHTML = `Your word "${currentWord.toUpperCase()}" is not a word!<br /><b>YOU GET 0 POINTS`;
      }, 500);
    
    
}

function GameStart() {
    document.getElementById("info-box").innerHTML = "COUNTDOWN!";
    document.getElementById("timer").innerHTML = 30;
    clearInterval(timer);
    CountdownTimer(30, true);
    
    // Disable the buttons
    var buttons = document.getElementsByTagName("button");
    for(var i = 0; i < buttons.length; i++) buttons[i].disabled = "true";

    // Get all the draggable elements and the drag containers
    const draggables = document.querySelectorAll(".draggable");
    const containers = document.querySelectorAll(".drag-container");

    // Set the letters to be draggable
    draggables.forEach(element => {
        // Add a drag start listener to change it's look when being dragged
        element.addEventListener("dragstart", () => {
            element.classList.add("dragging");
        });
        // Then remove the look when drag stops
        element.addEventListener("dragend", () => {
            element.classList.remove("dragging");
            UpdateWord();
        });
    });
    
    // Set the containers to be able to be dragged to
    containers.forEach(container => {
        container.addEventListener("dragover", event => {
            // This will change the cursor from the 'not allowed' icon to 'drop'
            // because by default, dropping inside of an element is disabled
            event.preventDefault();
            // Call our function to get the closest element to our dragging element
            // (clientY is the y position of our mouse [the event])
            const closestElement = getDragAfterElement(container, event.clientX);
            // Next, we're going to get the element thats being dragged
            // (since only one element will have the 'dragging' class)
            const draggable = document.querySelector(".dragging");
            // If closest element is null (meaning we're below all the elements), just append it to the container
            if(closestElement == null) {
                container.appendChild(draggable);
            }
            // Otherwise, put the dragging container above the closest element
            else {
                container.insertBefore(draggable, closestElement);
            }        
        });
    });
}

function getDragAfterElement(container, x) {
    // Get all the elements currently inside the container that we're hovering
    // over, but ignore the one that we're dragging
    // Also, querySelectorAll does not make an array, so by putting the [... ], we 
    // can spread it out and put all the elements into an array called draggableElements
    const draggableElements = [...container.querySelectorAll(".draggable:not(.dragging)")];
    // Now we need to reduce the results down to the single element that is closest
    // to the y position of our dragging element and return its element.
    return draggableElements.reduce((closest, child) => {
        // Get the position of the current draggable element
        const box = child.getBoundingClientRect();
        // Get the difference between our mouse and the center of the box (top + 1/2 of height)
        const mouseDifference = x - box.left - box.width / 2;
        // When we're above an element, the difference is negative. When we're below, the
        // number is positive. We only care about the negative, so we know which element to put
        // it above. We also want to get the closest element (the one closest to 0)
        if(mouseDifference < 0 && mouseDifference > closest.mouseDifference) return { mouseDifference: mouseDifference, element: child };
        // if the previous closest element is still the closest, return it back
        else return closest;
        // We need to set our initial mouseDifference as the lowest number possible, so that any other
        // element will guarenteed be closer than the initial.
    }, { mouseDifference: Number.NEGATIVE_INFINITY }).element;
}

function ResetGame() {
    
}