
const GOOGLE_SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTvWhC4yN0O3MlGDrfVkHCcvGAEMtB_awnZODjyIMTZhrKN9SyCR8CefL_-YJ7Qy_heXavauA6VbpFJ/pub?gid=0&single=true&output=csv';


        // FETCH AND RENDER
        async function fetchLeaderboard() {
            const wrapper = document.getElementById('leaderboard-table-wrapper');
            wrapper.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-pulse"></i> Loading leaderboard...</div>';

            try {
                const response = await fetch(GOOGLE_SHEETS_CSV_URL);
                if (!response.ok) throw new Error('Network response was not ok');
                const csvText = await response.text();
                
                const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
                if (lines.length < 2) throw new Error('No data rows found');
                
                // Assume first row is header: timestamp, username, points
                const data = [];
                for (let i = 1; i < lines.length; i++) {
                    const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
                    if (cols.length >= 3) {
                        const timestamp = cols[0];
                        const username = cols[1];
                        const points = parseInt(cols[2], 10);
                        if (username && !isNaN(points)) {
                            data.push({ username, points, timestamp });
                        }
                    }
                }
                
                if (data.length === 0) throw new Error('No valid data entries');
                
                // Sort: first by points DESC, then by timestamp ASC (earlier is better)
                data.sort((a, b) => {
                    if (a.points !== b.points) {
                        return b.points - a.points;
                    }
                    // Compare timestamps (strings like "YYYY-MM-DD HH:MM:SS" work lexicographically)
                    return a.timestamp.localeCompare(b.timestamp);
                });
                
                renderTable(data);
            } catch (error) {
                console.error('Error fetching from Google Sheets:', error);
                // Use demo data with proper sorting
                const sortedDemo = [...DEMO_DATA].sort((a,b) => {
                    if (a.points !== b.points) return b.points - a.points;
                    return a.timestamp.localeCompare(b.timestamp);
                });
                renderTable(sortedDemo, true);
            }
        }

        function renderTable(leaderboardData, isDemo = false) {
            const wrapper = document.getElementById('leaderboard-table-wrapper');
            if (!leaderboardData.length) {
                wrapper.innerHTML = '<div class="error-message">⚠️ No leaderboard data available yet. Be the first to submit a challenge!</div>';
                return;
            }

            let html = `
                 <table>
                    <thead>
                        <tr><th>Rank</th><th>Member</th><th>Points</th><th>Submission Time</th></tr>
                    </thead>
                    <tbody>
            `;
            leaderboardData.forEach((entry, idx) => {
                let rankIcon = '';
                if (idx === 0) rankIcon = '🏆 ';
                else if (idx === 1) rankIcon = '🥈 ';
                else if (idx === 2) rankIcon = '🥉 ';
                html += `
                    <tr>
                        <td class="rank-cell">${rankIcon}${idx + 1}</td>
                        <td class="name-cell">${escapeHtml(entry.username)}</td>
                        <td class="score-cell">${entry.points} pts</td>
                        <td style="font-size: 0.8rem; color: #aaa;">${escapeHtml(entry.timestamp || '—')}</td>
                    </tr>
                `;
            });
            html += `</tbody>}</table>`;
            if (isDemo) {
                html += `<div class="error-message" style="margin-top: 1rem; text-align:center;">⚠️ Using demo data — set your Google Sheets URL and ensure columns: Timestamp, Username, Points.</div>`;
            }
            wrapper.innerHTML = html;
        }

        function escapeHtml(str) {
            if (!str) return '';
            return str.replace(/[&<>]/g, function(m) {
                if (m === '&') return '&amp;';
                if (m === '<') return '&lt;';
                if (m === '>') return '&gt;';
                return m;
            });
        }
        const refreshBtn = document.getElementById('refreshLeaderboard');
        if(refreshBtn){
            document.getElementById('refreshLeaderboard').addEventListener('click', fetchLeaderboard);
            fetchLeaderboard();
        }