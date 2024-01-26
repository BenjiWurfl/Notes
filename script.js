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
console.log("Firebase app initialized:", app);
const db = getFirestore(app);
const auth = getAuth();
const notesArr = [];

const addBox = document.querySelector('.add-box'),
popupBox = document.querySelector('.popup-box'),
popupTitle = popupBox.querySelector('header p'),
closeIcon = document.querySelector('header i'),
titleEl = document.querySelector('input'),
descEl = document.querySelector('textarea'),
addBtn = document.querySelector('button ');

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
  if(user){
    console.log(user.uid)
    const notesRef = collection(db, "users", user.uid, "notes");
    getDocs(notesRef).then(querySnapshot => {
      notesArr.length = 0;
      querySnapshot.forEach(doc => {
        const noteData = doc.data;
        let lastUpdated;

        // Überprüfen Sie, ob das Datum als Timestamp gespeichert ist
        if (noteData.date && noteData.date.seconds) {
          lastUpdated = new Date(eventData.date.seconds * 1000);
        } else if (noteData.date) {
          // Wenn das Datum im String-Format vorliegt
          lastUpdated = new Date(noteData.date);
        } else {
          // Standardwert, wenn kein Datum vorhanden ist
          lastUpdated = new Date();
        }

        const note = { id: doc.id, ...noteData, lastUpdated: lastUpdated };
        notesArr.push(note);

      })
      updateNotes();
    }).catch(error => {
      console.error("Error loading notes: ", error);
    });
   } 
}

function deleteNote(noteId) {
    let confirmDelete= confirm("Are you sure you want to delete this note?");
    if(!confirmDelete) return;
    notes.splice(noteId, 1);
    localStorage.setItem('notes', JSON.stringify(notes));
    showNotes();
}

function updateNote(noteId, title, desc) {
    isUpdate = true;
    updateId = noteId;
    addBox.click();
    titleEl.value = title;
    descEl.value = desc;
    addBtn.innerText = 'Edit Note';
    popupTitle.innerText = 'Editing a Note';
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

    let noteTitle = titleEl.value,
    noteDesc = descEl.value;
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
        //localStorage.setItem('notes', JSON.stringify(notes));
        addNoteToFirestore(newNote);
        closeIcon.click();
        showNotes();
    }
});

function addNoteToFirestore(newNote) {
  const userUID = "YoFPYLvv8VbD5S04AODlibh55xN2";
  /*if (!user) {
    alert("You must be logged in to add events.");
    return;
  }*/

  const notesRef = collection(db, "users", userUID, "notes");
  addDoc(notesRef, newNote).then(docRef => {
    console.log("Added note with ID: ", docRef.id);
    newNote.id = docRef.id;
    notesArr.push(newNote);
    updateNotes();
  }).catch(error => {
    console.error("Error adding event: ", error);
  });
  
  addEventWrapper.classList.remove("active");
  addEventTitle.value = "";
  addEventDescription.value = "";
  addEventFrom.value = "";
  addEventTo.value = "";
}

function updateNotes(){
  notesArr.forEach((noteObj, index)=>{
    let liEl=`<li class="note">
                    <div class="details">
                        <p>${noteObj.title}</p>
                        <span>${noteObj.body}</span>
                    </div>
                    <div class="bottom-content">
                        <span>${noteObj.lastUpdated}</span>
                        <div class="settings">
                            <i onClick="updateNote(${index}, '${noteObj.title}', '${noteObj.body}')"  class="uil uil-edit"></i>
                            <i onClick="deleteNote(${index})" class="uil uil-trash"></i>
                        </div>
                    </div>
                </li>`;
    addBox.insertAdjacentHTML('afterend', liEl);
  });
}