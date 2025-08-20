// === データ構造の定義 ===
        let sections = []; // セクションの配列
        let currentSection = null; // 現在選択されているセクション
        let nextId = 1; // ID生成用のカウンター
        let contextTarget = null; // コンテキストメニューの対象
        let sectionCounter = 1; // セクション番号のカウンター
        let isPanelHidden = false; // パネルの表示状態

        // === 初期化処理 ===
        function initializeApp() {
            renderSections(); // セクション一覧を描画
        }

        // === セクション関連の処理 ===

        // セクション一覧を画面に描画
        function renderSections() {
            const list = document.getElementById('sections-list');
            list.innerHTML = ''; // 既存の内容をクリア
            
            // 各セクションをHTMLとして生成
            sections.forEach(section => {
                const item = document.createElement('div');
                item.className = 'section-item';
                item.innerHTML = `
                    <div class="section-name">${section.name}</div>
                    <button class="section-menu" onclick="showContextMenu(event, 'section', ${section.id})">⋮</button>
                `;
                // セクションクリック時の処理（メニューボタン以外）
                item.onclick = (e) => {
                    if (!e.target.classList.contains('section-menu')) {
                        selectSection(section.id);
                    }
                };
                list.appendChild(item);
            });
        }

        // セクションを選択した時の処理
        function selectSection(id) {
            currentSection = sections.find(s => s.id === id); // 選択されたセクションを取得
            document.getElementById('header-title').textContent = currentSection.name; // ヘッダーのタイトル部分だけ変更
            showNotesPanel(); // ノート一覧パネルを表示
            moveSectionToTop(id); // 選択したセクションを一番上に移動
            renderNotes(); // ノート一覧を描画
        }

        // セクション追加モーダルを表示
        function showAddSectionModal() {
            // 標準名を生成（セクション1、セクション2...、重複しない番号を自動生成）
            let baseName = 'セクション';
            let counter = sectionCounter;
            let proposedName = `${baseName}${counter}`;
            
            // 既存のセクション名と重複しないかチェック
            while (sections.some(s => s.name === proposedName)) {
                counter++;
                proposedName = `${baseName}${counter}`;
            }
            
            document.getElementById('section-name').value = proposedName;
            showModal('section-modal');
        }

        // 新しいセクションを追加
        function addSection() {
            const name = document.getElementById('section-name').value.trim();
            if (name) {
                const section = {
                    id: nextId++, // 一意のIDを生成
                    name: name,
                    notes: [] // 空のノート配列で初期化
                };
                sections.push(section);
                
                // セクション番号カウンターを更新
                const match = name.match(/セクション(\d+)/);
                if (match) {
                    sectionCounter = Math.max(sectionCounter, parseInt(match[1]) + 1);
                }
                
                renderSections(); // セクション一覧を再描画
                hideModal('section-modal');
            }
        }

        // セクションを削除
        function deleteSection(id) {
            sections = sections.filter(s => s.id !== id);
            if (currentSection?.id === id) {
                currentSection = null;
                document.getElementById('header-title').textContent = 'セクションを選択してください'; // 初期表示に戻す
                hideNotesPanel();
                hidePageContent();
            }
            renderSections();
        }

        // === ノート関連の処理 ===

        // ノート一覧パネルを表示
        function showNotesPanel() {
            document.getElementById('sections-panel').style.display = 'none'; // セクションパネルを非表示
            document.getElementById('notes-panel').classList.add('show'); // ノートパネルを表示
            document.getElementById('notes-title').textContent = currentSection.name; // タイトル設定
            
            // ノート画面でも入力エリアを表示
            document.getElementById('empty-state').style.display = 'none';
            document.getElementById('page-content').style.display = 'block';
            document.getElementById('input-area').style.display = 'flex';
            renderNotesDisplay(); // ノート表示を更新
        }

        // ノート一覧パネルを非表示
        function hideNotesPanel() {
            document.getElementById('notes-panel').classList.remove('show');
            document.getElementById('sections-panel').style.display = 'flex'; // セクションパネルを再表示

             document.getElementById('header-toggle-btn').style.display = 'inline-block';
            document.getElementById('save-btn').style.display = 'inline-block';
            document.getElementById('load-btn').style.display = 'inline-block';
        }

        // セクション一覧に戻る
        function backToSections() {
            hideNotesPanel();
            currentSection = null;
            document.getElementById('header-title').textContent = 'セクションを選択してください'; // 初期表示に戻す
            hidePageContent();
        }

        // ノート一覧を画面に描画
        function renderNotes() {
            const list = document.getElementById('notes-list');
            list.innerHTML = '';
            
            if (!currentSection) return;
            
            // 各ノートをHTMLとして生成
            currentSection.notes.forEach(note => {
                const item = document.createElement('div');
                item.className = 'note-item';
                item.style.borderLeftColor = getRandomColor(); // ランダムな色でカラーバーを設定
                item.innerHTML = `
                    <div class="note-category">${note.category}</div>
                    <div class="note-content">${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}</div>
                    <div class="note-date">${formatDate(note.date)}</div>
                    <button class="note-menu" onclick="showContextMenu(event, 'note', ${note.id})">⋮</button>
                `;
                list.appendChild(item);
            });
        }

        // 新しいノートを追加
        function addNote() {
            const category = document.getElementById('category-input').value.trim();
            const content = document.getElementById('content-input').value.trim();
            
            // 入力値チェック
            if (!category || !content || !currentSection) return;
            
            const note = {
                id: nextId++,
                category: category,
                content: content,
                date: new Date() // 現在の日時
            };
            
            currentSection.notes.unshift(note); // 配列の先頭に追加（新しい順）
            
            // 入力欄をクリア
            document.getElementById('category-input').value = '';
            document.getElementById('content-input').value = '';
            
            renderNotes(); // ノート一覧を再描画
            renderNotesDisplay(); // ページ部分のノート表示を更新
        }

        // ノートを削除
        function deleteNote(id) {
            if (currentSection) {
                currentSection.notes = currentSection.notes.filter(n => n.id !== id);
                renderNotes();
                renderNotesDisplay();
            }
        }

        // === ページ表示関連の処理 ===

        // ページ内容を表示
        function showPageContent() {
            document.getElementById('empty-state').style.display = 'none';
            document.getElementById('page-content').style.display = 'block';
            document.getElementById('input-area').style.display = 'flex';
            renderNotesDisplay();
        }

        // ページ内容を非表示
        function hidePageContent() {
            document.getElementById('empty-state').style.display = 'flex';
            document.getElementById('page-content').style.display = 'none';
            document.getElementById('input-area').style.display = 'none';
        }

        // ページ部分にノートをカテゴリ別にグループ化して表示
        function renderNotesDisplay() {
            const display = document.getElementById('notes-display');
            display.innerHTML = '';
            
            if (!currentSection) return;
            
            // カテゴリ別にノートをグループ化
            const categories = {};
            currentSection.notes.forEach(note => {
                if (!categories[note.category]) {
                    categories[note.category] = [];
                }
                categories[note.category].push(note);
            });
            
            // 各カテゴリごとにHTMLを生成
            Object.keys(categories).forEach(category => {
                const categoryGroup = document.createElement('div');
                categoryGroup.className = 'category-group';
                
                // カテゴリタイトル
                const categoryTitle = document.createElement('div');
                categoryTitle.className = 'category-title';
                categoryTitle.textContent = category;
                categoryGroup.appendChild(categoryTitle);
                
                // 新しい順でソート
                categories[category].sort((a, b) => new Date(b.date) - new Date(a.date));
                
                // 各ノートを表示
                categories[category].forEach(note => {
                    const noteEntry = document.createElement('div');
                    noteEntry.className = 'note-entry';
                    noteEntry.innerHTML = `
                        <div class="note-entry-content">${note.content}</div>
                        <div class="note-entry-date">${formatDate(note.date)}</div>
                    `;
                    categoryGroup.appendChild(noteEntry);
                });
                
                display.appendChild(categoryGroup);
            });
        }

        // === パネル切り替え処理 ===
        function togglePanel() {
            const sectionsPanel = document.getElementById('sections-panel');
            const toggleBtn = document.getElementById('header-toggle-btn');
            
            if (isPanelHidden) {
                // パネルを表示
                sectionsPanel.classList.remove('hidden');
                toggleBtn.textContent = '◀';
                isPanelHidden = false;
            } else {
                // パネルを隠す
                sectionsPanel.classList.add('hidden');
                toggleBtn.textContent = '▶';
                isPanelHidden = true;
            }
        }

        // === コンテキストメニュー関連 ===
        
        // コンテキストメニューを表示
        function showContextMenu(event, type, id) {
            event.preventDefault();
            event.stopPropagation();
            
            contextTarget = { type, id }; // メニューの対象を保存
            const menu = document.getElementById('context-menu');
            
            // マウス位置にメニューを表示
            menu.style.left = event.pageX + 'px';
            menu.style.top = event.pageY + 'px';
            menu.classList.add('show');
        }

        // コンテキストメニューを非表示
        function hideContextMenu() {
            document.getElementById('context-menu').classList.remove('show');
            contextTarget = null;
        }

        // 現在のアイテムを削除
        function deleteCurrentItem() {
            if (!contextTarget) return;
            
            if (contextTarget.type === 'section') {
                deleteSection(contextTarget.id);
            } else if (contextTarget.type === 'note') {
                deleteNote(contextTarget.id);
            }
            
            hideContextMenu();
        }

        // === ユーティリティ関数 ===
        
        // 日時を相対的な形式でフォーマット
        function formatDate(date) {
            const now = new Date();
            const diff = now - new Date(date);
            const minutes = Math.floor(diff / (1000 * 60));
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            
            if (minutes < 1) return 'たった今';
            if (minutes < 60) return `${minutes}分前`;
            if (hours < 24) return `${hours}時間前`;
            if (days < 7) return `${days}日前`;
            return new Date(date).toLocaleDateString('ja-JP');
        }

        // ランダムな色を取得（ノートの左側カラーバー用）
        function getRandomColor() {
            const colors = ['#0078d4', '#d13438', '#107c10', '#ff8c00', '#5c2d91', '#e3008c'];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        // === モーダル関連の処理 ===
        
        // モーダルを表示
        function showModal(modalId) {
            document.getElementById(modalId).classList.add('show');
        }

        // モーダルを非表示
        function hideModal(modalId) {
            document.getElementById(modalId).classList.remove('show');
        }

        // === イベントリスナーの設定 ===
        
        // ページ読み込み完了時に初期化
        document.addEventListener('DOMContentLoaded', initializeApp);

        // 画面クリック時にコンテキストメニューを隠す
        document.addEventListener('click', hideContextMenu);

        // モーダルの背景クリックで閉じる
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        });

        // Enterキーでモーダルの主要ボタンを実行
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const modal = document.querySelector('.modal.show');
                if (modal) {
                    const primaryBtn = modal.querySelector('.primary');
                    if (primaryBtn) {
                        primaryBtn.click();
                    }
                }
            }
        });

        // 内容入力欄でCtrl+Enterキーでノートを追加
        document.getElementById('content-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                addNote();
            }
        });

// === 端末保存 ===
function downloadData() {
    const appData = {
        sections,
        nextId,
        sectionCounter,
        currentSection: currentSection ? currentSection.id : null
    };
    const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notesAppData.json';
    a.click();
    URL.revokeObjectURL(url);
}

// === 端末読み込み ===
function uploadData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const appData = JSON.parse(e.target.result);
            sections = appData.sections || [];
            nextId = appData.nextId || 1;
            sectionCounter = appData.sectionCounter || 1;
            currentSection = appData.currentSection ? sections.find(s => s.id === appData.currentSection) : null;
            renderSections();
            if (currentSection) {
                document.getElementById('header-title').textContent = currentSection.name;
                showNotesPanel();
                renderNotes();
            } else {
                hideNotesPanel();
                hidePageContent();
                document.getElementById('header-title').textContent = 'セクションを選択してください';
            }
            alert("データを読み込みました。");
        } catch {
            alert("読み込みに失敗しました。正しいファイルを選択してください。");
        }
    };
    reader.readAsText(file);
}

// === 以下に元のJSの全関数 ===
// addSection, deleteSection, addNote, deleteNote には saveData() は不要（端末保存はボタンで行うため）
