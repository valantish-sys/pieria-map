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
            
            const btn = document.getElementById('login-btn');
            if (btn) { btn.disabled = false; btn.innerText = "Είσοδος στο Σύστημα"; }
            
            if (user) auth.signOut();
          }
        });
      });
  }

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


  function fetchPosts() {
    db.ref('parent_posts').on('value', snap => {
      allPosts = [];
      if (snap.exists()) {
     snap.forEach(child => {
          allPosts.push({ id: child.key, ...child.val() });
        });
        allPosts.sort((a,b) => (b.timestamp || 0) - (a.timestamp || 0)); 
      }
      updateUI();
    });
  }

 function updateUI() {
    // Αποθήκευση της κατάστασης των checkboxes πριν την ανανέωση
    const checkedBoxes = Array.from(document.querySelectorAll('.cb-bulk:checked')).map(cb => cb.value);

    const pending = allPosts.filter(p => p.status === 'pending');
    const approved = allPosts.filter(p => p.status === 'approved');
    const rejected = allPosts.filter(p => p.status === 'rejected');

    document.getElementById('stat-total').innerText = allPosts.length;
    document.getElementById('stat-pending-dash').innerText = pending.length;
    document.getElementById('stat-approved-dash').innerText = approved.length;

    updateBadge('pending-badge', pending.length);
    updateBadge('approved-badge', approved.length);
    updateBadge('trash-badge', rejected.length);

    renderGrid('grid-pending', pending, 'pending');
    renderGrid('grid-approved', approved, 'approved');
    renderGrid('grid-rejected', rejected, 'rejected');

    // Επαναφορά των επιλεγμένων checkboxes
    checkedBoxes.forEach(id => {
      const cb = document.querySelector(`.cb-bulk[value="${id}"]`);
      if (cb) cb.checked = true;
    });
  }

  function updateBadge(id, count) {
    const el = document.getElementById(id);
    el.innerText = count;
    el.style.display = count > 0 ? 'inline-block' : 'none';
  }

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
     let imgHtml = '';
      if (p.imageUrl) {
        imgHtml = `
          <img src="${p.imageUrl}" class="post-img" onclick="window.openLightbox('${p.imageUrl}')">
          <div style="display:flex; gap:10px; margin-top:5px; margin-bottom:15px;">
            <button class="btn" style="flex:1; font-size:11px; padding:4px; background:#f39c12; color:white; border:none; border-radius:3px; cursor:pointer;" onclick="openBlurTool('${p.id}', '${p.imageUrl}')">🎨 Εργαλείο Θόλωσης</button>
            <button class="btn btn-danger" style="flex:1; font-size:11px; padding:4px;" onclick="removePostImage('${p.id}')">🗑️ Αφαίρεση</button>
          </div>
        `;
      }
      
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
                      <button class="btn btn-success" style="flex:1;" onclick="updatePostStatus('${p.id}', 'pending')">Επαναφορά ✅</button>
                      <button class="btn btn-danger" style="flex:1;" onclick="deletePost('${p.id}')">Διαγραφή 🔥</button>
                     </div>`;
      }


      let displayContent = (p.content || '').replace(/\[READ_MORE\]/g, '<div style="margin: 15px 0; border-top: 2px dashed #e74c3c; text-align: center;"><span style="background: #fff; padding: 0 10px; color: #e74c3c; font-size: 11px; font-weight: bold; position: relative; top: -8px;">✂️ ΔΙΑΧΩΡΙΣΤΙΚΗ (Διαβάστε περισσότερα)</span></div>');

      html += `
        <div class="post-card-admin" style="border-left: 5px solid ${borderColors[type]};">
          <input type="checkbox" class="cb-bulk cb-${type}" value="${p.id}" />
       <div style="margin-right: 35px; margin-bottom: 12px;">
            <h3 style="margin:0 0 5px 0; font-size:18px; color:var(--dark);">${escapeHTML(p.title || '')}</h3>
            <div style="font-size:13px; color:var(--primary); font-weight:bold;">Από: ${escapeHTML(p.author || '')}</div>
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
    
    let titleText = action === 'approved' ? 'Έγκριση' : action === 'rejected' ? 'Απόρριψη/Απόσυρση' : action === 'pending' ? 'Επαναφορά στα Εκκρεμή' : 'Οριστική Διαγραφή';

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
    let msg = status === 'approved' ? 'Η ανάρτηση θα δημοσιευτεί στο Blog!' : status === 'rejected' ? 'Μεταφορά στον Κάδο;' : status === 'pending' ? 'Η ανάρτηση θα μεταφερθεί πίσω στα Εκκρεμή.' : '';
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

  window.editPost = (id) => {
      const post = allPosts.find(p => p.id === id);
      if(!post) return;

      if(typeof Swal !== 'undefined') {
          Swal.fire({
              title: 'Επεξεργασία Ανάρτησης',
              html: `
                <div style="text-align: left; font-size: 13px; font-weight: bold; margin-bottom: 5px;">Τίτλος:</div>
            <input id="edit-title" class="swal2-input" value="${(post.title || '').replace(/"/g, '&quot;')}" style="width: 100%; margin: 0 0 15px 0; max-width: 100%; box-sizing: border-box;">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 5px;">
                    <div style="font-size: 13px; font-weight: bold;">Κείμενο:</div>
                    <button type="button" onclick="const t = document.getElementById('edit-content'); const start = t.selectionStart; const end = t.selectionEnd; t.value = t.value.substring(0, start) + '\\n\\n[READ_MORE]\\n\\n' + t.value.substring(end); t.focus();" style="background: #1e6cff; color: white; border: none; padding: 5px 10px; border-radius: 5px; font-size: 11px; cursor: pointer;">
                        ✂️ Εισαγωγή "Διαβάστε περισσότερα"
                    </button>
                </div>
                
              <textarea id="edit-content" class="swal2-textarea" style="width: 100%; max-width: 100%; height: 250px; margin: 0; box-sizing: border-box;">${(post.content || '').replace(/<br>/g, '\n')}</textarea>
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
                      title: escapeHTML(document.getElementById('edit-title').value.trim()),
                      content: escapeHTML(document.getElementById('edit-content').value.trim()).replace(/\n/g, '<br>')
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
      } else {
          // Fallback αν δεν φορτώσει το SweetAlert
          const plainTitle = (post.title || '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
          const newTitle = prompt('Νέος Τίτλος:', plainTitle);
          if (newTitle !== null) {
              const plainContent = (post.content || '').replace(/<br>/g, '\n').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
              const newContent = prompt('Νέο Κείμενο:', plainContent);
              if (newContent !== null) {
                  db.ref('parent_posts/' + id).update({
                      title: escapeHTML(newTitle.trim()),
                      content: escapeHTML(newContent.trim()).replace(/\n/g, '<br>')
                  }).then(() => { alert('Ενημερώθηκε επιτυχώς!'); });
              }
          }
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
  const CLOUD_NAME = "drx2a5ane"; // Το ίδιο κλειδί με το Album (Αν έχεις άλλο για το blog, άλλαξέ το)
  const UPLOAD_PRESET = "school_album"; // Το ίδιο preset με το Album
  
  let isUploadingBlur = false;
  let blurCanvas, blurCtx, backupCanvas, backupCtx;
  let isDrawingBlur = false;
  let startX, startY, currentRect = null;
  let currentPostIdBlur = null;

  window.openBlurTool = (id, url) => {
      currentPostIdBlur = id;
      
      // Δημιουργία σκοτεινού overlay σε πλήρη οθόνη
      let overlay = document.getElementById('blur-editor-overlay');
      if (!overlay) {
          overlay = document.createElement('div');
          overlay.id = 'blur-editor-overlay';
          Object.assign(overlay.style, {
              position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.95)', zIndex: '999999', display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          });

          overlay.innerHTML = `
              <div style="padding: 15px; display: flex; gap: 15px; align-items: center; flex-wrap: wrap; justify-content: center; width: 100%; background: #222; box-sizing: border-box;">
                  <span style="color:white; font-size: 15px; text-align:center;" id="blur-status-text">⏳ Φόρτωση εικόνας...</span>
                  <button id="save-blur-btn" class="btn btn-success" style="padding: 10px 20px; font-size: 14px; cursor:pointer; border:none; border-radius:5px; background:#2ecc71; color:white; display:none;">💾 Αποθήκευση</button>
                  <button id="cancel-blur-btn" class="btn btn-danger" style="padding: 10px 20px; font-size: 14px; cursor:pointer; border:none; border-radius:5px; background:#e74c3c; color:white;">❌ Ακύρωση</button>
              </div>
              <div id="canvas-container" style="position: relative; overflow: hidden; width: 100vw; flex: 1; display: flex; justify-content: center; align-items: center; padding: 20px; box-sizing: border-box;">
              </div>
          `;
          document.body.appendChild(overlay);

          const canvasContainer = overlay.querySelector('#canvas-container');
          blurCanvas = document.createElement('canvas');
          backupCanvas = document.createElement('canvas');
          blurCanvas.style.maxWidth = '100%';
          blurCanvas.style.maxHeight = '100%';
          blurCanvas.style.objectFit = 'contain';
          blurCanvas.style.cursor = 'crosshair';
          blurCanvas.style.display = 'none';
          blurCanvas.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
          canvasContainer.appendChild(blurCanvas);

          blurCtx = blurCanvas.getContext('2d');
          backupCtx = backupCanvas.getContext('2d');

          blurCanvas.addEventListener('mousedown', handleDown);
          blurCanvas.addEventListener('mousemove', handleMove, {passive: false});
          window.addEventListener('mouseup', handleUp);
          
          blurCanvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleDown(e.touches[0]); }, {passive: false});
          blurCanvas.addEventListener('touchmove', (e) => { e.preventDefault(); handleMove(e.touches[0]); }, {passive: false});
          window.addEventListener('touchend', handleUp);

          overlay.querySelector('#cancel-blur-btn').onclick = closeBlurTool;
          overlay.querySelector('#save-blur-btn').onclick = savePostBlurredImage;
      } else {
          overlay.style.display = 'flex';
          document.body.style.overflow = 'hidden';
          document.getElementById('blur-status-text').innerText = "⏳ Φόρτωση εικόνας...";
          document.getElementById('save-blur-btn').style.display = 'none';
      }

      document.body.style.overflow = 'hidden'; // Μπλοκάρισμα σκρολ
      blurCanvas.style.display = 'none';
      if(blurCtx) blurCtx.clearRect(0, 0, blurCanvas.width, blurCanvas.height);

      let imgObj = new Image();
      imgObj.crossOrigin = "Anonymous";
      imgObj.onerror = () => { closeBlurTool(); alert("Σφάλμα φόρτωσης εικόνας. Ελέγξτε τη σύνδεσή σας."); };
      imgObj.onload = () => {
          blurCanvas.style.display = 'block';
          blurCanvas.width = backupCanvas.width = imgObj.width; 
          blurCanvas.height = backupCanvas.height = imgObj.height;
          blurCtx.drawImage(imgObj, 0, 0); 
          backupCtx.drawImage(imgObj, 0, 0);
          
          document.getElementById('blur-status-text').innerText = "👇 Κάνε κλικ & σύρε πάνω στα πρόσωπα για να τα θολώσεις.";
          document.getElementById('save-blur-btn').style.display = 'inline-block';
      };
      
      let fullUrl = url;
      // Φορτώνουμε μια βελτιστοποιημένη έκδοση της εικόνας για να μην "κολλάει" το εργαλείο σε κινητά
      if (fullUrl.includes('/upload/')) {
          fullUrl = fullUrl.replace('/upload/', '/upload/w_1920,c_limit,q_auto,f_auto/');
      }
      imgObj.src = fullUrl + (fullUrl.includes('?') ? '&' : '?') + 'nocache=' + Date.now();
  };

  function getMousePosCanvas(evt) {
      const rect = blurCanvas.getBoundingClientRect();
      const scaleX = blurCanvas.width / rect.width;
      const scaleY = blurCanvas.height / rect.height;
      return { x: (evt.clientX - rect.left) * scaleX, y: (evt.clientY - rect.top) * scaleY };
  }

  function handleDown(e) {
      if (isUploadingBlur) return;
      isDrawingBlur = true;
      const pos = getMousePosCanvas(e);
      startX = pos.x; startY = pos.y; currentRect = null;
  }

  function handleMove(e) {
      if (!isDrawingBlur || isUploadingBlur || !blurCtx) return;
      const pos = getMousePosCanvas(e);
      blurCtx.clearRect(0, 0, blurCanvas.width, blurCanvas.height);
      blurCtx.drawImage(backupCanvas, 0, 0);
      
      let w = pos.x - startX, h = pos.y - startY;
      let cx = startX + w / 2, cy = startY + h / 2;
      let rx = Math.abs(w / 2), ry = Math.abs(h / 2);
      
      blurCtx.fillStyle = "rgba(255, 0, 0, 0.3)";
      blurCtx.strokeStyle = "red";
      blurCtx.lineWidth = Math.max(2, blurCanvas.width / 500);
      blurCtx.beginPath();
      blurCtx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
      blurCtx.fill(); blurCtx.stroke();
      currentRect = {x: startX, y: startY, w: w, h: h};
  }

  function handleUp() {
      if (!isDrawingBlur || isUploadingBlur || !blurCtx) return;
      isDrawingBlur = false;
      if (!currentRect || Math.abs(currentRect.w) < 10 || Math.abs(currentRect.h) < 10) {
          blurCtx.clearRect(0, 0, blurCanvas.width, blurCanvas.height);
          blurCtx.drawImage(backupCanvas, 0, 0);
          return; 
      }
      
      let cx = currentRect.x + currentRect.w / 2, cy = currentRect.y + currentRect.h / 2;
      let rx = Math.abs(currentRect.w / 2), ry = Math.abs(currentRect.h / 2);

      blurCtx.clearRect(0, 0, blurCanvas.width, blurCanvas.height);
      blurCtx.drawImage(backupCanvas, 0, 0);
      blurCtx.save();
      blurCtx.beginPath();
      blurCtx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
      blurCtx.clip(); 
      
      let blurAmount = Math.max(15, blurCanvas.width / 50); 
      blurCtx.filter = `blur(${blurAmount}px)`; 
      blurCtx.drawImage(backupCanvas, 0, 0);
      blurCtx.restore();
      
      backupCtx.clearRect(0, 0, backupCanvas.width, backupCanvas.height);
      backupCtx.drawImage(blurCanvas, 0, 0);
  }

  window.closeBlurTool = () => {
      if (isUploadingBlur) {
          if (typeof Swal !== 'undefined') Swal.fire({toast: true, position: 'top-end', title: 'Γίνεται μεταφόρτωση...', icon: 'warning', showConfirmButton: false, timer: 1500});
          else alert('Περιμένετε να ολοκληρωθεί το ανέβασμα...');
          return;
      }
      const overlay = document.getElementById('blur-editor-overlay');
      if (overlay) overlay.style.display = 'none';
      document.body.style.overflow = ''; // Επαναφορά σκρολ σελίδας
  };

  window.savePostBlurredImage = () => {
      if(!blurCanvas || !currentPostIdBlur) return;
      isUploadingBlur = true; // ΕΝΕΡΓΟΠΟΙΗΣΗ ΑΣΠΙΔΑΣ!
      
      const btn = document.getElementById('save-blur-btn');
      if(btn) { btn.innerHTML = "⏳ Ανέβασμα..."; btn.disabled = true; }
      document.getElementById('blur-status-text').innerText = "Ανεβαίνει η ασφαλής εικόνα...";
      
      if (typeof Swal !== 'undefined') Swal.fire({toast: true, position: 'top-end', title: 'Η εικόνα μεταφορτώνεται...', icon: 'info', showConfirmButton: false, timer: 2000});

      const formData = new FormData();
      formData.append("file", blurCanvas.toDataURL('image/jpeg', 0.85));
      formData.append("upload_preset", UPLOAD_PRESET);

      fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: formData })
      .then(res => res.json())
      .then(data => {
          if(data.secure_url) {
              db.ref('parent_posts/' + currentPostIdBlur).update({ imageUrl: data.secure_url }).then(() => {
                  isUploadingBlur = false; // ΑΠΕΝΕΡΓΟΠΟΙΗΣΗ ΑΣΠΙΔΑΣ
                  closeBlurTool();
                  if (typeof Swal !== 'undefined') Swal.fire({icon: 'success', title: 'Επιτυχία!', text: 'Η εικόνα αντικαταστάθηκε.', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000});
              });
          } else throw new Error("Cloudinary Error");
      })
      .catch(err => {
          isUploadingBlur = false; // ΑΠΕΝΕΡΓΟΠΟΙΗΣΗ ΑΣΠΙΔΑΣ ΣΕ ΠΕΡΙΠΤΩΣΗ ΣΦΑΛΜΑΤΟΣ
          if(btn) { btn.innerHTML = "💾 Αποθήκευση"; btn.disabled = false; }
          document.getElementById('blur-status-text').innerText = "Αποτυχία. Δοκιμάστε ξανά.";
          if (typeof Swal !== 'undefined') Swal.fire('Σφάλμα', 'Αποτυχία ανεβάσματος. Δοκίμασε ξανά.', 'error');
          else alert("Αποτυχία ανεβάσματος. Δοκίμασε ξανά.");
      });
  };

  window.removePostImage = (id) => {
    if (confirm('Σίγουρα θέλετε να διαγράψετε την εικόνα;')) {
      db.ref('parent_posts/' + id + '/imageUrl').remove().then(() => {
        if (typeof Swal !== 'undefined') Swal.fire({icon: 'success', title: 'Διαγράφηκε', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000});
      });
    }
  };
  function escapeHTML(str) { return str ? str.replace(/[&<>'"]/g, t => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[t])) : ""; }

  initApp();
})();
