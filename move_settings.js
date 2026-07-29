const fs = require('fs');

const settingsHtml = fs.readFileSync('settings.html', 'utf8');
const indexHtml = fs.readFileSync('index.html', 'utf8');

const sectionRegex = /<section id="view-settings"[\s\S]*?<\/section>/;
const match = settingsHtml.match(sectionRegex);

if (match) {
    const sectionContent = match[0];
    
    // insert into index.html right before </main>
    const newIndexHtml = indexHtml.replace('</main>', sectionContent + '\n\n    </main>');
    fs.writeFileSync('index.html', newIndexHtml);
    console.log("Moved settings section!");
} else {
    console.log("Section not found");
}
