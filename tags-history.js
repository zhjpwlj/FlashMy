import { db } from "./firebase-config.js";
import { updateDoc, doc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

export async function addTagToSet(setId, tag) {
  const setRef = doc(db, "flashcards", setId);
  await updateDoc(setRef, {
    tags: arrayUnion(tag),
  });
}

export async function saveEditHistory(setId, editData) {
  const setRef = doc(db, "flashcards", setId);
  await updateDoc(setRef, {
    edits: arrayUnion(editData)
  });
}
