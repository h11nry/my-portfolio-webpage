(function(){
  const editor = document.getElementById('editor');
  const titleInput = document.getElementById('title');
  const categorySelect = document.getElementById('category');
  const imageInput = document.getElementById('imageInput');
  const exportBtn = document.getElementById('export');
  const formatOptions = document.getElementById('formatOptions');
  const formatButtons = document.querySelectorAll('.format-buttons button');
  const imageCaptionInput = document.getElementById('imageCaption');
  const confirmFormatBtn = document.getElementById('confirmImageFormat');
  const cancelFormatBtn = document.getElementById('cancelImageFormat');
  const manageBtn = document.getElementById('manageArticles');
  const articleManager = document.getElementById('articleManager');
  const articleList = document.getElementById('articleList');
  const closeManagerBtn = document.getElementById('closeManager');
  const cleanupBtn = document.getElementById('cleanupIndex');
  const cleanupImagesBtn = document.getElementById('cleanupOrphanImages');
  const refreshBtn = document.getElementById('refreshList');
  const articleCountEl = document.getElementById('articleCount');
  const saveDraftBtn = document.getElementById('saveDraft');
  const loadDraftBtn = document.getElementById('loadDraft');
  const draftManager = document.getElementById('draftManager');
  const draftList = document.getElementById('draftList');
  const closeDraftManagerBtn = document.getElementById('closeDraftManager');

  // Store for tracking files and their future locations
  let imageFiles = new Map();
  let projectDir = null;
  let pendingImageFiles = [];
  let selectedFormat = 'inline';
  let insertionPoint = null;
  let currentEditingSlug = null; // Track if we're editing an existing article
  let draftsDir = null;

  // Command handlers
  document.querySelectorAll('[data-cmd]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const cmd = btn.getAttribute('data-cmd');
      switch(cmd) {
        case 'insertImage':
          imageInput.click();
          break;
        case 'insertHeading':
          insertHeading();
          break;
        case 'insertQuote':
          insertQuoteBox();
          break;
        case 'insertHighlight':
          insertHighlightBox();
          break;
        case 'insertSpecialBox':
          insertSpecialBox();
          break;
        case 'insertConclusion':
          insertConclusionBox();
          break;
        case 'bold':
        case 'italic':
          document.execCommand(cmd, false, null);
          break;
      }
    });
  });

  // Format selection handlers
  formatButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      formatButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedFormat = btn.getAttribute('data-format');
    });
  });

  confirmFormatBtn.addEventListener('click', confirmImageFormat);
  cancelFormatBtn.addEventListener('click', cancelImageFormat);
  manageBtn.addEventListener('click', showArticleManager);
  closeManagerBtn.addEventListener('click', hideArticleManager);
  cleanupBtn.addEventListener('click', cleanupInvalidEntries);
  cleanupImagesBtn.addEventListener('click', cleanupOrphanImageFolders);
  saveDraftBtn.addEventListener('click', saveDraft);
  loadDraftBtn.addEventListener('click', showDraftManager);
  closeDraftManagerBtn.addEventListener('click', hideDraftManager);
  if (refreshBtn) refreshBtn.addEventListener('click', showArticleManager);

  function saveSelection() {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
      insertionPoint = sel.getRangeAt(0);
    }
  }

  function restoreSelection() {
    if (insertionPoint) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(insertionPoint);
    }
  }

  function insertNodeAtCursor(node) {
    let sel = window.getSelection();
    if (!sel || !sel.rangeCount) {
      editor.appendChild(node);
      return;
    }
    let range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function insertHeading() {
    const h3 = document.createElement('h3');
    h3.textContent = '在此输入标题';
    h3.contentEditable = true;
    insertNodeAtCursor(h3);
  }

  function insertQuoteBox() {
    const quoteDiv = document.createElement('div');
    quoteDiv.className = 'quote-box';
    quoteDiv.innerHTML = '<p contenteditable="true">"在此输入引用内容"</p><span class="quote-author" contenteditable="true">— 作者姓名</span>';
    insertNodeAtCursor(quoteDiv);
  }

  function insertHighlightBox() {
    const highlightDiv = document.createElement('div');
    highlightDiv.className = 'movie-highlight';
    highlightDiv.innerHTML = '<h4 contenteditable="true">🎬 高亮标题</h4><p contenteditable="true">在此输入高亮内容。</p>';
    insertNodeAtCursor(highlightDiv);
  }

  function insertSpecialBox() {
    const specialDiv = document.createElement('div');
    specialDiv.className = 'special-box';
    specialDiv.innerHTML = '<h4 contenteditable="true">特殊框标题</h4><ul><li contenteditable="true"><strong>项目1:</strong> 描述</li><li contenteditable="true"><strong>项目2:</strong> 描述</li></ul>';
    insertNodeAtCursor(specialDiv);
  }

  function insertConclusionBox() {
    const conclusionDiv = document.createElement('div');
    conclusionDiv.className = 'conclusion';
    conclusionDiv.innerHTML = '<h4 contenteditable="true">🎭 结论标题</h4><p contenteditable="true">在此输入结论内容。</p>';
    insertNodeAtCursor(conclusionDiv);
  }

  imageInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    saveSelection();
    pendingImageFiles = files;
    
    // Show format options
    formatOptions.style.display = 'block';
    // Reset selection
    formatButtons[0].click(); // Select first format by default
    imageCaptionInput.value = '';
    
    imageInput.value = '';
  });

  function confirmImageFormat() {
    if (pendingImageFiles.length === 0) return;

    const caption = imageCaptionInput.value.trim();
    restoreSelection();

    switch(selectedFormat) {
      case 'inline':
        insertInlineImages(pendingImageFiles, caption);
        break;
      case 'side-by-side':
        insertSideBySideImages(pendingImageFiles, caption);
        break;
      case 'gallery':
        insertImageGallery(pendingImageFiles, caption);
        break;
      case 'wide':
        insertWideImages(pendingImageFiles, caption);
        break;
      case 'featured':
        insertFeaturedImages(pendingImageFiles, caption);
        break;
    }

    formatOptions.style.display = 'none';
    pendingImageFiles = [];
  }

  function cancelImageFormat() {
    formatOptions.style.display = 'none';
    pendingImageFiles = [];
  }

  function createImageElement(file, className = '') {
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onload = () => {
        const dataUrl = reader.result;
        const img = document.createElement('img');
        img.src = dataUrl;
        img.alt = file.name;
        if (className) img.className = className;
        
        imageFiles.set(dataUrl, {file, suggestedName: file.name});
        resolve(img);
      };
      reader.readAsDataURL(file);
    });
  }

  async function insertInlineImages(files, caption) {
    for (let file of files) {
      const img = await createImageElement(file, 'inline-image');
      const container = document.createElement('div');
      container.className = 'image-container';
      container.appendChild(img);
      
      if (caption) {
        const captionP = document.createElement('p');
        captionP.className = 'image-caption';
        captionP.textContent = caption;
        container.appendChild(captionP);
      }
      
      insertNodeAtCursor(container);
    }
  }

  async function insertSideBySideImages(files, caption) {
    if (files.length < 2) {
      alert('并排图片需要至少2张图片');
      return;
    }
    
    const container = document.createElement('div');
    container.className = 'side-by-side';
    
    for (let i = 0; i < Math.min(files.length, 2); i++) {
      const img = await createImageElement(files[i], 'character-image');
      const imgContainer = document.createElement('div');
      imgContainer.appendChild(img);
      
      if (caption) {
        const captionP = document.createElement('p');
        captionP.className = 'image-caption';
        captionP.textContent = caption + (files.length > 1 ? ` ${i+1}` : '');
        imgContainer.appendChild(captionP);
      }
      
      container.appendChild(imgContainer);
    }
    
    insertNodeAtCursor(container);
  }

  async function insertImageGallery(files, caption) {
    const container = document.createElement('div');
    container.className = 'image-gallery';
    
    for (let file of files) {
      const img = await createImageElement(file, 'gallery-image');
      container.appendChild(img);
    }
    
    insertNodeAtCursor(container);
    
    if (caption) {
      const captionP = document.createElement('p');
      captionP.className = 'image-caption';
      captionP.textContent = caption;
      insertNodeAtCursor(captionP);
    }
  }

  async function insertWideImages(files, caption) {
    for (let file of files) {
      const img = await createImageElement(file, 'wide-image');
      insertNodeAtCursor(img);
      
      if (caption) {
        const captionP = document.createElement('p');
        captionP.className = 'image-caption';
        captionP.textContent = caption;
        insertNodeAtCursor(captionP);
      }
    }
  }

  async function insertFeaturedImages(files, caption) {
    for (let file of files) {
      const img = await createImageElement(file, 'featured-image');
      insertNodeAtCursor(img);
      
      if (caption) {
        const captionP = document.createElement('p');
        captionP.className = 'image-caption';
        captionP.textContent = caption;
        insertNodeAtCursor(captionP);
      }
    }
  }

  function slugify(s) {
    return s.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g,'-').replace(/(^-|-$)/g,'') || 'untitled';
  }

  function escapeHtml(s) {
    return s.replace(/[&<>\"']/g, function(c){ 
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; 
    });
  }

  function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function generatePostHTML(title, content, slug, date, category) {
    // Include all the CSS from the template
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)} - Henry's Blog</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap" rel="stylesheet">
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background: #1e1e1f;
            color: #d6d6d6;
            font-family: 'DM Sans', 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            padding: 20px;
            font-size: 16px;
        }
        
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: #2b2b2c;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }
        
        .blog-header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: #333334;
            border-radius: 8px;
        }
        
        .blog-header h1 {
            color: #ffdb70;
            font-size: 2.2em;
            margin-bottom: 10px;
            font-family: 'Space Grotesk', 'Arial Black', sans-serif;
            font-weight: 600;
        }
        
        .back-link {
            color: #ffdb70;
            text-decoration: none;
            font-size: 0.9em;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
        }
        
        .back-link:hover {
            text-decoration: underline;
        }
        
        .article-title {
            color: #ffffff;
            font-size: 2.8em;
            font-weight: 700;
            margin-bottom: 15px;
            line-height: 1.1;
            font-family: 'Space Grotesk', 'Arial Black', sans-serif;
            letter-spacing: -0.8px;
        }
        
        .blog-meta {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 30px;
            color: #888;
        }
        
        .blog-category {
            background: #ffdb70;
            color: #1e1e1f;
            padding: 6px 14px;
            border-radius: 25px;
            font-size: 0.8em;
            font-weight: 600;
            font-family: 'Poppins', sans-serif;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .dot {
            width: 4px;
            height: 4px;
            background: #888;
            border-radius: 50%;
        }
        
        .content {
            font-size: 1.1em;
            line-height: 1.7;
        }
        
        .content p {
            margin-bottom: 20px;
            text-align: left;
        }
        
        .content h1, .content h2, .content h3 {
            color: #ffffff;
            margin: 35px 0 18px;
            font-family: 'Space Grotesk', 'Arial Black', sans-serif;
            font-weight: 600;
        }
        
        .content h1 { font-size: 2.4em; border-bottom: 3px solid #ffdb70; padding-bottom: 8px; }
        .content h2 { font-size: 2.0em; border-bottom: 2px solid #ffdb70; padding-bottom: 6px; }
        .content h3 { font-size: 1.6em; border-bottom: 1px solid #ffdb70; padding-bottom: 4px; }
        
        .content strong {
            color: #ffffff;
            font-weight: bold;
        }
        
        .content em {
            color: #ffdb70;
            font-style: italic;
        }

        /* All blog formatting styles */
        .special-box {
            background: #383838;
            border: 1px solid #555;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            border-left: 4px solid #ffdb70;
        }
        
        .quote-box {
            background: #333;
            border-left: 4px solid #ffdb70;
            padding: 22px;
            margin: 25px 0;
            border-radius: 0 12px 12px 0;
            font-style: italic;
            font-size: 1.08em;
            font-family: 'DM Sans', sans-serif;
            line-height: 1.6;
        }
        
        .quote-author {
            display: block;
            margin-top: 15px;
            color: #ffdb70;
            font-style: normal;
            font-weight: 600;
            font-family: 'Poppins', sans-serif;
            font-size: 0.85em;
        }
        
        .movie-highlight {
            background: linear-gradient(135deg, #444, #333);
            border-left: 4px solid #ff6b6b;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .conclusion {
            background: linear-gradient(135deg, #444, #556);
            border: 2px solid #ffdb70;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            text-align: center;
        }
        
        .conclusion h4 {
            color: #ffdb70;
            margin-bottom: 15px;
        }

        /* Image styles */
        .inline-image, .featured-image {
            width: 100%;
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 25px 0;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            transition: transform 0.3s ease;
        }
        
        .featured-image {
            height: 450px;
            object-fit: cover;
        }
        
        .inline-image:hover, .featured-image:hover {
            transform: scale(1.02);
        }
        
        .image-caption {
            text-align: center;
            font-size: 0.82em;
            color: #aaa;
            margin-top: 8px;
            font-style: italic;
            font-family: 'Poppins', sans-serif;
            font-weight: 400;
        }
        
        .image-container {
            margin: 30px 0;
            text-align: center;
        }
        
        .image-gallery {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 25px 0;
        }
        
        .gallery-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .gallery-image:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
        }
        
        .side-by-side {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 25px 0;
        }
        
        .character-image {
            width: 100%;
            height: 250px;
            object-fit: cover;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        .wide-image {
            width: 100%;
            height: 300px;
            object-fit: cover;
            border-radius: 8px;
            margin: 25px 0;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        /* Responsive adjustments */
        @media (max-width: 600px) {
            .featured-image {
                height: 250px;
            }
            
            .side-by-side {
                grid-template-columns: 1fr;
            }
            
            .character-image {
                height: 200px;
            }
        }
    </style>
</head>

<body>
    <div class="container">
        <header class="blog-header">
            <h1>Henry's Blog</h1>
            <a href="../../index.html#blog" class="back-link">← Back to Blog</a>
        </header>

        <article>
            <h1 class="article-title">${escapeHtml(title)}</h1>
            
            <div class="blog-meta">
                <span class="blog-category">${escapeHtml(category)}</span>
                <span class="dot"></span>
                <time datetime="${date}">${new Date(date).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})}</time>
            </div>

            <div class="content">
${content}
            </div>
        </article>
    </div>
</body>
</html>`;
  }

  async function processImagesAndContent(slug) {
    const cloned = editor.cloneNode(true);
    const imgs = cloned.querySelectorAll('img');
    const processedImages = [];
    const usedNames = new Set();

    // Remove all contenteditable attributes from the cloned content
    const editableElements = cloned.querySelectorAll('[contenteditable]');
    editableElements.forEach(element => {
      element.removeAttribute('contenteditable');
    });

    // Process each image
    for(let img of imgs) {
      const dataUrl = img.src;
      const imageInfo = imageFiles.get(dataUrl);
      
      if(imageInfo) {
        let name = imageInfo.suggestedName.replace(/[^a-zA-Z0-9_.-]/g,'_');
        let i = 1;
        let base = name;
        while(usedNames.has(name)) { 
          const ext = base.match(/(\.[^.]+)$/)?.[0] || '';
          const baseName = base.replace(/(\.[^.]+)$/, '');
          name = `${baseName}-${i}${ext}`;
          i++; 
        }
        usedNames.add(name);
        
        // Update src to final path - using article-specific folder
        img.src = `../images/${slug}/${name}`;
        processedImages.push({
          file: imageInfo.file,
          name: name
        });
      }
    }

    return {
      content: cloned.innerHTML,
      images: processedImages
    };
  }

  async function requestProjectDirectory() {
    if(!('showDirectoryPicker' in window)) {
      alert('抱歉，你的浏览器不支持文件系统访问API。请使用Chrome、Edge或其他支持的浏览器。');
      return null;
    }

    try {
      const dirHandle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents'
      });
      
      // Verify this is the project directory by checking for index.html
      try {
        await dirHandle.getFileHandle('index.html');
        return dirHandle;
      } catch {
        alert('请选择包含 index.html 的项目根目录');
        return null;
      }
    } catch(e) {
      if(e.name !== 'AbortError') {
        console.error('Error accessing directory:', e);
      }
      return null;
    }
  }

  async function updateIndexHTML(dirHandle, postInfo) {
    try {
      const indexHandle = await dirHandle.getFileHandle('index.html');
      const file = await indexHandle.getFile();
      let content = await file.text();

      // Find the blog posts list and add new entry
      const blogListRegex = /<ul class="blog-posts-list">([\s\S]*?)<\/ul>/;
      const match = content.match(blogListRegex);
      
      if(match) {
        const existingItems = match[1];
        const newItem = `
            <li class="blog-post-item">
              <a href="./assets/posts/${postInfo.slug}.html">
                <figure class="blog-banner-box">
                  <img src="./assets/images/${postInfo.firstImage || 'default-blog.jpg'}" alt="${escapeHtml(postInfo.title)}" loading="lazy">
                </figure>

                <div class="blog-content">
                  <div class="blog-meta">
                    <p class="blog-category">${escapeHtml(postInfo.category)}</p>
                    <span class="dot"></span>
                    <time datetime="${postInfo.date}">${new Date(postInfo.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</time>
                  </div>

                  <h3 class="h3 blog-item-title">${escapeHtml(postInfo.title)}</h3>

                  <p class="blog-text">
                    ${escapeHtml(postInfo.excerpt)}
                  </p>
                </div>
              </a>
            </li>${existingItems}`;

        const newContent = content.replace(blogListRegex, `<ul class="blog-posts-list">${newItem}
          </ul>`);

        const writable = await indexHandle.createWritable();
        await writable.write(newContent);
        await writable.close();
        
        return true;
      }
    } catch(e) {
      console.error('Error updating index.html:', e);
      return false;
    }
    return false;
  }

  async function saveFilesToProject() {
    const title = titleInput.value.trim();
    const category = categorySelect.value;
    
    if(!title) {
      alert('请输入文章标题');
      return;
    }

    // Request project directory if not already selected
    if(!projectDir) {
      projectDir = await requestProjectDirectory();
      if(!projectDir) return;
    }

    const slug = slugify(title);
    const date = getCurrentDate();
    
    try {
      // Process content and images
      const {content, images} = await processImagesAndContent(slug);
      
      // Generate HTML
      const htmlContent = generatePostHTML(title, content, slug, date, category);
      
      // Get/create necessary directories
      const assetsDir = await projectDir.getDirectoryHandle('assets', {create: true});
      const postsDir = await assetsDir.getDirectoryHandle('posts', {create: true});
      const imagesDir = await assetsDir.getDirectoryHandle('images', {create: true});
      
      // Create article-specific image folder
      let articleImagesDir;
      if (images.length > 0) {
        articleImagesDir = await imagesDir.getDirectoryHandle(slug, {create: true});
      }
      
      // Save HTML file
      const htmlHandle = await postsDir.getFileHandle(`${slug}.html`, {create: true});
      const htmlWritable = await htmlHandle.createWritable();
      await htmlWritable.write(htmlContent);
      await htmlWritable.close();
      
      // Save images in article-specific folder
      for(let {file, name} of images) {
        const imageHandle = await articleImagesDir.getFileHandle(name, {create: true});
        const imageWritable = await imageHandle.createWritable();
        await imageWritable.write(file);
        await imageWritable.close();
      }
      
      // Update index.html
      const postInfo = {
        title,
        slug,
        date,
        category,
        firstImage: images.length > 0 ? `${slug}/${images[0].name}` : null,
        excerpt: editor.textContent.replace(/\s+/g, ' ').trim().substring(0, 120) + '...'
      };
      
      const indexUpdated = await updateIndexHTML(projectDir, postInfo);
      
      if(indexUpdated) {
        alert(`✅ 文章发布成功！\n\n文件已保存到：\n- assets/posts/${slug}.html\n- ${images.length} 张图片保存到 assets/images/${slug}/\n- index.html 已自动更新`);
        
        // Clear editor for next post
        titleInput.value = '';
        editor.innerHTML = '<p>在这里开始写你的新文章...</p>';
        imageFiles.clear();
      } else {
        alert('⚠️ 文章和图片已保存，但自动更新 index.html 失败。请手动添加博客条目。');
      }
      
    } catch(e) {
      console.error('Error saving files:', e);
      alert('❌ 保存失败: ' + e.message);
    }
  }

  async function showArticleManager() {
    if (!projectDir) {
      projectDir = await requestProjectDirectory();
      if (!projectDir) return;
    }

    try {
      const assetsDir = await projectDir.getDirectoryHandle('assets');
      const postsDir = await assetsDir.getDirectoryHandle('posts');
      
      articleList.innerHTML = '';
      let fileCount = 0;
      
      for await (const entry of postsDir.values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.html') && entry.name !== 'blog-template.html') {
          const articleItem = document.createElement('div');
          articleItem.className = 'article-item';
          
          const fileName = entry.name.replace('.html', '');
          articleItem.innerHTML = `
            <span>${fileName}</span>
            <button class="edit-btn" data-filename="${entry.name}">编辑</button>
            <button class="delete-btn" data-filename="${entry.name}">删除</button>
          `;
          
          articleList.appendChild(articleItem);
          fileCount++;
        }
      }
      
      if (articleCountEl) {
        articleCountEl.textContent = `共找到 ${fileCount} 篇文章`;
      }
      
      // Add event listeners to edit and delete buttons
      const editButtons = articleList.querySelectorAll('.edit-btn');
      editButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const filename = e.target.getAttribute('data-filename');
          loadArticleForEditing(filename);
        });
      });

      const deleteButtons = articleList.querySelectorAll('.delete-btn');
      deleteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const filename = e.target.getAttribute('data-filename');
          deleteArticle(filename);
        });
      });
      
      if (fileCount === 0) {
        articleList.innerHTML = '<p>暂无文章</p>';
      }
      
      articleManager.style.display = 'block';
      
    } catch (e) {
      alert('无法读取文章列表：' + e.message);
      console.error('Show manager error:', e);
    }
  }

  function hideArticleManager() {
    articleManager.style.display = 'none';
  }

  async function deleteArticle(filename) {
    const slug = filename.replace('.html', '');
    
    if (!confirm(`确定要删除文章 "${filename}" 吗？\n\n这将删除：\n- 文章HTML文件\n- 对应的图片文件夹（如果存在）\n- 主页中的条目\n\n此操作不可撤销。`)) {
      return;
    }

    try {
      const assetsDir = await projectDir.getDirectoryHandle('assets');
      const postsDir = await assetsDir.getDirectoryHandle('posts');
      const imagesDir = await assetsDir.getDirectoryHandle('images');
      
      // Delete the HTML file
      await postsDir.removeEntry(filename);
      console.log(`File ${filename} deleted`);
      
      // Try to delete the corresponding image folder
      let imagesFolderDeleted = false;
      try {
        const articleImagesDir = await imagesDir.getDirectoryHandle(slug);
        
        // Delete all files in the folder first
        for await (const entry of articleImagesDir.values()) {
          if (entry.kind === 'file') {
            await articleImagesDir.removeEntry(entry.name);
          }
        }
        
        // Then delete the folder itself
        await imagesDir.removeEntry(slug, { recursive: true });
        imagesFolderDeleted = true;
        console.log(`Image folder ${slug} deleted`);
      } catch (imageDirError) {
        console.warn(`Could not delete image folder for ${slug}:`, imageDirError);
      }
      
      // Update index.html to remove the blog entry
      const indexHandle = await projectDir.getFileHandle('index.html');
      const file = await indexHandle.getFile();
      let content = await file.text();
      
      // Use the same removal logic as cleanup
      const result = await removeEntryFromContent(content, slug);
      
      if (result.success) {
        const writable = await indexHandle.createWritable();
        await writable.write(result.content);
        await writable.close();
        console.log(`Entry for ${slug} removed from index`);
      } else {
        console.warn(`Could not remove entry for ${slug} from index`);
      }
      
      // Refresh the article list
      showArticleManager();
      
      let message = `文章 "${filename}" 已成功删除`;
      if (imagesFolderDeleted) {
        message += '，图片文件夹已删除';
      }
      if (result.success) {
        message += '，已从主页移除';
      } else {
        message += '（但主页条目可能需要手动清理）';
      }
      message += '。';
      
      alert(`✅ ${message}`);
      
    } catch (e) {
      alert('删除失败：' + e.message);
      console.error('Delete error:', e);
    }
  }


  
  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async function cleanupInvalidEntries() {
    if (!projectDir) {
      projectDir = await requestProjectDirectory();
      if (!projectDir) return;
    }

    try {
      const assetsDir = await projectDir.getDirectoryHandle('assets');
      const postsDir = await assetsDir.getDirectoryHandle('posts');
      
      // Get list of actual files
      const actualFiles = new Set();
      for await (const entry of postsDir.values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.html') && entry.name !== 'blog-template.html') {
          const slug = entry.name.replace('.html', '');
          actualFiles.add(slug);
        }
      }
      
      // Read index.html and find all blog entries
      const indexHandle = await projectDir.getFileHandle('index.html');
      const file = await indexHandle.getFile();
      let content = await file.text();
      
      // Extract all href references to posts
      const hrefRegex = /href="\.\/assets\/posts\/([^"]+)\.html"/g;
      const foundSlugs = [];
      let match;
      
      while ((match = hrefRegex.exec(content)) !== null) {
        foundSlugs.push(match[1]);
      }
      
      console.log('Actual files:', [...actualFiles]);
      console.log('Found in index:', foundSlugs);
      
      // Find invalid entries
      const invalidSlugs = foundSlugs.filter(slug => !actualFiles.has(slug));
      
      if (invalidSlugs.length === 0) {
        alert('没有发现无效条目。');
        return;
      }
      
      if (!confirm(`发现 ${invalidSlugs.length} 个无效条目：${invalidSlugs.join(', ')}。要清理吗？`)) {
        return;
      }
      
      // Remove invalid entries
      let cleanedContent = content;
      let removedCount = 0;
      
      for (const slug of invalidSlugs) {
        const success = await removeEntryFromContent(cleanedContent, slug);
        if (success.success) {
          cleanedContent = success.content;
          removedCount++;
        }
      }
      
      // Write back the cleaned content
      const writable = await indexHandle.createWritable();
      await writable.write(cleanedContent);
      await writable.close();
      
      alert(`成功清理了 ${removedCount} 个无效条目。`);
      
    } catch (e) {
      alert('清理失败：' + e.message);
      console.error('Cleanup error:', e);
    }
  }

  async function removeEntryFromContent(content, slug) {
    try {
      const lines = content.split('\n');
      let startIndex = -1, endIndex = -1;
      
      // Find the line with the href
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(`href="./assets/posts/${slug}.html"`)) {
          // Find the start of the <li> block (search backwards)
          for (let j = i; j >= 0; j--) {
            if (lines[j].trim().startsWith('<li class="blog-post-item">')) {
              startIndex = j;
              break;
            }
          }
          // Find the end of the </li> block (search forwards)
          for (let k = i; k < lines.length; k++) {
            if (lines[k].trim() === '</li>') {
              endIndex = k;
              break;
            }
          }
          break;
        }
      }
      
      if (startIndex >= 0 && endIndex >= 0) {
        lines.splice(startIndex, endIndex - startIndex + 1);
        return { success: true, content: lines.join('\n') };
      }
      
      return { success: false, content };
    } catch (e) {
      console.error('Error removing entry:', e);
      return { success: false, content };
    }
  }

  async function cleanupOrphanImageFolders() {
    if (!projectDir) {
      projectDir = await requestProjectDirectory();
      if (!projectDir) return;
    }

    try {
      const assetsDir = await projectDir.getDirectoryHandle('assets');
      const postsDir = await assetsDir.getDirectoryHandle('posts');
      const imagesDir = await assetsDir.getDirectoryHandle('images');
      
      // Get list of actual article files (slugs)
      const actualSlugs = new Set();
      for await (const entry of postsDir.values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.html') && entry.name !== 'blog-template.html') {
          const slug = entry.name.replace('.html', '');
          actualSlugs.add(slug);
        }
      }
      
      // Get list of image folders
      const imageFolders = [];
      for await (const entry of imagesDir.values()) {
        if (entry.kind === 'directory') {
          imageFolders.push(entry.name);
        }
      }
      
      // Find orphaned folders (folders without corresponding articles)
      const orphanFolders = imageFolders.filter(folder => !actualSlugs.has(folder));
      
      if (orphanFolders.length === 0) {
        alert('没有发现孤立的图片文件夹。');
        return;
      }
      
      if (!confirm(`发现 ${orphanFolders.length} 个孤立的图片文件夹：\n${orphanFolders.join(', ')}\n\n这些文件夹对应的文章已不存在。要删除这些文件夹吗？`)) {
        return;
      }
      
      let deletedCount = 0;
      
      for (const folderName of orphanFolders) {
        try {
          const folderHandle = await imagesDir.getDirectoryHandle(folderName);
          
          // Delete all files in the folder first
          for await (const entry of folderHandle.values()) {
            if (entry.kind === 'file') {
              await folderHandle.removeEntry(entry.name);
            }
          }
          
          // Then delete the folder itself
          await imagesDir.removeEntry(folderName, { recursive: true });
          deletedCount++;
          console.log(`Deleted orphan image folder: ${folderName}`);
        } catch (e) {
          console.error(`Failed to delete folder ${folderName}:`, e);
        }
      }
      
      alert(`✅ 成功清理了 ${deletedCount} 个孤立的图片文件夹。`);
      
    } catch (e) {
      alert('清理孤立图片文件夹失败：' + e.message);
      console.error('Cleanup orphan folders error:', e);
    }
  }

  // Draft management functions
  async function initDraftsDir() {
    if (!projectDir) {
      projectDir = await requestProjectDirectory();
      if (!projectDir) return null;
    }

    try {
      draftsDir = await projectDir.getDirectoryHandle('drafts', {create: true});
      return draftsDir;
    } catch (e) {
      console.error('Error creating drafts directory:', e);
      return null;
    }
  }

  async function saveDraft() {
    const title = titleInput.value.trim();
    if (!title) {
      alert('请输入文章标题才能保存草稿');
      return;
    }

    if (!await initDraftsDir()) {
      alert('无法创建草稿目录');
      return;
    }

    try {
      const slug = slugify(title);
      const category = categorySelect.value;
      
      // Prepare draft data
      const draftData = {
        title: title,
        category: category,
        content: editor.innerHTML,
        images: [],
        savedAt: new Date().toISOString(),
        editingSlug: currentEditingSlug // Track if this is editing an existing article
      };

      // Save images as base64 in draft
      for (let [dataUrl, fileInfo] of imageFiles) {
        draftData.images.push({
          dataUrl: dataUrl,
          filename: fileInfo.suggestedName
        });
      }

      const draftJson = JSON.stringify(draftData, null, 2);
      const draftHandle = await draftsDir.getFileHandle(`${slug}.json`, {create: true});
      const writable = await draftHandle.createWritable();
      await writable.write(draftJson);
      await writable.close();

      alert(`✅ 草稿 "${title}" 已保存`);
    } catch (e) {
      alert('保存草稿失败：' + e.message);
      console.error('Save draft error:', e);
    }
  }

  async function showDraftManager() {
    if (!await initDraftsDir()) {
      alert('无法访问草稿目录');
      return;
    }

    try {
      draftList.innerHTML = '';
      let draftCount = 0;

      for await (const entry of draftsDir.values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.json')) {
          const file = await entry.getFile();
          const draftData = JSON.parse(await file.text());
          
          const draftItem = document.createElement('div');
          draftItem.className = 'article-item';
          
          const savedDate = new Date(draftData.savedAt).toLocaleString('zh-CN');
          draftItem.innerHTML = `
            <div>
              <strong>${draftData.title}</strong>
              <br><small>保存于: ${savedDate}</small>
            </div>
            <div>
              <button class="edit-btn" data-draft="${entry.name}">加载</button>
              <button class="delete-btn" data-draft="${entry.name}">删除</button>
            </div>
          `;
          
          draftList.appendChild(draftItem);
          draftCount++;
        }
      }

      // Add event listeners
      const loadButtons = draftList.querySelectorAll('.edit-btn');
      loadButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const draftFile = e.target.getAttribute('data-draft');
          loadDraft(draftFile);
        });
      });

      const deleteButtons = draftList.querySelectorAll('.delete-btn');
      deleteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const draftFile = e.target.getAttribute('data-draft');
          deleteDraft(draftFile);
        });
      });

      if (draftCount === 0) {
        draftList.innerHTML = '<p>暂无草稿</p>';
      }

      draftManager.style.display = 'block';
    } catch (e) {
      alert('加载草稿列表失败：' + e.message);
      console.error('Load draft list error:', e);
    }
  }

  function hideDraftManager() {
    draftManager.style.display = 'none';
  }

  async function loadDraft(draftFilename) {
    try {
      const draftHandle = await draftsDir.getFileHandle(draftFilename);
      const file = await draftHandle.getFile();
      const draftData = JSON.parse(await file.text());

      // Load basic data
      titleInput.value = draftData.title;
      categorySelect.value = draftData.category || 'Blog';
      editor.innerHTML = draftData.content;
      currentEditingSlug = draftData.editingSlug || null;

      // Restore images
      imageFiles.clear();
      for (let imageData of draftData.images || []) {
        // Convert base64 back to file object
        const response = await fetch(imageData.dataUrl);
        const blob = await response.blob();
        const file = new File([blob], imageData.filename, { type: blob.type });
        
        imageFiles.set(imageData.dataUrl, {
          file: file,
          suggestedName: imageData.filename
        });
      }

      hideDraftManager();
      alert(`✅ 草稿 "${draftData.title}" 已加载`);
    } catch (e) {
      alert('加载草稿失败：' + e.message);
      console.error('Load draft error:', e);
    }
  }

  async function deleteDraft(draftFilename) {
    if (!confirm('确定要删除这个草稿吗？')) {
      return;
    }

    try {
      await draftsDir.removeEntry(draftFilename);
      showDraftManager(); // Refresh the list
      alert('✅ 草稿已删除');
    } catch (e) {
      alert('删除草稿失败：' + e.message);
    }
  }

  async function loadArticleForEditing(filename) {
    if (!projectDir) return;

    try {
      const assetsDir = await projectDir.getDirectoryHandle('assets');
      const postsDir = await assetsDir.getDirectoryHandle('posts');
      const imagesDir = await assetsDir.getDirectoryHandle('images');
      
      const slug = filename.replace('.html', '');
      
      // Read the HTML file
      const htmlHandle = await postsDir.getFileHandle(filename);
      const file = await htmlHandle.getFile();
      const htmlContent = await file.text();

      // Parse the HTML to extract title, category, and content
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      const title = doc.querySelector('.article-title')?.textContent || slug;
      const category = doc.querySelector('.blog-category')?.textContent || 'Blog';
      const content = doc.querySelector('.content')?.innerHTML || '';

      // Load into editor
      titleInput.value = title;
      categorySelect.value = category;
      editor.innerHTML = content;
      currentEditingSlug = slug;

      // Try to load existing images
      imageFiles.clear();
      try {
        const articleImagesDir = await imagesDir.getDirectoryHandle(slug);
        
        for await (const entry of articleImagesDir.values()) {
          if (entry.kind === 'file') {
            const imageFile = await entry.getFile();
            const dataUrl = await fileToDataUrl(imageFile);
            
            imageFiles.set(dataUrl, {
              file: imageFile,
              suggestedName: entry.name
            });

            // Update img src in editor to use the data URL for editing
            const imgs = editor.querySelectorAll(`img[src*="${entry.name}"]`);
            imgs.forEach(img => {
              img.src = dataUrl;
            });
          }
        }
      } catch (e) {
        console.log('No existing images found for this article');
      }

      hideArticleManager();
      alert(`✅ 文章 "${title}" 已加载到编辑器\n\n注意：您正在编辑已发布的文章。发布时将更新现有文章。`);
    } catch (e) {
      alert('加载文章失败：' + e.message);
      console.error('Load article error:', e);
    }
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Update the save function to handle editing existing articles
  const originalSaveFunction = saveFilesToProject;
  
  async function saveFilesToProject() {
    const title = titleInput.value.trim();
    const category = categorySelect.value;
    
    if(!title) {
      alert('请输入文章标题');
      return;
    }

    // Request project directory if not already selected
    if(!projectDir) {
      projectDir = await requestProjectDirectory();
      if(!projectDir) return;
    }

    const slug = slugify(title);
    const date = getCurrentDate();
    
    // Check if we're editing an existing article
    const isEditing = currentEditingSlug !== null;
    const oldSlug = currentEditingSlug;
    
    try {
      // Process content and images
      const {content, images} = await processImagesAndContent(slug);
      
      // Generate HTML
      const htmlContent = generatePostHTML(title, content, slug, date, category);
      
      // Get/create necessary directories
      const assetsDir = await projectDir.getDirectoryHandle('assets', {create: true});
      const postsDir = await assetsDir.getDirectoryHandle('posts', {create: true});
      const imagesDir = await assetsDir.getDirectoryHandle('images', {create: true});
      
      // If editing and slug changed, handle renaming
      if (isEditing && oldSlug && oldSlug !== slug) {
        // Delete old files
        try {
          await postsDir.removeEntry(`${oldSlug}.html`);
          
          // Try to delete old image folder
          try {
            const oldImagesDir = await imagesDir.getDirectoryHandle(oldSlug);
            for await (const entry of oldImagesDir.values()) {
              if (entry.kind === 'file') {
                await oldImagesDir.removeEntry(entry.name);
              }
            }
            await imagesDir.removeEntry(oldSlug, { recursive: true });
          } catch (e) {
            console.warn('Could not delete old image folder:', e);
          }
          
          // Remove old entry from index
          const indexHandle = await projectDir.getFileHandle('index.html');
          const file = await indexHandle.getFile();
          let indexContent = await file.text();
          
          const result = await removeEntryFromContent(indexContent, oldSlug);
          if (result.success) {
            const writable = await indexHandle.createWritable();
            await writable.write(result.content);
            await writable.close();
          }
        } catch (e) {
          console.warn('Error cleaning up old files:', e);
        }
      }
      
      // Create article-specific image folder
      let articleImagesDir;
      if (images.length > 0) {
        articleImagesDir = await imagesDir.getDirectoryHandle(slug, {create: true});
      }
      
      // Save HTML file
      const htmlHandle = await postsDir.getFileHandle(`${slug}.html`, {create: true});
      const htmlWritable = await htmlHandle.createWritable();
      await htmlWritable.write(htmlContent);
      await htmlWritable.close();
      
      // Save images in article-specific folder
      for(let {file, name} of images) {
        const imageHandle = await articleImagesDir.getFileHandle(name, {create: true});
        const imageWritable = await imageHandle.createWritable();
        await imageWritable.write(file);
        await imageWritable.close();
      }
      
      // Update index.html (only if not editing or if slug changed)
      if (!isEditing || (isEditing && oldSlug !== slug)) {
        const postInfo = {
          title,
          slug,
          date,
          category,
          firstImage: images.length > 0 ? `${slug}/${images[0].name}` : null,
          excerpt: editor.textContent.replace(/\s+/g, ' ').trim().substring(0, 120) + '...'
        };
        
        const indexUpdated = await updateIndexHTML(projectDir, postInfo);
        
        if(indexUpdated) {
          const action = isEditing ? '更新' : '发布';
          alert(`✅ 文章${action}成功！\n\n文件已保存到：\n- assets/posts/${slug}.html\n- ${images.length} 张图片保存到 assets/images/${slug}/\n- index.html 已自动更新`);
          
          // Clear editor and editing state
          titleInput.value = '';
          editor.innerHTML = '<p>在这里开始写你的新文章...</p>';
          imageFiles.clear();
          currentEditingSlug = null;
        } else {
          alert('⚠️ 文章和图片已保存，但自动更新 index.html 失败。请手动添加博客条目。');
        }
      } else {
        // Just updating content without changing slug
        alert(`✅ 文章更新成功！\n\n文件已保存到：\n- assets/posts/${slug}.html\n- ${images.length} 张图片保存到 assets/images/${slug}/`);
        
        // Clear editor and editing state
        titleInput.value = '';
        editor.innerHTML = '<p>在这里开始写你的新文章...</p>';
        imageFiles.clear();
        currentEditingSlug = null;
      }
      
    } catch(e) {
      console.error('Error saving files:', e);
      alert('❌ 保存失败: ' + e.message);
    }
  }

  exportBtn.addEventListener('click', saveFilesToProject);

})();
