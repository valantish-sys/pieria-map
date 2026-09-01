(function() {
  "use strict";
  
  const ADMIN_UID = 'vurqzwjwtDdImEetZVFA9T5RVgS2';
  let db, auth;
  let allPosts = [];

  function initApp() {
    if (typeof firebase === 'undefined' || !firebase.apps || !firebase.auth) {
      setTimeout(initApp, 100); return;
    }
    
    const config = {
      apiKey: "AIzaSyBYFxqAvOo0T91L2bFrJ6kA_MnI4uR-sAA",
      authDomain: "anartiseis-7cad1.firebaseapp.com",
      databaseURL: "https://anartiseis-7cad1-default-rtdb.europe-west1.firebasedatabase.app",
      projectId: "anartiseis-7cad1"
    };

    const app = !firebase.apps.find(a => a.name === "AnartiseisAdminApp") 
                ? firebase.initializeApp(config, "AnartiseisAdminApp") 
                : firebase.app("AnartiseisAdminApp");
    
    db = app.database();
    auth = app.auth();

    document.getElementById('loading-indicator').style.display = 'block';
    document.getElementById('login-form-area').style.display = 'none';

    // Google Sites Fix: Επιβολή τοπικής μνήμης για να μη χάνει το Login στα Iframes
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .catch(() => auth.setPersistence(firebase.auth.Auth.Persistence.NONE))
      .then(() => {
        auth.onAuthStateChanged(user => {
          document.getElementById('loading-indicator').style.display = 'none';
          
          if (user && user.uid === ADMIN_UID) {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('admin-panel').style.display = 'block';
            fetchPosts();
          } else {
            document.getElementById('admin-panel').style.display = 'none';
            document.getElementById('login-screen').style.display = 'block';
            document.getElementById('login-form-area').style.display = 'block';
            if (user) auth.signOut();
          }
        });
      });
  }

  // --- LOGIN / LOGOUT ---
  window.loginAdmin = () => {
    const email = document.getElementById('admin-email').value.trim();
    const pass = document.getElementById('admin-pass').value;
    const btn = document.getElementById('login-btn');
    if(!email || !pass) {
        if(typeof Swal !== 'undefined') Swal.fire({title: 'Σφάλμα', text: 'Συμπληρώστε στοιχεία', icon: 'warning', target: document.body});
        else alert('Συμπληρώστε στοιχεία');
        return;
    }
    
    btn.disabled = true; btn.innerText = "⏳ Σύνδεση...";
    auth.signInWithEmailAndPassword(email, pass).catch(e => {
      if(typeof Swal !== 'undefined') Swal.fire({title: 'Αποτυχία', text: 'Λάθος στοιχεία.', icon: 'error', target: document.body});
      else alert('Λάθος στοιχεία.');
      btn.disabled = false; btn.innerText = "Είσοδος στο Σύστημα";
    });
  };

  window.logoutAdmin = () => auth.signOut();

  // --- DATA FETCHING ---
  function fetchPosts() {
    db.ref('parent_posts').on('value', snap => {
      allPosts = [];
      if (snap.exists()) {
        snap.forEach(child => {
          allPosts.push({ id: child.key, ...child.val() });
        });
        allPosts.sort((a,b) => b.timestamp - a.timestamp); // Νεότερα πρώτα
      }
      updateUI();
    });
  }

  function updateUI() {
    const pending = allPosts.filter(p => p.status === 'pending');
    const approved = allPosts.filter(p => p.status === 'approved');
    const rejected = allPosts.filter(p => p.status === 'rejected');

    // Dashboard Stats
    document.getElementById('stat-total').innerText = allPosts.length;
    document.getElementById('stat-pending-dash').innerText = pending.length;
    document.getElementById('stat-approved-dash').innerText = approved.length;

    // Badges
    updateBadge('pending-badge', pending.length);
    updateBadge('approved-badge', approved.length);
    updateBadge('trash-badge', rejected.length);

    // Grids
    renderGrid('grid-pending', pending, 'pending');
    renderGrid('grid-approved', approved, 'approved');
    renderGrid('grid-rejected', rejected, 'rejected');
  }

  function updateBadge(id, count) {
    const el = document.getElementById(id);
    el.innerText = count;
    el.style.display = count > 0 ? 'inline-block' : 'none';
  }

  // --- RENDER POST CARDS ---
  function renderGrid(containerId, posts, type) {
    const container = document.getElementById(containerId);
    if (posts.length === 0) {
      container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #95a5a6; font-size: 16px; font-weight: bold;">Δεν υπάρχουν αναρτήσεις εδώ. 🎉</div>';
      return;
    }
    
    let html = '';
    const borderColors = { 'pending': 'var(--warning)', 'approved': 'var(--success)', 'rejected': 'var(--danger)' };

    posts.forEach(p => {
      const dateStr = new Date(p.timestamp).toLocaleString('el-GR');
      const imgHtml = p.imageUrl ? `<img src="${p.imageUrl}" class="post-img" onclick="window.openLightbox('${p.imageUrl}')">` : '';
      
      let buttons = '';
      if (type === 'pending') {
          buttons = `<div style="display:flex; gap:10px; margin-top:10px;">
                      <button class="btn btn-success" style="flex:1;" onclick="updatePostStatus('${p.id}', 'approved')">Έγκριση ✅</button>
                      <button class="btn" style="flex:1; background: #f39c12; color: #fff; border: none; border-radius: 5px;" onclick="editPost('${p.id}')">Επεξεργασία ✏️</button>
                      <button class="btn btn-danger" style="flex:1;" onclick="updatePostStatus('${p.id}', 'rejected')">Απόρριψη ❌</button>
                     </div>`;
      } else if (type === 'approved') {
          buttons = `<div style="display:flex; gap:10px; margin-top:10px;">
                      <button class="btn" style="flex:1; background: #f39c12; color: #fff; border: none; border-radius: 5px;" onclick="editPost('${p.id}')">Επεξεργασία ✏️</button>
                      <button class="btn btn-outline" style="flex:1;" onclick="updatePostStatus('${p.id}', 'rejected')">Απόσυρση (Στον Κάδο) 🗑️</button>
                     </div>`;
      } else if (type === 'rejected') {
          buttons = `<div style="display:flex; gap:10px; margin-top:10px;">
                      <button class="btn btn-success" style="flex:1;" onclick="updatePostStatus('${p.id}', 'approved')">Επαναφορά ✅</button>
                      <button class="btn btn-danger" style="flex:1;" onclick="deletePost('${p.id}')">Διαγραφή 🔥</button>
                     </div>`;
      }

      // ✂️ Οπτική ένδειξη του Διαχωριστή στο Admin για να ξέρεις ότι μπήκε σωστά!
      let displayContent = escapeHTML(p.content).replace(/\[READ_MORE\]/g, '<div style="margin: 15px 0; border-top: 2px dashed #e74c3c; text-align: center;"><span style="background: #fff; padding: 0 10px; color: #e74c3c; font-size: 11px; font-weight: bold; position: relative; top: -8px;">✂️ ΔΙΑΧΩΡΙΣΤΙΚΗ (Διαβάστε περισσότερα)</span></div>');

      html += `
        <div class="post-card-admin" style="border-left: 5px solid ${borderColors[type]};">
          <input type="checkbox" class="cb-bulk cb-${type}" value="${p.id}" />
          <div style="margin-right: 35px; margin-bottom: 12px;">
            <h3 style="margin:0 0 5px 0; font-size:18px; color:var(--dark);">${escapeHTML(p.title)}</h3>
            <div style="font-size:13px; color:var(--primary); font-weight:bold;">Από: ${escapeHTML(p.author)}</div>
            <div style="font-size:11px; color:var(--gray);">${dateStr}</div>
          </div>
          ${imgHtml}
          <div class="caption-box">${displayContent}</div>
          ${buttons}
        </div>
      `;
    });
    container.innerHTML = html;
  }

  // --- UI ACTIONS ---
  window.switchTab = (tabId) => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('btn-' + tabId).classList.add('active');
    document.getElementById(tabId).classList.add('active');
  };

  window.toggleSelectAll = (type) => {
    const isChecked = document.getElementById(`selectAll-${type}`).checked;
    document.querySelectorAll(`.cb-${type}`).forEach(cb => cb.checked = isChecked);
  };

  window.bulkAction = (type, action) => {
    const checkboxes = document.querySelectorAll(`.cb-${type}:checked`);
    if (checkboxes.length === 0) {
        if(typeof Swal !== 'undefined') Swal.fire({title: 'Προσοχή', text: 'Επιλέξτε τουλάχιστον μία ανάρτηση.', icon: 'warning', target: document.body});
        else alert('Επιλέξτε τουλάχιστον μία ανάρτηση.');
        return;
    }
    
    let titleText = action === 'approved' ? 'Έγκριση' : action === 'rejected' ? 'Απόρριψη/Απόσυρση' : 'Οριστική Διαγραφή';

    if(typeof Swal !== 'undefined') {
        Swal.fire({
          title: `Επιβεβαίωση`,
          text: `Θα γίνει ${titleText} σε ${checkboxes.length} αναρτήσεις. Συνέχεια;`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Ναι', cancelButtonText: 'Ακύρωση',
          target: document.body
        }).then(result => {
          if (result.isConfirmed) executeBulk(checkboxes, action, type);
        });
    } else {
        if (confirm(`Θα γίνει ${titleText} σε ${checkboxes.length} αναρτήσεις. Συνέχεια;`)) {
            executeBulk(checkboxes, action, type);
        }
    }
  };

  function executeBulk(checkboxes, action, type) {
      const updates = {};
      checkboxes.forEach(cb => {
        if (action === 'delete') updates[`parent_posts/${cb.value}`] = null;
        else updates[`parent_posts/${cb.value}/status`] = action;
      });
      
      db.ref().update(updates).then(() => {
        if(typeof Swal !== 'undefined') Swal.fire({title: 'Ολοκληρώθηκε!', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, target: document.body});
        document.getElementById(`selectAll-${type}`).checked = false;
      });
  }

  window.updatePostStatus = (id, status) => {
    let msg = status === 'approved' ? 'Η ανάρτηση θα δημοσιευτεί στο Blog!' : status === 'rejected' ? 'Μεταφορά στον Κάδο;' : '';
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Επιβεβαίωση', text: msg, icon: 'question',
            showCancelButton: true, confirmButtonText: 'Ναι', cancelButtonText: 'Ακύρωση', target: document.body
        }).then((res) => {
            if(res.isConfirmed) {
                db.ref('parent_posts/' + id).update({status: status});
                Swal.fire({icon: 'success', title: 'Έγινε!', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, target: document.body});
            }
        });
    } else {
        if(confirm(msg)) db.ref('parent_posts/' + id).update({status: status});
    }
  };

 window.deletePost = (id) => {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Οριστική Διαγραφή;', text: 'Η ενέργεια δεν αναιρείται.', icon: 'warning',
            showCancelButton: true, confirmButtonText: 'Διαγραφή', confirmButtonColor: '#e74c3c', cancelButtonText: 'Ακύρωση', target: document.body
        }).then((res) => {
            if(res.isConfirmed) db.ref('parent_posts/' + id).remove();
        });
    } else {
        if(confirm('Οριστική διαγραφή;')) db.ref('parent_posts/' + id).remove();
    }
  };

  // --- ΝΕΟ: ΕΠΕΞΕΡΓΑΣΙΑ & ΕΙΣΑΓΩΓΗ "READ MORE" ---
  window.editPost = (id) => {
      const post = allPosts.find(p => p.id === id);
      if(!post) return;

      if(typeof Swal !== 'undefined') {
          Swal.fire({
              title: 'Επεξεργασία Ανάρτησης',
              html: `
                <div style="text-align: left; font-size: 13px; font-weight: bold; margin-bottom: 5px;">Τίτλος:</div>
                <input id="edit-title" class="swal2-input" value="${escapeHTML(post.title)}" style="width: 100%; margin: 0 0 15px 0; max-width: 100%; box-sizing: border-box;">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 5px;">
                    <div style="font-size: 13px; font-weight: bold;">Κείμενο:</div>
                    <button type="button" onclick="const t = document.getElementById('edit-content'); const start = t.selectionStart; const end = t.selectionEnd; t.value = t.value.substring(0, start) + '\\n\\n[READ_MORE]\\n\\n' + t.value.substring(end); t.focus();" style="background: #1e6cff; color: white; border: none; padding: 5px 10px; border-radius: 5px; font-size: 11px; cursor: pointer;">
                        ✂️ Εισαγωγή "Διαβάστε περισσότερα"
                    </button>
                </div>
                
                <textarea id="edit-content" class="swal2-textarea" style="width: 100%; max-width: 100%; height: 250px; margin: 0; box-sizing: border-box;">${escapeHTML(post.content)}</textarea>
                <div style="font-size: 11px; color: #666; margin-top: 5px; text-align: left;">* Βάλε τον κέρσορα εκεί που θέλεις να κοπεί το κείμενο και πάτα το μπλε κουμπί.</div>
              `,
              showCancelButton: true,
              confirmButtonText: 'Αποθήκευση 💾',
              cancelButtonText: 'Ακύρωση',
              confirmButtonColor: '#2ecc71',
              target: document.body,
              width: '600px',
              preConfirm: () => {
                  return {
                      title: document.getElementById('edit-title').value.trim(),
                      content: document.getElementById('edit-content').value.trim()
                  }
              }
          }).then(res => {
              if (res.isConfirmed) {
                  db.ref('parent_posts/' + id).update({
                      title: res.value.title,
                      content: res.value.content
                  }).then(() => {
                      Swal.fire({icon: 'success', title: 'Ενημερώθηκε!', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, target: document.body});
                  });
              }
          });
      }
  };

  window.openLightbox = (url) => {
    document.getElementById('lightbox-img').src = url;
    document.getElementById('lightbox').style.display = 'flex';
  };
  window.closeLightbox = () => {
    document.getElementById('lightbox').style.display = 'none';
    document.getElementById('lightbox-img').src = '';
  };

  function escapeHTML(str) { return str ? str.replace(/[&<>'"]/g, t => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[t])) : ""; }

  initApp();
})();
