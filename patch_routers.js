const fs = require('fs');
const path = require('path');

const routersDir = path.join(__dirname, 'routers');
const filesToPatch = [
    'adBannerRouter.js',
    'bannerPageRouter.js',
    'bannerRouter.js',
    'categoryRouter.js',
    'configRouter.js',
    'featuredStripRouter.js',
    'flashDealRouter.js',
    'gridBannerRouter.js',
    'homePageTopicRoutes.js',
    'middleBannerRouter.js',
    'productRouter.js',
    'reelRouter.js',
    'sectionLabelRouter.js',
    'timeDealRouter.js'
];

for (const file of filesToPatch) {
    const filePath = path.join(routersDir, file);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check if adminOnly is already imported
    if (!content.includes('adminOnly')) {
        // Add import
        content = content.replace(/(const router = express\.Router\(\);|const [a-zA-Z]+Router = express\.Router\(\);)/, "$1\nconst { adminOnly } = require('../controllers/userControllers');");
        modified = true;
    }

    // Replace post, put, delete
    // Need to avoid replacing routes that already have adminOnly
    const replaceRoute = (method) => {
        const regex = new RegExp(`router\\.${method}\\((['"\`].*?['"\`]),\\s*(?!adminOnly)([^\\)]+)\\)`, 'g');
        content = content.replace(regex, `router.${method}($1, adminOnly, $2)`);
    };

    replaceRoute('post');
    replaceRoute('put');
    replaceRoute('delete');

    // for specific named routers like productRouter
    const replaceNamedRoute = (method) => {
        const regex = new RegExp(`[a-zA-Z]+Router\\.${method}\\((['"\`].*?['"\`]),\\s*(?!adminOnly)([^\\)]+)\\)`, 'g');
        content = content.replace(regex, (match, p1, p2) => {
             // Avoid double replacement if somehow caught
             if(p2.startsWith('adminOnly')) return match;
             return match.replace(`${p1}, ${p2}`, `${p1}, adminOnly, ${p2}`);
        });
    };

    replaceNamedRoute('post');
    replaceNamedRoute('put');
    replaceNamedRoute('delete');

    if (modified || content !== fs.readFileSync(filePath, 'utf8')) {
        fs.writeFileSync(filePath, content);
        console.log(`Patched ${file}`);
    }
}
