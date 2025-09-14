#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_VERSION = '2022-06-28';

if (!NOTION_TOKEN) {
  console.error('❌ NOTION_TOKEN environment variable is required');
  process.exit(1);
}

// Fonction pour extraire le frontmatter
function extractFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = content.match(frontmatterRegex);

  if (!match) return null;

  const frontmatter = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      let value = valueParts.join(':').trim();
      // Remove quotes
      value = value.replace(/^["']|["']$/g, '');
      frontmatter[key.trim()] = value;
    }
  }

  return frontmatter;
}

// Fonction pour convertir markdown en blocs Notion
function markdownToNotionBlocks(markdown) {
  // Supprimer le frontmatter
  const contentWithoutFrontmatter = markdown.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');

  const lines = contentWithoutFrontmatter.split('\n');
  const blocks = [];

  for (const line of lines) {
    if (line.trim() === '') continue;

    if (line.startsWith('# ')) {
      blocks.push({
        object: 'block',
        type: 'heading_1',
        heading_1: {
          rich_text: [{
            type: 'text',
            text: { content: line.substring(2) }
          }]
        }
      });
    } else if (line.startsWith('## ')) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{
            type: 'text',
            text: { content: line.substring(3) }
          }]
        }
      });
    } else if (line.startsWith('### ')) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [{
            type: 'text',
            text: { content: line.substring(4) }
          }]
        }
      });
    } else {
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{
            type: 'text',
            text: { content: line }
          }]
        }
      });
    }
  }

  return blocks;
}

// Fonction pour mettre à jour une page Notion
async function updateNotionPage(pageId, title, blocks) {
  try {
    // Mettre à jour le titre
    const titleResponse = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': NOTION_VERSION
      },
      body: JSON.stringify({
        properties: {
          title: {
            title: [{
              text: { content: title }
            }]
          }
        }
      })
    });

    if (!titleResponse.ok) {
      const error = await titleResponse.text();
      console.error(`❌ Failed to update page title ${pageId}: ${error}`);
      return false;
    }

    // Supprimer le contenu existant
    const pageResponse = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': NOTION_VERSION
      }
    });

    if (pageResponse.ok) {
      const pageData = await pageResponse.json();
      for (const block of pageData.results) {
        await fetch(`https://api.notion.com/v1/blocks/${block.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${NOTION_TOKEN}`,
            'Notion-Version': NOTION_VERSION
          }
        });
      }
    }

    // Ajouter le nouveau contenu
    const updateResponse = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': NOTION_VERSION
      },
      body: JSON.stringify({
        children: blocks.slice(0, 100) // Notion limite à 100 blocs par requête
      })
    });

    if (updateResponse.ok) {
      console.log(`✅ Successfully updated page: ${title}`);
      return true;
    } else {
      const error = await updateResponse.text();
      console.error(`❌ Failed to update page content ${pageId}: ${error}`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Error updating page ${pageId}:`, error.message);
    return false;
  }
}

// Fonction principale
async function syncDocsToNotion() {
  console.log('🚀 Starting sync to Notion...');

  const docsDir = path.join(process.cwd(), 'docs');

  function findMarkdownFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...findMarkdownFiles(fullPath));
      } else if (item.endsWith('.md')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  const markdownFiles = findMarkdownFiles(docsDir);
  console.log(`📄 Found ${markdownFiles.length} markdown files`);

  let successCount = 0;
  let failCount = 0;

  for (const filePath of markdownFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    const frontmatter = extractFrontmatter(content);

    if (!frontmatter || !frontmatter.notion_page_id) {
      console.log(`⏭️  Skipping ${path.basename(filePath)} - no notion_page_id`);
      continue;
    }

    const title = frontmatter.title || path.basename(filePath, '.md');
    const blocks = markdownToNotionBlocks(content);

    console.log(`📝 Syncing: ${title}`);
    const success = await updateNotionPage(frontmatter.notion_page_id, title, blocks);

    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    // Attendre un peu pour éviter le rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n🎉 Sync completed!`);
  console.log(`✅ Success: ${successCount} files`);
  console.log(`❌ Failed: ${failCount} files`);

  if (failCount > 0) {
    process.exit(1);
  }
}

syncDocsToNotion().catch(error => {
  console.error('💥 Sync failed:', error);
  process.exit(1);
});