const fs = require('fs');

const machineHtml = fs.readFileSync('machine.html', 'utf8');
const indexHtml = fs.readFileSync('index.html', 'utf8');

const sectionRegex = /<section id="view-single"[\s\S]*?<\/section>/;
const match = machineHtml.match(sectionRegex);

if (match) {
    const sectionContent = match[0];
    
    // insert into index.html right before </main>
    const newIndexHtml = indexHtml.replace('</main>', sectionContent + '\n\n    </main>');
    fs.writeFileSync('index.html', newIndexHtml);
    console.log("Moved section!");
} else {
    console.log("Section not found");
}
