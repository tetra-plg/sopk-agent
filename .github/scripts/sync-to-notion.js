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

// Fonction pour créer une page Notion
async function createNotionPage(parentId, title, blocks) {
  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': NOTION_VERSION
      },
      body: JSON.stringify({
        parent: { page_id: parentId },
        properties: {
          title: {
            title: [{
              text: { content: title }
            }]
          }
        },
        children: blocks.slice(0, 100) // Notion limite à 100 blocs par requête
      })
    });

    if (response.ok) {
      const page = await response.json();
      console.log(`✅ Created new page: ${title} (ID: ${page.id})`);
      return page.id;
    } else {
      const error = await response.text();
      console.error(`❌ Failed to create page: ${error}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error creating page:`, error.message);
    return null;
  }
}

// Fonction pour mettre à jour une page Notion
async function updateNotionPage(pageId, title, blocks) {
  try {
    // Vérifier si la page existe d'abord
    const checkResponse = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': NOTION_VERSION
      }
    });

    if (!checkResponse.ok) {
      console.log(`⚠️  Page ${pageId} not found, will need to create it`);
      return false;
    }

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
  const ROOT_PAGE_ID = process.env.NOTION_ROOT_PAGE_ID || '26dc48d1806980b19b08ed84492ba4e3';

  // Créer une map des pages parent pour reproduire l'arborescence
  const parentPages = new Map();
  parentPages.set('docs', ROOT_PAGE_ID);

  // Fonction pour créer les dossiers parent si nécessaire
  async function ensureParentPage(dirPath, parentId) {
    const relativePath = path.relative(process.cwd(), dirPath);

    if (parentPages.has(relativePath)) {
      return parentPages.get(relativePath);
    }

    const dirName = path.basename(dirPath);
    const parentDirPath = path.dirname(dirPath);
    const relativeParentPath = path.relative(process.cwd(), parentDirPath);

    let actualParentId = parentId;
    if (relativeParentPath !== '.' && relativeParentPath !== 'docs') {
      actualParentId = await ensureParentPage(parentDirPath, parentId);
    }

    // Créer la page pour ce dossier
    const folderTitle = `📁 ${dirName}`;
    const emptyBlocks = [{
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{
          type: 'text',
          text: { content: `Dossier: ${dirName}` }
        }]
      }
    }];

    const folderId = await createNotionPage(actualParentId, folderTitle, emptyBlocks);
    if (folderId) {
      parentPages.set(relativePath, folderId);
      return folderId;
    }

    return actualParentId;
  }

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
  let createdCount = 0;

  for (const filePath of markdownFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    const frontmatter = extractFrontmatter(content);
    const title = frontmatter?.title || path.basename(filePath, '.md');
    const blocks = markdownToNotionBlocks(content);

    console.log(`📝 Syncing: ${title}`);

    // Déterminer le parent correct selon l'arborescence
    const fileDir = path.dirname(filePath);
    let parentId = ROOT_PAGE_ID;

    if (fileDir !== docsDir) {
      parentId = await ensureParentPage(fileDir, ROOT_PAGE_ID);
    }

    let success = false;

    // Si on a un notion_page_id, essayer de mettre à jour
    if (frontmatter?.notion_page_id) {
      success = await updateNotionPage(frontmatter.notion_page_id, title, blocks);
    }

    // Si la mise à jour a échoué ou pas d'ID, créer une nouvelle page
    if (!success) {
      const newPageId = await createNotionPage(parentId, title, blocks);
      if (newPageId) {
        success = true;
        createdCount++;

        // Mettre à jour le frontmatter avec le nouvel ID
        const newFrontmatter = `---
notion_page_id: "${newPageId}"
notion_parent_page_id: "${parentId}"
title: "${title}"
---

`;
        const contentWithoutFrontmatter = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');
        const newContent = newFrontmatter + contentWithoutFrontmatter;

        try {
          fs.writeFileSync(filePath, newContent);
          console.log(`📝 Updated frontmatter for ${path.basename(filePath)}`);
        } catch (error) {
          console.log(`⚠️  Could not update frontmatter for ${path.basename(filePath)}: ${error.message}`);
        }
      }
    }

    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    // Attendre un peu pour éviter le rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log(`\n🎉 Sync completed!`);
  console.log(`✅ Success: ${successCount} files`);
  console.log(`🆕 Created: ${createdCount} new pages`);
  console.log(`❌ Failed: ${failCount} files`);

  if (failCount > 0) {
    process.exit(1);
  }
}

syncDocsToNotion().catch(error => {
  console.error('💥 Sync failed:', error);
  process.exit(1);
});