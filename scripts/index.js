const priorityAreas = [
            {
                title: "Agriculture",
                image: "https://images.unsplash.com/photo-1472396961693-142e6e269027",
                overlay: "Agriculture"
            },
            {
                title: "Energy\n(clean and efficient)",
                image: "https://images.unsplash.com/photo-1466442929976-97f336a657be",
                overlay: "Energy\n(clean and efficient)"
            },
            {
                title: "Natural resource conservation and management\n(including mining)",
                image: "https://images.unsplash.com/photo-1500673922987-e212871fec22",
                overlay: "Natural resource conservation and management\n(including mining)"
            },
            {
                title: "Sustainable transport and infrastructure",
                image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
                overlay: "Sustainable transport and infrastructure"
            },
            {
                title: "Environmental sustainability, including tourism education",
                image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
                overlay: "Environmental sustainability, including tourism education"
            },
            {
                title: "Green buildings and the built environment",
                image: "https://images.unsplash.com/photo-1472396961693-142e6e269027",
                overlay: "Green buildings and the built environment"
            },
            {
                title: "Sustainable waste management and recycling",
                image: "https://images.unsplash.com/photo-1500673922987-e212871fec22",
                overlay: "Sustainable waste management and recycling"
            },
            {
                title: "Water management",
                image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
                overlay: "Water management"
            },
            {
                title: "Sustainable production and consumption",
                image: "https://images.unsplash.com/photo-1466442929976-97f336a657be",
                overlay: "Sustainable production and consumption"
            }
        ];

        document.addEventListener('DOMContentLoaded', function () {
            const grid = document.getElementById('priority-areas');
            if (!grid) return;
            grid.innerHTML = '';
            priorityAreas.forEach(area => {
                const card = document.createElement('div');
                card.className = 'relative group overflow-hidden';
                card.innerHTML = `
                    <img src="${area.image}" class="w-full h-48 object-cover" alt="${area.title}">
                    <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span class="text-white text-xl font-semibold text-center">${area.overlay}</span>
                    </div>
                `;
                grid.appendChild(card);
            });
        });

        document.querySelectorAll('a[href="/"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = '/index.html';
            });
        });

        document.querySelectorAll('a[href="/about"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = '/about.html';
            });
        });

        // --- UI Usage Tracking Module ---
        function trackEvent(eventType, details = {}) {
            const event = {
                eventType,
                details,
                timestamp: new Date().toISOString(),
                page: window.location.pathname
            };
            let logs = JSON.parse(localStorage.getItem('uiUsageLogs') || '[]');
            logs.push(event);
            localStorage.setItem('uiUsageLogs', JSON.stringify(logs));
            // Send to Google Analytics if available
            if (typeof gtag === 'function') {
                gtag('event', eventType, {
                    event_category: 'UI Usage',
                    event_label: details.filter || details.cardTitle || '',
                    page_path: window.location.pathname,
                    ...details
                });
            }
        }

        // Track page load
        trackEvent('page_load');

        // Track navigation clicks (for all <a> tags)
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('a').forEach(a => {
                a.addEventListener('click', function() {
                    trackEvent('nav_click', { href: a.href });
                });
            });
        });

        // --- Improved UI Usage Log Viewer ---
        function showUsageLogs() {
            // Remove existing modal if present
            const existing = document.getElementById('usage-logs-modal');
            if (existing) existing.remove();

            const logs = JSON.parse(localStorage.getItem('uiUsageLogs') || '[]');
            const modal = document.createElement('div');
            modal.id = 'usage-logs-modal';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100vw';
            modal.style.height = '100vh';
            modal.style.background = 'rgba(0,0,0,0.5)';
            modal.style.zIndex = '10000';
            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';

            // Close modal when clicking outside content
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.remove();
                }
            });

            const content = document.createElement('div');
            content.style.background = '#fff';
            content.style.borderRadius = '10px';
            content.style.padding = '24px';
            content.style.maxWidth = '700px';
            content.style.width = '90vw';
            content.style.maxHeight = '80vh';
            content.style.overflowY = 'auto';
            content.style.boxShadow = '0 4px 32px rgba(0,0,0,0.2)';

            const closeBtn = document.createElement('button');
            closeBtn.innerText = 'Close';
            closeBtn.style.float = 'right';
            closeBtn.style.background = '#005d6a';
            closeBtn.style.color = 'white';
            closeBtn.style.border = 'none';
            closeBtn.style.padding = '6px 16px';
            closeBtn.style.borderRadius = '6px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.onclick = () => modal.remove();

            const title = document.createElement('h2');
            title.innerText = 'UI Usage Logs';
            title.style.marginTop = '0';
            title.style.marginBottom = '16px';
            title.style.color = '#005d6a';

            content.appendChild(closeBtn);
            content.appendChild(title);

            if (logs.length === 0) {
                const empty = document.createElement('div');
                empty.innerText = 'No logs found.';
                empty.style.color = '#888';
                content.appendChild(empty);
            } else {
                logs.reverse().forEach(log => {
                    const logDiv = document.createElement('div');
                    logDiv.style.background = '#f6f8fa';
                    logDiv.style.border = '1px solid #e0e0e0';
                    logDiv.style.borderRadius = '6px';
                    logDiv.style.padding = '10px 14px';
                    logDiv.style.marginBottom = '10px';
                    logDiv.style.fontFamily = 'monospace';
                    logDiv.style.fontSize = '14px';
                    logDiv.innerHTML = `<b>Type:</b> ${log.eventType}<br><b>Page:</b> ${log.page}<br><b>Time:</b> ${new Date(log.timestamp).toLocaleString()}<br><b>Details:</b> <pre style='white-space:pre-wrap;margin:0;'>${JSON.stringify(log.details, null, 2)}</pre>`;
                    content.appendChild(logDiv);
                });
            }

            // Add Save Logs button
            const saveBtn = document.createElement('button');
            saveBtn.innerText = 'Save Logs';
            saveBtn.style.float = 'right';
            saveBtn.style.background = '#0c973f';
            saveBtn.style.color = 'white';
            saveBtn.style.border = 'none';
            saveBtn.style.padding = '6px 16px';
            saveBtn.style.borderRadius = '6px';
            saveBtn.style.cursor = 'pointer';
            saveBtn.style.marginRight = '8px';
            saveBtn.onclick = function() {
                const blob = new Blob([JSON.stringify(logs, null, 2)], {type: 'application/json'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'ui-usage-logs.json';
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 0);
            };

            content.appendChild(saveBtn);

            modal.appendChild(content);
            document.body.appendChild(modal);
        }

        // Add a floating button for viewing logs (for admin/testing)
        document.addEventListener('DOMContentLoaded', function() {
            if (!document.getElementById('view-usage-logs-btn')) {
                const btn = document.createElement('button');
                btn.id = 'view-usage-logs-btn';
                btn.innerText = 'View Usage Logs';
                btn.style.position = 'fixed';
                btn.style.bottom = '20px';
                btn.style.right = '20px';
                btn.style.zIndex = '9999';
                btn.style.background = '#005d6a';
                btn.style.color = 'white';
                btn.style.padding = '10px 16px';
                btn.style.border = 'none';
                btn.style.borderRadius = '8px';
                btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                btn.style.cursor = 'pointer';
                btn.onclick = showUsageLogs;
                document.body.appendChild(btn);
            }
        });