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
let projectsArr = []

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
    notesArr.length = 0;
    projectsArr.length = 0;
    const user = auth.currentUser;
    if (user) {
        const notesRef = collection(db, "users", user.uid, "notes");
        const projectsRef = collection(db, "users", user.uid, "projects");
        getDocs(projectsRef)
            .then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    const projectData = doc.data();
                    let dueDate = projectData.dueDate.toDate()

                    const project = {id: doc.id, ...projectData, dueDate: dueDate};

                    projectsArr.push(project);
                    addProjectToNavbar(project);
                });
                //updatePinnedItems();
            })
            .catch(error => {
                console.error("Error loading projects: ", error);
            });
    }
}

function addProjectToNavbar(project) {
    const pinnedProjectsContainer = document.querySelector('#nav-content');

    const pinnedProject = document.createElement('a');
    pinnedProject.classList.add('nav-project');
    pinnedProject.dataset.projectID = project.id;
    let dueDate = project.dueDate.toLocaleDateString("en-us");
    let projectTitle = project.title;
    // Truncate the text content to 15 characters
    if (projectTitle.length > 15) {
        console.log(noteTitle.length);
        projectTitle = projectTitle.substring(0, 13) + '...';
    }
    console.log(projectTitle);

    pinnedProject.innerHTML = `<i class='bx bx-chevron-down dropdown'></i>
        <span id="projecttitle">${projectTitle}</span>
        <span id="last-updated">${dueDate}</span>`

    pinnedProject.onclick(function () {
        const subNotes = document.querySelector('.nav-sub-notes');
        subNotes.classList.toggle('show');
    });
    pinnedProjectsContainer.appendChild(pinnedProject);

    const user = auth.currentUser;
    if (user) {
        const notesRef = collection(db, "users", user.uid, "projects", project.id, "notes");
        getDocs(notesRef)
            .then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    const noteData = doc.data();
                    let lastUpdated = noteData.lastUpdated.toDate();

                    const note = {id: doc.id, ...noteData, lastUpdated: lastUpdated};

                    notesArr.push(note);

                    const pinnedNotesContainer = document.querySelector('.nav-sub-notes');
                    const pinnedNote = document.createElement('a');
                    pinnedNote.classList.add('sub-note');
                    pinnedNote.dataset.noteID = note.id;
                    lastUpdated = lastUpdated.toLocaleDateString("en-us");
                    let noteTitle = project.title;
                    // Truncate the text content to 15 characters
                    if (noteTitle.length > 12) {
                        console.log(noteTitle.length);
                        noteTitle = noteTitle.substring(0, 9) + '...';
                    }
                    console.log(noteTitle);

                    pinnedNote.innerHTML = noteTitle;

                    pinnedNotesContainer.appendChild(pinnedNote);

                });


            })
            .catch(error => {
                console.error("Error loading projects: ", error);
            });
    }
}

function updatePinnedItems() {
    const pinnedItemsContainer = document.querySelector('#nav-content');

    // Leere den Inhalt der Sidebar
    pinnedItemsContainer.innerHTML = '';

    // Sortiere notesArr nach lastUpdated in absteigender Reihenfolge
    notesArr = notesArr.slice().sort((a, b) => b.lastUpdated - a.lastUpdated);
    projectsArr = projectsArr.slice().sort((a, b) => b.dueDate - a.dueDate)

    // Durchlaufe alle Notizen und füge sie zur Sidebar hinzu
    notesArr.forEach((noteObj, index) => {
        const pinnedItem = document.createElement('div');
        pinnedItem.classList.add('nav-project');
        pinnedItem.dataset.noteId = noteObj.id;
        let options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
        let noteDate = noteObj.lastUpdated.toLocaleDateString("en-us");
        let noteTitle = noteObj.title;
        // Truncate the text content to 15 characters
        if (noteTitle.length > 15) {
            console.log(noteTitle.length);
            noteTitle = noteTitle.substring(0, 13) + '...';
        }

        console.log(noteTitle)

        pinnedItem.innerHTML = `<span>${noteTitle}</span><span id="last-updated">${noteDate}</span>`


        // Füge einen Klick-Eventlistener hinzu, um die Notiz zu öffnen oder bearbeiten
        pinnedItem.addEventListener('click', () => {
            // Hier kannst du die Logik hinzufügen, um die Notiz zu öffnen oder zu bearbeiten
            document.getElementById('title').innerHTML = noteObj.title;
            document.getElementById('title').dataset.noteId = noteObj.id;
            document.getElementById('text-content').innerHTML = noteObj.body;
            document.getElementById('text-content').dataset.noteId = noteObj.id;

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

document.querySelector('.nav-project-addNote').addEventListener('click', () => {
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
    addDoc(notesRef, newNote).then(docRef => {
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
