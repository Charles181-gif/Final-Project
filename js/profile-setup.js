import { auth, db, storage } from './firebase-config.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'login.html';
  } else {
    initProfileForm(user);
  }
});

function initProfileForm(user) {
  const form = document.getElementById('profileForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullName = document.getElementById('fullName').value.trim();
    const age = parseInt(document.getElementById('age').value.trim(), 10);
    const phone = document.getElementById('phone').value.trim();
    const location = document.getElementById('location').value;
    const gender = document.getElementById('gender').value;
    const bloodType = document.getElementById('bloodType').value;
    const notifications = document.getElementById('notifications').checked;
    const file = document.getElementById('profilePic').files[0];

    let photoURL = '';
    if (file) {
      const storageRef = ref(storage, `profiles/${user.uid}`);
      await uploadBytes(storageRef, file);
      photoURL = await getDownloadURL(storageRef);
    }

    // Preserve userType=patient if already stored
    const docData = {
      fullName,
      age,
      phone,
      location,
      gender,
      bloodType: bloodType || null,
      notifications: !!notifications,
      photoURL,
      email: user.email,
      userType: 'patient',
      updatedAt: new Date()
    };

    await setDoc(doc(db, 'users', user.uid), docData, { merge: true });

    window.location.href = 'dashboard.html';
  });
}
