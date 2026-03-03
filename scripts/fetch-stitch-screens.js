const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const PROJECT_ID = '15612392003159116408';
const SCREENS = [
  { id: '088e670f981848e2ae4d54471c1de1bd', name: 'style-quiz-step3-lifestyle' },
  { id: '198df9846d574afd8794fc4bcca51db2', name: 'digital-wardrobe-inventory' },
  { id: '30b88036c4174d49b3a27960f9967bbd', name: 'style-quiz-step1-aesthetic' },
  { id: '49fd09c5f96e404aa18f0ffb1b2e54f9', name: 'style-dna-social-share' },
  { id: '71dcb7dfd3b24a89a9761c7820672c5c', name: 'style-profile-summary' },
  { id: '731d5721c77a41fdb57435b7782d5da9', name: 'ai-stylist-chat' },
  { id: '7fced7d61eba444a98d1497448d3b1a4', name: 'shopping-cart-checkout' },
  { id: '883206a13f004b25bf4f156c3d3c067c', name: 'outfit-planner-calendar' },
  { id: '8ce7f6df822b4f80b743af4e9288f78e', name: 'ai-stylist-daily-recommendations' },
  { id: '92c9b3a24a384af5948c328f444c58d2', name: 'home-screen' },
  { id: 'b628969723584bd1a7229bd618f20490', name: 'ai-style-profile-generation' },
  { id: 'b9109d6b51414f4c9d49031222a03a76', name: 'product-detail-view' },
  { id: 'ce17d909b3b54466a83b6bf94182d722', name: 'user-account-dashboard' },
  { id: 'dc9e796e52544ffd9e1d01634061c6f0', name: 'style-profile-summary-alt' },
  { id: 'e5d35cbfef7741f39bb5b3b703538d83', name: 'style-quiz-step2-color-pattern' },
  { id: 'c03fc78465f449dc95d53160f54dae2f', name: 'style-dna-social-share-dark' },
  { id: '517481d3eb054143b6c54e65c888e858', name: 'upload-tutorial-lighting' },
  { id: 'e13c94c313504a1487785b904f962094', name: 'upload-tutorial-framing' },
  { id: 'c9c94fff318547e28fc41f71f4eb5e14', name: 'upload-tutorial-camera-guide' },
];

const OUT_DIR = path.join(__dirname, '..', 'stitch-screens');
const HTML_DIR = path.join(OUT_DIR, 'html');
const IMG_DIR = path.join(OUT_DIR, 'images');

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const follow = (u, redirects = 0) => {
      if (redirects > 10) return reject(new Error('Too many redirects'));
      const mod = u.startsWith('https') ? https : http;
      mod.get(u, { headers: { 'User-Agent': 'stitch-fetch/1.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return follow(res.headers.location, redirects + 1);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${u}`));
        }
        const stream = fs.createWriteStream(dest);
        res.pipe(stream);
        stream.on('finish', () => { stream.close(); resolve(); });
        stream.on('error', reject);
      }).on('error', reject);
    };
    follow(url);
  });
}

async function fetchScreen(screen) {
  console.log(`Fetching: ${screen.name} (${screen.id})...`);
  try {
    const raw = execSync(
      `STITCH_API_KEY=$STITCH_API_KEY npx @_davideast/stitch-mcp tool get_screen_code -d '{"projectId": "${PROJECT_ID}", "screenId": "${screen.id}"}'`,
      { encoding: 'utf8', timeout: 60000, stdio: ['pipe', 'pipe', 'pipe'] }
    );
    const lines = raw.split('\n').filter(l => !l.startsWith('npm warn') && l.trim());
    const json = JSON.parse(lines.join('\n'));

    if (json.htmlContent) {
      fs.writeFileSync(path.join(HTML_DIR, `${screen.name}.html`), json.htmlContent);
      console.log(`  HTML saved: ${screen.name}.html (${json.htmlContent.length} chars)`);
    }

    if (json.screenshot?.downloadUrl) {
      const imgPath = path.join(IMG_DIR, `${screen.name}.png`);
      await downloadFile(json.screenshot.downloadUrl, imgPath);
      console.log(`  Image saved: ${screen.name}.png`);
    }

    return { ...screen, title: json.title, width: json.width, height: json.height, success: true };
  } catch (err) {
    console.error(`  FAILED: ${screen.name} - ${err.message}`);
    return { ...screen, success: false, error: err.message };
  }
}

async function main() {
  fs.mkdirSync(HTML_DIR, { recursive: true });
  fs.mkdirSync(IMG_DIR, { recursive: true });

  const results = [];
  for (const screen of SCREENS) {
    const result = await fetchScreen(screen);
    results.push(result);
  }

  const manifest = { projectId: PROJECT_ID, fetchedAt: new Date().toISOString(), screens: results };
  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

  const succeeded = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`\nDone: ${succeeded} succeeded, ${failed} failed out of ${SCREENS.length} screens`);
}

main().catch(console.error);
