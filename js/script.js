const noteArea = document.querySelector(".noteArea");   // This is a div set to contenteditable
noteArea.setAttribute("data-font-size", '2');           // set default font size

const verbose = false;

// if up, up, down, down is pressed, clear local storage
var konami = [38, 38, 40, 40];
cheatCode(konami, clearData);

function cheatCode(cheat, callback) {
    var cheat_index = 0;

    document.addEventListener('keydown', function (e) {
        if (e.keyCode == cheat[cheat_index]) {
            cheat_index++;
            if (cheat_index == cheat.length) {
                cheat_index = 0;

                callback();
            }
        } else {
            cheat_index = 0;
        }
    });
}

function clearData() {
    // set data-font-size attribute to default
    noteArea.setAttribute("data-font-size", '2');
    // clear local storage
    localStorage.clear();
    // refresh the page
    location.reload();
}

if (localStorage.getItem("note")) {
    noteArea.innerHTML = localStorage.getItem("note");

    // check for saved font size
    if (localStorage.getItem("fontSize"))
    {
        noteArea.setAttribute("data-font-size", localStorage.getItem("fontSize"));
        noteArea.style.fontSize = `${localStorage.getItem("fontSize")}rem`;
    }

    emptyCheck();
}

// Note: the data-font-size thing was intended to make spans with different font sizes, but it didn't work out so it's just hanging around for now. Either it'll be made to work at some point, or it'll just be left alone.

// on mousewheel, change font size
noteArea.addEventListener("wheel", (e) => {
    if (e.ctrlKey) {
        e.preventDefault();

        // check for selected text
        let selectedText = getSelectionText();

        let fontSize;

        if (selectedText.length === 0) {
            // if no text is selected, change font size relative to the whole note
            // get current font size
            fontSize = parseFloat(noteArea.getAttribute("data-font-size"));

            // get scroll direction
            let direction = (e.deltaY < 0) ? 1 : -1;

            console.log(`Scrolling ${direction === 1 ? "up" : "down"}`)

            console.log(`Current font size: ${fontSize}`)
            // change font size
            fontSize += (direction * 0.1);
            fontSize = parseFloat(fontSize.toFixed(1));
            console.log(`New font size: ${fontSize}`)

            // if font size is too small, set it to 1
            fontSize = (fontSize < 1) ? 1 : fontSize;

            noteArea.style.fontSize = `${fontSize}rem`;
            // set data-font-size attribute
            noteArea.setAttribute("data-font-size", fontSize);
            
            // save font size to local storage
            localStorage.setItem("fontSize", fontSize);
        }
        else if (1 == 2) // yarr, this be broken
        {
            // CURRENTLY BROKEN

            // resize the .selected span
            let selectedSpan = document.querySelector(".selected");
            let currentFontSize = 1;

            // if selectedSpan, replace it with its text
            if (selectedSpan) {
                let selectedSpanText = selectedSpan.innerText;
                console.log(`Selected span: ${selectedSpanText}`)

                currentFontSize = parseFloat(selectedSpan.style.fontSize);
                selectedSpan.outerHTML = selectedSpanText;
            }
            else
            {
                currentFontSize = parseFloat(noteArea.getAttribute("data-font-size"));
            }

            let selection = window.getSelection();
            let range = selection.getRangeAt(0);
            let span = document.createElement("span");
            // set font size to the current font size
            span.style.fontSize = `${currentFontSize}rem`;
            range.surroundContents(span);
            selectedSpan = span;
  
            console.log(`Current font size: ${currentFontSize}`)
            let direction = (e.deltaY < 0) ? 1 : -1;
            currentFontSize += (direction * 0.1);
            currentFontSize = parseFloat(currentFontSize.toFixed(1));
            currentFontSize = (currentFontSize < 1) ? 1 : currentFontSize;
            selectedSpan.style.fontSize = `${currentFontSize}rem`;

            // set data-font-size attribute
            selectedSpan.setAttribute("data-font-size", currentFontSize);
        }

    }
});

// if you click on a span, select it
noteArea.addEventListener("click", (e) => {
    if (e.target.tagName === "SPAN") {
        let range = document.createRange();
        range.selectNode(e.target);
        let selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        // mark the span as selected
        e.target.classList.add("selected");
    }
});


function getSelectionText() {
    // Thanks to https://stackoverflow.com/a/5379408, slightly modified
    var text = "";
    if (window.getSelection)
        text = window.getSelection().toString();
    else if (document.selection && document.selection.type != "Control")
        text = document.selection.createRange().text;
    return text;
}

// when the text is updated, save the note to local storage
noteArea.addEventListener("input", () => {
    emptyCheck();
    localStorage.setItem("note", noteArea.innerHTML);
    localStorage.setItem("fontSize", noteArea.getAttribute("data-font-size"));
});

emptyCheck();

function emptyCheck() {
    let brRegex = /<br>/;

    let note = noteArea.innerHTML;
    if (brRegex.test(note))
        noteArea.innerHTML.replace(brRegex, "");

    // any blockquotes that only contain a <br> should be replaced with an empty string
    let bqRegex = /<blockquote style=".*"><br><\/blockquote>/;
    let bqEmRegex = /<blockquote style=".*"><br><\/em><\/blockquote>/;
    if (bqRegex.test(note) || bqEmRegex.test(note))
    {
        console.log("Found empty blockquote");

        // regex replace the blockquote with an empty string
        noteArea.innerHTML = noteArea.innerHTML.replace(bqRegex, "<div><br></div>");
        noteArea.innerHTML = noteArea.innerHTML.replace(bqEmRegex, "<div><br></div>");
    }
    
    // if the note is empty, show the placeholder
    noteArea.classList.toggle("empty", noteArea.innerHTML.length === 0);    
}