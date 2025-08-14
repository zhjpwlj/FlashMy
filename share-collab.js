import { db } from "./firebase-config.js";
import { collection, query, where, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

export async function getPublicSets() {
  const q = query(collection(db, "flashcards"), where("public", "==", true));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function addEditor(setId, uid) {
  const setRef = doc(db, "flashcards", setId);
  await updateDoc(setRef, { editors: arrayUnion(uid) });
}
