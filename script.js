import {initializeApp} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    updateDoc,
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
let currentNote;
let currentSortByState = "Date down";

const notes = JSON.parse(localStorage.getItem('notes') || '[]');

function showProjects() {
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
                updateProjectView();
            })
            .catch(error => {
                console.error("Error loading projects: ", error);
            });
    }
}


onAuthStateChanged(auth, (user) => {
    if (user) {
        showProjects();
    } else {
        console.log("No user is signed in.");
    }
});

function addNoteToGrid(note, containerForNoteCards) {
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

    currentNote = note;

    document.getElementById('title').innerHTML = note.title;
    document.getElementById('title').dataset.noteId = note.id;
    document.getElementById('text-content').innerHTML = note.body;
    document.getElementById('text-content').dataset.noteId = note.id;
    switch (note.rating) {
        case 1:
            star1.setAttribute('checked', 'checked')
            break;
        case 2:
            star2.setAttribute('checked', 'checked')
            break;
        case 3:
            star3.setAttribute('checked', 'checked')
            break;
        case 4:
            star4.setAttribute('checked', 'checked')
            break;
        case 5:
            star5.setAttribute('checked', 'checked')
            break;
    }

    document.getElementById('text-content').focus();

}

function addProjectToGrid(project, containerForProjectCards) {
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
        '                        <p class="text-sm ml-1">' + project.dueDate.toLocaleDateString("en-us") + '</p>' +
        '                    </div>' +
        '                </div>' +
        '            </div>';
    containerForProjectCards.appendChild(roundedDiv);

    roundedDiv.addEventListener('click', () => openProject(project));
}

function updateNotesView(project) {

    const cardsCompletelyHiddenToggle = document.querySelector('.over-div');
    cardsCompletelyHiddenToggle.classList.remove('hidden');
    const containerForNoteCards = document.querySelector('.container-for-cards');
    containerForNoteCards.innerHTML = "";

    const backToProjectsButton = document.createElement('span');
    backToProjectsButton.classList.add('back-to-projects', 'px-4', 'w-full', 'font-bold', 'text-[#3019bd]', 'text-md', 'cursor-pointer');
    backToProjectsButton.innerHTML = '< back to projects'
    backToProjectsButton.addEventListener('click', () => backToProjects());


    const modifyProjectSpan = document.createElement('span');
    modifyProjectSpan.classList.add('modify-project', 'col-end-5', 'px-4', 'w-full', 'font-bold', 'text-[#3019bd]', 'text-md', 'cursor-pointer', 'text-right', 'justify-end', 'items-end');

    const editProjectButton = document.createElement('span');
    editProjectButton.classList.add('flex', 'justify-end');
    editProjectButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#3019BD">' +
        '<path d="m7 17.013 4.413-.015 9.632-9.54c.378-.378.586-.88.586-1.414s-.208-1.036-.586-1.414l-1.586-1.586c-.756-.756-2.075-.752-2.825-.003L7 12.583v4.43zM18.045 4.458l1.589 1.583-1.597 1.582-1.586-1.585 1.594-1.58zM9 13.417l6.03-5.973 1.586 1.586-6.029 5.971L9 15.006v-1.589z"></path><path d="M5 21h14c1.103 0 2-.897 2-2v-8.668l-2 2V19H8.158c-.026 0-.053.01-.079.01-.033 0-.066-.009-.1-.01H5V5h6.847l2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2z"></path>' +
        '</svg>';
    editProjectButton.addEventListener('click', () => editProject(project));

    const deleteProjectButton = document.createElement('span');
    deleteProjectButton.classList.add('flex', 'justify-end');
    deleteProjectButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#3019BD">' +
        '   <path d="M5 20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8h2V6h-4V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2H3v2h2zM9 4h6v2H9zM8 8h9v12H7V8z"></path>' +
        '   <path d="M9 10h2v8H9zm4 0h2v8h-2z"></path>' +
        '</svg>';
    deleteProjectButton.addEventListener('click', () => deleteProject(project));


    const title = document.createElement('div');
    title.classList.add('flex', 'items-center', 'text-4xl', 'text-[#3019bd]', 'col-span-4', 'px-4', 'w-full', 'font-bold', 'text-center');
    title.innerHTML = 'Notes of  <span class="bg-[#3019bd] text-white rounded-2xl p-2 ml-3"> ' + project.title + '</span>';

    const sortBy = document.createElement('div');
    sortBy.classList.add('sort-by', 'cursor-pointer', 'flex', 'items-center', 'text-md', 'text-[#3019bd]', 'col-span-4', 'h-1', 'px-4', 'w-full', 'font-bold', 'text-center');
    sortBy.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"' +
        'fill="#3019bd">' +
        '<path d="M7 20h2V8h3L8 4 4 8h3zm13-4h-3V4h-2v12h-3l4 4z"></path>' +
        '</svg> Date';

    sortBy.addEventListener('click', () => sortNotes(project, sortBy));

    const addNoteButton = document.createElement('div');
    addNoteButton.classList.add('ml-4', 'bg-[#3019bd]', 'w-10', 'h-10', 'font-bold', 'text-xl', 'text-white', 'shadow-md', 'rounded', 'cursor-pointer', 'flex', 'justify-center', 'items-center')
    addNoteButton.innerHTML = '+';
    addNoteButton.addEventListener('click', () => addNewNote(project));
    title.append(addNoteButton);
    containerForNoteCards.appendChild(backToProjectsButton);
    modifyProjectSpan.appendChild(editProjectButton);
    modifyProjectSpan.appendChild(deleteProjectButton);
    containerForNoteCards.appendChild(modifyProjectSpan);
    containerForNoteCards.appendChild(title);
    containerForNoteCards.appendChild(sortBy);

    if (currentSortByState === "Date down") {
        notesArr = notesArr.slice().sort((a, b) => b.lastUpdated - a.lastUpdated);
    }

    notesArr.forEach((note, index) => {

        addNoteToGrid(note, containerForNoteCards);
    })
}

function deleteProject(project) {
    let confirmDelete = confirm("Are you sure you want to delete this project?");
    if (!confirmDelete) return;
    const user = auth.currentUser;
    const projRef = doc(db, "users", user.uid, "projects", project.id);
    deleteDoc(projRef).then(() => showProjects())
        .catch(error => console.error(error));

}

function sortNotes(project) {
    switch (currentSortByState) {
        case "Date down":
            changeNotesArrayByDateUp(project);
            break;
        case "Date up":
            changeNotesArrayByDateDown(project);
            break;
        default:
            changeNotesArrayByDateDown(project);
    }
}

function changeNotesArrayByDateDown(project) {
    currentSortByState = "Date down";
    notesArr = notesArr.slice().sort((a, b) => b.lastUpdated - a.lastUpdated);
    updateNotesView(project);
}

function changeNotesArrayByDateUp(project) {
    currentSortByState = "Date up";
    notesArr = notesArr.slice().sort((a, b) => a.lastUpdated - b.lastUpdated);
    updateNotesView(project);
}

function sortProjects() {
    switch (currentSortByState) {
        case "Date down":
            changeProjectsArrayByDateUp();
            break;
        case "Date up":
            changeProjectsArrayByDateDown();
            break;
        default:
            changeProjectsArrayByDateDown();
    }
}

function changeProjectsArrayByDateDown() {
    currentSortByState = "Date down";
    projectsArr = projectsArr.slice().sort((a, b) => b.dueDate - a.dueDate);
    showProjects();
}

function changeProjectsArrayByDateUp() {
    currentSortByState = "Date up";
    projectsArr = projectsArr.slice().sort((a, b) => a.dueDate - b.dueDate);
    showProjects();
}

function updateProjectView() {

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

    const sortBy = document.createElement('div');
    sortBy.classList.add('sort-by', 'cursor-pointer', 'flex', 'items-center', 'text-md', 'text-[#3019bd]', 'col-span-4', 'h-1', 'px-4', 'w-full', 'font-bold', 'text-center');
    sortBy.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"' +
        'fill="#3019bd">' +
        '<path d="M7 20h2V8h3L8 4 4 8h3zm13-4h-3V4h-2v12h-3l4 4z"></path>' +
        '</svg> Date';

    sortBy.addEventListener('click', () => sortProjects());

    containerForProjectCards.appendChild(title);
    containerForProjectCards.appendChild(sortBy);

    if (currentSortByState === "Date down") {
        projectsArr = projectsArr.slice().sort((a, b) => b.dueDate - a.dueDate);
    }

    projectsArr.forEach((project, index) => {
        addProjectToGrid(project, containerForProjectCards);
    })

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

    const projectsRef = collection(db, "users", user.uid, "projects");
    addDoc(projectsRef, newProject).then(docRef => {
        newProject.id = docRef.id;
        projectsArr.push(newProject);
        showProjects();
        closeIcon.click();
    }).catch(error => {
        console.error("Error adding event: ", error);
    });


    const eventTitle = newProject.title;
    const eventDescription = "This project is from the tab \'Notes\'";
    let eventTimeFrom = '00:00';
    let eventTimeTo = '23:59';
    let day = newProject.dueDate.getDate();
    let month = newProject.dueDate.getMonth();
    let year = newProject.dueDate.getFullYear();

    const event = {
        title: eventTitle,
        description: eventDescription,
        timeFrom: eventTimeFrom,
        timeTo: eventTimeTo,
        allDay: true,
        day: day,
        month: month + 1,
        year: year,
        date: newProject.dueDate // Datum des Events
    };
    const eventsRef = collection(db, "users", user.uid, "events");

    // Neues Ereignis zur Datenbank hinzufügen
    addDoc(eventsRef, event).then(docRef => {
        console.log("Event added with ID: ", event);
        event.id = docRef.id; // ID zum Ereignis hinzufügen

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
document.getElementById('askAI').addEventListener('click', () => ai());

async function ai() {

    let prompt = window.prompt("Please enter the prompt: ", "Write an essay about...");
    if (prompt != null) {
        const user = auth.currentUser;
        if (user) {
            const tokenRef = doc(db, "openai", "token");
            getDoc(tokenRef)
                .then(async docSnapshot => {
                    if (docSnapshot.exists()) {
                        const tokenData = docSnapshot.data();
                        const token = tokenData.token;

                        await sendOpenAIRequest(token, prompt);


                    } else {
                        console.log("Token-Dokument existiert nicht");
                    }
                })
                .catch(error => {
                    console.error("Fehler beim Laden des Token-Dokuments oder beim Aufrufen von GPT3: ", error);
                });
        } else {
            console.error("Benutzer nicht gefunden");
        }
    }
}

async function sendOpenAIRequest(token, prompt) {
    const textContent = document.getElementById('text-content');
    try {
        const url = "https://api.openai.com/v1/chat/completions";
        const bearer = 'Bearer ' + token; // Bearer + token für die Authentifizierung benötigt. Bearer = Inhaber des Tokens

        let response;

        if (window.getSelection().toString() === null) {


            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': bearer,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "Your usage is in an note application. " +
                                "The user is giving you instructions like writing something, " +
                                "summing something up or translate something." +
                                "Do not answer with an \'okay\' or something like that. Simply, just fulfill your job " +
                                "without any confirmation. Stay friendly and do not use any curse words."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    stream: true,
                })
            });
        } else {
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': bearer,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "Your usage is in an note application. " +
                                "The user is giving you instructions like writing something, " +
                                "summing something up or translate something." +
                                "Do not answer with an \'okay\' or something like that. Simply, just fulfill your job " +
                                "without any confirmation. Stay friendly and do not use any curse words."
                        },
                        {
                            role: "user",
                            content: (prompt + "\'" + window.getSelection().toString() + "\'")
                        }
                    ],
                    stream: true,
                    temperature: 1,
                    max_tokens: 4000,
                    top_p: 1,
                })
            });
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        while (true) {
            const chunk = await reader.read();
            const {done, value} = chunk;
            if (done) {
                break;
            }

            const decodedChunk = decoder.decode(value);
            const lines = decodedChunk.split("\n");

            const parsedLines = lines
                .map((line) => line.replace(/^data: /, "").trim()) // Remove the "data: " prefix
                .filter((line) => line !== "" && line !== "[DONE]") // Remove empty lines and "[DONE]"
                .map(line => JSON.parse(line)); // Parse the JSON string


            for (const parsedLine of parsedLines) {
                const {choices} = parsedLine;
                const {delta} = choices[0];
                const {content} = delta;
                // Update the UI with the new content
                if (content) {
                    if (window.getSelection().toString() !== null) {
                        window.getSelection().deleteFromDocument();
                    }
                    textContent.innerText += content;
                }
            }
        }
    } catch {
        console.error("Error")
    }
}


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
    document.execCommand(cmd, false, value);
}

function openProject(project) {

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
                updateNotesView(project);
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
    showProjects();
}

document.querySelector('.delete-note').addEventListener('click', () => {
    let confirmDelete = confirm("Are you sure you want to delete this note?");
    if (!confirmDelete) return;
    const user = auth.currentUser;
    const noteRef = doc(db, "users", user.uid, "projects", currentProject.id, "notes", currentNote.id);
    deleteDoc(noteRef).then(() => loadNotesOfProject(currentProject))
        .catch(error => console.error(error));
})

function editProject(project) {
    my_modal_2.showModal();

    const modal = document.querySelector('.modal2');
    const modalName = document.querySelector('.input-name');
    const modalDate = document.querySelector('.input-date');
    const modalCategory = document.querySelector('.input-category');
    const closeIcon = document.querySelector('.close-icon');
    const submit = document.querySelector('.update-project');

    modalName.value = project.title;
    modalDate.value = project.dueDate.toISOString().substring(0, 10);
    modalCategory.value = project.category;

    modalName.addEventListener('change', () => {
        project.title = modalName.value;
    });
    modalDate.addEventListener('change', () => {
        project.dueDate = new Date(modalDate.value + "T00:00");

        const user = auth.currentUser;

        const eventTitle = project.title;
        const eventDescription = "This project is from the tab \'Projects\'";
        const allDay = project.dueDate;
        let eventTimeFrom = '00:00';
        let eventTimeTo = '23:59';
        let day = project.dueDate.getDay();
        let month = project.dueDate.getMonth();
        let year = project.dueDate.getFullYear();

        const event = {
            title: eventTitle,
            description: eventDescription,
            timeFrom: eventTimeFrom,
            timeTo: eventTimeTo,
            allDay: allDay,
            day: day,
            month: month + 1,
            year: year,
            date: project.dueDate // Datum des Events
        };
        const eventsRef = collection(db, "users", user.uid, "events");

        // Neues Ereignis zur Datenbank hinzufügen
        addDoc(eventsRef, event).then(docRef => {
            console.log("Event added with ID: ", event);
            event.id = docRef.id; // ID zum Ereignis hinzufügen

        }).catch(error => {
            console.error("Error adding event: ", error);
        });
    });
    modalCategory.addEventListener('change', () => {
        project.category = modalCategory.value;
    });
    closeIcon.addEventListener('click', () => {
        modalName.value = '';
        modalDate.value = '';
        modal.removeAttribute('open');
        window.location.reload();
    });

    submit.addEventListener('click', () => {
        const user = auth.currentUser;
        if (user) {
            const projRef = doc(db, "users", user.uid, "projects", project.id);
            updateDoc(projRef, project)
                .then(() => {
                })
                .catch((error) => {
                    console.error("Error updating note in Firestore: ", error);
                });
        }
    })
}

// --- NavBar

const body = document.querySelector('body'),
    sidebar = body.querySelector('nav'),
    toggle = body.querySelector(".toggle-sidebar"),
    modeSwitch = body.querySelector(".toggle-switch"),
    modeText = body.querySelector(".mode-text");


toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
})

modeSwitch.addEventListener("click", () => {
    body.classList.toggle("dark");

    if (body.classList.contains("dark")) {
        modeText.innerText = "Light mode";
    } else {
        modeText.innerText = "Dark mode";
    }
});
// ---

const star1 = document.querySelector('.rating-1'),
    star2 = document.querySelector('.rating-2'),
    star3 = document.querySelector('.rating-3'),
    star4 = document.querySelector('.rating-4'),
    star5 = document.querySelector('.rating-5');

star1.addEventListener('click', () => rated(1));
star2.addEventListener('click', () => rated(2));
star3.addEventListener('click', () => rated(3));
star4.addEventListener('click', () => rated(4));
star5.addEventListener('click', () => rated(5));


async function rated(index) {
    const user = auth.currentUser;
    const noteRef = doc(db, "users", user.uid, "projects", currentProject.id, "notes", currentNote.id)
    currentNote.rating = index;
    await updateDoc(noteRef, currentNote)
}



