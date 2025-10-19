# Blog Article Writing Guide

## 📝 Where to Write Your Content

Your main article content goes in the `<section class="blog-text-full">` section of your HTML file.

## 🎨 Available Formatting Elements

### 1. **Basic Text Structure**
```html
<p>Your paragraph text here.</p>

<!-- Empty line between paragraphs (just use separate <p> tags) -->
<p>First paragraph.</p>
<p>Second paragraph with space above.</p>
```

### 2. **Headings & Subheadings**
```html
<h3>Main Section Title</h3>
<h4>Subsection Title</h4>
```

### 3. **Lists**
```html
<ul>
  <li>Bullet point item 1</li>
  <li>Bullet point item 2</li>
</ul>
```

### 4. **Special Content Boxes**

#### Character Showcase (for comparisons)
```html
<div class="character-showcase">
  <div class="character-comparison">
    <h4>Actor Name's Evolution</h4>
    <ul>
      <li><strong>Character 1:</strong> Description</li>
      <li><strong>Character 2:</strong> Description</li>
    </ul>
  </div>
</div>
```

#### Feature Highlights (grid layout)
```html
<div class="feature-list">
  <div class="feature-item">
    <h4>📚 Feature Title</h4>
    <p>Feature description</p>
  </div>
  <div class="feature-item">
    <h4>🎭 Another Feature</h4>
    <p>Another description</p>
  </div>
</div>
```

#### Movie Spotlight (highlighted content)
```html
<div class="movie-spotlight">
  <h4>🎬 Movie Title: Scene Description</h4>
  <p>Detailed analysis or description here.</p>
</div>
```

#### Conclusion Box (call-out section)
```html
<div class="conclusion-box">
  <h4>🎭 The Final Take</h4>
  <p>Your concluding thoughts here.</p>
</div>
```

#### Blockquotes (for quotes)
```html
<blockquote>
  "Your quote text here."
  <cite>— Quote Attribution</cite>
</blockquote>
```

### 5. **Adding Images**

#### Inline Images
```html
<figure class="blog-image">
  <img src="../images/your-image.jpg" alt="Description of image" loading="lazy">
  <figcaption>Image caption (optional)</figcaption>
</figure>
```

#### Side-by-side Images
```html
<div class="image-gallery">
  <img src="../images/image1.jpg" alt="Description 1">
  <img src="../images/image2.jpg" alt="Description 2">
</div>
```

### 6. **Emphasized Text**
```html
<strong>Bold important text</strong>
<em>Italicized text</em>
```

## 🖼️ Adding Media Content

### Images
1. Place images in `assets/images/` folder
2. Use relative path: `../images/filename.jpg`
3. Always include alt text for accessibility

### Embedding Videos (YouTube)
```html
<div class="video-embed">
  <iframe width="560" height="315" 
          src="https://www.youtube.com/embed/VIDEO_ID" 
          title="Video title"
          frameborder="0" 
          allowfullscreen>
  </iframe>
</div>
```

## 📱 Writing Tips

### For Engaging Content:
- **Start with a hook** - Draw readers in immediately
- **Use subheadings** - Break up long content
- **Add visual elements** - Use the special boxes and quotes
- **Include specific examples** - Like character names and movie scenes
- **End with impact** - Use the conclusion box for final thoughts

### For Technical Formatting:
- **Empty lines**: Use separate `<p>` tags (no `<br>` needed)
- **Consistency**: Use the same structure for similar content
- **Mobile-friendly**: All styles are responsive
- **Emojis**: Feel free to use emojis in headings for visual appeal

## 🎯 Your Current Article Structure

Your "One person; Many faces" article now includes:
✅ Engaging introduction
✅ Multiple sections with subheadings  
✅ Character comparison box
✅ Feature highlights
✅ Movie spotlights
✅ Blockquote with attribution
✅ Conclusion box
✅ Professional styling throughout

## 🔗 File Structure
- Main HTML: `assets/posts/one-person-many-faces.html`
- Styling: `assets/css/style.css` (automatically applied)
- Images: `assets/images/` (reference with `../images/filename`)

Your article is now ready to view! Open the HTML file in your browser to see the full formatted article.