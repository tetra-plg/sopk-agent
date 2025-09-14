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

// Fonction pour parser le texte avec formatage markdown
function parseRichText(text) {
  const richText = [];
  let currentIndex = 0;

  // Regex pour capturer différents types de formatage
  const patterns = [
    { regex: /\*\*(.*?)\*\*/g, type: 'bold' },
    { regex: /\*(.*?)\*/g, type: 'italic' },
    { regex: /`(.*?)`/g, type: 'code' },
    { regex: /\[([^\]]+)\]\(([^)]+)\)/g, type: 'link' },
  ];

  let segments = [{ text: text, annotations: {} }];

  for (const pattern of patterns) {
    const newSegments = [];

    for (const segment of segments) {
      if (typeof segment.text !== 'string') {
        newSegments.push(segment);
        continue;
      }

      let lastIndex = 0;
      let match;
      pattern.regex.lastIndex = 0;

      while ((match = pattern.regex.exec(segment.text)) !== null) {
        // Ajouter le texte avant la correspondance
        if (match.index > lastIndex) {
          const beforeText = segment.text.substring(lastIndex, match.index);
          if (beforeText) {
            newSegments.push({
              type: 'text',
              text: { content: beforeText },
              annotations: { ...segment.annotations }
            });
          }
        }

        // Ajouter le texte formaté
        if (pattern.type === 'link') {
          newSegments.push({
            type: 'text',
            text: { content: match[1], link: { url: match[2] } },
            annotations: { ...segment.annotations }
          });
        } else {
          const annotations = { ...segment.annotations };
          annotations[pattern.type] = true;

          newSegments.push({
            type: 'text',
            text: { content: match[1] },
            annotations
          });
        }

        lastIndex = pattern.regex.lastIndex;
      }

      // Ajouter le texte restant
      if (lastIndex < segment.text.length) {
        const remainingText = segment.text.substring(lastIndex);
        if (remainingText) {
          newSegments.push({
            type: 'text',
            text: { content: remainingText },
            annotations: { ...segment.annotations }
          });
        }
      }

      if (newSegments.length === 0) {
        newSegments.push(segment);
      }
    }

    segments = newSegments;
  }

  return segments.filter(segment => segment.text?.content || segment.text?.link);
}

// Fonction pour optimiser le contenu pour l'API Notion
function optimizeContentForNotion(blocks) {
  const maxTextLength = 2000; // Limite par rich_text object

  // Corriger les blocs qui dépassent la limite de texte
  const optimizedBlocks = blocks.map(block => {
    const newBlock = JSON.parse(JSON.stringify(block)); // Deep copy

    // Fonction pour limiter le texte dans rich_text
    const limitRichText = (richTextArray) => {
      if (!richTextArray) return;
      for (const richText of richTextArray) {
        if (richText.text?.content && richText.text.content.length > maxTextLength) {
          richText.text.content = richText.text.content.substring(0, maxTextLength - 3) + '...';
        }
      }
    };

    // Appliquer la limitation à tous les types de blocs
    if (newBlock.paragraph?.rich_text) limitRichText(newBlock.paragraph.rich_text);
    if (newBlock.heading_1?.rich_text) limitRichText(newBlock.heading_1.rich_text);
    if (newBlock.heading_2?.rich_text) limitRichText(newBlock.heading_2.rich_text);
    if (newBlock.heading_3?.rich_text) limitRichText(newBlock.heading_3.rich_text);
    if (newBlock.bulleted_list_item?.rich_text) limitRichText(newBlock.bulleted_list_item.rich_text);
    if (newBlock.numbered_list_item?.rich_text) limitRichText(newBlock.numbered_list_item.rich_text);
    if (newBlock.quote?.rich_text) limitRichText(newBlock.quote.rich_text);

    return newBlock;
  });

  return optimizedBlocks;
}

// Fonction pour convertir markdown en blocs Notion
function markdownToNotionBlocks(markdown) {
  // Supprimer le frontmatter
  const contentWithoutFrontmatter = markdown.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');

  const lines = contentWithoutFrontmatter.split('\n');
  const blocks = [];
  let inCodeBlock = false;
  let codeBlockContent = [];
  let codeBlockLanguage = '';
  let inList = false;
  let listItems = [];
  let firstH1Skipped = false; // Pour éviter le doublon avec le titre de la page

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Gestion des blocs de code
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockLanguage = line.substring(3).trim();
        codeBlockContent = [];
      } else {
        inCodeBlock = false;
        // Valider et normaliser le langage pour Notion
        const validLanguages = [
          'abap', 'abc', 'agda', 'arduino', 'ascii art', 'assembly', 'bash', 'basic', 'bnf',
          'c', 'c#', 'c++', 'clojure', 'coffeescript', 'coq', 'css', 'dart', 'dhall', 'diff',
          'docker', 'ebnf', 'elixir', 'elm', 'erlang', 'f#', 'flow', 'fortran', 'gherkin',
          'glsl', 'go', 'graphql', 'groovy', 'haskell', 'hcl', 'html', 'idris', 'java',
          'javascript', 'json', 'julia', 'kotlin', 'latex', 'less', 'lisp', 'livescript',
          'llvm ir', 'lua', 'makefile', 'markdown', 'markup', 'matlab', 'mathematica',
          'mermaid', 'nix', 'notion formula', 'objective-c', 'ocaml', 'pascal', 'perl',
          'php', 'plain text', 'powershell', 'prolog', 'protobuf', 'purescript', 'python',
          'r', 'racket', 'reason', 'ruby', 'rust', 'sass', 'scala', 'scheme', 'scss',
          'shell', 'smalltalk'
        ];

        let language = codeBlockLanguage.toLowerCase() || 'plain text';

        // Mapper des alias courants vers les langages Notion
        const languageMap = {
          'js': 'javascript',
          'ts': 'javascript',
          'tsx': 'javascript',
          'jsx': 'javascript',
          'py': 'python',
          'rb': 'ruby',
          'sh': 'shell',
          'yml': 'yaml',
          'yaml': 'markup',
          'xml': 'markup',
          'md': 'markdown',
          'cpp': 'c++',
          'hpp': 'c++',
          'cs': 'c#',
          'fs': 'f#'
        };

        if (languageMap[language]) {
          language = languageMap[language];
        }

        if (!validLanguages.includes(language)) {
          language = 'plain text';
        }

        // Gérer les blocs de code longs en les divisant si nécessaire
        let codeContent = codeBlockContent.join('\n');

        if (codeContent.length <= 2000) {
          // Code court - un seul bloc
          blocks.push({
            object: 'block',
            type: 'code',
            code: {
              rich_text: [{
                type: 'text',
                text: { content: codeContent }
              }],
              language: language
            }
          });
        } else {
          // Code long - diviser en plusieurs blocs
          const maxChunkSize = 1900; // Laisser de la marge
          const chunks = [];

          // Diviser intelligemment aux sauts de ligne si possible
          let currentChunk = '';
          const lines = codeContent.split('\n');

          for (const line of lines) {
            if (currentChunk.length + line.length + 1 > maxChunkSize && currentChunk.length > 0) {
              chunks.push(currentChunk);
              currentChunk = line;
            } else {
              currentChunk += (currentChunk ? '\n' : '') + line;
            }
          }
          if (currentChunk) {
            chunks.push(currentChunk);
          }

          // Ajouter le premier chunk comme bloc de code
          if (chunks.length > 0) {
            blocks.push({
              object: 'block',
              type: 'code',
              code: {
                rich_text: [{
                  type: 'text',
                  text: { content: chunks[0] }
                }],
                language: language
              }
            });

            // Ajouter les chunks suivants comme blocs de code supplémentaires
            for (let i = 1; i < chunks.length; i++) {
              // Ajouter un indicateur de continuation
              if (i === 1) {
                blocks.push({
                  object: 'block',
                  type: 'paragraph',
                  paragraph: {
                    rich_text: [{
                      type: 'text',
                      text: { content: '... (suite du code)' },
                      annotations: { italic: true }
                    }]
                  }
                });
              }

              blocks.push({
                object: 'block',
                type: 'code',
                code: {
                  rich_text: [{
                    type: 'text',
                    text: { content: chunks[i] }
                  }],
                  language: language
                }
              });
            }

            // Ajouter un indicateur de fin
            if (chunks.length > 1) {
              blocks.push({
                object: 'block',
                type: 'paragraph',
                paragraph: {
                  rich_text: [{
                    type: 'text',
                    text: { content: '... (fin du code)' },
                    annotations: { italic: true }
                  }]
                }
              });
            }
          }
        }
        codeBlockContent = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Terminer la liste si on sort du contexte de liste
    if (inList && !line.startsWith('- ') && !line.startsWith('* ') && !line.match(/^\d+\. /) && line.trim() !== '') {
      // Ajouter la liste précédente
      for (const item of listItems) {
        blocks.push(item);
      }
      listItems = [];
      inList = false;
    }

    // Lignes vides
    if (line.trim() === '') {
      if (inList) {
        // Conserver les éléments de liste
        continue;
      }
      continue;
    }

    // Headings - Notion ne supporte que H1, H2, H3
    if (line.startsWith('# ')) {
      // Ignorer le premier H1 car il fait doublon avec le titre de la page
      if (!firstH1Skipped) {
        firstH1Skipped = true;
        continue;
      }
      blocks.push({
        object: 'block',
        type: 'heading_1',
        heading_1: {
          rich_text: parseRichText(line.substring(2).trim())
        }
      });
    } else if (line.startsWith('## ')) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: parseRichText(line.substring(3).trim())
        }
      });
    } else if (line.startsWith('### ')) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: parseRichText(line.substring(4).trim())
        }
      });
    } else if (line.startsWith('#### ')) {
      // H4 et plus -> texte en gras
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{
            type: 'text',
            text: { content: line.substring(5).trim() },
            annotations: { bold: true }
          }]
        }
      });
    } else if (line.startsWith('##### ')) {
      // H5 -> texte en gras
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{
            type: 'text',
            text: { content: line.substring(6).trim() },
            annotations: { bold: true }
          }]
        }
      });
    } else if (line.startsWith('###### ')) {
      // H6 -> texte en gras
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{
            type: 'text',
            text: { content: line.substring(7).trim() },
            annotations: { bold: true }
          }]
        }
      });
    }
    // Listes à puces
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      inList = true;
      listItems.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: parseRichText(line.substring(2).trim())
        }
      });
    }
    // Listes numérotées
    else if (line.match(/^\d+\. /)) {
      inList = true;
      const match = line.match(/^\d+\. (.*)$/);
      listItems.push({
        object: 'block',
        type: 'numbered_list_item',
        numbered_list_item: {
          rich_text: parseRichText(match[1].trim())
        }
      });
    }
    // Citations
    else if (line.startsWith('> ')) {
      blocks.push({
        object: 'block',
        type: 'quote',
        quote: {
          rich_text: parseRichText(line.substring(2).trim())
        }
      });
    }
    // Séparateurs
    else if (line.match(/^---+$/)) {
      blocks.push({
        object: 'block',
        type: 'divider',
        divider: {}
      });
    }
    // Paragraphes normaux
    else {
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: parseRichText(line)
        }
      });
    }
  }

  // Ajouter les derniers éléments de liste si nécessaire
  if (inList && listItems.length > 0) {
    for (const item of listItems) {
      blocks.push(item);
    }
  }

  return optimizeContentForNotion(blocks);
}

// Fonction pour ajouter des blocs à une page par chunks
async function addBlocksToPage(pageId, blocks) {
  const maxBlocksPerRequest = 100;

  for (let i = 0; i < blocks.length; i += maxBlocksPerRequest) {
    const chunk = blocks.slice(i, i + maxBlocksPerRequest);

    try {
      const response = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${NOTION_TOKEN}`,
          'Content-Type': 'application/json',
          'Notion-Version': NOTION_VERSION
        },
        body: JSON.stringify({
          children: chunk
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error(`❌ Failed to add blocks chunk ${i / maxBlocksPerRequest + 1}:`, error.message);
        return false;
      }

      // Attendre entre les chunks pour éviter le rate limiting
      if (i + maxBlocksPerRequest < blocks.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }

    } catch (error) {
      console.error(`❌ Error adding blocks chunk:`, error.message);
      return false;
    }
  }

  return true;
}

// Fonction pour créer une page Notion
async function createNotionPage(parentId, title, blocks) {
  try {
    // Vérifier d'abord si le parent est archivé
    const parentCheck = await fetch(`https://api.notion.com/v1/pages/${parentId}`, {
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': NOTION_VERSION
      }
    });

    if (parentCheck.ok) {
      const parentData = await parentCheck.json();
      if (parentData.archived) {
        console.log(`🗃️  Parent page ${parentId} is archived, unarchiving it first...`);
        const unarchived = await unarchivePage(parentId);
        if (!unarchived) {
          console.error(`❌ Could not unarchive parent page ${parentId}`);
          return null;
        }
        // Attendre après le désarchivage
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Créer la page avec les premiers 100 blocs
    const initialBlocks = blocks.slice(0, 100);
    const remainingBlocks = blocks.slice(100);

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
        children: initialBlocks
      })
    });

    if (response.ok) {
      const page = await response.json();
      console.log(`✅ Created new page: ${title} (ID: ${page.id})`);

      // Ajouter le reste des blocs si nécessaire
      if (remainingBlocks.length > 0) {
        console.log(`📄 Adding ${remainingBlocks.length} additional blocks to page...`);
        const success = await addBlocksToPage(page.id, remainingBlocks);

        if (success) {
          console.log(`✅ Successfully added all ${blocks.length} blocks to page`);
        } else {
          console.log(`⚠️  Some blocks may not have been added completely`);
        }
      }

      return page.id;
    } else {
      const errorData = await response.json();
      console.error(`❌ Failed to create page "${title}":`, errorData.message);

      // Si c'est une erreur d'archive, on a déjà essayé de désarchiver, donc on abandonne
      if (errorData.code === 'validation_error' && errorData.message.includes('archived')) {
        console.error(`🗃️  Cannot create in archived parent. Parent ID: ${parentId}`);
      } else if (errorData.code === 'object_not_found') {
        console.error(`🔍 Parent page not found or not shared with integration: ${parentId}`);
      }
      return null;
    }
  } catch (error) {
    console.error(`❌ Error creating page:`, error.message);
    return null;
  }
}

// Fonction pour désarchiver une page
async function unarchivePage(pageId) {
  try {
    const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': NOTION_VERSION
      },
      body: JSON.stringify({
        archived: false
      })
    });

    if (response.ok) {
      console.log(`♻️  Successfully unarchived page ${pageId}`);
      return true;
    } else {
      const error = await response.json();
      console.error(`❌ Failed to unarchive page ${pageId}:`, error.message);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error unarchiving page:`, error.message);
    return false;
  }
}

// Fonction pour mettre à jour une page Notion
async function updateNotionPage(pageId, title, blocks) {
  try {
    // Vérifier si la page existe et son statut
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

    const pageData = await checkResponse.json();

    // Si la page est archivée, la désarchiver d'abord
    if (pageData.archived) {
      console.log(`🗃️  Page ${pageId} is archived, unarchiving it first...`);
      const unarchived = await unarchivePage(pageId);
      if (!unarchived) {
        console.error(`❌ Could not unarchive page ${pageId}`);
        return false;
      }
      // Attendre un peu après le désarchivage
      await new Promise(resolve => setTimeout(resolve, 500));
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

    // Ajouter le nouveau contenu par chunks
    console.log(`📄 Adding ${blocks.length} blocks to updated page...`);
    const success = await addBlocksToPage(pageId, blocks);

    if (success) {
      console.log(`✅ Successfully updated page: ${title} (${blocks.length} blocks)`);
      return true;
    } else {
      console.error(`❌ Failed to update page content ${pageId}`);
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
  const CREATE_FOLDERS = process.env.CREATE_NOTION_FOLDERS !== 'false'; // Par défaut true

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

    // Vérifier si le parent est accessible avant de créer
    if (!actualParentId) {
      console.log(`⚠️  Cannot create folder "${dirName}" - parent not accessible`);
      return ROOT_PAGE_ID; // Fallback sur la page racine
    }

    // D'abord vérifier si une page dossier existe déjà (archivée ou non)
    const folderTitle = `📁 ${dirName}`;

    // Rechercher la page existante dans Notion
    // Note: Pour une vraie implémentation, il faudrait utiliser l'API search
    // Mais ici on va créer directement et gérer les erreurs

    console.log(`📂 Creating folder structure: ${relativePath}`);

    const emptyBlocks = [{
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{
          type: 'text',
          text: { content: `Contient les documents du dossier: ${dirName}` }
        }]
      }
    }];

    const folderId = await createNotionPage(actualParentId, folderTitle, emptyBlocks);
    if (folderId) {
      parentPages.set(relativePath, folderId);
      console.log(`✅ Created folder page: ${folderTitle}`);
      return folderId;
    }

    // Si on ne peut pas créer le dossier, utiliser le parent direct ou ROOT
    console.log(`⚠️  Could not create folder "${dirName}", using parent page instead`);
    return actualParentId || ROOT_PAGE_ID;
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

    if (CREATE_FOLDERS && fileDir !== docsDir) {
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
  console.log(`✅ Success: ${successCount} files synchronized`);
  console.log(`🆕 Created: ${createdCount} new pages`);
  console.log(`♻️  Updated: ${successCount - createdCount} existing pages`);
  console.log(`❌ Failed: ${failCount} files`);

  console.log(`\n📊 Summary:`);
  console.log(`- Pages are created ${CREATE_FOLDERS ? 'with folder hierarchy' : 'in flat structure'}`);
  console.log(`- Archived pages are automatically unarchived when found`);
  console.log(`- Large documents are handled with chunked uploads`);

  if (failCount > 0) {
    console.log(`\n⚠️  Some files failed to sync. Check the errors above.`);
    process.exit(1);
  }
}

syncDocsToNotion().catch(error => {
  console.error('💥 Sync failed:', error);
  process.exit(1);
});