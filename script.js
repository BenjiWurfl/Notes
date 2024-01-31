import {initializeApp} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    getDoc,
    addDoc,
    deleteDoc,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import {getAuth, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBe7d9bllq8RnmI6xxEBk3oub3qogPT2aM",
    authDomain: "thinkwise-c7673.firebaseapp.com",
    databaseURL: "https://thinkwise-c7673-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "thinkwise-c7673",
    storageBucket: "thinkwise-c7673.appspot.com",
    messagingSenderId: "37732571551",
    appId: "1:37732571551:web:9b90a849ac5454f33a85aa",
    measurementId: "G-8957WM4SB7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
let notesArr = [];

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is signed in with UID:", user.uid);
        showNotes();
    } else {
        console.log("No user is signed in.");
    }
});

const notes = JSON.parse(localStorage.getItem('notes') || '[]');

function showNotes() {
    const user = auth.currentUser;
    if (user) {
        const notesRef = collection(db, "users", user.uid, "notes");
        getDocs(notesRef)
            .then(querySnapshot => {
                notesArr.length = 0;
                querySnapshot.forEach(doc => {
                    const noteData = doc.data();
                    let lastUpdated = noteData.lastUpdated.toDate();

                    const note = {id: doc.id, ...noteData, lastUpdated: lastUpdated};
                    console.log("Note Data2: ", note);
                    notesArr.push(note);
                });
                console.log("Funktionsaufruf 'updatePinnedItems'")
                updatePinnedItems();

            })
            .catch(error => {
                console.error("Error loading notes: ", error);
            });
    }
}

function updatePinnedItems() {
    const pinnedItemsContainer = document.querySelector('#nav-content');

    // Leere den Inhalt der Sidebar
    pinnedItemsContainer.innerHTML = '';

    console.log("Notes Array unsortiert: ", notesArr);
    // Sortiere notesArr nach lastUpdated in absteigender Reihenfolge
    notesArr = notesArr.slice().sort((a, b) => b.lastUpdated - a.lastUpdated);

    console.log("Notes Array sortiert: ", notesArr);
    // Durchlaufe alle Notizen und füge sie zur Sidebar hinzu
    notesArr.forEach((noteObj, index) => {
        console.log("Note Object: ", noteObj)
        const pinnedItem = document.createElement('div');
        pinnedItem.classList.add('nav-button');
        pinnedItem.dataset.noteId = noteObj.id;

        pinnedItem.innerHTML = `<i class="fas fa-thumbtack"></i><span>${noteObj.title}</span>`;

        console.log("Element: ", pinnedItem)

        // Füge einen Klick-Eventlistener hinzu, um die Notiz zu öffnen oder bearbeiten
        pinnedItem.addEventListener('click', () => {
            // Hier kannst du die Logik hinzufügen, um die Notiz zu öffnen oder zu bearbeiten
            console.log('Pinned item clicked:', noteObj.id, noteObj.title, noteObj.body);

            document.getElementById('title').innerHTML = noteObj.title;
            document.getElementById('title').dataset.noteId = noteObj.id;
            document.getElementById('text-content').innerHTML = noteObj.body;
            document.getElementById('text-content').dataset.noteId = noteObj.id;
            let options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
            let noteDate = noteObj.lastUpdated.toLocaleDateString("en-us", options)
            document.getElementById('last-updated').innerHTML = noteDate;

            document.getElementById('text-content').focus()
        });

        pinnedItemsContainer.appendChild(pinnedItem);
    });
}

function deleteNote(noteId) {
    let confirmDelete = confirm("Are you sure you want to delete this note?");
    if (!confirmDelete) return;
    notes.splice(noteId, 1);
    localStorage.setItem('notes', JSON.stringify(notes));
    showNotes();
}

document.querySelector('.nav-button-addNote').addEventListener('click', () => {
    let noteTitle = "Enter Title";
    let noteDesc = "";
    let dateEl = new Date()

    const newNote = {
        title: noteTitle,
        body: noteDesc,
        lastUpdated: dateEl
    }
    addNoteToFirestore(newNote);
});

function addNoteToFirestore(newNote) {
    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to add events.");
        return;
    }

    const notesRef = collection(db, "users", user.uid, "notes");
    console.log(notesRef);
    console.log(user.uid);
    addDoc(notesRef, newNote).then(docRef => {
        console.log("Added note with ID: ", docRef.id);
        newNote.id = docRef.id;
        notesArr.push(newNote);
        updatePinnedItems();
    }).catch(error => {
        console.error("Error adding event: ", error);
    });

    //addEventWrapper.classList.remove("active");
}


// Event Listener für Toolbar
document.getElementById('undoBtn').addEventListener('click', () => formatDoc('undo', null));
document.getElementById('redoBtn').addEventListener('click', () => formatDoc('redo', null));
document.getElementById('boldBtn').addEventListener('click', () => formatDoc('bold', null));
document.getElementById('underlineBtn').addEventListener('click', () => formatDoc('underline', null));
document.getElementById('italicBtn').addEventListener('click', () => formatDoc('italic', null));
document.getElementById('strikeBtn').addEventListener('click', () => formatDoc('strikeThrough', null));
document.getElementById('leftAlignBtn').addEventListener('click', () => formatDoc('justifyLeft', null));
document.getElementById('centerAlignBtn').addEventListener('click', () => formatDoc('justifyCenter', null));
document.getElementById('rightAlignBtn').addEventListener('click', () => formatDoc('justifyRight', null));
document.getElementById('justifyBtn').addEventListener('click', () => formatDoc('justifyFull', null));
document.getElementById('orderedListBtn').addEventListener('click', () => formatDoc('insertOrderedList', null));
document.getElementById('unorderedListBtn').addEventListener('click', () => formatDoc('insertUnorderedList', null));
document.getElementById('linkBtn').addEventListener('click', addLink);
document.getElementById('unlinkBtn').addEventListener('click', () => formatDoc('unlink', null));

document.getElementById('copy').addEventListener('click', function (event) {
    event.preventDefault();
    document.execCommand('copy', false, null);
});

document.getElementById('title').addEventListener('input', function () {
    const noteId = this.dataset.noteId;
    const note = notesArr.find((note) => note.id === noteId);
    if (note) {
        note.title = this.innerHTML; // Hier musst du vielleicht anpassen, je nachdem, wie der Inhalt des divs dargestellt wird
    }
    const indexToRemove = notesArr.findIndex((note) => note.id === noteId);
    if (indexToRemove !== -1) {
        notesArr.splice(indexToRemove, 1);
    }
    note.lastUpdated = new Date();
    notesArr.push(note);
    updatePinnedItems();
    updateNoteToFirestore(noteId, note);
});

document.getElementById('text-content').addEventListener('input', function () {
    const noteId = this.dataset.noteId;
    const note = notesArr.find((note) => note.id === noteId);
    if (note) {
        note.body = this.innerHTML; // Hier musst du vielleicht anpassen, je nachdem, wie der Inhalt des divs dargestellt wird
    }
    const indexToRemove = notesArr.findIndex((note) => note.id === noteId);
    if (indexToRemove !== -1) {
        notesArr.splice(indexToRemove, 1);
    }
    note.lastUpdated = new Date();
    notesArr.push(note);
    updateNoteToFirestore(noteId, note);
});


function updateNoteToFirestore(noteId, updatedNote) {
    const user = auth.currentUser;
    if (user) {
        const noteRef = doc(db, "users", user.uid, "notes", noteId);
        updateDoc(noteRef, updatedNote)
            .then(() => {
                console.log("Note updated in Firestore");
            })
            .catch((error) => {
                console.error("Error updating note in Firestore: ", error);
            });
    }
}


// Event-Listener für Format
document.getElementById('formatSelect').addEventListener('change', function () {
    formatDoc('formatBlock', this.value);
});

// Event-Listener für Font Size
document.getElementById('fontSizeSelect').addEventListener('change', function () {
    formatDoc('fontSize', this.value);
});

// Event-Listener für Color
document.getElementById('foreColorInput').addEventListener('input', function () {
    formatDoc('foreColor', this.value);
    this.value = '#000000';
});

// Event-Listener für Background
document.getElementById('hiliteColorInput').addEventListener('input', function () {
    formatDoc('hiliteColor', this.value);
    this.value = '#000000';
});

function addLink() {
    const url = prompt('Insert url');
    formatDoc('createLink', url);
}

function formatDoc(cmd, value = null) {
    console.log("formatCodeEntry")
    document.execCommand(cmd, false, value);
}

const contextMenu = document.querySelector(".wrapper");
//const shareMenu = contextMenu.querySelector(".share-menu");

window.addEventListener("contextmenu", e => {
    e.preventDefault();
    let x = e.offsetX, y = e.offsetY,
        winWidth = window.innerWidth,
        winHeight = window.innerHeight,
        cmWidth = contextMenu.offsetWidth,
        cmHeight = contextMenu.offsetHeight;

    x = x > winWidth - cmWidth ? winWidth - cmWidth - 5 : x;
    y = y > winHeight - cmHeight ? winHeight - cmHeight - 5 : y;

    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenu.style.visibility = "visible";
});

document.addEventListener("click", () => contextMenu.style.visibility = "hidden");
