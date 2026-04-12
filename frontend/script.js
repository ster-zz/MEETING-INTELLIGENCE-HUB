const API_BASE = '/api';

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
            listContainer.innerHTML = '<div class="col-span-full py-20 text-center text-zinc-400">No meetings found. Start by uploading a transcript above.</div>';
            return;
        }

        // Only show last 3 meetings, newest first
        const recentMeetings = meetings.slice(-3).reverse();

        recentMeetings.forEach(m => {
            const card = document.createElement('div');
            card.className = 'bg-surface-container-lowest p-8 rounded-2xl border-b-4 border-on-surface hover:shadow-2xl transition-all group cursor-pointer';
            
            // Map sentiment to aesthetic classes
            const sentiment = m.overall_sentiment || 'Neutral';
            const sentimentColor = sentiment === 'Positive' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 
                                 (sentiment === 'Negative' ? 'bg-primary shadow-[0_0_8px_rgba(176,38,0,0.6)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]');
            const sentimentText = sentiment === 'Positive' ? 'Positive Alignment' : (sentiment === 'Negative' ? 'High Urgency' : 'Neutral/Mixed');
            const sentimentTextColor = sentiment === 'Positive' ? 'text-emerald-600' : (sentiment === 'Negative' ? 'text-primary' : 'text-amber-600');

            card.onclick = () => window.location.href = `detail.html?id=${m.id}`;
            
            card.innerHTML = `
                <div class="flex justify-between items-start mb-6">
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full ${sentimentColor}"></div>
                        <span class="text-[10px] font-black uppercase tracking-widest ${sentimentTextColor}">${sentimentText}</span>
                    </div>
                    <span class="text-[10px] font-medium text-zinc-500">${m.date || 'RECENT'}</span>
                </div>
                <h3 class="text-2xl font-black mb-4 leading-tight group-hover:text-secondary transition-colors break-words line-clamp-2">${m.title.replace(/\.[^/.]+$/, "")}</h3>
                <div class="flex gap-2 mb-6">
                    <span class="px-3 py-1 bg-surface-container rounded-full text-[10px] font-bold text-zinc-500 uppercase tracking-wider">#Meeting</span>
                    <span class="px-3 py-1 bg-surface-container rounded-full text-[10px] font-bold text-zinc-500 uppercase tracking-wider">#AI-Analyzed</span>
                </div>
                <div class="flex items-center justify-between pt-6 border-t border-outline-variant/20">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-sm text-primary">task_alt</span>
                        <span class="text-xs font-bold text-on-surface">View Dashboard</span>
                    </div>
                    <button class="material-symbols-outlined text-zinc-400 group-hover:text-primary">arrow_forward</button>
                </div>
            `;
            listContainer.appendChild(card);
        });
    } catch (e) {
        listContainer.innerHTML = `<div class="col-span-full py-10 text-center text-primary font-bold">Failed to connect to Intelligence Hub.</div>`;
    }
}

// upload.html - Handle File Upload
async function handleUpload(e) {
    if (e) e.preventDefault();
    const fileInput = document.getElementById('transcript-file');
    const btn = document.getElementById('upload-btn');
    const progressBar = document.getElementById('progress-bar');
    const progressPercent = document.getElementById('progress-percent');
    const progressStatus = document.getElementById('progress-status');

    if (!fileInput || !fileInput.files.length) return;

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    if (btn) {
        btn.disabled = true;
        btn.classList.add('loading');
    }
    
    // Simulate Progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 95) {
            progress = 95;
            clearInterval(interval);
            if (progressStatus) progressStatus.textContent = 'Intelligence extraction in progress...';
        }
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (progressPercent) progressPercent.textContent = `${Math.floor(progress)}%`;
    }, 400);

    try {
        const result = await apiRequest('/upload', {
            method: 'POST',
            body: formData
        });
        
        clearInterval(interval);
        if (progressBar) progressBar.style.width = '100%';
        if (progressPercent) progressPercent.textContent = '100%';
        if (progressStatus) progressStatus.textContent = 'Analysis Complete! Redirecting...';
        
        setTimeout(() => window.location.href = `detail.html?id=${result.meeting_id}`, 1000);
    } catch (err) {
        clearInterval(interval);
        if (progressStatus) {
            progressStatus.textContent = 'Error: Analysis failed.';
            progressStatus.style.color = '#b02600';
        }
        if (btn) {
            btn.disabled = false;
            btn.classList.remove('loading');
        }
    }
}

// detail.html - Fetch specific meeting details & chat in Studio Layout
async function fetchMeetingDetails() {
    const titleEl = document.getElementById('meeting-title-header');
    if (!titleEl) return;

    const params = new URLSearchParams(window.location.search);
    const meetingId = params.get('id') || 'dummy_id';

    try {
        const data = await apiRequest(`/meetings/${meetingId}`);
        
        // Populate Title and Metadata (Clean extension)
        const cleanTitle = data.title.replace(/\.[^/.]+$/, "");
        titleEl.textContent = cleanTitle;
        const dateEl = document.getElementById('meeting-date');
        if (dateEl) dateEl.textContent = data.date || 'APRIL 2026';
        
        // Populate Analysis Content on the Right
        const contentArea = document.getElementById('analysis-content');
        contentArea.innerHTML = '';

        // Summary Card (Aesthetic Typography Refinement)
        const summaryHtml = `
            <section class="border-l-8 border-[#151614] pl-10 py-6 mb-12">
                <p class="text-4xl lg:text-5xl font-black uppercase tracking-tighter text-on-surface mb-10 leading-none">Principal Summary</p>
                <div class="max-w-[85%] pr-10">
                    <p class="text-lg text-zinc-600 font-medium leading-relaxed">
                        ${data.summary || 'Extracting core narrative...'}
                    </p>
                </div>
            </section>
        `;
        contentArea.insertAdjacentHTML('beforeend', summaryHtml);

        // Sentiment Indicator (Metadata Section)
        if (data.overall_sentiment) {
            const sentimentColors = {
                'Positive': 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
                'Negative': 'bg-[#b02600] shadow-[0_0_8px_rgba(176,38,0,0.5)]',
                'Neutral': 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
            };
            const indicatorHtml = `
                <div class="flex items-center gap-4 py-6 border-b border-outline-variant/10 mb-8">
                    <div class="w-3 h-3 rounded-full ${sentimentColors[data.overall_sentiment]}"></div>
                    <span class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Emotional Rhythm: ${data.overall_sentiment} Alignment</span>
                </div>
            `;
            contentArea.insertAdjacentHTML('beforeend', indicatorHtml);
        }

        // 1. Display Original Transcript on the Left
        displayTranscript(data.text || 'No transcript data available.');

        // Speaker Dynamics
        if (data.speaker_sentiment && data.speaker_sentiment.length > 0) {
            const speakerHtml = `
                <section class="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/20 shadow-sm">
                    <h2 class="text-2xl font-black uppercase tracking-tighter mb-8">Speaker Dynamics</h2>
                    <div class="space-y-6">
                        ${data.speaker_sentiment.map(s => {
                            const badgeColor = s.sentiment === 'Positive' ? 'text-emerald-600 bg-emerald-50' : (s.sentiment === 'Negative' ? 'text-[#b02600] bg-red-50' : 'text-amber-600 bg-amber-50');
                            return `
                                <div class="flex flex-col gap-2">
                                    <div class="flex items-center gap-3">
                                        <span class="text-sm font-black uppercase tracking-tight">${s.name}</span>
                                        <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase ${badgeColor}">${s.sentiment}</span>
                                    </div>
                                    <p class="text-sm text-zinc-500 leading-relaxed">${s.note || ''}</p>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </section>
            `;
            contentArea.insertAdjacentHTML('beforeend', speakerHtml);
        }

        // Intelligence Anchors (Key Moments)
        if (data.key_moments && data.key_moments.length > 0) {
            const anchorsHtml = `
                <section class="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/20 shadow-sm">
                    <h2 class="text-2xl font-black uppercase tracking-tighter mb-8">Intelligence Anchors</h2>
                    <div class="space-y-4">
                        ${data.key_moments.map(m => {
                             const typeColor = m.type === 'Agreement' ? 'text-emerald-500' : (m.type === 'Conflict' ? 'text-[#b02600]' : 'text-amber-500');
                             return `
                                <div class="flex gap-4 group cursor-pointer" onclick="highlightTranscriptText('${m.text}')">
                                    <span class="text-[10px] font-black uppercase tracking-widest pt-1 ${typeColor} w-20 flex-shrink-0">${m.type}</span>
                                    <p class="text-sm font-medium italic group-hover:text-[#b02600] transition-colors leading-relaxed">"${m.text}"</p>
                                </div>
                             `;
                        }).join('')}
                    </div>
                </section>
            `;
            contentArea.insertAdjacentHTML('beforeend', anchorsHtml);
        }

        // Key Decisions
        if (data.decisions && data.decisions.length > 0) {
            const decisionsHtml = `
                <section class="bg-[#1b1c19] text-white p-10 rounded-3xl shadow-2xl">
                    <h2 class="text-2xl font-black uppercase tracking-tighter mb-8 text-[#ff3b00]">Key Decisions</h2>
                    <div class="space-y-8">
                        ${data.decisions.map(d => `
                            <div>
                                <h4 class="text-lg font-bold mb-2 leading-tight">${d.decision || d}</h4>
                                <p class="text-sm text-zinc-400 leading-relaxed font-medium">${d.rationale || ''}</p>
                            </div>
                        `).join('')}
                    </div>
                </section>
            `;
            contentArea.insertAdjacentHTML('beforeend', decisionsHtml);
        }

        // Action Items
        if (data.action_items && data.action_items.length > 0) {
            const itemsHtml = `
                <section class="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/20 shadow-sm">
                    <h2 class="text-2xl font-black uppercase tracking-tighter mb-8">Strategic Tasks</h2>
                    <table class="w-full text-left">
                        <thead>
                            <tr class="border-b border-outline-variant/30">
                                <th class="pb-4 text-xs font-black uppercase tracking-widest text-zinc-400">Operation</th>
                                <th class="pb-4 text-xs font-black uppercase tracking-widest text-zinc-400">Accountable</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.action_items.map(a => {
                                const priorityColor = a.priority === 'High' ? 'text-red-600' : (a.priority === 'Medium' ? 'text-amber-600' : 'text-blue-600');
                                return `
                                    <tr class="border-b border-outline-variant/10">
                                        <td class="py-6">
                                            <p class="text-sm font-bold mb-1">${a.task || a}</p>
                                            <div class="flex items-center gap-2">
                                                <span class="text-[10px] font-black uppercase tracking-tighter ${priorityColor}">${a.priority || 'Standard'}</span>
                                                <span class="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">Deadline: ${a.deadline || 'ASAP'}</span>
                                            </div>
                                        </td>
                                        <td class="py-6">
                                            <span class="px-3 py-1 bg-[#1b1c19] text-white rounded-full text-[10px] font-black uppercase tracking-widest">${a.owner || 'Unassigned'}</span>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </section>
            `;
            contentArea.insertAdjacentHTML('beforeend', itemsHtml);
        }

        // 3. Setup Chat Studio
        setupChatStudio(meetingId);

    } catch (e) {
        console.error(e);
        if (titleEl) titleEl.textContent = 'Error loading meeting details';
    }
}

function displayTranscript(text) {
    const container = document.getElementById('transcript-container');
    if (!container) return;

    // Basic parsing of timestamps if present [00:00]
    const lines = text.split('\n');
    container.innerHTML = lines.map((line, i) => {
        if (!line.trim()) return '';
        
        // Match timestamps like 00:00 or [00:00]
        const timeMatch = line.match(/^\[?(\d{2}:\d{2})\]?/);
        let time = timeMatch ? timeMatch[1] : '';
        let content = timeMatch ? line.replace(timeMatch[0], '').trim() : line.trim();

        return `
            <div class="flex gap-6 group transcript-line" id="line-${i}">
                <span class="w-10 text-[10px] font-bold text-zinc-300 group-hover:text-primary transition-colors flex-shrink-0 pt-1">${time || (i+1).toString().padStart(2, '0')}</span>
                <p class="text-sm font-medium transition-all group-hover:text-on-surface">${content}</p>
            </div>
        `;
    }).join('');
}

function highlightTranscriptText(text) {
    const container = document.getElementById('transcript-container');
    const lines = container.querySelectorAll('.transcript-line');
    
    lines.forEach(line => {
        const p = line.querySelector('p');
        if (p && p.textContent.includes(text)) {
            line.scrollIntoView({ behavior: 'smooth', block: 'center' });
            line.classList.add('highlight-pulse');
            setTimeout(() => line.classList.remove('highlight-pulse'), 3000);
        }
    });
}

function setupChatStudio(meetingId) {
    const chatInput = document.getElementById('chat-input-text');
    const sendBtn = document.getElementById('send-studio-btn');
    if (!chatInput || !sendBtn) return;

    const handleSend = async () => {
        const msg = chatInput.value.trim();
        if (!msg) return;

        addStudioMessage(msg, 'user');
        chatInput.value = '';

        const thinkingId = addStudioMessage('Synthesizing...', 'system thinking');

        try {
            const res = await apiRequest('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ meeting_id: meetingId, message: msg })
            });
            document.getElementById(thinkingId)?.remove();
            addStudioMessage(res.answer || 'Analysis inconclusive.', 'system');
        } catch (err) {
            document.getElementById(thinkingId)?.remove();
            addStudioMessage('Critical Error: Could not connect to Analysis Hub.', 'system');
        }
    };

    sendBtn.onclick = handleSend;
    chatInput.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
}

function addStudioMessage(text, type) {
    const messages = document.getElementById('chat-messages');
    const id = 'msg-' + Math.random().toString(36).substr(2, 9);
    
    const msgDiv = document.createElement('div');
    msgDiv.id = id;
    msgDiv.className = `flex gap-4 ${type.includes('user') ? 'flex-row-reverse' : ''} ${type.includes('thinking') ? 'thinking' : ''}`;
    
    const icon = type.includes('user') ? 'person' : 'robot_2';
    const bgColor = type.includes('user') ? 'bg-[#b02600]' : 'bg-[#1b1c19]';
    const bubbleColor = type.includes('user') ? 'bg-white border-outline-variant/20' : 'bg-surface-container';
    const textColor = 'text-on-surface';

    msgDiv.innerHTML = `
        <div class="w-10 h-10 rounded-2xl ${bgColor} text-white flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-sm">${icon}</span>
        </div>
        <div class="${bubbleColor} p-6 rounded-3xl ${type.includes('user') ? 'rounded-tr-none' : 'rounded-tl-none'} border border-outline-variant/10 shadow-sm max-w-[80%]">
            <p class="text-sm font-medium leading-relaxed ${textColor}">${text}</p>
        </div>
    `;
    
    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;
    return id;
}
async function enableRename() {
    const titleEl = document.getElementById('meeting-title-header');
    const currentTitle = titleEl.textContent;
    const newTitle = prompt("Rename Document:", currentTitle);
    
    if (newTitle && newTitle !== currentTitle) {
        const params = new URLSearchParams(window.location.search);
        const meetingId = params.get('id');
        const oldTitle = titleEl.textContent;
        titleEl.textContent = "Renaming...";
        
        try {
            await apiRequest(`/meetings/${meetingId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle })
            });
            titleEl.textContent = newTitle;
            // Also update sidebar tooltip if any or other global refs
        } catch (err) {
            alert("Critical Error: Analysis Hub could not persist title update.");
            titleEl.textContent = oldTitle;
        }
    }
}

// Global Tab Switcher (Styled for DECISIO Studio)
function switchTab(tab) {
    const analysisView = document.getElementById('analysis-view');
    const chatView = document.getElementById('chat-view');
    const tabAnalysis = document.getElementById('tab-analysis');
    const tabChat = document.getElementById('tab-chat');

    const activeClasses = ['border-[#b02600]', 'text-[#b02600]', 'shadow-sm'];
    const inactiveClasses = ['border-outline-variant/30', 'text-zinc-400'];

    if (tab === 'analysis') {
        analysisView?.classList.remove('hidden');
        chatView?.classList.add('hidden');
        
        tabAnalysis?.classList.add(...activeClasses);
        tabAnalysis?.classList.remove(...inactiveClasses);
        
        tabChat?.classList.remove(...activeClasses);
        tabChat?.classList.add(...inactiveClasses);
    } else {
        analysisView?.classList.add('hidden');
        chatView?.classList.remove('hidden');
        
        tabChat?.classList.add(...activeClasses);
        tabChat?.classList.remove(...inactiveClasses);
        
        tabAnalysis?.classList.remove(...activeClasses);
        tabAnalysis?.classList.add(...inactiveClasses);
    }
}
