import {initializeApp} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    getDoc,
    addDoc,
    deleteDoc,
    updateDoc,
    doc,
    Timestamp
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
let currentProject;



const notes = JSON.parse(localStorage.getItem('notes') || '[]');

function showNotes() {
    projectsArr.length = 0;
    const user = auth.currentUser;
    if (user) {
        const projectsRef = collection(db, "users", user.uid, "projects");
        getDocs(projectsRef)
            .then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    const projectData = doc.data();
                    let dueDate = projectData.dueDate.toDate();

                    const project = {id: doc.id, ...projectData, dueDate: dueDate};

                    projectsArr.push(project);
                });
                updatePinnedItems();
            })
            .catch(error => {
                console.error("Error loading projects: ", error);
            });
    }
}


onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is signed in with UID:", user.uid);
        showNotes();
    } else {
        console.log("No user is signed in.");
    }
});

function addNoteToNavbar(note, containerForNoteCards) {
    const roundedDiv = document.createElement('div');
    roundedDiv.classList.add('rounded');
    roundedDiv.innerHTML = '<div class="group w-full h-25 flex flex-col justify-between bg-transparent rounded-lg shadow-lg mb-6 py-5 px-4 hover:shadow-2xl hover:bg-gray-100 cursor-pointer transition-all ease-in-out duration-300">\n' +
        '                <div class="bg-[#3019bd] rounded-lg items-center">' +
        '                    <h4 class="text-white text-center font-bold">' + note.title + '</h4>' +
        '                </div>' +
        '                <div>' +
        '                    <div class="flex items-center text-[#3019bd] justify-center mt-5">' +
        '                        <svg  xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke-width="1" fill="#3019bd" stroke-linecap="round" stroke-linejoin="round">' +
        '                            <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm3.293 14.707L11 12.414V6h2v5.586l3.707 3.707-1.414 1.414z"></path>' +
        '                        </svg>' +
        '                        <p class="text-sm  ml-1">' + note.lastUpdated.toLocaleDateString("en-us") + '</p>' +
        '                    </div>' +
        '                </div>' +
        '            </div>';
    containerForNoteCards.appendChild(roundedDiv);

    let lastUpdated = note.lastUpdated.toLocaleDateString("en-us");
    let noteTitle = note.title;
    // Truncate the text content to 15 characters
    if (noteTitle.length > 14) {
        noteTitle = noteTitle.substring(0, 12) + '...';
    }
    roundedDiv.addEventListener('click', () => loadDataOfNote(note));
}

function loadDataOfNote(note) {
    const richTextEditor = document.querySelector('.textEditor');
    richTextEditor.classList.remove('hidden');

    const containerForCards = document.querySelector('.over-div');
    containerForCards.classList.add('hidden');

    document.getElementById('title').innerHTML = note.title;
    document.getElementById('title').dataset.noteId = note.id;
    document.getElementById('text-content').innerHTML = note.body;
    document.getElementById('text-content').dataset.noteId = note.id;

    document.getElementById('text-content').focus();

}


function addProjectToNavbar(project, containerForProjectCards) {
    const roundedDiv = document.createElement('div');
    roundedDiv.classList.add('rounded');
    roundedDiv.innerHTML = '<div class="group w-full h-25 flex flex-col justify-between bg-transparent rounded-lg shadow-lg mb-6 py-5 px-4 hover:shadow-2xl hover:bg-gray-100 cursor-pointer transition-all ease-in-out duration-300">\n' +
        '                <div class="bg-[#3019bd] rounded-lg items-center">' +
        '                    <h4 class="text-white text-center font-bold">' + project.title + '</h4>' +
        '                </div>' +
        '                <div>' +
        '                    <div class="flex items-center text-[#3019bd] justify-center mt-5">' +
        '                        <svg  xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke-width="1" fill="#3019bd" stroke-linecap="round" stroke-linejoin="round">' +
        '                            <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm3.293 14.707L11 12.414V6h2v5.586l3.707 3.707-1.414 1.414z"></path>' +
        '                        </svg>' +
        '                        <p class="text-sm  ml-1">' + project.dueDate.toLocaleDateString("en-us") + '</p>' +
        '                    </div>' +
        '                </div>' +
        '            </div>';
    containerForProjectCards.appendChild(roundedDiv);

    roundedDiv.addEventListener('click', () => flipDropdown(project));
}

function updatePinnedNotes(project) {
    notesArr = notesArr.slice().sort((a, b) => b.lastUpdated - a.lastUpdated);

    const overDiv = document.querySelector('.over-div');
    overDiv.classList.remove('hidden');
    const containerForNoteCards = document.querySelector('.container-for-cards');
    containerForNoteCards.innerHTML = "";

    const backToProjectsButton = document.createElement('div');
    backToProjectsButton.classList.add('back-to-projects', 'text-[#3019bd]', 'font-bold', 'text-lg', 'cursor-pointer');
    backToProjectsButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#3019bd">\n' +
        '                   <path d="M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z"></path>\n' +
        '             </svg>\n' +
        '            Back to projects'

    const title = document.createElement('div');
    title.classList.add('flex', 'items-center', 'text-4xl', 'text-[#3019bd]', 'p-4', 'font-bold', 'text-center', 'col-span-4', 'w-full');
    title.innerHTML = 'Notes of  <span class="bg-[#3019bd] text-white rounded-2xl p-2 ml-3"> ' + project.title + '</span>';
    const addNoteButton = document.createElement('div');
    addNoteButton.classList.add('ml-4', 'bg-[#3019bd]', 'w-10', 'h-10', 'font-bold', 'text-xl', 'text-white', 'shadow-md', 'rounded', 'cursor-pointer', 'flex', 'justify-center', 'items-center')
    addNoteButton.innerHTML = '+';
    addNoteButton.addEventListener('click', () => addNewNote(project));
    title.append(addNoteButton);
    containerForNoteCards.appendChild(backToProjectsButton);
    containerForNoteCards.appendChild(title);

    console.log("Update")
    notesArr.forEach((note, index) => {
        addNoteToNavbar(note, containerForNoteCards);
    })
}

function updatePinnedItems() {
    // Sortiere notesArr nach lastUpdated in absteigender Reihenfolge
    projectsArr = projectsArr.slice().sort((a, b) => b.dueDate - a.dueDate);

    const richTextEditor = document.querySelector('.textEditor');
    richTextEditor.classList.add('hidden');


    const overDiv = document.querySelector('.over-div');
    overDiv.classList.remove('hidden');
    const containerForProjectCards = document.querySelector('.container-for-cards');
    containerForProjectCards.innerHTML = "";

    const title = document.createElement('div');
    title.classList.add('flex', 'items-center', 'text-4xl', 'text-[#3019bd]', 'p-4', 'font-bold', 'text-center', 'col-span-4', 'w-full');
    title.innerHTML = 'Projects' +
        '<div onclick="my_modal_1.showModal()" class="ml-4 bg-[#3019bd] w-10 h-10 font-bold text-xl text-white shadow-md rounded cursor-pointer flex justify-center items-center"> + </div>';
    containerForProjectCards.appendChild(title);


    projectsArr.forEach((project, index) => {
        addProjectToNavbar(project, containerForProjectCards);
    })

}

function deleteNote(noteId) {
    let confirmDelete = confirm("Are you sure you want to delete this note?");
    if (!confirmDelete) return;
    notes.splice(noteId, 1);
    localStorage.setItem('notes', JSON.stringify(notes));
    showNotes();
}

function addNewNote(project) {
    let noteTitle = "Enter Title";
    let lastUpdated = new Date();

    const newNote = {
        title: noteTitle,
        body: "",
        lastUpdated: lastUpdated,
        parentProject: project.id
    }
    addNoteToFirestore(newNote, project);
}

function addNoteToFirestore(newNote, project) {
    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to add events.");
        return;
    }

    const notesRef = collection(db, "users", user.uid, "projects", newNote.parentProject, "notes");
    addDoc(notesRef, newNote).then(docRef => {
        newNote.id = docRef.id;
        notesArr.push(newNote);
        loadNotesOfProject(project);
    }).catch(error => {
        console.error("Error adding event: ", error);
    });
}

function addProjectToFirestore(newProject) {
    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to add events.");
        return;
    }

    console.log("AddProjectClicked");

    const projectsRef = collection(db, "users", user.uid, "projects");
    addDoc(projectsRef, newProject).then(docRef => {
        newProject.id = docRef.id;
        projectsArr.push(newProject);
        showNotes();
        closeIcon.click();
    }).catch(error => {
        console.error("Error adding event: ", error);
    });
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
    updateNoteToFirestore(note);

    const project = projectsArr.find((project) => project.id === note.parentProject); // Hier wurde project.id === note.parentProject korrigiert

    console.log("Project: ", project);

    loadNotesOfProject(project);
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
    updateNoteToFirestore(note);
});


function updateNoteToFirestore(updatedNote) {
    const user = auth.currentUser;
    console.log("Updated note: ", updatedNote);
    if (user) {
        const noteRef = doc(db, "users", user.uid, "projects", updatedNote.parentProject, "notes", updatedNote.id);
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

function flipDropdown(project) {

    currentProject = project;

    loadNotesOfProject(project);
}


function loadNotesOfProject(project) {
    notesArr.length = 0;
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
                });
                updatePinnedNotes(project);
            })
            .catch(error => {
                console.error("Error loading notes: ", error);
            });
    }
}

const modal = document.querySelector('.modal'),
    closeIcon = document.querySelector('.closeIcon'),
    titleEl = document.querySelector('.inputTitle'),
    dateEl = document.querySelector('.inputDate'),
    addBtn = document.querySelector('.submit-btn'),
    category = document.querySelector('#category');

closeIcon.addEventListener('click', () => {
    titleEl.value = '';
    dateEl.value = '';
    modal.removeAttribute('open');
    window.location.reload();
});

addBtn.addEventListener('click', (e) => {
    e.preventDefault();
    let projectTitle = titleEl.value;
    let projectDate = new Date(dateEl.value);
    let projectCategory = category.value;

    const newProject = {
        title: projectTitle,
        dueDate: projectDate,
        category: projectCategory
    }
    addProjectToFirestore(newProject);

});

document.querySelector('.back-to-notes').addEventListener('click', () => {
    document.querySelector('.textEditor').classList.add('hidden');
    loadNotesOfProject(currentProject);
});

function backToProjects() {
    showNotes();
}