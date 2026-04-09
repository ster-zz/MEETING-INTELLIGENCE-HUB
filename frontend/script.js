const API_BASE = 'http://127.0.0.1:8000/api';

// Shared utilities
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// index.html - Fetch all meetings
async function fetchMeetings() {
    const listContainer = document.getElementById('meetings-list');
    if (!listContainer) return;

    try {
        const meetings = await apiRequest('/meetings');
        listContainer.innerHTML = '';
        
        if (meetings.length === 0) {
            listContainer.innerHTML = '<p>No meetings found. Try uploading a transcript.</p>';
            return;
        }

        meetings.forEach(m => {
            const card = document.createElement('a');
            card.href = `detail.html?id=${m.id}`;
            card.className = 'glass-card meeting-card';
            card.innerHTML = `
                <h3>${m.title}</h3>
                <p>Date: ${m.date}</p>
                <div style="margin-top:1rem;color:var(--primary);font-size:0.9rem;">View details &rarr;</div>
            `;
            listContainer.appendChild(card);
        });
    } catch (e) {
        listContainer.innerHTML = `<div class="status-message error">Failed to load meetings. Make sure backend is running.</div>`;
    }
}

// upload.html - Handle File Upload
async function handleUpload(e) {
    e.preventDefault();
    const fileInput = document.getElementById('transcript-file');
    const statusDiv = document.getElementById('upload-status');
    const btn = document.getElementById('upload-btn');

    if (!fileInput.files.length) return;

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    btn.disabled = true;
    btn.textContent = 'Uploading...';
    statusDiv.textContent = '';

    try {
        const result = await apiRequest('/upload', {
            method: 'POST',
            body: formData
        });
        statusDiv.style.color = '#10b981'; // Green
        statusDiv.textContent = 'Upload successful! Redirecting to meeting details...';
        setTimeout(() => window.location.href = `detail.html?id=${result.meeting_id}`, 1500);
    } catch (err) {
        statusDiv.style.color = '#ef4444'; // Red
        statusDiv.textContent = 'Failed to upload document.';
        btn.disabled = false;
        btn.textContent = 'Upload & Analyze';
    }
}

// detail.html - Fetch specific meeting details & chat
async function fetchMeetingDetails() {
    const titleEl = document.getElementById('meeting-title');
    if (!titleEl) return;

    const params = new URLSearchParams(window.location.search);
    const meetingId = params.get('id') || 'dummy_id';

    try {
        const data = await apiRequest(`/meetings/${meetingId}`);
        
        document.getElementById('meeting-title').textContent = data.title;
        
        // Populate Decisions
        const decList = document.getElementById('decisions-list');
        decList.innerHTML = data.decisions.map(d => `<li>${d}</li>`).join('') || '<li>No decisions</li>';

        // Populate Action Items
        const aiList = document.getElementById('action-items-list');
        aiList.innerHTML = data.action_items.map(a => `
            <tr>
                <td>${a.task}</td>
                <td><span style="background:var(--primary);padding:2px 8px;border-radius:12px;font-size:0.8rem">${a.owner}</span></td>
            </tr>
        `).join('') || '<tr><td colspan="2">No action items</td></tr>';

    } catch (e) {
        titleEl.textContent = 'Error loading meeting details';
    }

    // Setup Chat
    const chatForm = document.getElementById('chat-form');
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('chat-input');
        const msg = input.value.trim();
        if (!msg) return;

        addChatMessage(msg, 'user');
        input.value = '';

        try {
            const res = await apiRequest('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ meeting_id: meetingId, message: msg })
            });
            addChatMessage(res.reply, 'system');
        } catch (err) {
            addChatMessage('Sorry, an error occurred communicating with the server.', 'system');
        }
    });
}

function addChatMessage(text, sender) {
    const window = document.getElementById('chat-window');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    msgDiv.textContent = text;
    window.appendChild(msgDiv);
    window.scrollTop = window.scrollHeight;
}
