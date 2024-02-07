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
    const navContent = document.querySelector('.nav-content');
    navContent.innerHTML = '<li>\n' +
        '                <button type="button" onclick="my_modal_1.showModal()" class="flex w-full p-2 text-white transition duration-75 rounded-lg group bg-blue-700 hover:text-white" aria-controls="dropdown-example" data-collapse-toggle="dropdown-example">\n' +
        '                    <svg class="flex-shrink-0 w-5 h-5 transition duration-75 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 21">\n' +
        '                        <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"></path>\n' +
        '                    </svg>\n' +
        '                    <span class="flex-1 ms-3 text-left whitespace-nowrap">Add a Project</span>\n' +
        '                </button>\n' +
        '            </li>';
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

function addProjectToNavbar(project) {
    const pinnedProjectsContainer = document.querySelector('.nav-content');
    const pinnedProjAndNotes = document.createElement('li');
    const pinnedProject = document.createElement('button');
    pinnedProject.type = 'button';
    pinnedProject.classList.add('flex', 'items-center', 'w-full', 'p-2', 'text-gray-900', 'transition', 'duration-75', 'rounded-lg', 'pl-11', 'group', 'hover:bg-gray-100');
    pinnedProject.dataset.projectID = project.id;

    let dueDate = project.dueDate.toLocaleDateString("en-us");
    let projectTitle = project.title;
    // Truncate the text content to 15 characters
    if (projectTitle.length > 14) {
        projectTitle = projectTitle.substring(0, 12) + '...';
    }

    /*pinnedProject.innerHTML = `<i class='bx bx-chevron-down dropdown'></i>
        <span id="projecttitle">${projectTitle}</span>
        <span id="last-updated">${dueDate}</span>`*/
    pinnedProject.innerHTML = `<svg class="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 21">
                         <path d="M20 5h-9.586L8.707 3.293A.997.997 0 0 0 8 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V7c0-1.103-.897-2-2-2z"></path>
                    </svg>
                    <span class="flex-1 ms-3 text-left rtl:text-right whitespace-nowrap">${projectTitle}</span>
                    <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
                    </svg>`
    pinnedProjectsContainer.appendChild(pinnedProjAndNotes)
    pinnedProjAndNotes.appendChild(pinnedProject);

    // Deklaration der subNotes außerhalb der flipDropdown-Funktion
    const subNotesUl = document.createElement('ul');
    subNotesUl.id = 'dropdown-example';
    subNotesUl.classList.add('hidden', 'py-2', 'space-y-2');
    const subNotesLi = document.createElement('li');
    subNotesUl.appendChild(subNotesLi);

    pinnedProject.addEventListener('click', () => flipDropdown(project, pinnedProjectsContainer, pinnedProject, subNotesLi))

}

function updatePinnedItems() {
    // Sortiere notesArr nach lastUpdated in absteigender Reihenfolge
    notesArr = notesArr.slice().sort((a, b) => b.lastUpdated - a.lastUpdated);
    projectsArr = projectsArr.slice().sort((a, b) => b.dueDate - a.dueDate)

    projectsArr.forEach((project, index) => {
        addProjectToNavbar(project);
    })

    // Durchlaufe alle Notizen und füge sie zur Sidebar hinzu
    /*notesArr.forEach((noteObj, index) => {
        const pinnedItem = document.createElement('div');
        pinnedItem.classList.add('nav-project');
        pinnedItem.dataset.noteId = noteObj.id;
        let options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
        let noteDate = noteObj.lastUpdated.toLocaleDateString("en-us");
        let noteTitle = noteObj.title;
        // Truncate the text content to 15 characters
        if (noteTitle.length > 15) {
            noteTitle = noteTitle.substring(0, 13) + '...';
        }

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
    });*/
}

function deleteNote(noteId) {
    let confirmDelete = confirm("Are you sure you want to delete this note?");
    if (!confirmDelete) return;
    notes.splice(noteId, 1);
    localStorage.setItem('notes', JSON.stringify(notes));
    showNotes();
}

/*document.querySelector('.nav-project-addProject').addEventListener('click', () => {
    let noteTitle = "Enter Title";
    let dueDate = new Date();

    const newProject = {
        title: noteTitle,
        dueDate: dueDate
    }
    addProjectToFirestore(newProject);
});*/

function addNoteToFirestore(newNote) {
    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to add events.");
        return;
    }

    const notesRef = collection(db, "users", user.uid, "projects", newNote.parentProject, "notes");
    addDoc(notesRef, newNote).then(docRef => {
        newNote.id = docRef.id;
        notesArr.push(newNote);
        showNotes();
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
    updateNoteToFirestore(noteId, note);
    showNotes();
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
        const noteRef = doc(db, "users", user.uid, "projects", updatedNote.dataset.parentProject, "notes");
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


function flipDropdown(project, pinnedProjectsContainer, pinnedProject, subNotes) {
    pinnedProject.onclick = document.getElementById('dropdown-example').classList.toggle('hidden');
    if (!pinnedProject.classList.contains('hidden')) {
        loadNotesOfProject(project, pinnedProjectsContainer, pinnedProject, subNotes);
    }
}

function loadNotesOfProject(project, pinnedProjectsContainer, pinnedProject, subNotes) {
    subNotes.innerHTML = '';

    const user = auth.currentUser;
    if (user) {
        const notesRef = collection(db, "users", user.uid, "projects", project.id, "notes");
        getDocs(notesRef)
            .then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    const noteData = doc.data();
                    let lastUpdated = noteData.lastUpdated.toDate();
                    const note = {id: doc.id, ...noteData, lastUpdated: lastUpdated};

                    const pinnedNote = document.createElement('a');
                    pinnedNote.classList.add('flex', 'items-center', 'w-full', 'p-2', 'text-gray-900', 'transition', 'duration-75', 'rounded-lg', 'pl-11', 'group', 'hover:bg-gray-100');
                    pinnedNote.dataset.noteID = note.id;


                    let noteTitle = note.title;

                    if (noteTitle.length > 12) {
                        noteTitle = noteTitle.substring(0, 9) + '...';
                    }

                    pinnedNote.innerHTML = noteTitle;

                    pinnedNote.addEventListener('click', () => {
                        document.getElementById('title').innerHTML = note.title;
                        document.getElementById('title').dataset.noteId = note.id;
                        document.getElementById('text-content').innerHTML = note.body;
                        document.getElementById('text-content').dataset.noteId = note.id;

                        document.getElementById('text-content').focus();
                    });
                    console.log("Load notes");

                    subNotes.appendChild(pinnedNote);
                });
                appendAddNoteButton(project, subNotes);
            })
            .catch(error => {
                console.error("Error loading notes: ", error);
            });
    }
}

function appendAddNoteButton(project, subNotes) {
    console.log("Add AddNoteButton");
    const addNoteButton = document.createElement('a');
    addNoteButton.classList.add('nav-project-addNote', 'flex', 'items-center', 'w-full', 'p-2', 'text-gray-900', 'transition', 'duration-75', 'rounded-lg', 'pl-11', 'group', 'hover:bg-gray-100');
    addNoteButton.innerHTML = '+ Add Note';

    addNoteButton.addEventListener('click', () => {
        let noteTitle = "Enter Title";
        let noteDesc = "";
        let dateEl = new Date()

        const newNote = {
            title: noteTitle,
            body: noteDesc,
            lastUpdated: dateEl,
            parentProject: project.id
        }
        addNoteToFirestore(newNote);
    });

    subNotes.appendChild(addNoteButton);
}

const modal = document.querySelector('.modal'),
    closeIcon = document.querySelector('.closeIcon'),
    titleEl = document.querySelector('.inputTitle'),
    dateEl = document.querySelector('.inputDate'),
    addBtn = document.querySelector('.btn');

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

    const newProject = {
        title: projectTitle,
        dueDate: projectDate
    }
    addProjectToFirestore(newProject);

});