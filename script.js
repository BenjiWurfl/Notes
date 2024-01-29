import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, addDoc, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

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
const notesArr = [];

const wrapper = document.querySelector('.wrapper');
const addBox = document.querySelector('.nav-button-addNote');
const popupBox = document.querySelector('.popup-box'),
popupTitle = popupBox.querySelector('header p'),
closeIcon = document.querySelector('header i'),
titleEl = document.querySelector('input'),
descEl = document.querySelector('textarea'),
addBtn = document.querySelector('button');

onAuthStateChanged(auth, (user) => {
  if (user) {
      console.log("User is signed in with UID:", user.uid);
      showNotes();
  } else {
      console.log("No user is signed in.");
  }
});

const months= ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const notes = JSON.parse(localStorage.getItem('notes') || '[]');
let isUpdate = false, updateId;

function showNotes() {
    const user = auth.currentUser;
    if (user) {
      const notesRef = collection(db, "users", user.uid, "notes");
      getDocs(notesRef)
        .then(querySnapshot => {
          notesArr.length = 0;
          querySnapshot.forEach(doc => {
            const noteData = doc.data();
            let lastUpdated;
            // Überprüfen Sie, ob das Datum als Timestamp gespeichert ist
            if (noteData.date && noteData.date.seconds) {
              lastUpdated = new Date(noteData.date.seconds * 1000);
            } else if (noteData.date) {
              // Wenn das Datum im String-Format vorliegt
              lastUpdated = new Date(noteData.date);
            } else {
              // Standardwert, wenn kein Datum vorhanden ist
              lastUpdated = new Date();
            }
            const note = { id: doc.id, ...noteData, lastUpdated: lastUpdated };
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
    console.log("updatePinnedItems wird aufgerufen!");
    const pinnedItemsContainer = document.querySelector('#nav-content');
  
    // Leere den Inhalt der Sidebar
    pinnedItemsContainer.innerHTML = '';
  
    console.log("Notes Array: ", notesArr);
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

        });
  
        pinnedItemsContainer.appendChild(pinnedItem);
    });
}

function deleteNote(noteId) {
    let confirmDelete= confirm("Are you sure you want to delete this note?");
    if(!confirmDelete) return;
    notes.splice(noteId, 1);
    localStorage.setItem('notes', JSON.stringify(notes));
    showNotes();
}

addBox.addEventListener('click', ()=>{
    titleEl.focus();
    popupBox.classList.add('show')
});

closeIcon.addEventListener('click', ()=>{
    isUpdate = false;
    titleEl.value = '';
    descEl.value = '';
    addBtn.innerText = 'Add Note';
    popupTitle.innerText = 'Add a new Note';
    popupBox.classList.remove('show');
});

addBtn.addEventListener('click', (e)=>{
    e.preventDefault();

    let noteTitle = titleEl.value;
    let noteDesc = descEl.value;
    if (noteTitle || noteDesc) {
        let dateEl= new Date(),
        month = months[dateEl.getMonth()],
        day = dateEl.getDate(),
        year = dateEl.getFullYear();

        const newNote = {
            title: noteTitle,
            body: noteDesc,
            lastUpdated: `${month} ${day} ${year}`
        }
        
        if (!isUpdate) {
            notes.push(newNote);
        }else{
            isUpdate = false;
            notes[updateId] = newNote;
        }
        addNoteToFirestore(newNote);
        closeIcon.click();
    }
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

document.getElementById('title').addEventListener('input', function() {

        const note = this.dataset.noteId;

        console.log("update: ", note);
    
        // Entferne die alte Notiz aus dem Array
        const indexToRemove = notesArr.findIndex((note) => note);

        const newNote = notesArr[indexToRemove]

        newNote.title = this.value;

        console.log("This value: ", this.value);
        console.log("New item: ", newNote);

     if (indexToRemove !== -1) {
            notesArr.splice(indexToRemove, 1);
        }


    
        // Füge die aktualisierte Notiz zum Array hinzu
        notesArr.push(newNote);
    
        // Führe die Aktualisierung in Firestore durch
        updateNoteToFirestore(note, newNote);
    
});


function updateNoteToFirestore(noteId, updatedNote) {
    const user = auth.currentUser;

    if (!user) {
        alert("You must be logged in to update notes.");
        return;
    }

    const notesRef = collection(db, "users", user.uid, "notes");
    const noteDocRef = doc(notesRef, noteId);

    updateDoc(noteDocRef, updatedNote)
        .then(() => {
            console.log("Note updated successfully in Firestore");
            // Optional: Hier kannst du weitere Aktionen nach der Aktualisierung durchführen
        })
        .catch((error) => {
            console.error("Error updating note in Firestore: ", error);
        });
}


// Event-Listener für Format
document.getElementById('formatSelect').addEventListener('change', function() {
    formatDoc('formatBlock', this.value);
});

// Event-Listener für Font Size
document.getElementById('fontSizeSelect').addEventListener('change', function() {
    formatDoc('fontSize', this.value);
});

// Event-Listener für Color
document.getElementById('foreColorInput').addEventListener('input', function() {
    formatDoc('foreColor', this.value);
    this.value = '#000000';
});

// Event-Listener für Background
document.getElementById('hiliteColorInput').addEventListener('input', function() {
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
